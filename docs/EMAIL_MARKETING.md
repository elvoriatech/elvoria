# Email Marketing (Admin)

## Setup

1. Ensure Supabase env vars are set (same as CRM).
2. Run **`supabase/email_marketing_schema.sql`** in the Supabase SQL Editor (after `crm_schema.sql`).
3. Ensure outbound email is configured (`SMTP_*` or `EMAIL_*` in `.env.local`).

## Admin routes

| Path | Purpose |
|------|---------|
| `/admin/email-marketing/templates` | Edit initial + 2 follow-up templates |
| `/admin/email-marketing/recipients` | Manual add + Excel upload |
| `/admin/email-marketing/campaigns` | Select template type, recipients, send |
| `/admin/email-marketing/logs` | Campaign summary + per-email log |

## Templates: save vs default

| Action | What it does |
|--------|----------------|
| **Factory default** | Built into the app (`lib/emailMarketing/defaults.ts`). Never deleted. |
| **Save template** | Your edited copy in Supabase — used when you send campaigns. |
| **Reset to default** | Admin → Templates → **Reset to default** on the active tab restores factory text (with confirm). |

Branded header/footer/logo are added automatically on preview and send — not stored in the DB.

## Variables

`[First Name]`, `[Company Name]`, `[Industry]` — replaced per recipient on send.

## Auto follow-up

When sending **Initial** with “Auto follow-up” checked:

- After **3 days** (no reply): run **Process due auto follow-ups** or call `POST /api/admin/email-marketing/follow-ups` to send Follow-up 1.
- After **~5 days** from Follow-up 1: sends Final follow-up.

Mark recipients **Replied** on the Companies tab to stop follow-ups.

## Excel upload

`.xlsx` with columns: **First Name**, **Email**, **Company Name**, **Industry** (header names flexible).
