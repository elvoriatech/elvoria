import { NextRequest } from 'next/server';
import { marked } from 'marked';
import { loadProposalVersionMarkdown } from '@/lib/proposalMarkdown';
import { verifyDownloadToken } from '@/lib/pdfToken';

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function GET(req: NextRequest, ctx: RouteContext<'/api/proposal/version/[versionId]/preview'>) {
  const { versionId } = await ctx.params;
  const url = new URL(req.url);
  const token = url.searchParams.get('token') || '';

  if (!verifyDownloadToken(versionId, token)) {
    return new Response('Unauthorized', { status: 401, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  const markdown = await loadProposalVersionMarkdown(versionId);
  if (!markdown) {
    return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  const company = process.env.COMPANY_NAME || 'Elvoria Technologies';
  const siteUrl = (process.env.SITE_URL || 'https://elvoriatech.com').replace(/\/$/, '');
  const htmlBody = marked.parse(markdown, { gfm: true }) as string;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>${escapeHtml(company)} — Proposal preview</title>
  <style>
    :root {
      --bg: #070b14;
      --text: #e5e7eb;
      --muted: #94a3b8;
      --cyan: #06b6d4;
      --violet: #8b5cf6;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.65;
    }
    .top {
      position: sticky;
      top: 0;
      z-index: 10;
      padding: 14px 20px;
      background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.12));
      border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .top a.home {
      color: #93c5fd;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
    }
    .top a.home:hover { text-decoration: underline; }
    .badge {
      font-size: 12px;
      color: var(--muted);
      max-width: 100%;
    }
    .wrap { max-width: 900px; margin: 0 auto; padding: 28px 20px 56px; }
    .doc {
      padding: 22px 20px;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      background: rgba(255,255,255,0.04);
    }
    .doc h1, .doc h2, .doc h3 { margin: 18px 0 10px; line-height: 1.25; color: #f8fafc; }
    .doc h1 { font-size: 1.5rem; }
    .doc h2 { font-size: 1.15rem; }
    .doc pre {
      background: rgba(2,6,23,0.65);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 12px 14px;
      overflow: auto;
      font-size: 12px;
    }
    .doc code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; }
    .doc table { border-collapse: collapse; width: 100%; font-size: 13px; margin: 12px 0; }
    .doc th, .doc td { border: 1px solid rgba(255,255,255,0.1); padding: 8px 10px; text-align: left; }
    .doc a { color: #67e8f9; }
    .foot {
      margin-top: 20px;
      font-size: 12px;
      color: var(--muted);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="top">
    <a class="home" href="${escapeHtml(siteUrl)}">← ${escapeHtml(company)}</a>
    <span class="badge">AI proposal preview · link expires with your saved version · PDF may be sent separately by our team</span>
  </div>
  <div class="wrap">
    <div class="doc">${htmlBody}</div>
    <p class="foot">Indicative content only — not a binding quote. For a formal PDF or questions, reply to our team or use the contact page.</p>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
