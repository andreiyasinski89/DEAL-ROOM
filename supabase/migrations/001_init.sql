-- DEAL ROOM · initial schema (Phase 5, with the team tables Phase 7 needs).
-- Run in the Supabase SQL editor or with `supabase db push`.
-- Row Level Security is ON for every table: a player sees only their own rows;
-- a team leader sees the sessions of their team members.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role text not null default 'player' check (role in ('player', 'leader', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- a player must not promote themselves: only display_name is writable from the client
revoke update on public.profiles from authenticated, anon;
grant update (display_name) on public.profiles to authenticated;

-- create the profile row on sign-up
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), ''));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- teams
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  invite_code text not null unique default encode(gen_random_bytes(5), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'leader')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- helper functions are SECURITY DEFINER so policies do not recurse into themselves
create or replace function public.is_team_member(t uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.team_members m where m.team_id = t and m.user_id = auth.uid());
$$;

create or replace function public.leads_player(player uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from public.team_members lead
    join public.team_members m on m.team_id = lead.team_id
    where lead.user_id = auth.uid() and lead.role = 'leader' and m.user_id = player
  );
$$;

create policy "teams: members read" on public.teams
  for select using (owner_id = auth.uid() or public.is_team_member(id));
create policy "teams: owner writes" on public.teams
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "team_members: read own team" on public.team_members
  for select using (user_id = auth.uid() or public.is_team_member(team_id));
create policy "team_members: leader manages" on public.team_members
  for all using (exists (select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid()))
  with check (exists (select 1 from public.teams t where t.id = team_id and t.owner_id = auth.uid()));
create policy "team_members: join as member" on public.team_members
  for insert with check (user_id = auth.uid() and role = 'member');

-- ---------------------------------------------------------------- scenarios (custom / generated)
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.scenarios enable row level security;
create policy "scenarios: read own or public" on public.scenarios
  for select using (owner_id = auth.uid() or is_public);
create policy "scenarios: write own" on public.scenarios
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ---------------------------------------------------------------- sessions (one row = one game)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,                      -- generated in the browser, makes sync idempotent
  user_id uuid not null references auth.users (id) on delete cascade,
  scenario_id text not null,
  level int not null check (level between 1 and 5),
  outcome text not null check (outcome in ('sale', 'partial', 'lost')),
  score int not null default 0,
  turns int not null default 0,
  duration_sec int not null default 0,
  hints_used int not null default 0,
  moves jsonb not null default '[]'::jsonb,     -- [{nodeId, quality}]
  played_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists sessions_user_idx on public.sessions (user_id, played_at desc);

alter table public.sessions enable row level security;
create policy "sessions: read own" on public.sessions
  for select using (user_id = auth.uid());
create policy "sessions: leader reads team" on public.sessions
  for select using (public.leads_player(user_id));
create policy "sessions: insert own" on public.sessions
  for insert with check (user_id = auth.uid());
-- sessions are immutable history: no update policy. Players may delete their own rows.
create policy "sessions: delete own" on public.sessions
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------- achievements
create table if not exists public.achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.achievements enable row level security;
create policy "achievements: read own" on public.achievements
  for select using (user_id = auth.uid());
create policy "achievements: leader reads team" on public.achievements
  for select using (public.leads_player(user_id));
create policy "achievements: insert own" on public.achievements
  for insert with check (user_id = auth.uid());
