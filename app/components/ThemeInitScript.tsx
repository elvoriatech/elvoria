import { headers } from 'next/headers';

/** Apply saved theme before paint; uses CSP nonce from middleware. */
export async function ThemeInitScript() {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return <script src="/theme-init.js" nonce={nonce} suppressHydrationWarning />;
}
