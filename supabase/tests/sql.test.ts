// Runs the real migrations (001–004) on an in-process Postgres (PGlite) with a Supabase-like
// setup (roles anon/authenticated, auth.users, auth.uid() from a JWT claim) and checks the
// Row Level Security rules and the SECURITY DEFINER functions from the player's point of view.
// NOTE: like in a fresh Supabase project, NO default privileges are granted to the roles:
// everything must come from 002/003/004.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let db: PGlite;
const dir = join(__dirname, "..", "migrations");

const A = "00000000-0000-0000-0000-00000000000a"; // team leader
const B = "00000000-0000-0000-0000-00000000000b"; // team member
const C = "00000000-0000-0000-0000-00000000000c"; // outsider

/** Runs fn as a signed-in user (role authenticated + JWT sub), or as anon when uid is null. */
async function as<T>(uid: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${uid ? "authenticated" : "anon"}`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [uid ?? ""]);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
  }
}
const q = async <T = Record<string, unknown>>(sql: string, params: unknown[] = []) => (await db.query<T>(sql, params)).rows;
const rpc = async (name: string, ...args: unknown[]) => {
  const ph = args.map((_, i) => `$${i + 1}`).join(", ");
  const rows = await q<{ r: unknown }>(`select public.${name}(${ph}) as r`, args);
  return rows[0].r as { ok: boolean; [k: string]: unknown };
};
const denied = async (fn: () => Promise<unknown>) => {
  try {
    await fn();
  } catch (e) {
    return String((e as Error).message);
  }
  return null;
};
const session = (uid: string, scenario: string, outcome: string, score: number, at = "now()") =>
  q(`insert into public.sessions (client_id, user_id, scenario_id, level, outcome, score, played_at) values ($1, $2, $3, 1, $4, $5, ${at})`, [
    Math.random().toString(36).slice(2), uid, scenario, outcome, score,
  ]);

beforeAll(async () => {
  db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    grant usage on schema public to anon;
  `);
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()) await db.exec(readFileSync(join(dir, f), "utf-8"));
  await db.exec(`
    insert into auth.users (id, email) values
      ('${A}', 'anna@example.com'), ('${B}', 'boris@example.com'), ('${C}', 'clara@example.com');
  `);
}, 60_000);

afterAll(async () => {
  await db.close();
});

describe("migrations", () => {
  it("apply cleanly in order and create every table", async () => {
    const t = (await q<{ table_name: string }>(`select table_name from information_schema.tables where table_schema='public'`)).map((r) => r.table_name);
    for (const n of ["profiles", "teams", "team_members", "scenarios", "sessions", "achievements", "ai_usage", "team_assignments"]) expect(t).toContain(n);
  });
  it("RLS is enabled on every table", async () => {
    const rows = await q<{ relname: string; relrowsecurity: boolean }>(
      `select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'`,
    );
    expect(rows.length).toBeGreaterThanOrEqual(8);
    expect(rows.filter((r) => !r.relrowsecurity)).toEqual([]);
  });
  it("sign-up trigger creates a profile named after the email", async () => {
    const p = await q<{ display_name: string; role: string }>(`select display_name, role from public.profiles where id = $1`, [A]);
    expect(p[0]).toEqual({ display_name: "anna", role: "player" });
  });
});

describe("anonymous visitors", () => {
  it("cannot read or call anything", async () => {
    await as(null, async () => {
      expect(await denied(() => q(`select * from public.sessions`))).toMatch(/permission denied/);
      expect(await denied(() => q(`select * from public.profiles`))).toMatch(/permission denied/);
      expect(await denied(() => rpc("create_team", "x"))).toMatch(/permission denied/);
      expect(await denied(() => rpc("ai_consume", true))).toMatch(/permission denied/);
    });
  });
});

describe("profiles", () => {
  it("a player reads only their own profile and may change only display_name", async () => {
    await as(A, async () => {
      expect((await q(`select id from public.profiles`)).map((r) => (r as { id: string }).id)).toEqual([A]);
      await q(`update public.profiles set display_name = 'Анна' where id = $1`, [A]);
      expect(await denied(() => q(`update public.profiles set role = 'admin' where id = $1`, [A]))).toMatch(/permission denied/);
    });
    expect((await q<{ display_name: string }>(`select display_name from public.profiles where id=$1`, [A]))[0].display_name).toBe("Анна");
  });
  it("cannot update someone else's profile", async () => {
    await as(B, async () => {
      await q(`update public.profiles set display_name = 'hacked' where id = $1`, [A]);
    });
    expect((await q<{ display_name: string }>(`select display_name from public.profiles where id=$1`, [A]))[0].display_name).toBe("Анна");
  });
});

