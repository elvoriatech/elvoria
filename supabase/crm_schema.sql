-- Elvoria CRM: encrypted PII + conversations (run once in Supabase SQL Editor after booking_schema.sql).
-- Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATA_ENCRYPTION_KEY (app-side AES-256-GCM).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Leads (widget gate) — linked 1:1 to a conversation id
-- ---------------------------------------------------------------------------
create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique,
  source text not null,
  email_lookup_hash text not null,
  full_name_enc text not null,
  email_enc text not null,
  company_enc text not null,
  phone_enc text not null default '',
  follow_up_status text not null default 'new'
    check (follow_up_status in ('new', 'contacted', 'qualified', 'won', 'lost')),
  follow_up_notes_enc text not null default '',
  follow_up_next_at timestamptz,
  follow_up_updated_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists crm_leads_email_hash_idx on public.crm_leads (email_lookup_hash);
create index if not exists crm_leads_follow_up_status_idx on public.crm_leads (follow_up_status);
create index if not exists crm_leads_created_at_idx on public.crm_leads (created_at desc);

-- ---------------------------------------------------------------------------
-- Conversation snapshots (encrypted JSON: { messages, draft })
-- ---------------------------------------------------------------------------
create table if not exists public.crm_conversations (
  id uuid primary key,
  snapshot_enc text not null,
  message_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_conversations_updated_idx on public.crm_conversations (updated_at desc);

alter table public.crm_leads
  drop constraint if exists crm_leads_conversation_id_fkey;

alter table public.crm_leads
  add constraint crm_leads_conversation_id_fkey
  foreign key (conversation_id) references public.crm_conversations (id) on delete cascade;

-- ---------------------------------------------------------------------------
-- Finalized proposal versions + PDF metadata
-- ---------------------------------------------------------------------------
create table if not exists public.crm_proposal_versions (
  id uuid primary key,
  conversation_id uuid not null references public.crm_conversations (id) on delete cascade,
  lead_id uuid references public.crm_leads (id) on delete set null,
  visitor_email_lookup_hash text not null default '',
  visitor_name_enc text not null default '',
  visitor_email_enc text not null default '',
  draft_snapshot_enc text not null default '',
  estimate_enc text not null default '',
  markdown_enc text not null default '',
  pdf_status text not null default 'queued'
    check (pdf_status in ('queued', 'ready', 'failed')),
  pdf_error_enc text not null default '',
  pdf_storage_path text,
  finalized_at timestamptz not null default now(),
  expires_at timestamptz not null,
  visitor_notified_pdf_issue boolean not null default false,
  pdf_emailed_by_admin_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists crm_proposal_versions_conv_idx on public.crm_proposal_versions (conversation_id);
create index if not exists crm_proposal_versions_finalized_idx on public.crm_proposal_versions (finalized_at desc);

-- ---------------------------------------------------------------------------
-- Private PDF bucket (service role only via app)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proposal-pdfs',
  'proposal-pdfs',
  false,
  52428800,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- RLS: deny anon/authenticated; app uses service_role server-side only
-- ---------------------------------------------------------------------------
alter table public.crm_leads enable row level security;
alter table public.crm_conversations enable row level security;
alter table public.crm_proposal_versions enable row level security;

revoke all on public.crm_leads from anon, authenticated;
revoke all on public.crm_conversations from anon, authenticated;
revoke all on public.crm_proposal_versions from anon, authenticated;

grant all on public.crm_leads to service_role;
grant all on public.crm_conversations to service_role;
grant all on public.crm_proposal_versions to service_role;
