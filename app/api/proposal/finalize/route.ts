import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { readJson, writeJson, conversationPath, proposalPdfPath } from '@/lib/localStore';
import { emptyDraft, normalizeDraft, readiness, type ProposalDraft } from '@/lib/proposalSchema';
import { sendChat, type ChatMessage } from '@/lib/openrouter';
import { estimateRough } from '@/lib/estimator';
import { renderProposalPdf } from '@/lib/pdfGenerator';
import { loadProposalPdfServerAssets } from '@/lib/proposalPdfServerAssets';
import { signDownloadToken } from '@/lib/pdfToken';
import { getSalesEngineerContextBlock } from '@/lib/companyContext';
import { getProposalArchitectRoleBlock } from '@/lib/aiProposalArchitect';
import { appendProposalFinalizeLog } from '@/lib/proposalFinalizeLog';
import { sendProposalPdfNotReadyVisitorEmail } from '@/lib/proposalPdfFollowupEmail';

const VISITOR_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StoredConversation = {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; ts: string }>;
  draft: ProposalDraft;
};

type StoredProposalVersion = {
  id: string;
  conversationId: string;
  createdAt: string;
  expiresAt: string;
  archivedAt?: string;
  draftSnapshot: ProposalDraft;
  estimate: ReturnType<typeof estimateRough>;
  markdown: string;
  pdf: { status: 'queued' | 'ready' | 'failed'; path?: string; error?: string };
};

