'use client';

import { Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { readiness, type ProposalDraft } from '@/lib/proposalSchema';
import { PROPOSAL_CHAT_MAX_USER_MESSAGES } from '@/lib/proposalChatLimits';
import type { ProposalChatSource } from '@/lib/elvoriaEvents';
import type { SupportLeadSource } from '@/lib/supportLeads';

const PROPOSAL_CHAT_SOURCES: SupportLeadSource[] = [
  'proposal_widget',
  'contact_technical_proposal',
  'hero_start_project',
  'hero_build_together',
  'contact_start_project',
];

function toLeadSource(src: string | undefined): SupportLeadSource {
  if (src && PROPOSAL_CHAT_SOURCES.includes(src as SupportLeadSource)) {
    return src as SupportLeadSource;
  }
  return 'proposal_widget';
}

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const LEAD_STORAGE_KEY = 'elvoria:supportLead';

function clsx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

const MD_WRAPPER_CLASS =
  'proposal-chat-md break-words text-left [&_a]:text-cyan-600 dark:[&_a]:text-cyan-300 [&_a]:underline [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-foreground/20 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] dark:[&_code]:bg-white/10 [&_h1]:mb-2 [&_h1]:text-[15px] [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-[14px] [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-[13px] [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:mb-2 [&_p]:last:mb-0 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-4 [&_pre]:my-2 [&_pre]:max-h-48 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-black/20 [&_pre]:p-2 [&_pre]:text-[11px] dark:[&_pre]:bg-black/40';

function assistantHtml(markdown: string): string {
  try {
    const raw = marked.parse(markdown, { gfm: true, breaks: true, async: false }) as string;
    return DOMPurify.sanitize(raw, {
      USE_PROFILES: { html: true },
      // Basic hardening: keep links safe even if model emits odd markup.
      ADD_ATTR: ['target', 'rel'],
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
    });
  } catch {
    return `<p>${markdown.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</p>`;
  }
}

function MessageBody({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  if (role === 'user') {
    return <span className="whitespace-pre-wrap break-words">{content}</span>;
  }
  return (
    <div
      className={MD_WRAPPER_CLASS}
      // eslint-disable-next-line react/no-danger -- HTML from our assistant API (trusted pipeline)
      dangerouslySetInnerHTML={{ __html: assistantHtml(content) }}
    />
  );
}

async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error('Empty response from server');
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error('Invalid JSON from server');
  }
}

