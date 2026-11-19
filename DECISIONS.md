# DECISIONS

## Phase 1

- **Stack:** MeetOwl is Next.js/Prisma, which does not fit this app (offline PWA, Supabase, Edge Functions). Used the master prompt default: React + TypeScript + Vite, Tailwind v4, Framer Motion, Lucide.
- **Charts:** pure SVG (no Recharts) — lighter bundle and full control over the animated pulse line.
- **Routing:** no router; a single `screen` state (boot → menu → briefing → deal → result). Revisit with Phase 5 (accounts).
- **Engine in Phase 1:** `src/engine` already holds the final types from the master prompt (section 6) and a small pure `applyChoice` + scoring. Phase 2 adds Zod, validator, tests and full conditional logic.
- **Mini-case:** one hardcoded scenario (`src/content/miniCase.ts`), 9 client nodes + 9 endings, 2 sale paths, 3 partial and 5 lost endings.
- **Settings:** "effects off" and "sound" stored in localStorage; `prefers-reduced-motion` is honoured by default. Sound is a stub until Phase 8.
- **Fonts:** loaded from Google Fonts in `index.html`; self-host in Phase 8 for offline PWA.
- **Language:** UI strings are RU, kept in components for now; i18n extraction in Phase 8.

## Phase 2

- **Zod 4** schema in `src/engine/schema.ts`; `parseScenario` returns errors as readable `path: message` strings.
- **Validator** (`src/engine/validate.ts`): schema → structure (missing/unreachable nodes, dead ends, cycles without exit, 2–4 choices, conditional `next` needs a default, unknown flags) → content rules (≥15 nodes, sale/partial/lost endings, ≥2 sale paths, ≥2 lost endings on levels 4–5) → 1000-run seeded simulation. Run with `npm run validate`; exits 1 on any error (CI-ready).
- **Path counting** ignores flag conditions (over-approximation), so "≥2 paths to sale" is a lower-bound sanity check, not proof that both are playable.
- **Level thresholds** (`LEVEL_RULES` in engine): irritation limit 100/100/95/90/85, trust floor 0/0/5/10/15 for levels 1–5. These are my defaults; tune with playtests.
- **Mini-case moved from level 1 to level 3.** The simulation showed a random player wins only 0.4% (level 1 needs ≥30%). The case tests honesty and MLM scepticism, which is level 3 in the master prompt. Real level-1 cases must be much more forgiving (few critical errors). Consequence: technique tags are hidden in the demo, as the spec says for level 3+.
- **Not done in Phase 2:** "2 forgiven mistakes" on level 1 and the decision timer for levels 4–5 are engine/UI features, left for when level 1/4/5 content exists (Phase 4).

## Phase 3

- **Debrief logic is pure** (`src/engine/debrief.ts`, tested): good/bad moves, growth points (regex map from mistake tags to advice), hidden context, key fork = the turn where the chosen answer lost the most points against the best choice of that node.
- **Best path** = exhaustive search over (node, scales, flags) with memo; ranks the ending first (sale > partial > lost), then summed move quality. On levels 4–5 it unlocks after 2 attempts (attempts counted per scenario in localStorage `dr_att_<id>`).
- **Story cards:** result → good → bad → growth → hidden → fork → summary; arrows, click on the progress bars, or swipe. Timeline shows the pulse chart with markers (red = weak/error, gold = key fork) and the full dialogue with per-move deltas.
- **Export:** PDF = browser print dialog with a print-only light stylesheet (no PDF library; user picks "Save as PDF"). Story image = canvas-rendered 1080×1920 PNG of the summary card (one image, not one per card).
- **Pace bonus** from the scoring spec is not implemented yet (needs real timing data from several cases).
- **Chart fix:** `pathLength` animation conflicts with `vector-effect: non-scaling-stroke` (lines were drawn with gaps); the pulse line now fades in instead.

## Phase 4

