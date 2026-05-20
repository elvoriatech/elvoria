-- Elvoria Email Marketing (run in Supabase SQL Editor after crm_schema.sql).
-- Server-only access via SUPABASE_SERVICE_ROLE_KEY.

create type public.em_template_type as enum ('initial', 'follow_up_1', 'follow_up_2');

create table if not exists public.em_templates (
  template_type public.em_template_type primary key,
  subject text not null,
  body_html text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.em_recipients (
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
  last_template_type public.em_template_type,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists em_recipients_email_unique on public.em_recipients (email);
create index if not exists em_recipients_status_idx on public.em_recipients (status);

create table if not exists public.em_campaigns (
  id uuid primary key default gen_random_uuid(),
  template_type public.em_template_type not null,
  auto_follow_up boolean not null default false,
  recipient_count int not null default 0,
  sent_count int not null default 0,
  failed_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.em_send_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.em_campaigns (id) on delete set null,
  recipient_id uuid references public.em_recipients (id) on delete set null,
  template_type public.em_template_type not null,
  email text not null,
  status text not null check (status in ('sent', 'failed')),
  error_message text not null default '',
  sent_at timestamptz not null default now()
);

create index if not exists em_send_logs_sent_at_idx on public.em_send_logs (sent_at desc);
create index if not exists em_campaigns_created_idx on public.em_campaigns (created_at desc);

alter table public.em_templates enable row level security;
alter table public.em_recipients enable row level security;
alter table public.em_campaigns enable row level security;
alter table public.em_send_logs enable row level security;

revoke all on public.em_templates from anon, authenticated;
revoke all on public.em_recipients from anon, authenticated;
revoke all on public.em_campaigns from anon, authenticated;
revoke all on public.em_send_logs from anon, authenticated;

grant all on public.em_templates to service_role;
grant all on public.em_recipients to service_role;
grant all on public.em_campaigns to service_role;
grant all on public.em_send_logs to service_role;
