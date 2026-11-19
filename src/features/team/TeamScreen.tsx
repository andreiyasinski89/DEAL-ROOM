import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Copy, Crown, Trash2, UserMinus } from "lucide-react";
import { T, useI18n } from "../../i18n";
import { rankFor } from "../../engine/profile";
import {
  completion, dueLabel, formatCode, groupAssignments, isValidCode, normalizeCode, pendingFor, rankRows,
  type LeaderRow, type StatusRow,
} from "../../engine/teams";
import type { Scenario } from "../../engine/types";
import { Panel } from "../../ui/parts";
import type { AuthState } from "../account/useAuth";
import {
  TeamError, assignmentStatus, createAssignment, createTeam, deleteAssignment, deleteTeam, joinTeam, leaderboard,
  leaveTeam, myTeams, removeMember, setDisplayName, type MyTeam,
} from "./api";

const OUT = { sale: T("ПРОДАЖА"), partial: T("ЧАСТИЧНО"), lost: T("ПРОВАЛ") } as const;
const OUT_COLOR = { sale: "var(--hud-green)", partial: "var(--hud-gold)", lost: "var(--hud-red)" } as const;
const input = { minHeight: 0, height: 36, display: "block" } as const;

export function TeamScreen({
  scenarios,
  auth,
  onBack,
  onPlay,
}: {
  scenarios: Scenario[];
  auth: AuthState;
  onBack: () => void;
  onPlay: (scenarioId: string) => void;
}) {
  const { tr } = useI18n();
  const userId = auth.user?.id;
  const [teams, setTeams] = useState<MyTeam[]>([]);
  const [sel, setSel] = useState<string>("");
  const [board, setBoard] = useState<LeaderRow[]>([]);
  const [status, setStatus] = useState<StatusRow[]>([]);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [myName, setMyName] = useState("");
  const [lvl, setLvl] = useState(1);
  const [caseId, setCaseId] = useState("");
  const [due, setDue] = useState("");
  const [copied, setCopied] = useState(false);

  const team = teams.find((t) => t.id === sel);
  const leader = team?.role === "leader";
  const byId = useMemo(() => new Map(scenarios.map((s) => [s.id, s])), [scenarios]);
  const levelCases = useMemo(() => scenarios.filter((s) => s.level === lvl), [scenarios, lvl]);

  const fail = (e: unknown) => setMsg({ text: tr(e instanceof TeamError ? e.message : T("Не удалось выполнить запрос.")), ok: false });
  const ok = (text: string) => setMsg({ text, ok: true });
  // effects below run on mount / team change only; they report errors through the latest `fail` (it depends on the language)
  const failRef = useRef(fail);
  useEffect(() => {
    failRef.current = fail;
  });

  const loadTeams = useCallback(async (select?: string) => {
    const list = await myTeams();
    setTeams(list);
    setSel((cur) => select ?? (list.some((t) => t.id === cur) ? cur : list[0]?.id ?? ""));
  }, []);

  const loadTeam = useCallback(async (id: string) => {
    const [b, s] = await Promise.all([leaderboard(id), assignmentStatus(id)]);
    setBoard(b);
    setStatus(s);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    myTeams()
      .then((list) => {
        if (!alive) return;
        setTeams(list);
        setSel(list[0]?.id ?? "");
      })
      .catch((e) => failRef.current(e));
    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!sel) return;
    let alive = true;
    Promise.all([leaderboard(sel), assignmentStatus(sel)])
      .then(([b, s]) => {
        if (!alive) return;
        setBoard(b);
        setStatus(s);
      })
      .catch((e) => failRef.current(e));
    return () => {
      alive = false;
    };
  }, [sel]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const ranked = useMemo(() => rankRows(board), [board]);
  const me = board.find((r) => r.user_id === userId);
  const assignments = useMemo(() => groupAssignments(status), [status]);
  const myPending = useMemo(() => (userId ? pendingFor(userId, assignments) : []), [userId, assignments]);

  if (!auth.configured || !userId)
    return (
      <div className="screen" style={{ maxWidth: 760 }}>
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={14} /> {tr("меню")}</button>
        <Panel title={tr("КОМАНДА")}>
          <p>{!auth.configured ? tr("Команды работают через облако: подключите Supabase (см. README).") : tr("Чтобы создать команду или вступить в неё, войдите в аккаунт: Профиль → Аккаунт.")}</p>
        </Panel>
      </div>
    );

  return (
    <div className="screen" style={{ maxWidth: 1000 }}>
      <button className="icon-btn" onClick={onBack}><ArrowLeft size={14} /> {tr("меню")}</button>
      {msg && <div role={msg.ok ? "status" : "alert"} style={{ margin: "10px 0", color: msg.ok ? "var(--hud-green)" : "var(--hud-gold)", fontSize: 13 }}>{msg.text}</div>}

      <div className="menu-grid" style={{ marginTop: 12 }}>
        <div className="col">
          <Panel title={tr("МОИ КОМАНДЫ")}>
            {teams.length === 0 && <p className="dim" style={{ fontSize: 13 }}>{tr("Вы пока не состоите в команде. Создайте свою или вступите по коду приглашения.")}</p>}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {teams.map((t) => (
                <button key={t.id} className={`icon-btn ${t.id === sel ? "active" : ""}`} onClick={() => setSel(t.id)}>
                  {t.role === "leader" && <Crown size={11} />} {t.name} · {t.member_count}
                </button>
              ))}
            </div>
            <label className="t-mono dim" style={{ fontSize: 11 }}>
              {tr("СОЗДАТЬ КОМАНДУ")}
              <input className="notes" style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("Название, 2–60 символов")} maxLength={60} />
            </label>
            <button className="btn" style={{ marginTop: 6 }} disabled={busy || name.trim().length < 2} onClick={() => run(async () => {
              const r = await createTeam(name);
              setName("");
              await loadTeams(r.id);
              ok(tr("Команда создана. Отправьте код приглашения участникам."));
            })}>{tr("Создать")}</button>

            <label className="t-mono dim" style={{ fontSize: 11, display: "block", marginTop: 12 }}>
              {tr("ВСТУПИТЬ ПО КОДУ")}
              <input className="notes" style={input} value={code} onChange={(e) => setCode(e.target.value)} placeholder={tr("например a1b2c-3d4e5")} maxLength={24} />
            </label>
            <button className="btn gold" style={{ marginTop: 6 }} disabled={busy || !isValidCode(code)} onClick={() => run(async () => {
              const r = await joinTeam(normalizeCode(code));
              setCode("");
              await loadTeams(r.team_id);
              ok(r.already ? tr("Вы уже в команде «{name}».", { name: r.name }) : tr("Вы вступили в команду «{name}».", { name: r.name }));
            })}>{tr("Вступить")}</button>
          </Panel>

          {team && (
            <Panel title={`${tr("КОМАНДА")} · ${team.name.toUpperCase()}`}>
              <div className="t-mono" style={{ fontSize: 12 }}>{tr("Роль")}: {leader ? tr("лидер") : tr("участник")} · {tr("участников")}: {team.member_count}</div>
              {leader && team.invite_code && (
                <div style={{ marginTop: 10 }}>
                  <div className="t-mono dim" style={{ fontSize: 11 }}>{tr("КОД ПРИГЛАШЕНИЯ")}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="t-display" style={{ fontSize: 22, color: "var(--hud-gold)" }}>{formatCode(team.invite_code)}</span>
                    <button className="icon-btn" aria-label={tr("Копировать код")} onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(team.invite_code ?? "");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      } catch {
                        ok(tr("Код: {code}", { code: team.invite_code ?? "" }));
                      }
                    }}>{copied ? <Check size={12} /> : <Copy size={12} />}</button>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <label className="t-mono dim" style={{ fontSize: 11 }}>
                  {tr("ВАШЕ ИМЯ В РЕЙТИНГЕ")} {me ? <span>({tr("сейчас")}: {me.display_name})</span> : null}
                  <input className="notes" style={input} value={myName} onChange={(e) => setMyName(e.target.value)} placeholder={tr("Как вас видят в команде")} maxLength={40} />
                </label>
                <button className="btn ghost" style={{ marginTop: 6 }} disabled={busy || myName.trim().length < 2} onClick={() => run(async () => {
                  await setDisplayName(userId, myName);
                  setMyName("");
                  await loadTeam(team.id);
                  ok(tr("Имя обновлено."));
                })}>{tr("Сохранить имя")}</button>
              </div>
              <div style={{ marginTop: 12 }}>
                {leader ? (
                  <button className="btn ghost" disabled={busy} onClick={() => window.confirm(tr("Удалить команду «{name}» вместе с заданиями? Это нельзя отменить.", { name: team.name })) && run(async () => {
                    await deleteTeam(team.id);
                    await loadTeams();
                    ok(tr("Команда удалена."));
                  })}><Trash2 size={14} style={{ display: "inline", marginRight: 6 }} />{tr("Удалить команду")}</button>
                ) : (
                  <button className="btn ghost" disabled={busy} onClick={() => window.confirm(tr("Выйти из команды «{name}»?", { name: team.name })) && run(async () => {
                    await leaveTeam(team.id);
                    await loadTeams();
                    ok(tr("Вы вышли из команды."));
                  })}>{tr("Выйти из команды")}</button>
                )}
              </div>
            </Panel>
          )}
        </div>

        <div className="col">
          {team && (
            <Panel title={tr("ЛИДЕРБОРД")}>
              {ranked.length === 0 ? <p className="dim" style={{ fontSize: 13 }}>{tr("Пока нет данных.")}</p> : (
                <div style={{ display: "grid", gap: 4 }}>
                  {ranked.map((r) => (
                    <div key={r.user_id} className="turn" style={{ display: "flex", gap: 8, alignItems: "center", background: r.user_id === userId ? "rgba(63,224,255,0.07)" : undefined }}>
                      <span className="t-display" style={{ width: 28, flex: "none", textAlign: "center", color: r.rank === 1 ? "var(--hud-gold)" : undefined }}>{r.rank}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="t-ui" style={{ display: "block" }}>{r.role === "leader" && <Crown size={11} style={{ display: "inline", marginRight: 4 }} />}{r.display_name}{r.user_id === userId ? ` (${tr("вы")})` : ""}</span>
                        <span className="dim t-mono" style={{ fontSize: 11 }}>{rankFor(r.points).name} · {tr("игр")} {r.games} · {tr("побед")} {r.wins}</span>
                      </span>
                      <span className="t-mono" style={{ color: "var(--hud-gold)", minWidth: 56, flex: "none", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.points}</span>
                      {leader && r.user_id === userId && <span aria-hidden style={{ width: 30, flex: "none" }} />}
                      {leader && r.user_id !== userId && (
                        <button className="icon-btn" aria-label={tr("Убрать {name}", { name: r.display_name })} disabled={busy} onClick={() => window.confirm(tr("Убрать {name} из команды?", { name: r.display_name })) && run(async () => {
                          await removeMember(team.id, r.user_id);
                          await loadTeam(team.id);
                          ok(tr("Участник убран."));
                        })}><UserMinus size={12} /></button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {team && (
            <Panel title={leader ? tr("ДОМАШНИЕ ЗАДАНИЯ · ПАНЕЛЬ ЛИДЕРА") : tr("МОИ ДОМАШНИЕ ЗАДАНИЯ")}>
              {leader && (
                <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
                  <div className="t-mono dim" style={{ fontSize: 11 }}>{tr("НАЗНАЧИТЬ КЕЙС")}</div>
                  <select className="notes" style={input} value={lvl} onChange={(e) => { setLvl(Number(e.target.value)); setCaseId(""); }} aria-label={tr("Уровень")}>
                    {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>{tr("Уровень {n}", { n: l })}</option>)}
                  </select>
                  <select className="notes" style={input} value={caseId} onChange={(e) => setCaseId(e.target.value)} aria-label={tr("Кейс")}>
                    <option value="">{tr("Выберите кейс…")}</option>
                    {levelCases.map((s) => <option key={s.id} value={s.id}>{s.title} — {s.persona.name}</option>)}
                  </select>
                  <input className="notes" style={input} type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label={tr("Срок")} />
                  <button className="btn gold" disabled={busy || !caseId} onClick={() => run(async () => {
                    await createAssignment(team.id, caseId, due || null);
                    setCaseId("");
                    setDue("");
                    await loadTeam(team.id);
                    ok(tr("Задание назначено."));
                  })}>{tr("Назначить")}</button>
                </div>
              )}

              {!leader && myPending.length > 0 && <div className="t-mono" style={{ color: "var(--hud-gold)", fontSize: 12, marginBottom: 6 }}>{tr("Осталось выполнить")}: {myPending.length}</div>}
              {assignments.length === 0 && <p className="dim" style={{ fontSize: 13 }}>{tr("Заданий нет.")}</p>}
              {assignments.map((a) => {
                const s = byId.get(a.scenarioId.replace(/^live:/, ""));
                const d = dueLabel(a.dueDate, new Date(), tr);
                const mine = a.members.find((m) => m.userId === userId);
                return (
                  <div className="turn" key={a.id}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="t-ui" style={{ flex: 1, minWidth: 140 }}>{s ? `${s.title}` : a.scenarioId}{s && <span className="dim" style={{ fontSize: 12 }}> · {tr("ур. {n}", { n: s.level })} · {s.persona.name}</span>}</span>
                      <span className="tag" style={d.overdue && !mine?.done ? { color: "var(--hud-red)", borderColor: "var(--hud-red)" } : undefined}>{d.text}</span>
                      {s && !mine?.done && <button className="btn" onClick={() => onPlay(s.id)}>{tr("Играть")}</button>}
                      {mine?.done && <span className="tag" style={{ color: OUT_COLOR[mine.best ?? "partial"], borderColor: OUT_COLOR[mine.best ?? "partial"] }}>{mine.best ? tr(OUT[mine.best]) : tr("ГОТОВО")}</span>}
                      {leader && <button className="icon-btn" aria-label={tr("Удалить задание")} disabled={busy} onClick={() => run(async () => { await deleteAssignment(a.id); await loadTeam(team.id); ok(tr("Задание удалено.")); })}><Trash2 size={12} /></button>}
                    </div>
                    {leader && (
                      <>
                        <div role="progressbar" aria-valuenow={Math.round(completion(a) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={tr("Выполнение")} style={{ height: 5, background: "rgba(127,147,176,0.25)", margin: "6px 0" }}>
                          <div style={{ width: `${completion(a) * 100}%`, height: "100%", background: "var(--hud-green)" }} />
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {a.members.map((m) => (
                            <span key={m.userId} className="tag" style={m.done ? { color: "var(--hud-green)", borderColor: "var(--hud-green)" } : undefined}>
                              {m.done ? "✔" : "…"} {m.name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
