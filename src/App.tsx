import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TUTORIAL_ID } from "./content/ids";
import { loadSoundSetting, play, setSoundEnabled } from "./sound";
import { dailyCase, dailyDone, makeRecord, mergeRecords, rankFor, streakDays, totalPoints, unlockedAchievements, type SessionRecord } from "./engine/profile";
import { fetchQuota, type Quota } from "./live/quota";
import { loadLocal, newId, saveLocal, syncSessions, uploadAchievements, uploadSession } from "./features/account/sessions";
import { cloudConfigured, supabase } from "./features/account/supabase";
import { useAuth } from "./features/account/useAuth";
import { useI18n, type Lang } from "./i18n";
import { Boot } from "./ui/Boot";
import type { FinishedGame } from "./ui/Deal";
import { loadProgress, type Progress } from "./ui/progress";
import type { LiveAccess } from "./ui/screens";

// Everything beyond the boot screen is loaded on demand, and the heavy parts are fetched
// while the boot animation plays: the first paint only needs React and a few KB of code.
const loadContent = (lang: Lang) => import("./content/bundle").then((m) => m.loadLibrary(lang));
const Menu = lazy(() => import("./ui/Menu").then((m) => ({ default: m.Menu })));
const Briefing = lazy(() => import("./ui/screens").then((m) => ({ default: m.Briefing })));
const Deal = lazy(() => import("./ui/Deal").then((m) => ({ default: m.Deal })));
const Debrief = lazy(() => import("./ui/Debrief").then((m) => ({ default: m.Debrief })));
const Profile = lazy(() => import("./ui/Profile").then((m) => ({ default: m.Profile })));
const TeamScreen = lazy(() => import("./features/team/TeamScreen").then((m) => ({ default: m.TeamScreen })));
const LiveDeal = lazy(() => import("./live/LiveDeal").then((m) => ({ default: m.LiveDeal })));

type Lib = Awaited<ReturnType<typeof loadContent>>;
type Screen = "menu" | "briefing" | "deal" | "result" | "profile" | "live" | "team";

const read = (store: "session" | "local", k: string) => {
  try {
    return (store === "session" ? sessionStorage : localStorage).getItem(k);
  } catch {
    return null;
  }
};
const write = (store: "session" | "local", k: string, v: string) => {
  try {
    (store === "session" ? sessionStorage : localStorage).setItem(k, v);
  } catch {
    /* private mode */
  }
};

const RANK_OF = { sale: 2, partial: 1, lost: 0 } as const;

const Loading = () => (
  <div className="boot t-mono dim" role="status" aria-live="polite">
    …
  </div>
);

export default function App() {
  const { lang } = useI18n();
  const [lib, setLib] = useState<Lib | null>(null);
  const [booted, setBooted] = useState(() => !!read("session", "dr_booted"));

  // The scenario library is per language; the previous one stays on screen until the new one is ready.
  useEffect(() => {
    let alive = true;
    void loadContent(lang).then((m) => alive && setLib(m));
    return () => {
      alive = false;
    };
  }, [lang]);
  useEffect(() => {
    void import("./ui/Menu"); // warm up the first screen
  }, []);

  const bootDone = useCallback(() => {
    write("session", "dr_booted", "1");
    setBooted(true);
  }, []);

  return (
    <>
      <div className="hud-bg" aria-hidden />
      {!booted ? <Boot onDone={bootDone} /> : !lib ? <Loading /> : <Game lib={lib} />}
    </>
  );
}

