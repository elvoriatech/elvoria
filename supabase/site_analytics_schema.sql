-- Site visitor page views (run once in Supabase SQL Editor)
create table if not exists public.site_page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null,
  path text not null default '/',
  viewed_at timestamptz not null default now()
);

create index if not exists site_page_views_viewed_at_idx on public.site_page_views (viewed_at desc);
create index if not exists site_page_views_visitor_id_idx on public.site_page_views (visitor_id);

alter table public.site_page_views enable row level security;
