import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { marked } from 'marked';

export type PdfBranding = {
  companyName: string;
  siteUrl: string;
  /** Cyan / accent (matches site dark: #22d3ee) */
  primary: string;
  /** Indigo / secondary (matches site dark: #6366f1) */
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

/**
 * AI models often emit `sequenceDiagram    participant` on one line — Mermaid needs a newline after the diagram keyword.
 */
function normalizeMermaidInMarkdown(markdown: string): string {
  return markdown.replace(/```mermaid\s*([\s\S]*?)```/gi, (_, inner: string) => {
    let c = inner.replace(/\r\n/g, '\n');
    c = c.replace(/^(flowchart|sequenceDiagram|graph\s+TD|graph\s+LR|stateDiagram-v2)\s{2,}/im, (m: string) => `${m.trimEnd()}\n`);
    c = c.replace(/(sequenceDiagram)\s+(participant\b)/gi, '$1\n$2');
    c = c.replace(/(flowchart\s+\w+)\s+(subgraph\b|\w+\s*\[)/gi, '$1\n$2');
    return `\`\`\`mermaid\n${c.trim()}\n\`\`\``;
  });
}

/** Turn `/elvoria.png` in proposal HTML into absolute URLs so Puppeteer can fetch them. */
function absolutizeHtmlImages(html: string, siteBase: string): string {
  const base = siteBase.replace(/\/$/, '');
  let out = html.replace(/<img([^>]*?)\ssrc="\/([^"]+)"/gi, (_m, attrs: string, p: string) => {
    return `<img${attrs} src="${base}/${p}"`;
  });
  out = out.replace(/<img([^>]*?)\ssrc='\/([^']+)'/gi, (_m, attrs: string, p: string) => {
    return `<img${attrs} src='${base}/${p}'`;
  });
  return out;
}

