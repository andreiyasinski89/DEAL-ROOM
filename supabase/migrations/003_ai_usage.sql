-- Daily quota for the "Live client" (AI) mode.
-- The Edge Function calls ai_consume() with the caller's own JWT: no service key needed,
-- and a player cannot read or edit the counters directly (no table privileges for clients).

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  sessions int not null default 0,
  turns int not null default 0,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;
-- intentionally NO policies and NO grants: only the SECURITY DEFINER function below touches it.

create or replace function public.ai_consume(
  p_new_session boolean,
  p_max_sessions int default 5,
  p_max_turns int default 120
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  u public.ai_usage;
begin
  if uid is null then
    return json_build_object('allowed', false, 'reason', 'unauthorized');
  end if;

  insert into public.ai_usage (user_id, day) values (uid, current_date)
  on conflict (user_id, day) do nothing;

  select * into u from public.ai_usage where user_id = uid and day = current_date for update;

  if u.turns >= p_max_turns then
    return json_build_object('allowed', false, 'reason', 'daily_turns', 'sessions_left', greatest(p_max_sessions - u.sessions, 0));
  end if;
  if p_new_session and u.sessions >= p_max_sessions then
    return json_build_object('allowed', false, 'reason', 'daily_sessions', 'sessions_left', 0);
  end if;

  update public.ai_usage
     set turns = turns + 1,
         sessions = sessions + (case when p_new_session then 1 else 0 end)
   where user_id = uid and day = current_date;

  return json_build_object(
    'allowed', true,
    'sessions_left', greatest(p_max_sessions - u.sessions - (case when p_new_session then 1 else 0 end), 0)
  );
end $$;

revoke all on function public.ai_consume(boolean, int, int) from public, anon;
grant execute on function public.ai_consume(boolean, int, int) to authenticated;
