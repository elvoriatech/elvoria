import fs from 'node:fs/promises';
import path from 'node:path';

/** Logo + Mermaid bundle for PDF — isolated so Turbopack NFT does not treat the PDF renderer as tracing all of `cwd`. */
export async function loadProposalPdfServerAssets(): Promise<{
  logoDataUri: string | null;
  mermaidScript: string;
}> {
  let logoDataUri: string | null = null;
  try {
    const buf = await fs.readFile(
      path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'elvoria.png')
    );
    logoDataUri = `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    logoDataUri = null;
  }

  let mermaidScript = '';
  try {
    mermaidScript = await fs.readFile(
      path.join(/*turbopackIgnore: true*/ process.cwd(), 'node_modules', 'mermaid', 'dist', 'mermaid.min.js'),
      'utf8'
    );
  } catch {
    mermaidScript = '';
  }

  return { logoDataUri, mermaidScript };
}
