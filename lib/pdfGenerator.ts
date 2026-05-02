import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { marked } from 'marked';

type PdfBranding = {
  companyName: string;
  siteUrl: string;
  logoUrl: string; // path or url
  primary: string;
  secondary: string;
};

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function resolveMermaidScript() {
  // Use local mermaid bundle to avoid external network dependencies.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mermaidPath = require.resolve('mermaid/dist/mermaid.min.js');
  return fs.readFile(mermaidPath, 'utf8');
}

export async function renderProposalPdf(params: {
  markdown: string;
  outPath: string;
  branding: PdfBranding;
}) {
  const { markdown, outPath, branding } = params;

  const htmlBody = marked.parse(markdown, { gfm: true }) as string;
  const mermaidJs = await resolveMermaidScript();

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(branding.companyName)} — Technical Proposal</title>
    <style>
      :root{
        --bg:#070b14;
        --card:rgba(255,255,255,0.06);
        --text:#e5e7eb;
        --muted:#94a3b8;
        --primary:${escapeHtml(branding.primary)};
        --secondary:${escapeHtml(branding.secondary)};
      }
      *{ box-sizing:border-box; }
      body{
        margin:0;
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Arial,sans-serif;
        background:var(--bg);
        color:var(--text);
      }
      .wrap{ max-width:900px; margin:0 auto; padding:36px 28px 60px; }
      .header{
        display:flex; align-items:center; justify-content:space-between;
        padding:18px 18px;
        border:1px solid rgba(255,255,255,0.10);
        border-radius:18px;
        background:linear-gradient(135deg, rgba(139,92,246,0.16), rgba(6,182,212,0.10));
      }
      .brand{ display:flex; gap:12px; align-items:center; }
      .logo{ width:44px; height:44px; border-radius:12px; object-fit:cover; background:#0b1220; }
      .title{ font-weight:900; font-size:16px; letter-spacing:.2px; }
      .sub{ color:var(--muted); font-size:12px; margin-top:3px; }
      .meta{ text-align:right; color:var(--muted); font-size:12px; }
      .doc{
        margin-top:18px;
        padding:22px 20px;
        border:1px solid rgba(255,255,255,0.10);
        border-radius:18px;
        background:rgba(255,255,255,0.04);
      }
      h1,h2,h3{ margin:16px 0 10px; line-height:1.2; }
      h1{ font-size:22px; }
      h2{ font-size:16px; color:#fff; }
      h3{ font-size:14px; color:#fff; opacity:.95; }
      p,li{ font-size:13px; line-height:1.7; color:var(--text); }
      code{ font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace; }
      pre{
        background:rgba(2,6,23,0.65);
        border:1px solid rgba(255,255,255,0.08);
        border-radius:14px;
        padding:12px 14px;
        overflow:auto;
        color:#e2e8f0;
      }
      blockquote{
        margin:12px 0;
        padding:10px 12px;
        border-left:3px solid rgba(6,182,212,0.7);
        background:rgba(6,182,212,0.06);
        border-radius:10px;
        color:var(--text);
      }
      a{ color:#93c5fd; text-decoration:none; }
      .footer{
        margin-top:14px;
        color:var(--muted);
        font-size:11px;
        line-height:1.6;
      }
      /* Mermaid */
      .mermaid { background: rgba(2,6,23,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 10px; }
      svg { max-width: 100%; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <div class="brand">
          <img class="logo" src="${escapeHtml(branding.logoUrl)}" alt="" />
          <div>
            <div class="title">${escapeHtml(branding.companyName)} — Technical Proposal</div>
            <div class="sub">${escapeHtml(branding.siteUrl)}</div>
          </div>
        </div>
        <div class="meta">
          Generated: ${escapeHtml(new Date().toLocaleString())}<br/>
          Currency: EUR
        </div>
      </div>
      <div class="doc" id="doc">
        ${htmlBody}
      </div>
      <div class="footer">
        This document is an AI-assisted rough estimate and technical outline. Final scope, timeline, and budget will be confirmed by the support team after discovery.
      </div>
    </div>
    <script>${mermaidJs}</script>
    <script>
      try {
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
        // Render any mermaid code blocks produced by markdown parser:
        // marked typically emits <pre><code class="language-mermaid">...</code></pre>
        const blocks = Array.from(document.querySelectorAll('code.language-mermaid'));
        blocks.forEach((code, idx) => {
          const pre = code.parentElement;
          const src = code.textContent || '';
          const container = document.createElement('div');
          container.className = 'mermaid';
          container.textContent = src;
          if (pre && pre.parentElement) pre.parentElement.replaceChild(container, pre);
        });
        mermaid.run({ querySelector: '.mermaid' });
      } catch (e) {
        // If diagrams fail, keep document readable; don't crash.
        console.warn('Mermaid render failed', e);
      }
    </script>
  </body>
</html>`;

  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const browser = await puppeteer.launch({
    // In many docker environments sandbox must be disabled.
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: ['load', 'networkidle0'] });
    // Ensure mermaid rendering has a moment to apply.
    await new Promise((r) => setTimeout(r, 400));
    await page.pdf({
      path: outPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
    });
  } finally {
    await browser.close();
  }
}