export function ProposalChatWidget() {
  const [open, setOpen] = useState(false);
  const [leadComplete, setLeadComplete] = useState(false);
  const [leadSource, setLeadSource] = useState<SupportLeadSource>('proposal_widget');
  const [leadForm, setLeadForm] = useState({ fullName: '', email: '', company: '', phone: '' });
  const [leadBusy, setLeadBusy] = useState(false);
  const [leadError, setLeadError] = useState('');

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProposalDraft | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'I’m your AI Technical Proposal Architect for Elvoria Tech. Describe your idea — I’ll translate it into scope, AI-native architecture, roadmap, timeline, and indicative EUR ranges (then you can generate a PDF when ready).',
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [chatLimitReached, setChatLimitReached] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const userMessageCount = messages.filter((m) => m.role === 'user').length;
  const atChatLimit = chatLimitReached || userMessageCount >= PROPOSAL_CHAT_MAX_USER_MESSAGES;

  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem(LEAD_STORAGE_KEY);
      if (!raw) return;
      const o = JSON.parse(raw) as { v?: number; email?: string; fullName?: string };
      if (o.v === 1) {
        setLeadComplete(true);
        if (typeof o.email === 'string' && o.email.includes('@')) {
          const savedEmail = o.email.trim();
          setLeadForm((f) => ({
            ...f,
            email: savedEmail,
            fullName: typeof o.fullName === 'string' ? o.fullName.trim() : f.fullName,
          }));
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('elvoria:proposalChat:conversationId');
    if (saved) setConversationId(saved);
  }, []);

  useEffect(() => {
    if (open && !conversationId) {
      setConversationId(crypto.randomUUID());
    }
  }, [open, conversationId]);

  /** Open from elsewhere (e.g. Contact “Request Technical Proposal”). */
  useEffect(() => {
    const ev = 'elvoria:open-proposal-chat';
    function onOpenProposal(e: Event) {
      const ce = e as CustomEvent<{ source?: ProposalChatSource }>;
      setLeadSource(toLeadSource(ce.detail?.source));
      setOpen(true);
    }
    window.addEventListener(ev, onOpenProposal as EventListener);
    return () => window.removeEventListener(ev, onOpenProposal as EventListener);
  }, []);

  useEffect(() => {
    if (conversationId) localStorage.setItem('elvoria:proposalChat:conversationId', conversationId);
  }, [conversationId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, expanded, leadComplete]);

  const r = useMemo(() => (draft ? readiness(draft) : { score: 0, missing: ['project.summary'] }), [draft]);

  async function submitLead() {
    setLeadError('');
    setLeadBusy(true);
    const cid = conversationId ?? crypto.randomUUID();
    if (!conversationId) setConversationId(cid);
    try {
      const res = await fetch('/api/support-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: cid,
          fullName: leadForm.fullName.trim(),
          email: leadForm.email.trim(),
          company: leadForm.company.trim(),
          phone: leadForm.phone.trim(),
          source: leadSource,
        }),
      });
      const data = (await readJsonBody(res)) as {
        error?: string;
        conversationId?: string;
        autoReplyEnabled?: boolean;
        autoReplySent?: boolean;
        autoReplyError?: string;
      };
      if (!res.ok) throw new Error(data?.error || 'Could not save your details');
      if (data.autoReplyEnabled && !data.autoReplySent && data.autoReplyError) {
        console.warn('[support-lead] confirmation email not sent:', data.autoReplyError);
      }
      if (data.conversationId) setConversationId(data.conversationId);
      localStorage.setItem(
        LEAD_STORAGE_KEY,
        JSON.stringify({
          v: 1,
          savedAt: new Date().toISOString(),
          email: leadForm.email.trim(),
          fullName: leadForm.fullName.trim(),
        })
      );
      setLeadComplete(true);
    } catch (e) {
      setLeadError((e as Error)?.message || 'Something went wrong');
    } finally {
      setLeadBusy(false);
    }
  }

  async function send() {
    if (!leadComplete) return;
    const text = input.trim();
    if (!text || busy || atChatLimit) return;
    setDownloadUrl(null);
    setInput('');
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', content: text }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: text }),
      });
      const data = (await readJsonBody(res)) as {
        error?: string;
        code?: string;
        conversationId?: string;
        reply?: string;
        draft?: ProposalDraft;
      };
      if (!res.ok) {
        if (res.status === 403 && data?.code === 'CHAT_LIMIT') {
          setChatLimitReached(true);
          setInput(text);
          setMessages((m) => {
            const next = [...m];
            if (next[next.length - 1]?.role === 'user') next.pop();
            return [
              ...next,
              {
                role: 'assistant' as const,
                content: `This conversation has reached the ${PROPOSAL_CHAT_MAX_USER_MESSAGES}-message limit. You can still generate a PDF if readiness is complete, or contact us for more help.`,
              },
            ];
          });
          return;
        }
        throw new Error(data?.error || 'Chat failed');
      }
      setConversationId(data.conversationId ?? null);
      if (data.draft) setDraft(data.draft);
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || 'Thanks for your message.' }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Sorry — I couldn’t process that. ${(e as Error)?.message || ''}`.trim() },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function finalize() {
    if (!leadComplete || !conversationId || finalizing) return;
    setFinalizing(true);
    setDownloadUrl(null);
    try {
      const res = await fetch('/api/proposal/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          visitorEmail: leadForm.email.trim(),
          visitorName: leadForm.fullName.trim(),
        }),
      });
      const data = (await readJsonBody(res)) as {
        error?: string;
        readiness?: { missing?: string[] };
        download?: { url?: string };
        preview?: { url?: string };
        pdfStatus?: string;
        followUpEmailSent?: boolean;
      };
      if (!res.ok) {
        const missing = data?.readiness?.missing?.join(', ') || 'missing required info';
        throw new Error(data?.error ? `${data.error}: ${missing}` : missing);
      }
      if (data?.download?.url) setDownloadUrl(data.download.url);
      const pdfReady = data?.pdfStatus === 'ready';
      const emailed = Boolean(data?.followUpEmailSent);
      const previewPath = data?.preview?.url?.trim();
      const previewLine =
        !pdfReady && previewPath
          ? `\n\n[**Open your full proposal in the browser**](${window.location.origin}${previewPath.startsWith('/') ? previewPath : `/${previewPath}`}) — you can read, print, or save as PDF from your browser.`
          : '';
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: pdfReady
            ? 'Your PDF is ready. Use the download button below.'
            : emailed
              ? `The proposal was saved, but the automatic PDF could not be created right now. Check your email for a **professional summary** with a secure link to read the full proposal online. Our team can still email you the official PDF — check spam if needed.${previewLine}`
              : `The proposal was saved, but the automatic PDF could not be created right now. If outbound mail is configured, you may receive an email with a link; otherwise use the link below or contact us on the site and mention “proposal PDF”.${previewLine}`,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: `I can’t finalize yet. ${(e as Error)?.message || ''}`.trim(),
        },
      ]);
    } finally {
      setFinalizing(false);
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-cyan-400/60';

  return (
    <div className={clsx('fixed bottom-4 right-4', open ? 'z-[80]' : 'z-[60]')}>
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setLeadSource('proposal_widget');
            setOpen(true);
          }}
          className="rounded-full px-4 py-3 shadow-lg border border-white/10 bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-slate-950 font-extrabold text-sm hover:from-cyan-400 hover:to-blue-400"
        >
          Proposal Architect
        </button>
      ) : (
        <div
          className={clsx(
            'max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur transition-[width] duration-200 ease-out',
            expanded ? 'w-[min(640px,calc(100vw-2rem))]' : 'w-[360px]'
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-gradient-to-r from-violet-500/15 to-cyan-500/10 px-3 py-3 sm:px-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-extrabold text-foreground">AI Technical Proposal Architect</div>
              <div className="text-xs text-muted-foreground">
                {leadComplete ? (
                  <>
                    Readiness: <span className="font-bold">{r.score}%</span>
                    {r.missing.length ? <span className="opacity-80"> · Missing: {r.missing[0]}</span> : null}
                    <span className="opacity-80">
                      {' '}
                      · Messages: {Math.min(userMessageCount, PROPOSAL_CHAT_MAX_USER_MESSAGES)}/
                      {PROPOSAL_CHAT_MAX_USER_MESSAGES}
                    </span>
                  </>
                ) : (
                  <span>Step 1 — Share your details so our team can follow up.</span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {leadComplete ? (
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="rounded-lg border border-white/10 p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  aria-label={expanded ? 'Use compact chat size' : 'Expand chat for readability'}
                  title={expanded ? 'Compact' : 'Expand'}
                >
                  {expanded ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/10 px-2 py-1.5 text-xs font-bold hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>

          <div
            ref={listRef}
            className={clsx(
              'overflow-auto px-3 py-3',
              leadComplete ? 'space-y-3' : '',
              expanded ? 'min-h-[min(48vh,440px)] max-h-[min(68vh,620px)]' : 'h-[360px]'
            )}
          >
            {!leadComplete ? (
              <div className="space-y-3 text-[13px]">
                <p className="text-muted-foreground leading-relaxed">
                  Before we open the proposal assistant, tell us who you are. <strong className="text-foreground">Name</strong>{' '}
                  and <strong className="text-foreground">email</strong> are required; phone is optional but helps us follow up
                  faster. This is stored for our support team only.
                </p>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground" htmlFor="elv-lead-name">
                    Full name
                  </label>
                  <input
                    id="elv-lead-name"
                    className={fieldClass}
                    value={leadForm.fullName}
                    onChange={(e) => setLeadForm((f) => ({ ...f, fullName: e.target.value }))}
                    autoComplete="name"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground" htmlFor="elv-lead-email">
                    Work email
                  </label>
                  <input
                    id="elv-lead-email"
                    type="email"
                    className={fieldClass}
                    value={leadForm.email}
                    onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                    autoComplete="email"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground" htmlFor="elv-lead-company">
                    Company
                  </label>
                  <input
                    id="elv-lead-company"
                    className={fieldClass}
                    value={leadForm.company}
                    onChange={(e) => setLeadForm((f) => ({ ...f, company: e.target.value }))}
                    autoComplete="organization"
                    placeholder="Acme Inc."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground" htmlFor="elv-lead-phone">
                    Phone / contact <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    id="elv-lead-phone"
                    type="tel"
                    className={fieldClass}
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))}
                    autoComplete="tel"
                    placeholder="So we can reach you faster if you’d like"
                  />
                </div>
                {leadError ? (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
                    {leadError}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => void submitLead()}
                  disabled={leadBusy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-2.5 text-sm font-extrabold text-slate-950 disabled:opacity-60"
                >
                  {leadBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    'Continue to proposal chat'
                  )}
                </button>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={clsx(
                    'rounded-2xl border px-3 py-2.5 text-[13px] leading-relaxed',
                    m.role === 'user'
                      ? 'ml-auto max-w-[90%] border-white/10 bg-white/5 text-foreground'
                      : clsx(
                          'mr-auto border-white/10 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-foreground',
                          expanded ? 'max-w-full' : 'max-w-[92%]'
                        )
                  )}
                >
                  <MessageBody role={m.role} content={m.content} />
                </div>
              ))
            )}
          </div>

          {leadComplete ? (
            <div className="px-3 pb-3">
              {atChatLimit ? (
                <p className="mb-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
                  Message limit reached ({PROPOSAL_CHAT_MAX_USER_MESSAGES} messages). Sending more messages is disabled.
                </p>
              ) : null}
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !atChatLimit) void send();
                  }}
                  placeholder={atChatLimit ? 'Limit reached' : 'Describe your app idea…'}
                  disabled={atChatLimit}
                  aria-disabled={atChatLimit}
                  className="flex-1 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={busy || atChatLimit}
                  className="inline-flex min-w-[4.25rem] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-sm font-extrabold text-slate-950 disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      <span className="sr-only">Sending</span>
                    </>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={finalize}
                  disabled={!conversationId || r.missing.length > 0 || finalizing}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-extrabold hover:bg-white/5 disabled:opacity-50"
                >
                  {finalizing ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      Generating PDF
                    </span>
                  ) : (
                    'Generate final PDF'
                  )}
                </button>
                {downloadUrl ? (
                  <a
                    href={downloadUrl}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold hover:bg-white/10"
                  >
                    Download PDF
                  </a>
                ) : (
                  <div className="text-[11px] text-muted-foreground">Guest session</div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
