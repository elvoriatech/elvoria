import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const nodeRequire = createRequire(import.meta.url);

/** Logo + Mermaid bundle for PDF — use `createRequire` so Turbopack does not rewrite `node_modules` paths. */
export async function loadProposalPdfServerAssets(): Promise<{
  logoDataUri: string | null;
  mermaidScript: string;
}> {
  let logoDataUri: string | null = null;
  try {
    const buf = await fs.readFile(path.join(process.cwd(), 'public', 'elvoria.png'));
    logoDataUri = `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    logoDataUri = null;
  }

  let mermaidScript = '';
  try {
    const mermaidPath = nodeRequire.resolve('mermaid/dist/mermaid.min.js');
    mermaidScript = await fs.readFile(mermaidPath, 'utf8');
  } catch (err) {
    console.warn('[proposalPdf] mermaid.min.js not loaded:', (err as Error)?.message || err);
    mermaidScript = '';
  }

  return { logoDataUri, mermaidScript };
}
