import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, Crown, Trash2, UserMinus } from "lucide-react";
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

const OUT = { sale: "ПРОДАЖА", partial: "ЧАСТИЧНО", lost: "ПРОВАЛ" } as const;
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

  const fail = (e: unknown) => setMsg({ text: e instanceof TeamError ? e.message : "Не удалось выполнить запрос.", ok: false });
  const ok = (text: string) => setMsg({ text, ok: true });

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
      .catch(fail);
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
      .catch(fail);
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
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={14} /> меню</button>
        <Panel title="КОМАНДА">
          <p>{!auth.configured ? "Команды работают через облако: подключите Supabase (см. README)." : "Чтобы создать команду или вступить в неё, войдите в аккаунт: Профиль → Аккаунт."}</p>
        </Panel>
      </div>
    );

  return (
    <div className="screen" style={{ maxWidth: 1000 }}>
      <button className="icon-btn" onClick={onBack}><ArrowLeft size={14} /> меню</button>
      {msg && <div role={msg.ok ? "status" : "alert"} style={{ margin: "10px 0", color: msg.ok ? "var(--hud-green)" : "var(--hud-gold)", fontSize: 13 }}>{msg.text}</div>}

      <div className="menu-grid" style={{ marginTop: 12 }}>
        <div className="col">
          <Panel title="МОИ КОМАНДЫ">
            {teams.length === 0 && <p className="dim" style={{ fontSize: 13 }}>Вы пока не состоите в команде. Создайте свою или вступите по коду приглашения.</p>}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {teams.map((t) => (
                <button key={t.id} className={`icon-btn ${t.id === sel ? "active" : ""}`} onClick={() => setSel(t.id)}>
                  {t.role === "leader" && <Crown size={11} />} {t.name} · {t.member_count}
                </button>
              ))}
            </div>
            <label className="t-mono dim" style={{ fontSize: 11 }}>
              СОЗДАТЬ КОМАНДУ
              <input className="notes" style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Название, 2–60 символов" maxLength={60} />
            </label>
            <button className="btn" style={{ marginTop: 6 }} disabled={busy || name.trim().length < 2} onClick={() => run(async () => {
              const r = await createTeam(name);
              setName("");
              await loadTeams(r.id);
              ok("Команда создана. Отправьте код приглашения участникам.");
            })}>Создать</button>

            <label className="t-mono dim" style={{ fontSize: 11, display: "block", marginTop: 12 }}>
              ВСТУПИТЬ ПО КОДУ
              <input className="notes" style={input} value={code} onChange={(e) => setCode(e.target.value)} placeholder="например a1b2c-3d4e5" maxLength={24} />
            </label>
            <button className="btn gold" style={{ marginTop: 6 }} disabled={busy || !isValidCode(code)} onClick={() => run(async () => {
              const r = await joinTeam(normalizeCode(code));
              setCode("");
              await loadTeams(r.team_id);
              ok(r.already ? `Вы уже в команде «${r.name}».` : `Вы вступили в команду «${r.name}».`);
            })}>Вступить</button>
          </Panel>

          {team && (
            <Panel title={`КОМАНДА · ${team.name.toUpperCase()}`}>
              <div className="t-mono" style={{ fontSize: 12 }}>Роль: {leader ? "лидер" : "участник"} · участников: {team.member_count}</div>
              {leader && team.invite_code && (
                <div style={{ marginTop: 10 }}>
                  <div className="t-mono dim" style={{ fontSize: 11 }}>КОД ПРИГЛАШЕНИЯ</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="t-display" style={{ fontSize: 22, color: "var(--hud-gold)" }}>{formatCode(team.invite_code)}</span>
                    <button className="icon-btn" aria-label="Копировать код" onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(team.invite_code ?? "");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      } catch {
                        ok(`Код: ${team.invite_code}`);
                      }
                    }}>{copied ? <Check size={12} /> : <Copy size={12} />}</button>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <label className="t-mono dim" style={{ fontSize: 11 }}>
                  ВАШЕ ИМЯ В РЕЙТИНГЕ {me ? <span>(сейчас: {me.display_name})</span> : null}
                  <input className="notes" style={input} value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="Как вас видят в команде" maxLength={40} />
                </label>
                <button className="btn ghost" style={{ marginTop: 6 }} disabled={busy || myName.trim().length < 2} onClick={() => run(async () => {
                  await setDisplayName(userId, myName);
                  setMyName("");
                  await loadTeam(team.id);
                  ok("Имя обновлено.");
                })}>Сохранить имя</button>
              </div>
              <div style={{ marginTop: 12 }}>
                {leader ? (
                  <button className="btn ghost" disabled={busy} onClick={() => window.confirm(`Удалить команду «${team.name}» вместе с заданиями? Это нельзя отменить.`) && run(async () => {
                    await deleteTeam(team.id);
                    await loadTeams();
                    ok("Команда удалена.");
                  })}><Trash2 size={14} style={{ display: "inline", marginRight: 6 }} />Удалить команду</button>
                ) : (
                  <button className="btn ghost" disabled={busy} onClick={() => window.confirm(`Выйти из команды «${team.name}»?`) && run(async () => {
                    await leaveTeam(team.id);
                    await loadTeams();
                    ok("Вы вышли из команды.");
                  })}>Выйти из команды</button>
                )}
              </div>
            </Panel>
          )}
        </div>

        <div className="col">
          {team && (
            <Panel title="ЛИДЕРБОРД">
              {ranked.length === 0 ? <p className="dim" style={{ fontSize: 13 }}>Пока нет данных.</p> : (
                <div style={{ display: "grid", gap: 4 }}>
                  {ranked.map((r) => (
                    <div key={r.user_id} className="turn" style={{ display: "flex", gap: 8, alignItems: "center", background: r.user_id === userId ? "rgba(63,224,255,0.07)" : undefined }}>
                      <span className="t-display" style={{ width: 26, color: r.rank === 1 ? "var(--hud-gold)" : undefined }}>{r.rank}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="t-ui" style={{ display: "block" }}>{r.role === "leader" && <Crown size={11} style={{ display: "inline", marginRight: 4 }} />}{r.display_name}{r.user_id === userId ? " (вы)" : ""}</span>
                        <span className="dim t-mono" style={{ fontSize: 11 }}>{rankFor(r.points).name} · игр {r.games} · побед {r.wins}</span>
                      </span>
                      <span className="t-mono" style={{ color: "var(--hud-gold)" }}>{r.points}</span>
                      {leader && r.user_id !== userId && (
                        <button className="icon-btn" aria-label={`Убрать ${r.display_name}`} disabled={busy} onClick={() => window.confirm(`Убрать ${r.display_name} из команды?`) && run(async () => {
                          await removeMember(team.id, r.user_id);
                          await loadTeam(team.id);
                          ok("Участник убран.");
                        })}><UserMinus size={12} /></button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {team && (
            <Panel title={leader ? "ДОМАШНИЕ ЗАДАНИЯ · ПАНЕЛЬ ЛИДЕРА" : "МОИ ДОМАШНИЕ ЗАДАНИЯ"}>
              {leader && (
                <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
                  <div className="t-mono dim" style={{ fontSize: 11 }}>НАЗНАЧИТЬ КЕЙС</div>
                  <select className="notes" style={input} value={lvl} onChange={(e) => { setLvl(Number(e.target.value)); setCaseId(""); }} aria-label="Уровень">
                    {[1, 2, 3, 4, 5].map((l) => <option key={l} value={l}>Уровень {l}</option>)}
                  </select>
                  <select className="notes" style={input} value={caseId} onChange={(e) => setCaseId(e.target.value)} aria-label="Кейс">
                    <option value="">Выберите кейс…</option>
                    {levelCases.map((s) => <option key={s.id} value={s.id}>{s.title} — {s.persona.name}</option>)}
                  </select>
                  <input className="notes" style={input} type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Срок" />
                  <button className="btn gold" disabled={busy || !caseId} onClick={() => run(async () => {
                    await createAssignment(team.id, caseId, due || null);
                    setCaseId("");
                    setDue("");
                    await loadTeam(team.id);
                    ok("Задание назначено.");
                  })}>Назначить</button>
                </div>
              )}

              {!leader && myPending.length > 0 && <div className="t-mono" style={{ color: "var(--hud-gold)", fontSize: 12, marginBottom: 6 }}>Осталось выполнить: {myPending.length}</div>}
              {assignments.length === 0 && <p className="dim" style={{ fontSize: 13 }}>Заданий нет.</p>}
              {assignments.map((a) => {
                const s = byId.get(a.scenarioId.replace(/^live:/, ""));
                const d = dueLabel(a.dueDate);
                const mine = a.members.find((m) => m.userId === userId);
                return (
                  <div className="turn" key={a.id}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="t-ui" style={{ flex: 1, minWidth: 140 }}>{s ? `${s.title}` : a.scenarioId}{s && <span className="dim" style={{ fontSize: 12 }}> · ур. {s.level} · {s.persona.name}</span>}</span>
                      <span className="tag" style={d.overdue && !mine?.done ? { color: "var(--hud-red)", borderColor: "var(--hud-red)" } : undefined}>{d.text}</span>
                      {s && !mine?.done && <button className="btn" onClick={() => onPlay(s.id)}>Играть</button>}
                      {mine?.done && <span className="tag" style={{ color: OUT_COLOR[mine.best ?? "partial"], borderColor: OUT_COLOR[mine.best ?? "partial"] }}>{mine.best ? OUT[mine.best] : "ГОТОВО"}</span>}
                      {leader && <button className="icon-btn" aria-label="Удалить задание" disabled={busy} onClick={() => run(async () => { await deleteAssignment(a.id); await loadTeam(team.id); ok("Задание удалено."); })}><Trash2 size={12} /></button>}
                    </div>
                    {leader && (
                      <>
                        <div role="progressbar" aria-valuenow={Math.round(completion(a) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Выполнение" style={{ height: 5, background: "rgba(127,147,176,0.25)", margin: "6px 0" }}>
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
