# Testing

## Run tests

```bash
npm test          # full suite
npm run test:watch  # watch mode
npm run test:ci     # CI mode (non-interactive)
```

## Pre-commit

`husky` runs `npm test` on every `git commit`. If any test fails, the commit is blocked.

To commit without hooks (emergency only):

```bash
git commit --no-verify
```

## What is covered

- **Mail config** — password normalization, From address, Gmail error hints (`lib/siteMailer`)
- **Visitor auto-replies** — `SEND_AUTOREPLY`, marketing layout emails (`lib/visitorAckEmail`, `lib/visitorAutoReplyLayout`)
- **Email marketing** — template variables, outreach HTML shell, recipient pagination (`lib/emailMarketing`)
- **API routes** — contact form and support-lead validation + success paths (mocked mail/CRM)

Recipients admin lists **500 companies per page** with total count; selection persists in `sessionStorage` between Companies and Campaigns tabs.

Tests do not call Gmail, Supabase, or OpenRouter. Add new tests under `**/__tests__/**/*.test.ts` when changing behavior.
