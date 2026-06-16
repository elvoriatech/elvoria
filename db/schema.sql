-- Elvoria — consolidated PostgreSQL schema (plain Postgres, no Supabase).
-- Apply once:  psql "$DATABASE_URL" -f db/schema.sql
-- or:          npm run db:setup

create extension if not exists "pgcrypto";

-- ===========================================================================
-- Bookings
-- ===========================================================================
create table if not exists meeting_types (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  duration_minutes int not null default 30,
  description text,
  created_at timestamptz not null default now()
);

insert into meeting_types (slug, title, duration_minutes, description)
values ('consultation', 'Free consultation', 30, '30-minute discovery call')
on conflict (slug) do nothing;

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  meeting_type_id uuid not null references meeting_types (id) on delete restrict,
  name text not null,
  email text not null,
  company text,
  notes text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default now(),
  constraint bookings_end_after_start check (end_time > start_time)
);

create index if not exists bookings_start_time_idx on bookings (start_time);
create index if not exists bookings_range_idx on bookings (start_time, end_time);

create or replace function book_consultation(
  p_meeting_slug text,
  p_name text,
  p_email text,
  p_start timestamptz,
  p_end timestamptz,
  p_company text default null,
  p_notes text default null
) returns jsonb
language plpgsql
as $$
declare
  mt_id uuid;
  new_id uuid;
begin
  perform pg_advisory_xact_lock(87299101);

  select id from meeting_types where slug = p_meeting_slug limit 1 into mt_id;
  if mt_id is null then
    return jsonb_build_object('ok', false, 'error', 'unknown_meeting_type');
  end if;

  if exists (
    select 1 from bookings b
    where b.start_time < p_end and b.end_time > p_start
  ) then
    return jsonb_build_object('ok', false, 'error', 'conflict');
  end if;

  insert into bookings (meeting_type_id, name, email, company, notes, start_time, end_time)
  values (
    mt_id,
    trim(p_name),
    lower(trim(p_email)),
    nullif(trim(p_company), ''),
    nullif(trim(p_notes), ''),
    p_start,
    p_end
  )
  returning id into new_id;

  return jsonb_build_object(
    'ok', true,
    'booking', jsonb_build_object('id', new_id, 'start_time', p_start, 'end_time', p_end)
  );
end;
$$;

-- ===========================================================================
-- CRM: encrypted leads, conversations, proposal versions
-- ===========================================================================
create table if not exists crm_conversations (
  id uuid primary key,
  snapshot_enc text not null,
  message_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_conversations_updated_idx on crm_conversations (updated_at desc);

create table if not exists crm_leads (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique references crm_conversations (id) on delete cascade,
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

create index if not exists crm_leads_email_hash_idx on crm_leads (email_lookup_hash);
create index if not exists crm_leads_follow_up_status_idx on crm_leads (follow_up_status);
create index if not exists crm_leads_created_at_idx on crm_leads (created_at desc);

create table if not exists crm_proposal_versions (
  id uuid primary key,
  conversation_id uuid not null references crm_conversations (id) on delete cascade,
  lead_id uuid references crm_leads (id) on delete set null,
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
  pdf_bytes bytea,
  finalized_at timestamptz not null default now(),
  expires_at timestamptz not null,
  visitor_notified_pdf_issue boolean not null default false,
  pdf_emailed_by_admin_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists crm_proposal_versions_conv_idx on crm_proposal_versions (conversation_id);
create index if not exists crm_proposal_versions_finalized_idx on crm_proposal_versions (finalized_at desc);

-- ===========================================================================
-- Email marketing
-- ===========================================================================
do $$ begin
  create type em_template_type as enum ('initial', 'follow_up_1', 'follow_up_2');
exception
  when duplicate_object then null;
end $$;

create table if not exists em_templates (
  template_type em_template_type primary key,
  subject text not null,
  body_html text not null,
  updated_at timestamptz not null default now()
);

create table if not exists em_recipients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default '',
  contact_name text not null default '',
  email text not null,
  industry text not null default '',
  notes text not null default '',
  status text not null default 'not_sent'
    check (status in ('not_sent', 'sent', 'replied')),
  auto_follow_up boolean not null default false,
  initial_sent_at timestamptz,
  follow_up_1_sent_at timestamptz,
  follow_up_2_sent_at timestamptz,
  replied_at timestamptz,
  last_template_type em_template_type,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists em_recipients_email_unique on em_recipients (email);
create index if not exists em_recipients_status_idx on em_recipients (status);

create table if not exists em_campaigns (
  id uuid primary key default gen_random_uuid(),
  template_type em_template_type not null,
  auto_follow_up boolean not null default false,
  recipient_count int not null default 0,
  sent_count int not null default 0,
  failed_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists em_send_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references em_campaigns (id) on delete set null,
  recipient_id uuid references em_recipients (id) on delete set null,
  template_type em_template_type not null,
  email text not null,
  status text not null check (status in ('sent', 'failed')),
  error_message text not null default '',
  sent_at timestamptz not null default now()
);

create index if not exists em_send_logs_sent_at_idx on em_send_logs (sent_at desc);
create index if not exists em_campaigns_created_idx on em_campaigns (created_at desc);

create table if not exists em_send_jobs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references em_campaigns (id) on delete set null,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  template_type em_template_type not null,
  auto_follow_up boolean not null default false,
  selection_mode text not null check (selection_mode in ('all_not_sent', 'recipient_ids')),
  recipient_ids jsonb not null default '[]'::jsonb,
  processed_index int not null default 0,
  total_count int not null default 0,
  sent_count int not null default 0,
  failed_count int not null default 0,
  last_error text not null default '',
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists em_send_jobs_status_created_idx on em_send_jobs (status, created_at desc);

-- ===========================================================================
-- Site analytics
-- ===========================================================================
create table if not exists site_page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null,
  path text not null default '/',
  viewed_at timestamptz not null default now()
);

create index if not exists site_page_views_viewed_at_idx on site_page_views (viewed_at desc);
create index if not exists site_page_views_visitor_id_idx on site_page_views (visitor_id);