function versionsPath(conversationId: string) {
  return `data/proposals/${conversationId}.versions.json`;
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
      visitorEmail?: string;
      visitorName?: string;
    };
    const conversationId = String(body.conversationId || '').trim();
    const visitorEmail = typeof body.visitorEmail === 'string' ? body.visitorEmail.trim().toLowerCase() : '';
    const visitorName = typeof body.visitorName === 'string' ? body.visitorName.trim() : '';
    if (!conversationId) return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });

    const convo = await readJson<StoredConversation | null>(conversationPath(conversationId), null);
    const draft = normalizeDraft(convo?.draft ?? emptyDraft);
    const r = readiness(draft);
    if (r.missing.length) {
      return NextResponse.json(
        { error: 'Draft is missing required info', readiness: r, draft },
        { status: 400 }
      );
    }

    const estimate = estimateRough(draft);
    const transcript = convo?.messages?.length ? formatTranscript(convo.messages) : '(No transcript stored.)';

    const company = getSalesEngineerContextBlock();
    const architect = getProposalArchitectRoleBlock();

    const system: ChatMessage = {
      role: 'system',
      content: [
        company,
        '',
        architect,
        '',
        'You are the AI Technical Proposal Architect for Elvoria Tech.',
        'Write one client-facing technical proposal in Markdown using EXACTLY these top-level sections (## headings), in order:',
        '',
        '## Executive Summary',
        '## Why Elvoria Tech',
        '## A. Business Understanding (Problem → Value)',
        '## B. AI-Powered Solution Overview',
        '## C. System Architecture',
        '  Use subheadings ### Frontend, ### Backend, ### AI Layer, ### Data Layer, ### Infrastructure as applicable.',
        '## D. AI Features Breakdown',
        '## E. Implementation Roadmap',
        '  Use phased milestones (MVP → AI expansion → enterprise scale) with indicative week ranges.',
        '## F. Timeline & Effort Estimate',
        '  Include team-size assumption and complexity (Low / Medium / High). Anchor numeric ranges to the provided estimate JSON.',
        '## G. Indicative Cost (EUR)',
        '  Use the provided estimate JSON as the primary numeric anchor; explain drivers (integrations, AI usage, compliance, platforms).',
        '## AI Intelligence Add-On',
        '  Mandatory: where AI reduces manual work, automation replaces repetitive steps, predictions improve decisions, copilots assist users.',
        '## Requirements & Conversation Highlights',
        '  Merge structured draft JSON with transcript; subsection "Conversation highlights" for Q&A not already in JSON.',
        '## Key Flows',
        '## Assumptions',
        '## Out of Scope',
        '## Risks',
        '',
        'Diagrams:',
        '- Include 2 Mermaid fenced code blocks (`mermaid`): (1) flowchart high-level architecture, (2) sequenceDiagram for the primary user/system flow.',
        '- After ```mermaid put a newline before the diagram keyword (flowchart / sequenceDiagram / graph). Use simple ASCII node IDs (A, B, C); avoid slashes or spaces inside participant names.',
        '',
        'Commercial:',
        '- Map engagement options to company PRICING where helpful (dedicated team / fixed scope / hourly).',
        '',
        'Guardrails:',
        '- Realistic only; no invented certifications or clients beyond named case studies.',
        '- Close with a free 30-minute consultation offer and CONTACT details from company context.',
        '',
        'Return only Markdown.',
      ].join('\n'),
    };

    const user: ChatMessage = {
      role: 'user',
      content: [
        'Here is the structured draft JSON:',
        JSON.stringify(draft, null, 2),
        '',
        'Here is the full conversation transcript:',
        transcript,
        '',
        'Here is the rough estimate you MUST use:',
        JSON.stringify(estimate, null, 2),
        '',
        'Branding:',
        `Company: ${process.env.COMPANY_NAME || 'Elvoriatech'}`,
        `Site: ${process.env.SITE_URL || 'https://elvoriatech.com'}`,
      ].join('\n'),
    };

    const markdown = await sendChat([system, user]);

    const versionId = randomUUID();
    const now = new Date();
    const createdAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const version: StoredProposalVersion = {
      id: versionId,
      conversationId,
      createdAt,
      expiresAt,
      draftSnapshot: draft,
      estimate,
      markdown,
      pdf: { status: 'queued' },
    };

    const versionsFile = versionsPath(conversationId);
    const list = await readJson<StoredProposalVersion[]>(versionsFile, []);
    list.unshift(version);
    await writeJson(versionsFile, list);

    const outPdf = proposalPdfPath(versionId);
    try {
      const pdfAssets = await loadProposalPdfServerAssets();
      await renderProposalPdf({
        markdown,
        outPath: outPdf,
        branding: {
          companyName: process.env.COMPANY_NAME || 'Elvoriatech',
          siteUrl: process.env.SITE_URL || 'https://elvoriatech.com',
          /* Align with app/theme.css `.theme-elvoria.dark` (cyan + indigo) */
          primary: '#22d3ee',
          secondary: '#6366f1',
        },
        logoDataUri: pdfAssets.logoDataUri,
        mermaidScript: pdfAssets.mermaidScript,
      });
      version.pdf = { status: 'ready', path: outPdf };
    } catch (e) {
      version.pdf = { status: 'failed', error: (e as Error)?.message || 'PDF generation failed' };
    }

    const updatedList = await readJson<StoredProposalVersion[]>(versionsFile, []);
    const idx = updatedList.findIndex((v) => v.id === versionId);
    if (idx !== -1) updatedList[idx] = version;
    await writeJson(versionsFile, updatedList);

    const token = signDownloadToken(versionId);

    let followUpEmailSent = false;
    if (version.pdf.status !== 'ready' && visitorEmail && VISITOR_EMAIL_RE.test(visitorEmail)) {
      const siteUrl = process.env.SITE_URL || 'https://elvoriatech.com';
      const mail = await sendProposalPdfNotReadyVisitorEmail({
        to: visitorEmail,
        visitorName: visitorName || 'there',
        siteUrl,
        versionId,
        downloadToken: token,
      });
      followUpEmailSent = mail.sent;
      if (!mail.sent) {
        console.warn('[finalize] visitor follow-up email not sent:', mail.reason, 'detail' in mail ? mail.detail : '');
      }
    }

    await appendProposalFinalizeLog({
      versionId,
      conversationId,
      visitorEmail,
      visitorName,
      pdfStatus: version.pdf.status,
      pdfError: version.pdf.status === 'failed' ? version.pdf.error : undefined,
      finalizedAt: new Date().toISOString(),
      visitorNotifiedPdfIssue: version.pdf.status !== 'ready' ? followUpEmailSent : undefined,
    });

    return NextResponse.json({
      versionId,
      pdfStatus: version.pdf.status,
      download: version.pdf.status === 'ready' ? { url: `/api/proposal/version/${versionId}/download?token=${token}` } : null,
      preview:
        version.pdf.status !== 'ready'
          ? { url: `/api/proposal/version/${versionId}/preview?token=${encodeURIComponent(token)}` }
          : null,
      readiness: r,
      estimate,
      followUpEmailSent,
    });
  } catch (err) {
    console.error('Finalize error:', err);
    const message = err instanceof Error ? err.message : 'Finalize failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