export async function renderProposalPdf(params: {
  markdown: string;
  outPath: string;
  branding: PdfBranding;
  /** From `loadProposalPdfServerAssets()` — avoids `process.cwd()` in this module for Turbopack NFT. */
  logoDataUri: string | null;
  mermaidScript: string;
}) {
  const { markdown, outPath, branding, logoDataUri, mermaidScript } = params;
  const siteBase = branding.siteUrl.replace(/\/$/, '');

  const mdForPdf = normalizeMermaidInMarkdown(markdown);
  let htmlBody = marked.parse(mdForPdf, { gfm: true }) as string;
  htmlBody = absolutizeHtmlImages(htmlBody, siteBase);

  const logoSrc = logoDataUri || `${siteBase}/elvoria.png`;
  const mermaidScriptTag = mermaidScript ? `<script>${mermaidScript}</script>` : '';

  const p = escapeHtml(branding.primary);
  const s = escapeHtml(branding.secondary);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(branding.companyName)} — Technical Proposal</title>
    <style>
      :root{
        --bg:#020617;
        --surface:rgba(255,255,255,0.04);
        --text:#e5e7eb;
        --muted:rgba(226,232,240,0.72);
        --primary:${p};
        --secondary:${s};
        --border:rgba(255,255,255,0.10);
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
        border:1px solid var(--border);
        border-radius:18px;
        background:linear-gradient(135deg, rgba(99,102,241,0.22), rgba(34,211,238,0.12));
        box-shadow:0 18px 48px rgba(0,0,0,0.35);
      }
      .brand{ display:flex; gap:12px; align-items:center; }
      .logo{ width:44px; height:44px; border-radius:12px; object-fit:cover; background:#0f172a; border:1px solid rgba(255,255,255,0.08); }
      .title{ font-weight:900; font-size:16px; letter-spacing:.2px; color:#f8fafc; }
      .sub{ color:var(--muted); font-size:12px; margin-top:3px; }
      .meta{ text-align:right; color:var(--muted); font-size:12px; }
      .doc{
        margin-top:18px;
        padding:22px 20px;
        border:1px solid var(--border);
        border-radius:18px;
        background:var(--surface);
      }
      .doc h1,.doc h2,.doc h3{ margin:16px 0 10px; line-height:1.25; color:#f8fafc; }
      .doc h1{ font-size:22px; padding-bottom:8px; border-bottom:1px solid rgba(34,211,238,0.25); }
      .doc h2{ font-size:16px; color:#e5e7eb; }
      .doc h3{ font-size:14px; color:#e5e7eb; opacity:.98; }
      .doc p,.doc li{ font-size:13px; line-height:1.7; color:var(--text); }
      .doc ul{ padding-left:1.2rem; }
      .doc code{ font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace; font-size:12px; }
      .doc pre{
        background:rgba(15,23,42,0.85);
        border:1px solid rgba(255,255,255,0.08);
        border-radius:14px;
        padding:12px 14px;
        overflow:auto;
        color:#e2e8f0;
      }
      .doc blockquote{
        margin:12px 0;
        padding:10px 12px;
        border-left:3px solid rgba(34,211,238,0.75);
        background:rgba(99,102,241,0.08);
        border-radius:10px;
        color:var(--text);
      }
      .doc a{ color:#67e8f9; text-decoration:none; }
      .doc table{ border-collapse:collapse; width:100%; font-size:12px; margin:14px 0; }
      .doc th,.doc td{ border:1px solid rgba(255,255,255,0.12); padding:8px 10px; text-align:left; vertical-align:top; }
      .doc th{ background:rgba(99,102,241,0.18); color:#f1f5f9; font-weight:700; }
      .doc tr:nth-child(even) td{ background:rgba(255,255,255,0.02); }
      .doc hr{ border:none; border-top:1px solid rgba(255,255,255,0.12); margin:18px 0; }
      .footer{
        margin-top:14px;
        color:var(--muted);
        font-size:11px;
        line-height:1.6;
      }
      .mermaid { background: rgba(15,23,42,0.65); border: 1px solid rgba(255,255,255,0.10); border-radius: 14px; padding: 10px; margin: 12px 0; }
      .mermaid svg { max-width: 100%; height: auto; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <div class="brand">
          <img class="logo" src="${escapeHtml(logoSrc)}" alt="" width="44" height="44" />
          <div>
            <div class="title">${escapeHtml(branding.companyName)} — Technical Proposal</div>
            <div class="sub">${escapeHtml(branding.siteUrl)}</div>
          </div>
        </div>
        <div class="meta">
          Generated: ${escapeHtml(new Date().toLocaleString('en-GB', { timeZone: 'UTC' }))} UTC<br/>
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
    ${mermaidScriptTag}
    <script>
      try {
        if (typeof mermaid !== 'undefined') {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            themeVariables: {
              primaryColor: '#22d3ee',
              primaryTextColor: '#020617',
              primaryBorderColor: '#06b6d4',
              lineColor: '#94a3b8',
              secondaryColor: '#6366f1',
              tertiaryColor: '#0f172a',
            },
          });
          const blocks = Array.from(document.querySelectorAll('code.language-mermaid'));
          blocks.forEach((code) => {
            const pre = code.parentElement;
            const src = (code.textContent || '').trim();
            const container = document.createElement('div');
            container.className = 'mermaid';
            container.textContent = src;
            if (pre && pre.parentElement) pre.parentElement.replaceChild(container, pre);
          });
          if (blocks.length) {
            try {
              var runResult = mermaid.run({ querySelector: '.mermaid' });
              if (runResult && typeof runResult.then === 'function') {
                runResult.catch(function (e) { console.warn('mermaid.run', e); });
              }
            } catch (e) {
              console.warn('mermaid.run', e);
            }
          }
        }
      } catch (e) {
        console.warn('Mermaid render failed', e);
      }
    </script>
  </body>
</html>`;

  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load', timeout: 120_000 });
    await new Promise((r) => setTimeout(r, 1400));
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
