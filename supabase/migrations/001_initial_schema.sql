create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'family');
create type public.interaction_type as enum (
  'call',
  'missed_call_returned',
  'text_exchange',
  'fortnite',
  'visit',
  'manual_activity',
  'life_event',
  'birthday_remembered',
  'admin_bonus',
  'admin_penalty'
);
create type public.interaction_direction as enum ('inbound', 'outbound', 'mutual');
create type public.interaction_source as enum ('manual', 'import', 'admin');
create type public.approval_status as enum ('pending', 'approved', 'denied');
create type public.score_period as enum ('week', 'month', 'year', 'all_time');
create type public.age_bracket as enum ('kid', 'teen', 'adult', 'unknown');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'family',
  display_name text,
  created_at timestamptz not null default now()
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  relationship text not null,
  birthday date,
  age_bracket public.age_bracket not null default 'unknown',
  phone text,
  email text,
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  type public.interaction_type not null,
  direction public.interaction_direction not null default 'mutual',
  initiated_by_person boolean not null default false,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes numeric not null default 0 check (duration_minutes >= 0),
  message_count integer not null default 0 check (message_count >= 0),
  is_group_chat boolean not null default false,
  source public.interaction_source not null default 'manual',
  status public.approval_status not null default 'pending',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.scoring_weights (
  id uuid primary key default gen_random_uuid(),
  interaction_type text not null unique,
  base_points numeric not null default 0,
  points_per_minute numeric not null default 0,
  points_per_message numeric not null default 0,
  cap_per_event numeric,
  initiative_bonus numeric not null default 0,
  returned_call_bonus numeric not null default 0,
  active boolean not null default true
);

create table public.scores (
  person_id uuid not null references public.people(id) on delete cascade,
  total_score numeric not null default 0,
  call_score numeric not null default 0,
  text_score numeric not null default 0,
  initiative_score numeric not null default 0,
  time_together_score numeric not null default 0,
  reliability_score numeric not null default 0,
  bonus_score numeric not null default 0,
  penalty_score numeric not null default 0,
  period public.score_period not null,
  calculated_at timestamptz not null default now(),
  primary key (person_id, period)
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text
);

create table public.person_badges (
  person_id uuid not null references public.people(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (person_id, badge_id)
);

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.scoring_weights (
  interaction_type,
  base_points,
  points_per_minute,
  points_per_message,
  cap_per_event,
  initiative_bonus,
  returned_call_bonus,
  active
) values
  ('call:inbound', 50, 2, 0, 150, 15, 0, true),
  ('call:outbound', 20, 1, 0, 75, 0, 0, true),
  ('missed_call_returned', 75, 2, 0, 175, 15, 25, true),
  ('text_exchange:person_initiated', 30, 1, 0.5, 100, 15, 0, true),
  ('text_exchange:reply', 10, 0.5, 0.25, 50, 0, 0, true),
  ('fortnite', 10, 3, 0, 250, 10, 0, true),
  ('visit', 50, 5, 0, 500, 10, 0, true),
  ('birthday_remembered', 200, 0, 0, 200, 0, 0, true),
  ('life_event', 150, 0, 0, 150, 25, 0, true),
  ('manual_activity', 10, 2, 0, 200, 10, 0, true),
  ('admin_bonus', 0, 1, 0, null, 0, 0, true),
  ('admin_penalty', 0, 1, 0, null, 0, 0, true)
on conflict (interaction_type) do nothing;

insert into public.app_settings (key, value) values
  ('public_leaderboard_enabled', 'false'::jsonb),
  ('limited_family_leaderboard_enabled', 'true'::jsonb),
  ('inheritance_simulator_enabled', 'true'::jsonb)
on conflict (key) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.owns_person(target_person_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.people
    where id = target_person_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (new.id, 'family', coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