describe("sessions and achievements", () => {
  it("a player inserts and reads their own games only; history is immutable", async () => {
    await as(B, async () => {
      await session(B, "case-1", "sale", 100);
      expect((await q(`select * from public.sessions`)).length).toBe(1);
      expect(await denied(() => session(A, "case-1", "sale", 999))).toMatch(/row-level security/);
      expect(await denied(() => q(`update public.sessions set score = 9999`))).toMatch(/permission denied/);
    });
    await as(C, async () => {
      expect((await q(`select * from public.sessions`)).length).toBe(0);
    });
  });
  it("sync upsert on (user_id, client_id) is idempotent", async () => {
    await as(C, async () => {
      for (let i = 0; i < 3; i++)
        await q(
          `insert into public.sessions (client_id, user_id, scenario_id, level, outcome, score) values ('same', $1, 'x', 1, 'lost', 0) on conflict (user_id, client_id) do nothing`,
          [C],
        );
      expect((await q(`select * from public.sessions`)).length).toBe(1);
    });
  });
  it("achievements: own rows only", async () => {
    await as(C, async () => {
      await q(`insert into public.achievements (user_id, key) values ($1, 'first_sale')`, [C]);
      expect(await denied(() => q(`insert into public.achievements (user_id, key) values ($1, 'x')`, [A]))).toMatch(/row-level security/);
    });
  });
});

describe("AI daily quota (ai_consume)", () => {
  it("allows 10 new sessions per day, then blocks; table is not readable by players", async () => {
    await as(C, async () => {
      for (let i = 0; i < 10; i++) expect((await rpc("ai_consume", true)).allowed).toBe(true);
      const eleventh = await rpc("ai_consume", true);
      expect(eleventh).toMatchObject({ allowed: false, reason: "daily_sessions" });
      expect((await rpc("ai_consume", false)).allowed).toBe(true); // turns of an existing game still pass
      expect(await denied(() => q(`select * from public.ai_usage`))).toMatch(/permission denied/);
    });
  });
  it("caps total turns per day", async () => {
    await q(`update public.ai_usage set turns = 200 where user_id = $1`, [C]);
    await as(C, async () => {
      expect(await rpc("ai_consume", false)).toMatchObject({ allowed: false, reason: "daily_turns" });
    });
  });
});