- **Content is assembled, not hand-written** (49 of 50 cases). A case = persona + niche vocabulary + ordered objection beats from a bank (`src/content/data/beats.ts`, 18 objection tags × 4 answers + 3 recovery answers). The builder (`src/content/builder.ts`) creates a diamond graph: opening → beats (each with a pushback node and its own GAME OVER) → close → 5 shared endings; levels 2–5 add a hidden-objection branch (revealed only if `trusted`) and a "stall" branch that both rejoin the main line. 16–32 nodes per case. Only `mwr-l3-irina-accountant` is hand-written.
- **Why:** 50 × 15+ nodes × 3–4 answers by hand is ~3000 texts; the builder guarantees structure and calibration, and the validator gates everything. The honest weakness: client phrasing repeats across cases. Next quality step is the LLM pipeline from the master prompt, gated by the same validator.
- **Matrix** (`src/content/matrix.ts`): 12/12/10/9/7 by level; niche variants weighted 7/7/6/5/3+3/6/6/7 (services split into interior design and mentoring); channel rotates within what the niche allows; persona = every 3rd of 20 so all are used.
- **Level shape:** beats per level 3/4/4/5/6 (+ hidden). Negative effects scale ×0.7/0.85/1/1.15/1.3; start scales get worse with level. Level 1 forgives a weak answer and a critical error leads to a pushback node (not game over). Close: a sale needs `trusted` (excellent close) or `value` (alternative close), otherwise PARTIAL.
- **Calibration with the simulator:** random player wins ≈ 34% (L1), 11–17% (L2), 2–4% (L3), 1–2% (L4–5). First run failed level 1 (17%); fixed by forgiving weak answers and removing the flag requirement on the excellent close at level 1.
- **Length bias fixed:** first draft had the best answer as the longest in 92% of nodes. Rewrote bank texts: now 22% longest / 21% shortest (test caps both at 45%).
- **Language details:** accusative forms (`productAcc`, `thirdWho`) and gendered forms («сказал(а)») are resolved by the builder; tests fail on leftover placeholders or «(а)».
- **Technique tags (levels 1–2):** weak/wrong answers get a decoy tag, otherwise only correct answers would be tagged.
- **Menu:** all cases by level tabs and radar dots; a level unlocks after 3 cases of the previous one are completed (sale or partial); "free play" unlocks everything. Progress in localStorage (`dr_progress`) until accounts in Phase 5.
- **Known gaps:** level 4–5 "false facts" and the decision timer are not mechanics yet. Bundle is 518 KB (163 KB gzip) — content should be code-split in Phase 8.

## Phase 4b — 100 cases, all on MWR Life

- **Every case is MWR Life.** Facts (single source: `src/content/data/mwr.ts`): Elite $340 and Turbo $590; $100 of each goes to the company, the rest ($240 / $490) is credited as points to the Travel Advantage account; subscription $120 per month; income only from building a distributor network. Nothing else about the company is stated as true: refund/cancel terms, what the subscription includes, commissions and point expiry are answered with "check the contract and show it in writing". **These facts come from the user's message and must be verified against official materials.**
- **Niches replaced** by MWR market segments: Elite client, Turbo client, recruiting (building a network), cold contact, existing client (subscription doubts), family, business owner, social media. `Niche` type and Zod schema changed accordingly.
- **Bank rewritten for MWR:** 23 objection beats (18 old, reworded for MWR + 5 new: `subscription`, `points_value`, `tier_choice`, `refund_cancel`, `network_realism`). Each beat has 2 soft + 2 hard client lines and 2 pushback lines, so phrasing varies per case. Placeholders `{tier} {tierPrice} {tierPoints} {fee} {sub}` are filled by the builder per case (Elite/Turbo).
- **Compliance by tests** (`src/content/mwr.test.ts`): any `$` amount outside the known set fails; euros, "тысяч" and a "trial month" fail; a promise of income / payback / refund / discount ("гарантирую", "окупится", "вернут всё", "без последствий") can only be a weak or critical answer; strong answers about refunds must point to the contract; no percentages in strong answers.
- **Distribution:** 24/24/20/18/14 by level; segments 16/12/16/12/12/10/12/10; 30 personas (10 new), segment-specific personas for business, family and social.
- **Persona voice** now has 4 variants per psychotype (was 2) and colours only every other line.
- **Calibration kept:** random player wins 33.8% (L1), 15.5% (L2), 3.7% (L3), 1.8% (L4), 1.5% (L5); length bias 26% / 25%.
- **Retention mode** (`repeat` segment): the close and endings talk about reviewing the subscription honestly instead of registering a tier; the goal is trust, not keeping the client at any price.
- **Honest limit:** still builder-assembled phrasing (99 of 100 cases); the hand-written mini-case was adapted to the same facts.

