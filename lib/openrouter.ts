import { OpenRouter } from '@openrouter/sdk';
import { pickFreeOpenRouterTextModel } from '@/lib/openrouterFreeModel';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export function getOpenRouterClient() {
  const apiKey = requiredEnv('OPENROUTER_API_KEY');
  const referer = process.env.OPENROUTER_HTTP_REFERER || process.env.SITE_URL || 'https://elvoriatech.com';
  const title = process.env.OPENROUTER_TITLE || process.env.COMPANY_NAME || 'Elvoria Technologies';

  return new OpenRouter({
    apiKey,
    httpReferer: referer,
    appTitle: title,
  });
}

export function getChatModel() {
  return process.env.OPENAI_MODEL || process.env.OPENROUTER_MODEL || 'openai/gpt-5.2';
}

function isFreeOnlyMode() {
  const v = String(process.env.OPENROUTER_FREE_ONLY ?? '').toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

/** Resolves which OpenRouter model id to call (explicit env, or catalog free model when testing). */
export async function resolveChatModelId(): Promise<string> {
  if (isFreeOnlyMode()) {
    return pickFreeOpenRouterTextModel();
  }
  return getChatModel();
}

export function getTemperature() {
  const raw = process.env.OPENAI_TEMPERATURE;
  const parsed = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0.2;
}

export async function sendChat(messages: ChatMessage[]) {
  const client = getOpenRouterClient();
  const model = await resolveChatModelId();
  const completion = await client.chat.send({
    chatRequest: {
      model,
      messages,
      temperature: getTemperature(),
      stream: false,
    },
  });

  const content = completion?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned no message content');
  return content;
}

