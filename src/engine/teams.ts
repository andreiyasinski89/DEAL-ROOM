/** Pure helpers for the team screens (the data itself comes from the SECURITY DEFINER functions in 004_teams.sql). */

export type LeaderRow = {
  user_id: string;
  display_name: string;
  role: "leader" | "member";
  points: number;
  games: number;
  wins: number;
  last_played: string | null;
};

export type StatusRow = {
  assignment_id: string;
  scenario_id: string;
  due_date: string | null;
  created_at: string;
  user_id: string;
  display_name: string;
  done: boolean;
  best_outcome: "sale" | "partial" | "lost" | null;
};

/** Invite codes are 10 hex characters; people paste them with spaces, dashes or capitals. */
export const normalizeCode = (s: string) => s.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
export const isValidCode = (s: string) => /^[0-9a-f]{10}$/.test(normalizeCode(s));
export const formatCode = (code: string) => (code.length === 10 ? `${code.slice(0, 5)}-${code.slice(5)}` : code);

export type RankedRow = LeaderRow & { rank: number };

/** Competition ranking: equal points share a place (1, 1, 3). Ties on points are ordered by fewer games, then name. */
export function rankRows(rows: LeaderRow[]): RankedRow[] {
  const sorted = [...rows].sort((a, b) => b.points - a.points || a.games - b.games || a.display_name.localeCompare(b.display_name, "ru"));
  return sorted.map((r, i) => ({ ...r, rank: i > 0 && sorted[i - 1].points === r.points ? 0 : i + 1 })).map((r, i, arr) => ({
    ...r,
    rank: r.rank === 0 ? arr[i - 1].rank : r.rank,
  }));
}

export type AssignmentView = {
  id: string;
  scenarioId: string;
  dueDate: string | null;
  createdAt: string;
  members: { userId: string; name: string; done: boolean; best: StatusRow["best_outcome"] }[];
  doneCount: number;
  total: number;
};

/** Groups the flat (assignment × member) rows by assignment; newest first. */
export function groupAssignments(rows: StatusRow[]): AssignmentView[] {
  const map = new Map<string, AssignmentView>();
  for (const r of rows) {
    let v = map.get(r.assignment_id);
    if (!v) {
      v = { id: r.assignment_id, scenarioId: r.scenario_id, dueDate: r.due_date, createdAt: r.created_at, members: [], doneCount: 0, total: 0 };
      map.set(r.assignment_id, v);
    }
    v.members.push({ userId: r.user_id, name: r.display_name, done: r.done, best: r.best_outcome });
    v.total++;
    if (r.done) v.doneCount++;
  }
  return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Assignments the given player has not completed yet. */
export const pendingFor = (userId: string, views: AssignmentView[]) =>
  views.filter((v) => !v.members.some((m) => m.userId === userId && m.done));

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "сегодня", "через 3 дн.", "просрочено на 2 дн." for a YYYY-MM-DD due date. */
export function dueLabel(due: string | null, now = new Date()): { text: string; overdue: boolean } {
  if (!due) return { text: "без срока", overdue: false };
  const [y, m, d] = due.split("-").map(Number);
  const days = Math.round((new Date(y, m - 1, d).getTime() - startOfDay(now)) / DAY);
  if (days === 0) return { text: "сегодня", overdue: false };
  if (days === 1) return { text: "завтра", overdue: false };
  if (days > 1) return { text: `через ${days} дн.`, overdue: false };
  return { text: `просрочено на ${-days} дн.`, overdue: true };
}

/** Share of members that completed an assignment, 0..1. */
export const completion = (v: AssignmentView) => (v.total ? v.doneCount / v.total : 0);
