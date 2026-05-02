-- Run in Supabase SQL Editor (once). Requires pgcrypto for gen_random_uuid.

create extension if not exists "pgcrypto";

create table if not exists public.meeting_types (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  duration_minutes int not null default 30,
  description text,
  created_at timestamptz not null default now()
);

insert into public.meeting_types (slug, title, duration_minutes, description)
values ('consultation', 'Free consultation', 30, '30-minute discovery call')
on conflict (slug) do nothing;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  meeting_type_id uuid not null references public.meeting_types (id) on delete restrict,
  name text not null,
  email text not null,
  company text,
  notes text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default now(),
  constraint bookings_end_after_start check (end_time > start_time)
);

create index if not exists bookings_start_time_idx on public.bookings (start_time);
create index if not exists bookings_range_idx on public.bookings (start_time, end_time);

create or replace function public.book_consultation(
  p_meeting_slug text,
  p_name text,
  p_email text,
  p_start timestamptz,
  p_end timestamptz,
  p_company text default null,
  p_notes text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
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
    'booking', jsonb_build_object(
      'id', new_id,
      'start_time', p_start,
      'end_time', p_end
    )
  );
end;
$$;

revoke all on function public.book_consultation(text, text, text, timestamptz, timestamptz, text, text) from public;
grant execute on function public.book_consultation(text, text, text, timestamptz, timestamptz, text, text) to service_role;

alter table public.meeting_types enable row level security;
alter table public.bookings enable row level security;
