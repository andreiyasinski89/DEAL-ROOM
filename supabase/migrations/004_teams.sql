-- Phase 7: teams, invite codes, leaderboard, homework assignments.
-- Everything a player does with a team goes through SECURITY DEFINER functions that check
-- membership/leadership themselves; clients get no direct way to join a team or read other
-- members' game rows (the leaderboard returns only aggregated numbers).

-- Joining by a direct INSERT would bypass the invite code: remove that policy.
drop policy if exists "team_members: join as member" on public.team_members;

-- ---------------------------------------------------------------- assignments (homework)
create table if not exists public.team_assignments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  scenario_id text not null check (scenario_id ~ '^[A-Za-z0-9_:.-]{3,100}$'),
  due_date date,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists team_assignments_team_idx on public.team_assignments (team_id, created_at desc);

alter table public.team_assignments enable row level security;

create or replace function public.is_team_leader(t uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.team_members m where m.team_id = t and m.user_id = auth.uid() and m.role = 'leader');
$$;

create policy "assignments: members read" on public.team_assignments
  for select using (public.is_team_member(team_id));
create policy "assignments: leader inserts" on public.team_assignments
  for insert with check (public.is_team_leader(team_id) and created_by = auth.uid());
create policy "assignments: leader deletes" on public.team_assignments
  for delete using (public.is_team_leader(team_id));

grant select, insert, delete on public.team_assignments to authenticated;

-- ---------------------------------------------------------------- create / join / leave
create or replace function public.create_team(p_name text) returns json
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  nm text := btrim(coalesce(p_name, ''));
  t public.teams;
begin
  if uid is null then return json_build_object('ok', false, 'error', 'unauthorized'); end if;
  if char_length(nm) < 2 or char_length(nm) > 60 then return json_build_object('ok', false, 'error', 'bad_name'); end if;
  if (select count(*) from public.teams where owner_id = uid) >= 3 then return json_build_object('ok', false, 'error', 'too_many_teams'); end if;
  insert into public.teams (name, owner_id) values (nm, uid) returning * into t;
  insert into public.team_members (team_id, user_id, role) values (t.id, uid, 'leader');
  return json_build_object('ok', true, 'id', t.id, 'invite_code', t.invite_code);
end $$;

create or replace function public.join_team(p_code text) returns json
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  code text := lower(regexp_replace(coalesce(p_code, ''), '[^0-9a-fA-F]', '', 'g'));
  t public.teams;
begin
  if uid is null then return json_build_object('ok', false, 'error', 'unauthorized'); end if;
  select * into t from public.teams where invite_code = code;
  if not found then return json_build_object('ok', false, 'error', 'invalid_code'); end if;
  if exists (select 1 from public.team_members where team_id = t.id and user_id = uid) then
    return json_build_object('ok', true, 'team_id', t.id, 'name', t.name, 'already', true);
  end if;
  if (select count(*) from public.team_members where team_id = t.id) >= 50 then
    return json_build_object('ok', false, 'error', 'team_full');
  end if;
  insert into public.team_members (team_id, user_id, role) values (t.id, uid, 'member');
  return json_build_object('ok', true, 'team_id', t.id, 'name', t.name, 'already', false);
end $$;

create or replace function public.leave_team(p_team uuid) returns json
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if exists (select 1 from public.teams where id = p_team and owner_id = uid) then
    return json_build_object('ok', false, 'error', 'owner_cannot_leave');
  end if;
  delete from public.team_members where team_id = p_team and user_id = uid;
  return json_build_object('ok', true);
end $$;

create or replace function public.delete_team(p_team uuid) returns json
language plpgsql security definer set search_path = public as $$
begin
  delete from public.teams where id = p_team and owner_id = auth.uid();
  if not found then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  return json_build_object('ok', true);
end $$;

create or replace function public.remove_member(p_team uuid, p_user uuid) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_team_leader(p_team) then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  if exists (select 1 from public.teams where id = p_team and owner_id = p_user) then
    return json_build_object('ok', false, 'error', 'cannot_remove_owner');
  end if;
  delete from public.team_members where team_id = p_team and user_id = p_user;
  return json_build_object('ok', true);
end $$;

-- ---------------------------------------------------------------- reading
create or replace function public.my_teams()
returns table (id uuid, name text, role text, invite_code text, member_count bigint)
language sql security definer stable set search_path = public as $$
  select t.id, t.name, m.role,
         case when m.role = 'leader' then t.invite_code end,
         (select count(*) from public.team_members x where x.team_id = t.id)
  from public.team_members m
  join public.teams t on t.id = m.team_id
  where m.user_id = auth.uid()
  order by t.created_at;
$$;

