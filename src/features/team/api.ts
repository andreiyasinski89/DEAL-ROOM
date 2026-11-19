import type { LeaderRow, StatusRow } from "../../engine/teams";
import { ensureSupabase } from "../account/supabase";

export type MyTeam = { id: string; name: string; role: "leader" | "member"; invite_code: string | null; member_count: number };

const ERRORS: Record<string, string> = {
  unauthorized: "Войдите в аккаунт.",
  bad_name: "Название команды: от 2 до 60 символов.",
  too_many_teams: "Можно создать не больше 3 команд.",
  invalid_code: "Код не найден. Проверьте, что вы скопировали его полностью.",
  team_full: "В команде уже 50 участников.",
  owner_cannot_leave: "Создатель не может выйти из команды: её можно только удалить.",
  forbidden: "Недостаточно прав для этого действия.",
  cannot_remove_owner: "Создателя команды удалить нельзя.",
  bad_scenario: "Некорректный кейс.",
  too_many: "В команде уже 50 заданий: удалите старые.",
};

export class TeamError extends Error {}

const need = async () => {
  const client = await ensureSupabase();
  if (!client) throw new TeamError("Облако не настроено.");
  return client;
};

async function call<T = Record<string, unknown>>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await (await need()).rpc(fn, args);
  if (error) throw new TeamError(error.message.includes("permission denied") ? "Нет доступа. Выполните миграцию 004_teams.sql (см. README)." : error.message);
  const r = data as { ok?: boolean; error?: string } | null;
  if (r && typeof r === "object" && !Array.isArray(r) && r.ok === false) throw new TeamError(ERRORS[r.error ?? ""] ?? "Не удалось выполнить действие.");
  return data as T;
}

export const myTeams = async () => (await call<MyTeam[]>("my_teams")) ?? [];
export const createTeam = (name: string) => call<{ ok: true; id: string; invite_code: string }>("create_team", { p_name: name });
export const joinTeam = (code: string) => call<{ ok: true; team_id: string; name: string; already: boolean }>("join_team", { p_code: code });
export const leaveTeam = (team: string) => call("leave_team", { p_team: team });
export const deleteTeam = (team: string) => call("delete_team", { p_team: team });
export const removeMember = (team: string, user: string) => call("remove_member", { p_team: team, p_user: user });
export const leaderboard = async (team: string) => (await call<LeaderRow[]>("team_leaderboard", { p_team: team })) ?? [];
export const assignmentStatus = async (team: string) => (await call<StatusRow[]>("team_assignments_status", { p_team: team })) ?? [];
export const createAssignment = (team: string, scenarioId: string, due: string | null) =>
  call("create_assignment", { p_team: team, p_scenario: scenarioId, p_due: due });
export const deleteAssignment = (id: string) => call("delete_assignment", { p_id: id });

export async function setDisplayName(userId: string, name: string) {
  const { error } = await (await need()).from("profiles").update({ display_name: name.trim().slice(0, 40) }).eq("id", userId);
  if (error) throw new TeamError(error.message);
}
