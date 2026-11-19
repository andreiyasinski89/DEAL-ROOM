-- Read-only view of the caller's AI quota for today, for the badge on the main screen.
-- It never changes any counter (ai_consume() is the only function that does).
-- The limits are passed by the app so they stay in one place (LIMITS in supabase/functions/_shared/live.ts).

create or replace function public.ai_status(
  p_max_sessions int default 10,
  p_max_turns int default 200
) returns json
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  u public.ai_usage;
begin
  if uid is null then
    return json_build_object('ok', false, 'error', 'unauthorized');
  end if;

  select * into u from public.ai_usage where user_id = uid and day = current_date;

  return json_build_object(
    'ok', true,
    'sessions_used', coalesce(u.sessions, 0),
    'sessions_left', greatest(p_max_sessions - coalesce(u.sessions, 0), 0),
    'turns_used', coalesce(u.turns, 0),
    'turns_left', greatest(p_max_turns - coalesce(u.turns, 0), 0)
  );
end $$;

revoke all on function public.ai_status(int, int) from public, anon;
grant execute on function public.ai_status(int, int) to authenticated;