## Phase 5 — accounts and progress

- **Offline-first.** The source of truth in the browser is the game history (`dr_sessions` in localStorage). Cloud is optional: without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` the app runs as before and the profile screen says so. Level unlocks, "completed" marks and the profile are all derived from the history (old `dr_progress` is still read as a fallback).
- **One record = one game** (`SessionRecord`): scenario, level, outcome, score, turns, duration, hints and a list of `{nodeId, quality}` moves. No client text is stored; the debrief of past games is not reconstructible (full transcripts can be added later).
- **Weak-spot map is exact:** every client node now carries the objection `tag` it practises; each move's quality on a tagged node counts as good or bad for that tag. Radar = share of good answers per tag (top 8 by attempts). The hand-written mini-case has tags on 8 of its nodes.
- **Recommendations:** weakest tags (≥ 2 moves, ≥ 1 failure) → up to 3 cases per tag that the player has not won, at most one level above their best level.
- **Ranks** by total points: TRAINEE 0 · JUNIOR 150 · CLOSER 500 · PRO 1200 · SHARK 2500 · LEGEND 5000 (my thresholds, tune with real play).
- **Achievements (10):** computed on the client from the history; unlocked keys are also upserted to `achievements` when signed in.
- **Daily case:** deterministic by date (hash of the local day), done when that case was played today; streak = consecutive days with any game.
- **Sync:** on sign-in, upload local games the cloud lacks (`upsert … ignoreDuplicates` on `(user_id, client_id)`), merge both lists by id, save locally. Errors never block play; they show as a note on the profile.
- **Security model:** RLS on every table; sessions are immutable (no update policy); `profiles.role` is not writable from the client (column-level grant); team/leader helpers are `SECURITY DEFINER` to avoid recursive policies.
- **NOT verified:** the SQL migration and the sign-in flows have not been run against a real Supabase project (no project/keys were available). Auth code, sync and RLS need a first real run; expect small fixes.
- **Also fixed:** duplicate React key in the timeline chart when a weak move and the key fork fall on the same turn.

## Phase 6 — "Live client" (Claude API)

- **Where the key lives:** only in Supabase secrets (`ANTHROPIC_API_KEY`). The browser calls the Edge Function `live-client` with the user's session token. The function verifies the token itself (`auth.getUser`), so `verify_jwt = false` in `supabase/config.toml` (works with the new asymmetric signing keys).
- **Testable architecture:** all logic is plain TypeScript in `supabase/functions/_shared/` (`live.ts` prompts/validation, `handler.ts` the request handler with injected dependencies: Claude `fetch`, user lookup, quota). Only `live-client/index.ts` is Deno glue. The client imports the same types/limits, so both sides cannot drift. 46 tests drive the handler with a fake Claude.
- **Structured output through a forced tool call** (`client_reply` / `write_debrief`, `tool_choice` set) instead of "please answer in JSON"; one retry if the model does not return the tool call.
- **The model is never trusted:** deltas are clamped to ±25 and made consistent with the quality (a strong move cannot lower trust); a sale cannot be declared before the 4th player turn; a sale by a critical error becomes a loss; replies are sanitised and capped.
- **Ethics safety net independent of the model:** regexes on the player's text (income/payback/refund promises, "только сегодня", fake scarcity, "take a loan") force `critical_error`, trust ≤ −15, irritation ≥ +15, even if the model liked the move. Honest negations ("гарантий нет", "не гарантирую") are not flagged. Tests cover both directions.
- **Prompt injection:** the player's text is placed in `<player_message>` tags, `<` and `>` are replaced so it cannot close the tag, control characters are removed, length is capped; the system prompt says everything inside the tag is speech only and an injection attempt must be answered like a human to a strange phrase and rated weak or critical.
- **Limits:** 10 live games and 200 turns per user per day (raised from 5/120 after the first real sessions), enforced in Postgres by `ai_consume()` (SECURITY DEFINER, called with the caller's JWT — no service key). Fail closed: if the quota check fails the AI is not called. Request body ≤ 60 KB, transcript ≤ 40 messages, 25 s timeout, 14 turns per game.
- **Same scoring and endings as the scripted mode** (level thresholds from `LEVEL_RULES`, quality points, outcome points; turn cap → PARTIAL or LOST). The written debrief is a second function call; if it fails, the per-turn coach notes are still shown.
- **Profile:** a live game is saved as `live:<scenarioId>`; it counts for points/ranks/achievements but not for the weak-spot map (no objection tags on free text).
- **Model:** default `claude-sonnet-5-5`, overridable by the `CLAUDE_MODEL` secret.
- **NOT verified:** the function has not been deployed or called with a real key; the real model's behaviour (role-play quality, strictness of ratings) needs a first real session and prompt tuning.

## Phase 7 — teams, leaderboard, homework

- **Everything goes through SECURITY DEFINER functions** (`004_teams.sql`): `create_team`, `join_team`, `leave_team`, `delete_team`, `remove_member`, `my_teams`, `team_leaderboard`, `team_assignments_status`, `create_assignment`, `delete_assignment`. Each checks membership or leadership itself. The Phase 5 policy that let anybody INSERT themselves into `team_members` is dropped: it would have bypassed the invite code.
- **Invite codes:** 10 hex characters (40 bits), shown only to leaders (`my_teams()` hides the code from members); the client tolerates capitals, spaces and dashes. There is no brute-force throttle yet; with 40 bits and per-user auth that is acceptable for a private trainer, but a rate limit is a sensible later addition.
- **Privacy:** the leaderboard returns aggregates only (points, games, wins, last game). Members never get other members' rows. A leader can read the raw games of their team (policy from Phase 5) but there is no UI for it yet. Display names are visible to teammates; the default is the email prefix, so the screen lets players rename themselves.
- **Homework is done** when the player has a game for that case played after the assignment was created, outcome sale or partial; live games (`live:<id>`) count too. A member sees only their own status, a leader sees everybody.
- **Limits:** 3 owned teams, 50 members, 50 assignments per team.
- **The SQL is now really tested:** `supabase/tests/sql.test.ts` runs migrations 001–004 in PGlite (in-process Postgres) with Supabase-like roles and `auth.uid()` from a JWT claim and **no default privileges**, like the user's project. 21 tests cover grants, RLS, immutability of sessions, the AI quota, team flows, the 50-member cap, and that outsiders see nothing. It found no bugs in 001–003. Not covered: Supabase-specific extras (Realtime, PostgREST quirks), so the first real run may still need small fixes.
- **Not built:** a leader's drill-down into one member's game history, weekly/seasonal leaderboards, team chat, notifications about new homework.

## Phase 8 — polish and release

- **PWA** with `vite-plugin-pwa` (Workbox, `generateSW`, auto-update): the app shell, JS/CSS, icons and self-hosted fonts (`@fontsource/*`, no Google Fonts requests) are precached (66 files, ~1.4 MB). Navigation falls back to `index.html`. Cloud calls are never cached. Icons are generated by `scripts/make-icons.mjs` (no image library; a HUD reticle).
- **i18n:** own gettext-style helper (`tr("русский текст")`, ~175 strings), RU is the source and EN/PL are dictionaries. A test scans the source and fails on a missing translation, a changed `{placeholder}`, or a stale entry. Translated: boot, menu, briefing, deal screen, debrief, tour. **Not translated:** profile, team and live-mode screens, server messages, the scenario content itself (Russian by design). `<html lang>` follows the choice.
- **Sound:** Web Audio synthesis instead of Howler.js (no assets, no dependency); six short quiet sounds, OFF by default, remembered. Tested with a fake `AudioContext`.
- **Tutorial:** a 7-step spotlight tour (`data-tour` targets, keyboard owned by the tour while open) shown on the first game, and "Case 0" (a friendly level-1 call built by the same builder, validated like the rest) behind the "How to play" button. Case 0 gives no points and is not saved.
- **Performance (Lighthouse mobile, simulated slow 4G):** 86 → **94**. What mattered: (1) everything after the boot screen is lazy and the content chunk is fetched while the boot animation plays, (2) the Supabase client (~100 KB) is imported only when needed (`ensureSupabase()`), (3) a critical-CSS splash in `index.html` gives an early first paint, (4) scenario graphs are built lazily: metadata is computed at load (46 ms instead of 158 ms), the node graph on first access (`buildScenarioLazy`, tested equal to the eager build). Main JS 599 KB → 259 KB.
- **Self-found bug:** a hard-coded string comparison (`label === "РАЗДРАЖ."`) decided the colour of the irritation delta in `Gauge`; with translated labels it would have broken. Replaced with an `invert` prop.
- **E2E (Playwright, 6 tests)** run against the production build with the installed Chrome: win, lose, keys 1–4, tour, language switch, and a real offline reload through the service worker.
- **Deploy configs:** `vercel.json` (SPA rewrite, immutable asset caching, `no-cache` for `sw.js`/manifest, security headers) and `netlify.toml`. I did NOT deploy anything: no hosting account or repository was available to me.
- **Known gaps:** no CI workflow yet (the master prompt mentions running the validator in CI); the Briefing/Debrief card texts that come from scenario data (coach notes, personas) stay Russian; push notifications and install prompts are not customised.

## Voice dictation and higher limits (after Phase 8)

- **Dictation = the browser's Web Speech API** (`SpeechRecognition`/`webkitSpeechRecognition`), not a paid speech-to-text service: no key, no cost, no server code, and the audio never touches our Edge Function. Trade-offs: only Chromium browsers and Safari (the button is hidden elsewhere); in Chrome/Edge the audio is processed by the browser vendor's cloud, which the UI states; punctuation is whatever the engine gives (we only capitalise after a sentence end); quality depends on the browser.
- **`Dictation` controller** (`src/live/dictation.ts`) is browser-agnostic (takes a recognition factory) and tested with a fake: interim vs final results honouring `resultIndex`, automatic restart when the browser ends a session after a pause, no endless restart loop (20 restarts without any recognised speech, then it stops with an error), fatal errors (denied permission, no microphone, network) stop it with a readable Russian message, language change restarts it.
- **Sending while listening** includes the not-yet-final words and stops the microphone; dictation is started again explicitly (button or Alt+M). Dictation language is separate from the UI language and defaults to Russian.
- **Bug avoided:** the hosting headers had `Permissions-Policy: microphone=()`, which would have blocked the microphone on the deployed site. Now `microphone=(self)` in `vercel.json` and `netlify.toml`, guarded by a test.
- **Limits raised to 10 live games and 200 turns per day** (was 5/120; 10 games x 14 turns + a debrief each = 150). The Edge Function now passes the limits to `ai_consume()` explicitly from `LIMITS`, so changing them needs only a function redeploy, no SQL; the SQL defaults (003) were updated for fresh installs.
- **E2E for dictation** fakes the signed-in session, the cloud function (`page.route`) and the recognition class (both the standard and the prefixed name, because Chrome has both). It is skipped when `.env.local` is missing, because the build must know the cloud.
