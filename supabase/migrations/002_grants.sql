-- Table privileges for signed-in players. New Supabase projects do not grant these
-- automatically; without them every request fails with "permission denied" even though
-- Row Level Security would allow it. Row Level Security (001_init.sql) still decides WHICH rows.
-- Nothing is granted to the anonymous role: signing in is required for any data access.

grant usage on schema public to authenticated;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

grant select, insert, delete on public.sessions to authenticated;
grant select, insert on public.achievements to authenticated;

grant select, insert, update, delete on public.scenarios to authenticated;
grant select, insert, update, delete on public.teams to authenticated;
grant select, insert, update, delete on public.team_members to authenticated;
