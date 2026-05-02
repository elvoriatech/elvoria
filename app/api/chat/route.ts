import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { readJson, writeJson, conversationPath } from '@/lib/localStore';
import { emptyDraft, normalizeDraft, readiness, type ProposalDraft } from '@/lib/proposalSchema';
import { sendChat, type ChatMessage } from '@/lib/openrouter';
import { getSalesEngineerContextBlock } from '@/lib/companyContext';
import { getProposalArchitectRoleBlock } from '@/lib/aiProposalArchitect';
import { PROPOSAL_CHAT_MAX_USER_MESSAGES } from '@/lib/proposalChatLimits';

type StoredConversation = {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; ts: string }>;
  draft: ProposalDraft;
};

function safeParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function extractFirstJsonObject(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function toOpenRouterHistory(messages: StoredConversation['messages']): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const m of messages) {
    if (m.role !== 'user' && m.role !== 'assistant') continue;
    out.push({ role: m.role, content: m.content });
  }
  return out;
}

function formatTranscript(messages: StoredConversation['messages']): string {
  return messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      conversationId?: string;
      message?: string;
    };

    const userMessage = String(body.message || '').trim();
    if (!userMessage) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    const conversationId = body.conversationId || randomUUID();
    const filePath = conversationPath(conversationId);
    const now = new Date().toISOString();

    const existing = await readJson<StoredConversation | null>(filePath, null);
    const convo: StoredConversation =
      existing ??
      ({
        id: conversationId,
        createdAt: now,
        updatedAt: now,
        messages: [],
        draft: emptyDraft,
      } satisfies StoredConversation);

    convo.draft = normalizeDraft(convo.draft);

    const userTurns = convo.messages.filter((m) => m.role === 'user').length;
    if (userTurns >= PROPOSAL_CHAT_MAX_USER_MESSAGES) {
      return NextResponse.json(
        {
          error: `You have reached the maximum of ${PROPOSAL_CHAT_MAX_USER_MESSAGES} messages for this assistant.`,
          code: 'CHAT_LIMIT',
        },
        { status: 403 }
      );
    }

    convo.messages.push({ role: 'user', content: userMessage, ts: now });
    convo.updatedAt = now;

    const history = toOpenRouterHistory(convo.messages);

    // Step 1 — human-readable reply only (what the visitor sees in the widget)
    const company = getSalesEngineerContextBlock();
    const architect = getProposalArchitectRoleBlock();

    const humanSystem: ChatMessage = {
      role: 'system',
      content: [
        company,
        '',
        architect,
        '',
        'In this chat widget you speak to visitors in plain language only.',
        'Your public title is: AI Technical Proposal Architect for Elvoria Tech (pre-sales technical consultant).',
        'Reply in plain, friendly text only.',
        'Do not output JSON, markdown code blocks, schemas, or bullet lists of internal field names.',
        'Ground answers in the company context and the architect contract above.',
        'For substantive idea discussions, naturally progress: business understanding → AI-powered solution angle → architecture outline → roadmap phases → indicative EUR bands when relevant (always label as approximate).',
        'You may briefly answer general questions (e.g. mobile vs web) and always steer toward clarifying the visitor’s product idea.',
        'If information is missing for a proposal, ask up to 3 short, specific questions.',
        'Never invent certifications, client names, or final fixed prices; rough ranges only if the user asks, and note they are indicative.',
      ].join('\n'),
    };

    const humanReplyRaw = await sendChat([humanSystem, ...history]);
    const humanReply = humanReplyRaw.trim() || 'Thanks — could you share a bit more about what you want to build?';

    // Step 2 — structured draft update (server-side only; never shown raw to the user)
    const draftSystem: ChatMessage = {
      role: 'system',
      content: [
        company,
        '',
        architect,
        '',
        'You maintain a structured ProposalDraft as JSON for internal use and PDF generation.',
        'Return ONLY valid JSON (no markdown) with exactly this shape:',
        '{ "draft": ProposalDraft }',
        '',
        'ProposalDraft fields:',
        '- project: summary, targetUsers, region, languages[]',
        '- platforms: web, ios, android, desktop (booleans)',
        '- mustHave[], niceToHave[], integrations[]',
        '- nonFunctional: securityLevel (basic|standard|high), scaleTarget (mvp|growth|enterprise), compliance[]',
        '- keyFlows[], assumptions[], outOfScope[], risks[]',
        '- additionalContext: string[] — short bullets capturing new facts from THIS turn (and merge with prior meaning; dedupe);',
        '  include AI-relevant notes here when discussed (RAG, agents, LLM choice, vector DB, automation, copilots).',
        '',
        'Rules:',
        '- Merge new information from the full conversation; do not drop prior structured data unless the user corrects it.',
        '- If the user only asked a general question, keep the previous draft and add at most 1–2 additionalContext lines summarizing the topic discussed.',
        '- Do not invent budgets or compliance; leave arrays empty if unknown.',
      ].join('\n'),
    };

    const draftUser: ChatMessage = {
      role: 'user',
      content: [
        'Full conversation so far:',
        formatTranscript(convo.messages),
        '',
        'Latest assistant reply (human-facing):',
        humanReply,
        '',
        'Current ProposalDraft JSON (normalize and merge):',
        JSON.stringify(convo.draft, null, 2),
      ].join('\n'),
    };

    let mergedDraft = convo.draft;
    try {
      const rawDraft = await sendChat([draftSystem, draftUser]);
      const jsonSlice = safeParseJson<{ draft: ProposalDraft }>(rawDraft)
        ? rawDraft
        : extractFirstJsonObject(rawDraft);
      const parsed = jsonSlice ? safeParseJson<{ draft: ProposalDraft }>(jsonSlice) : null;
      if (parsed?.draft) {
        mergedDraft = normalizeDraft(parsed.draft);
      }
    } catch (draftErr) {
      console.error('Draft extraction failed:', draftErr);
      // Keep previous draft; user still gets a normal reply
    }

    convo.messages.push({ role: 'assistant', content: humanReply, ts: new Date().toISOString() });
    convo.draft = mergedDraft;
    convo.updatedAt = new Date().toISOString();

    await writeJson(filePath, convo);

    const r = readiness(convo.draft);
    return NextResponse.json({
      conversationId,
      reply: humanReply,
      draft: convo.draft,
      readiness: r,
    });
  } catch (err) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'Chat failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