function Game({ lib }: { lib: Lib }) {
  const { allScenarios, scenarioById, tutorialCase } = lib;
  const auth = useAuth();
  const { tr } = useI18n();
  const trRef = useRef(tr);
  useEffect(() => {
    trRef.current = tr;
  }, [tr]);
  const [screen, setScreen] = useState<Screen>("menu");
  const [fx, setFx] = useState(() => read("local", "dr_fx") !== "off");
  const [free, setFree] = useState(() => read("local", "dr_free") === "on");
  const [records, setRecords] = useState<SessionRecord[]>(loadLocal);
  const [legacy] = useState<Progress>(loadProgress); // progress saved before game history existed
  const [selectedId, setSelectedId] = useState<string>(allScenarios[0].id);
  const [runId, setRunId] = useState(0);
  const [game, setGame] = useState<FinishedGame | null>(null);
  const [syncNote, setSyncNote] = useState("");
  const [quotaRaw, setQuotaRaw] = useState<Quota | null>(null);
  const recordsRef = useRef(records);
  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  const [sound, setSound] = useState(() => {
    const v = loadSoundSetting();
    setSoundEnabled(v);
    return v;
  });
  const [tourDone, setTourDone] = useState(() => read("local", "dr_tour_done") === "1");
  const isTutorial = selectedId === TUTORIAL_ID;

  const scenario = useMemo(
    () => (selectedId === TUTORIAL_ID ? tutorialCase : scenarioById(selectedId) ?? allScenarios[0]),
    [selectedId, tutorialCase, scenarioById, allScenarios],
  );

  // best outcome per case, from history (plus legacy progress)
  const progress = useMemo<Progress>(() => {
    const p: Progress = { ...legacy };
    for (const r of records) if (!p[r.scenarioId] || RANK_OF[r.outcome] > RANK_OF[p[r.scenarioId]]) p[r.scenarioId] = r.outcome;
    return p;
  }, [records, legacy]);

  const daily = useMemo(() => dailyCase(allScenarios), [allScenarios]);
  const rank = rankFor(totalPoints(records));

  useEffect(() => {
    document.body.classList.toggle("no-fx", !fx);
    write("local", "dr_fx", fx ? "on" : "off");
  }, [fx]);
  useEffect(() => write("local", "dr_free", free ? "on" : "off"), [free]);
  const changeSound = useCallback((v: boolean) => {
    setSoundEnabled(v);
    setSound(v);
    if (v) play("strong");
  }, []);
  const startTutorial = useCallback(() => {
    setSelectedId(TUTORIAL_ID);
    setRunId((n) => n + 1);
    setScreen("deal");
  }, []);
  const finishTour = useCallback(() => {
    write("local", "dr_tour_done", "1");
    setTourDone(true);
  }, []);

  // after sign-in: upload local games and merge what the cloud has
  const userId = auth.user?.id;
  useEffect(() => {
    if (!supabase || !userId) return;
    let alive = true;
    (async () => {
      const res = await syncSessions(supabase!, userId, recordsRef.current);
      if (!alive) return;
      setRecords(res.records);
      saveLocal(res.records);
      const err = res.error ?? (await uploadAchievements(supabase!, userId, unlockedAchievements(res.records)));
      if (alive) setSyncNote(err ? trRef.current("Синхронизация не удалась: {err}", { err }) : trRef.current("Синхронизировано. Загружено игр: {n}.", { n: res.uploaded }));
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  // remaining live (AI) games: refreshed every time the main screen is shown (e.g. after a live game)
  useEffect(() => {
    if (!userId || screen !== "menu") return;
    let alive = true;
    void fetchQuota().then((q) => alive && setQuotaRaw(q));
    return () => {
      alive = false;
    };
  }, [userId, screen]);
  const quota = userId ? quotaRaw : null;

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setScreen("briefing");
  }, []);
  const start = useCallback(() => {
    setRunId((n) => n + 1);
    setScreen("deal");
  }, []);
  const toMenu = useCallback(() => setScreen("menu"), []);
  const toBriefing = useCallback(() => setScreen("briefing"), []);
  const toProfile = useCallback(() => setScreen("profile"), []);
  const toTeam = useCallback(() => setScreen("team"), []);

  const saveRecord = useCallback(
    (rec: SessionRecord) => {
      const next = mergeRecords(recordsRef.current, [rec]);
      recordsRef.current = next;
      setRecords(next);
      saveLocal(next);
      if (supabase && userId) {
        void uploadSession(supabase, userId, rec).then((err) => err && setSyncNote(trRef.current("Игра сохранена только локально: {err}", { err })));
        void uploadAchievements(supabase, userId, unlockedAchievements(next));
      }
    },
    [userId],
  );

  const finish = useCallback(
    (g: FinishedGame) => {
      // the tutorial is practice: no history, no points, no cloud upload
      if (scenario.id !== TUTORIAL_ID) saveRecord(makeRecord(scenario, g.state, g.outcome, g.durationSec, newId()));
      setGame(g);
      setScreen("result");
    },
    [scenario, saveRecord],
  );

  const liveAccess: LiveAccess = !cloudConfigured ? "off" : userId ? "ok" : "login";
  const startLive = useCallback(() => {
    setRunId((n) => n + 1);
    setScreen("live");
  }, []);

  const attempts = records.filter((r) => r.scenarioId === scenario.id).length;

  return (
    <Suspense fallback={<Loading />}>
      {screen === "menu" && (
        <Menu
          scenarios={allScenarios}
          progress={progress}
          free={free}
          fx={fx}
          onFx={setFx}
          onFree={setFree}
          onSelect={select}
          daily={daily}
          dailyDone={dailyDone(records, daily)}
          streak={streakDays(records)}
          rank={rank.name}
          onProfile={toProfile}
          onTeam={toTeam}
          sound={sound}
          onSound={changeSound}
          onTutorial={startTutorial}
          quota={quota}
        />
      )}
      {screen === "profile" && (
        <Profile records={records} scenarios={allScenarios} tagLabels={lib.tagLabels} auth={auth} syncNote={syncNote} onBack={toMenu} onOpenCase={select} />
      )}
      {screen === "team" && <TeamScreen scenarios={allScenarios} auth={auth} onBack={toMenu} onPlay={select} />}
      {screen === "briefing" && <Briefing scenario={scenario} onBack={toMenu} onStart={start} live={liveAccess} onLive={startLive} />}
      {screen === "live" && (
        <LiveDeal key={`live-${scenario.id}-${runId}`} scenario={scenario} onFinish={saveRecord} onExit={toMenu} onReplay={startLive} onScripted={start} />
      )}
      {screen === "deal" && (
        <Deal
          key={`${scenario.id}-${runId}`}
          scenario={scenario}
          fx={fx}
          onFinish={finish}
          onExit={isTutorial ? toMenu : toBriefing}
          tour={isTutorial || !tourDone}
          onTourDone={finishTour}
        />
      )}
      {screen === "result" && game && (
        <Debrief scenario={scenario} game={game} attempts={attempts} fx={fx} onReplay={start} onMenu={toMenu} onLive={liveAccess === "ok" ? startLive : undefined} />
      )}
    </Suspense>
  );
}
