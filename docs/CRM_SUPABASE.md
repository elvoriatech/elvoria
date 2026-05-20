# CRM on Supabase (GDPR-oriented)

All proposal leads, chat transcripts, and proposal PDFs are stored in **Supabase** (not local `data/` files). Personally identifiable fields are **encrypted in the application** before insert (AES-256-GCM). Email lookup uses an HMAC hash so plaintext email is not indexed in the database.

## 1. Supabase project (EU)

1. Create or use a Supabase project in an **EU region** (e.g. Frankfurt).
2. Run SQL in order:
   - `supabase/booking_schema.sql` (if you use consultation booking)
   - `supabase/crm_schema.sql`

## 2. Environment variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server only — never expose to the browser

# 32-byte secret for field encryption (generate once, store securely, rotate with a migration plan)
DATA_ENCRYPTION_KEY=   # openssl rand -base64 32

# Optional separate pepper for email HMAC (defaults to DATA_ENCRYPTION_KEY)
# GDPR_LOOKUP_PEPPER=
```

## 3. GDPR notes (high level — not legal advice)

- **Processor**: Supabase hosts encrypted ciphertext; your app holds the encryption key (`DATA_ENCRYPTION_KEY`).
- **Purpose limitation**: Use admin access only for sales follow-up and proposal delivery.
- **Retention**: Define and document how long you keep conversations/PDFs; delete rows and storage objects when retention expires.
- **Data subject requests**: Export/decrypt via admin UI or a future script; erasure = delete `crm_leads`, `crm_conversations`, related `crm_proposal_versions`, and PDF objects in bucket `proposal-pdfs`.
- **DPA**: Ensure a signed DPA with Supabase for EU processing.

## 4. Admin

- **Overview** — leads with link to conversation
- **Conversations** — full transcript + follow-up status/notes/next date
- **AI proposals** — finalized versions; PDFs in private storage

## 5. Optional migration from local files

Legacy `data/conversations/*.json` and `data/support-leads.json` are no longer read. A one-off import script can be added if you need historical data in Supabase.
