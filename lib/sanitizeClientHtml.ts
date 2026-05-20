/** DOMPurify only runs in the browser (requires `window`). Safe for SSR client components. */

type SanitizeConfig = {
  USE_PROFILES?: { html?: boolean };
  ADD_ATTR?: string[];
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
};

type PurifyLike = { sanitize: (html: string, cfg?: SanitizeConfig) => string };

function getDOMPurify(): PurifyLike | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('dompurify') as PurifyLike & { default?: PurifyLike };
  if (typeof mod.sanitize === 'function') return mod;
  if (mod.default && typeof mod.default.sanitize === 'function') return mod.default;
  return null;
}

export function sanitizeClientHtml(html: string, config?: SanitizeConfig): string {
  const purify = getDOMPurify();
  if (!purify) return html;
  return purify.sanitize(html, config);
}
