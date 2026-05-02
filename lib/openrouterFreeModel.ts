import { OpenRouter } from '@openrouter/sdk';

/** Minimal shape from `GET /models` for filtering (avoids deep SDK path imports). */
type CatalogModel = {
  id: string;
  pricing: { prompt: string; completion: string };
  architecture: { inputModalities: string[]; outputModalities: string[] };
};

function openRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing environment variable: OPENROUTER_API_KEY');
  const referer = process.env.OPENROUTER_HTTP_REFERER || process.env.SITE_URL || 'https://elvoriatech.com';
  const title = process.env.OPENROUTER_TITLE || process.env.COMPANY_NAME || 'Elvoriatech';
  return new OpenRouter({
    apiKey,
    httpReferer: referer,
    appTitle: title,
  });
}

const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { modelId: string; fetchedAt: number } | null = null;

function parsePrice(value: string | undefined): number {
  if (value === undefined || value === '') return Number.NaN;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : Number.NaN;
}

function isFreeModel(m: CatalogModel): boolean {
  const prompt = parsePrice(m.pricing?.prompt);
  const completion = parsePrice(m.pricing?.completion);
  if (prompt === 0 && completion === 0) return true;
  if (m.id.toLowerCase().includes(':free')) return true;
  return false;
}

/** Free endpoints include non-chat models; keep text-in → text-out only. */
function supportsTextChat(m: CatalogModel): boolean {
  const inputs = m.architecture?.inputModalities ?? [];
  const outputs = m.architecture?.outputModalities ?? [];
  return inputs.includes('text') && outputs.includes('text');
}

function blockedId(id: string): boolean {
  const lower = id.toLowerCase();
  // Heuristics for free-tier entries that are not general chat completions.
  if (lower.includes('ocr')) return true;
  if (lower.includes('lyria')) return true;
  if (lower.includes('clip-preview')) return true;
  return false;
}

function preferenceOrder(): string[] {
  const raw =
    process.env.OPENROUTER_FREE_MODEL_PREFERENCE ||
    'nemotron,laguna,gemma,owl,ling-2.6,qianfan,hy3';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function sortFreeTextModels(models: CatalogModel[]): CatalogModel[] {
  const prefs = preferenceOrder();
  return [...models].sort((a, b) => {
    const ia = prefs.findIndex((p) => a.id.toLowerCase().includes(p));
    const ib = prefs.findIndex((p) => b.id.toLowerCase().includes(p));
    const sa = ia === -1 ? 999 : ia;
    const sb = ib === -1 ? 999 : ib;
    if (sa !== sb) return sa - sb;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Picks one OpenRouter model id from the live catalog: free (pricing 0 or :free) and text chat.
 * Cached ~5 minutes. Requires OPENROUTER_API_KEY.
 */
export async function pickFreeOpenRouterTextModel(): Promise<string> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.modelId;
  }

  const client = openRouterClient();
  const list = await client.models.list();
  const data = list.data as CatalogModel[];

  const candidates = data.filter(
    (m) => isFreeModel(m) && supportsTextChat(m) && !blockedId(m.id)
  );

  if (!candidates.length) {
    throw new Error(
      'No suitable free text chat models returned from OpenRouter. Check OPENROUTER_API_KEY and try again later.'
    );
  }

  const sorted = sortFreeTextModels(candidates);
  const modelId = sorted[0].id;
  cache = { modelId, fetchedAt: now };
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.info(
      `[openrouter] OPENROUTER_FREE_ONLY: using ${modelId} (${sorted.length} free text candidates)`
    );
  }
  return modelId;
}

export function clearFreeModelCache() {
  cache = null;
}
