-- Background campaign send jobs (run after email_marketing_schema.sql).
-- Run in Supabase SQL Editor.

create table if not exists public.em_send_jobs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.em_campaigns (id) on delete set null,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  template_type public.em_template_type not null,
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

create index if not exists em_send_jobs_status_created_idx
  on public.em_send_jobs (status, created_at desc);

alter table public.em_send_jobs enable row level security;
revoke all on public.em_send_jobs from anon, authenticated;
grant all on public.em_send_jobs to service_role;