describe("teams", () => {
  let code = "";
  let teamId = "";

  it("create_team makes the caller its leader and returns an invite code; validates the name", async () => {
    await as(A, async () => {
      expect(await rpc("create_team", "x")).toMatchObject({ ok: false, error: "bad_name" });
      const r = await rpc("create_team", "  Команда Лидеров ");
      expect(r.ok).toBe(true);
      code = r.invite_code as string;
      teamId = r.id as string;
      expect(code).toMatch(/^[0-9a-f]{10}$/);
      const mine = await q<{ role: string; invite_code: string | null; member_count: string }>(`select * from public.my_teams()`);
      expect(mine).toHaveLength(1);
      expect(mine[0]).toMatchObject({ role: "leader", invite_code: code });
    });
  });

  it("limits a player to 3 own teams", async () => {
    await as(A, async () => {
      expect((await rpc("create_team", "Вторая")).ok).toBe(true);
      expect((await rpc("create_team", "Третья")).ok).toBe(true);
      expect(await rpc("create_team", "Четвёртая")).toMatchObject({ ok: false, error: "too_many_teams" });
    });
  });

  it("joining needs the code; a direct insert into team_members is impossible", async () => {
    await as(B, async () => {
      expect(await rpc("join_team", "deadbeef00")).toMatchObject({ ok: false, error: "invalid_code" });
      expect(await denied(() => q(`insert into public.team_members (team_id, user_id, role) values ($1, $2, 'member')`, [teamId, B]))).toMatch(/row-level security/);
      expect(await denied(() => q(`insert into public.team_members (team_id, user_id, role) values ($1, $2, 'leader')`, [teamId, B]))).not.toBeNull();
      const j = await rpc("join_team", code.toUpperCase().replace(/^(.{5})/, "$1 ")); // tolerant to case and spaces
      expect(j).toMatchObject({ ok: true, already: false });
      expect(await rpc("join_team", code)).toMatchObject({ ok: true, already: true });
    });
  });

  it("members do not see the invite code; outsiders see nothing of the team", async () => {
    await as(B, async () => {
      const mine = await q<{ invite_code: string | null; role: string }>(`select * from public.my_teams()`);
      expect(mine[0]).toMatchObject({ role: "member", invite_code: null });
    });
    await as(C, async () => {
      expect(await q(`select * from public.teams`)).toHaveLength(0);
      expect(await q(`select * from public.team_members`)).toHaveLength(0);
      expect(await q(`select * from public.team_leaderboard($1)`, [teamId])).toHaveLength(0);
      expect(await q(`select * from public.team_assignments_status($1)`, [teamId])).toHaveLength(0);
    });
  });

  it("leaderboard shows aggregated numbers to members only", async () => {
    await session(A, "lead-case", "sale", 120);
    await session(A, "lead-case-2", "lost", 10);
    await as(B, async () => {
      const lb = await q<{ display_name: string; points: number; games: number; wins: number }>(`select * from public.team_leaderboard($1)`, [teamId]);
      expect(lb.map((r) => r.display_name)).toEqual(["Анна", "boris"]); // sorted by points
      expect(lb[0]).toMatchObject({ points: 130, games: 2, wins: 1 });
      expect(lb[1]).toMatchObject({ points: 100, games: 1, wins: 1 });
      // ...but the raw game rows of the leader stay private to a plain member
      expect((await q<{ user_id: string }>(`select user_id from public.sessions`)).every((r) => r.user_id === B)).toBe(true);
    });
  });

  it("a team leader can read the games of their members (and only theirs)", async () => {
    await as(A, async () => {
      const ids = new Set((await q<{ user_id: string }>(`select user_id from public.sessions`)).map((r) => r.user_id));
      expect(ids.has(B)).toBe(true);
      expect(ids.has(C)).toBe(false);
    });
  });

  it("homework: only the leader creates; validates ids; members see only their own status", async () => {
    await as(B, async () => {
      expect(await rpc("create_assignment", teamId, "case-1", null)).toMatchObject({ ok: false, error: "forbidden" });
      expect(await denied(() => q(`insert into public.team_assignments (team_id, scenario_id, created_by) values ($1, 'case-1', $2)`, [teamId, B]))).toMatch(/row-level security/);
    });
    let assignmentId = "";
    await as(A, async () => {
      expect(await rpc("create_assignment", teamId, "bad id!", null)).toMatchObject({ ok: false, error: "bad_scenario" });
      const r = await rpc("create_assignment", teamId, "case-1", "2099-01-01");
      expect(r.ok).toBe(true);
      assignmentId = r.id as string;
      await rpc("create_assignment", teamId, "case-2", null);
      const all = await q<{ user_id: string; scenario_id: string; done: boolean }>(`select * from public.team_assignments_status($1)`, [teamId]);
      expect(all).toHaveLength(4); // 2 assignments x 2 members
    });
    await as(B, async () => {
      const mine = await q<{ user_id: string; scenario_id: string; done: boolean }>(`select * from public.team_assignments_status($1)`, [teamId]);
      expect(mine).toHaveLength(2);
      expect(mine.every((r) => r.user_id === B)).toBe(true);
      expect(mine.every((r) => r.done === false)).toBe(true); // B's earlier game predates the assignment
    });
    // B plays case-1 after the assignment was created: done. Live games count too.
    await as(B, async () => {
      await session(B, "case-1", "partial", 50);
      await session(B, "live:case-2", "sale", 100);
      const mine = await q<{ scenario_id: string; done: boolean; best_outcome: string }>(`select * from public.team_assignments_status($1) order by scenario_id`, [teamId]);
      expect(mine.map((r) => [r.scenario_id, r.done, r.best_outcome])).toEqual([["case-1", true, "partial"], ["case-2", true, "sale"]]);
    });
    await as(A, async () => {
      const lead = await q<{ user_id: string; scenario_id: string; done: boolean }>(`select * from public.team_assignments_status($1)`, [teamId]);
      expect(lead.filter((r) => r.user_id === A).every((r) => !r.done)).toBe(true);
      expect(await rpc("delete_assignment", assignmentId)).toMatchObject({ ok: true });
    });
    await as(B, async () => {
      expect(await rpc("delete_assignment", assignmentId)).toMatchObject({ ok: false, error: "forbidden" });
    });
  });

  it("members cannot remove others; the leader can remove a member but not the owner", async () => {
    await as(B, async () => {
      expect(await rpc("remove_member", teamId, A)).toMatchObject({ ok: false, error: "forbidden" });
    });
    await as(A, async () => {
      expect(await rpc("remove_member", teamId, A)).toMatchObject({ ok: false, error: "cannot_remove_owner" });
      expect(await rpc("remove_member", teamId, B)).toMatchObject({ ok: true });
      expect(await q(`select * from public.team_leaderboard($1)`, [teamId])).toHaveLength(1);
    });
  });

  it("a member can leave, the owner cannot; only the owner deletes the team", async () => {
    await as(B, async () => {
      await rpc("join_team", code);
      expect(await rpc("leave_team", teamId)).toMatchObject({ ok: true });
      expect(await rpc("delete_team", teamId)).toMatchObject({ ok: false, error: "forbidden" });
    });
    await as(A, async () => {
      expect(await rpc("leave_team", teamId)).toMatchObject({ ok: false, error: "owner_cannot_leave" });
      expect(await rpc("delete_team", teamId)).toMatchObject({ ok: true });
      expect((await q<{ id: string }>(`select id from public.my_teams()`)).map((r) => r.id)).not.toContain(teamId);
    });
  });

  it("a full team (50 members) rejects new joins", async () => {
    let t = { id: "", code: "" };
    await db.exec(`insert into auth.users (id, email) select gen_random_uuid(), 'u' || g || '@example.com' from generate_series(1, 49) g`);
    await as(A, async () => {
      const r = await rpc("create_team", "Большая");
      t = { id: r.id as string, code: r.invite_code as string };
    });
    await db.query(`insert into public.team_members (team_id, user_id, role) select $1, id, 'member' from auth.users where email like 'u%@example.com'`, [t.id]);
    await as(C, async () => {
      expect(await rpc("join_team", t.code)).toMatchObject({ ok: false, error: "team_full" });
    });
  });
});