-- Aggregated numbers only: no transcripts, no individual game rows.
create or replace function public.team_leaderboard(p_team uuid)
returns table (user_id uuid, display_name text, role text, points bigint, games bigint, wins bigint, last_played timestamptz)
language sql security definer stable set search_path = public as $$
  select m.user_id,
         coalesce(nullif(p.display_name, ''), 'Игрок'),
         m.role,
         coalesce(sum(s.score), 0)::bigint,
         count(s.id)::bigint,
         (count(s.id) filter (where s.outcome = 'sale'))::bigint,
         max(s.played_at)
  from public.team_members m
  left join public.profiles p on p.id = m.user_id
  left join public.sessions s on s.user_id = m.user_id
  where m.team_id = p_team and public.is_team_member(p_team)
  group by m.user_id, p.display_name, m.role
  order by 4 desc, 5 asc;
$$;

-- Leader sees every member; a member sees only their own rows.
create or replace function public.team_assignments_status(p_team uuid)
returns table (assignment_id uuid, scenario_id text, due_date date, created_at timestamptz, user_id uuid, display_name text, done boolean, best_outcome text)
language sql security definer stable set search_path = public as $$
  select a.id, a.scenario_id, a.due_date, a.created_at, m.user_id,
         coalesce(nullif(p.display_name, ''), 'Игрок'),
         coalesce(b.rk, -1) >= 1,
         case b.rk when 2 then 'sale' when 1 then 'partial' when 0 then 'lost' end
  from public.team_assignments a
  join public.team_members m on m.team_id = a.team_id
  left join public.profiles p on p.id = m.user_id
  left join lateral (
    select max(case s.outcome when 'sale' then 2 when 'partial' then 1 else 0 end) as rk
    from public.sessions s
    where s.user_id = m.user_id
      and s.scenario_id in (a.scenario_id, 'live:' || a.scenario_id)
      and s.played_at >= a.created_at
  ) b on true
  where a.team_id = p_team
    and public.is_team_member(p_team)
    and (public.is_team_leader(p_team) or m.user_id = auth.uid())
  order by a.created_at desc, 6;
$$;

-- ---------------------------------------------------------------- homework
create or replace function public.create_assignment(p_team uuid, p_scenario text, p_due date) returns json
language plpgsql security definer set search_path = public as $$
declare a public.team_assignments;
begin
  if not public.is_team_leader(p_team) then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  if coalesce(p_scenario, '') !~ '^[A-Za-z0-9_:.-]{3,100}$' then return json_build_object('ok', false, 'error', 'bad_scenario'); end if;
  if (select count(*) from public.team_assignments where team_id = p_team) >= 50 then return json_build_object('ok', false, 'error', 'too_many'); end if;
  insert into public.team_assignments (team_id, scenario_id, due_date, created_by)
  values (p_team, p_scenario, p_due, auth.uid()) returning * into a;
  return json_build_object('ok', true, 'id', a.id);
end $$;

create or replace function public.delete_assignment(p_id uuid) returns json
language plpgsql security definer set search_path = public as $$
declare tid uuid;
begin
  select team_id into tid from public.team_assignments where id = p_id;
  if tid is null or not public.is_team_leader(tid) then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  delete from public.team_assignments where id = p_id;
  return json_build_object('ok', true);
end $$;

-- ---------------------------------------------------------------- privileges
revoke all on function public.is_team_leader(uuid) from public, anon;
revoke all on function public.create_team(text) from public, anon;
revoke all on function public.join_team(text) from public, anon;
revoke all on function public.leave_team(uuid) from public, anon;
revoke all on function public.delete_team(uuid) from public, anon;
revoke all on function public.remove_member(uuid, uuid) from public, anon;
revoke all on function public.my_teams() from public, anon;
revoke all on function public.team_leaderboard(uuid) from public, anon;
revoke all on function public.team_assignments_status(uuid) from public, anon;
revoke all on function public.create_assignment(uuid, text, date) from public, anon;
revoke all on function public.delete_assignment(uuid) from public, anon;

grant execute on function public.is_team_leader(uuid) to authenticated;
grant execute on function public.create_team(text) to authenticated;
grant execute on function public.join_team(text) to authenticated;
grant execute on function public.leave_team(uuid) to authenticated;
grant execute on function public.delete_team(uuid) to authenticated;
grant execute on function public.remove_member(uuid, uuid) to authenticated;
grant execute on function public.my_teams() to authenticated;
grant execute on function public.team_leaderboard(uuid) to authenticated;
grant execute on function public.team_assignments_status(uuid) to authenticated;
grant execute on function public.create_assignment(uuid, text, date) to authenticated;
grant execute on function public.delete_assignment(uuid) to authenticated;
