# DEAL ROOM

Sales and objection-handling trainer with a tactical HUD interface. Built from `MASTER_PROMPT_sales_trainer.md`, phase by phase.

## Run

```powershell
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm run build
npm test           # Vitest
npm run validate   # validate all scenarios + 1000-run simulation
```

## Status

Phase 8 done: PWA (offline), EN/PL, sounds, tutorial, deploy configs, e2e.

Phase 7 done: teams, invite codes, leaderboard, homework (see README).

Phase 6 done: live client mode (Claude via Supabase Edge Function).

Phase 5 done: profile (rank, weak-spot map, recommendations, achievements, daily case), optional Supabase accounts.

Phase 4 done: 100 cases (MWR Life: Elite $340, Turbo $590, subscription $120), 30 personas, mission menu with level unlocks (see CONTENT_REPORT.md; npm run report).

Phase 3 done: debrief (story cards, timeline, best path, PDF and 9:16 PNG export).

Phase 2 done: Zod schema, scenario validator with simulation, unit tests.

Phase 1 done: HUD design system, boot screen, mission map, briefing, deal screen with one hardcoded mini-case, simple result screen. Keys: `1–4` answer, `H` hint (−10), `N` notes, `Space` skip typing, `Esc` pause.

See `DECISIONS.md` for decisions made along the way.

## Accounts and cloud sync (optional, Phase 5)

The app works fully offline: progress, history, achievements and the weak-spot map are stored in the browser. To add sign-in and sync across devices:

1. Create a free project at supabase.com.
2. Open **SQL Editor** and run `supabase/migrations/001_init.sql` (tables + Row Level Security).
3. **Authentication → Providers:** Email is on by default. For Google: enable the provider and paste the OAuth client id/secret from Google Cloud Console; add `http://localhost:5173` (and your production URL) to **Authentication → URL Configuration → Redirect URLs**.
4. Copy `.env.example` to `.env.local` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings → API). Use only the public **anon** key; never the `service_role` key.
5. Restart `npm run dev`. The profile screen now shows the sign-in form; after signing in, local games are uploaded (idempotent) and merged with the cloud ones.

Every table has RLS: a player sees only their own rows; a team leader also sees the sessions and achievements of their team members. Players cannot change their own `role`.

## Живой клиент (ИИ), Фаза 6

Режим, где вы отвечаете свободным текстом, а клиента играет Claude. Ключ Claude хранится **только в секретах Supabase** и никогда не попадает в браузер. Браузер вызывает Edge Function `live-client`, она проверяет вход, дневной лимит и корректность ответа модели.

Развёртывание (один раз):

1. Выполните в SQL Editor файл `supabase/migrations/003_ai_usage.sql` (таблица дневных лимитов и функция `ai_consume`).
2. Получите ключ на console.anthropic.com (API Keys). Он понадобится только в шаге 4.
3. Войдите в Supabase CLI и привяжите проект (в папке проекта):
   `npx supabase login`, затем `npx supabase link --project-ref <ID проекта>`.
4. Положите ключ в секреты (вводите в своём терминале, никому не отправляйте):
   `npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`
   Модель по умолчанию `claude-sonnet-5-5`; сменить можно секретом `CLAUDE_MODEL`.
5. Разверните функцию: `npx supabase functions deploy live-client --no-verify-jwt`.
6. Войдите в аккаунт в приложении: на экране брифинга станет активной кнопка «Живой клиент (ИИ)».

Лимиты: 10 живых игр в день и 200 реплик в день на игрока. Цифры задаются в одном месте, `LIMITS` в `supabase/functions/_shared/live.ts`; после изменения достаточно заново развернуть функцию (SQL трогать не нужно). Реплика игрока — до 500 символов, игра — до 14 ходов.

## Команды, лидерборд и домашние задания (Фаза 7)

**Один раз:** в Supabase → SQL Editor выполните файл `supabase/migrations/004_teams.sql`. Если вы ещё не выполняли `002_grants.sql` и `003_ai_usage.sql`, выполните их тоже, по порядку номеров.

**Как это работает**
1. Лидер: Меню → **Команда** → «Создать команду». Появится код приглашения (10 символов, например `a1b2c-3d4e5`). Отправьте его партнёрам.
2. Участник: Меню → **Команда** → «Вступить по коду». Войти в аккаунт нужно заранее.
3. **Лидерборд** виден всем членам команды: место, звание, очки, игры и победы. Видны только итоговые цифры, не переписки и не отдельные партии.
4. Лидер **назначает кейс** (уровень → кейс → срок). У участников задание появляется в списке «Мои домашние задания» с кнопкой «Играть». Оно считается выполненным, если после назначения сыграна партия (в скриптовом или живом режиме) с результатом «продажа» или «частично».
5. Панель лидера показывает по каждому заданию, кто выполнил, и полосу прогресса. Лидер может убрать участника и удалить задание или команду.
6. Своё имя в рейтинге можно поменять в блоке «Команда» (по умолчанию это начало почты).

Ограничения: до 3 созданных команд на игрока, до 50 участников и до 50 заданий в команде. Войти в команду можно только по коду; прямая запись в таблицу участников закрыта.

## Фаза 8: офлайн, языки, звук, обучение, деплой

**Офлайн (PWA).** После первого открытия скриптовый режим работает без интернета: приложение, кейсы и шрифты кэшируются сервис-воркером. Облачные функции (вход, команды, живой клиент) всегда ходят в сеть. На телефоне и в Chrome можно «Установить приложение» (значок установки в адресной строке). Иконки создаются скриптом `node scripts/make-icons.mjs`.

**Языки.** Интерфейс на русском, английском и польском: кнопки RU / EN / PL в шапке меню, выбор запоминается. Тексты самих кейсов остаются на русском. Переведены заставка, меню, брифинг, игровой экран, разбор и обучение; экраны профиля, команды и живого режима пока только на русском. Как добавить текст: оберните русскую строку в `tr("…")` (или `T("…")` для констант) и добавьте перевод в `src/i18n/en.ts` и `src/i18n/pl.ts`. Тест `npm test` проверяет, что переведены все строки и нет лишних.

**Звук.** Выключен по умолчанию, включается флажком «звук» в меню. Звуки синтезируются в браузере, файлов нет.

**Обучение.** Первая игра сопровождается подсветкой областей экрана (7 шагов, можно пропустить). Кнопка «Как играть» в меню запускает учебный кейс 0: он не даёт очков и не попадает в историю.

### Деплой на Vercel (рекомендую)

1. Загрузите проект на GitHub (в папке проекта):
   `git init`, `git add .`, `git commit -m "Deal Room"`, затем создайте пустой репозиторий на github.com и выполните показанные там команды `git remote add origin …` и `git push -u origin main`. Файлы `.env.local` и `node_modules` в репозиторий не попадут.
2. На vercel.com: **Add New → Project**, выберите репозиторий. Framework определится как Vite, остальное уже есть в `vercel.json`.
3. До нажатия Deploy откройте **Environment Variables** и добавьте две переменные (значения из вашего `.env.local`): `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`. Только публичный ключ, никаких секретных.
4. Нажмите **Deploy**. Через минуту появится адрес вида `https://deal-room-xxxx.vercel.app`.
5. В Supabase откройте **Authentication → URL Configuration**: в **Site URL** вставьте адрес сайта, а в **Redirect URLs** добавьте его же. Без этого письма подтверждения и вход через Google будут возвращать на неправильный адрес.
6. Откройте сайт, войдите в аккаунт, сыграйте кейс и проверьте, что строка появилась в таблице `sessions`.

Netlify: те же шаги, настройки уже лежат в `netlify.toml` (Add new site → Import from Git; переменные в Site configuration → Environment variables).

### Проверки качества

- `npm test`: юнит- и SQL-тесты. `npm run test:e2e`: сквозные тесты в Chrome (выигрыш, проигрыш, клавиши, обучение, языки, офлайн-перезагрузка). Playwright использует установленный Chrome, ничего не скачивается.
- Lighthouse (мобильный профиль, собранная версия): производительность 94, доступность 100, лучшие практики 100, SEO 100.

## Голосовой ввод в живом режиме

В режиме «Живой клиент (ИИ)» рядом с кнопкой отправки есть кнопка микрофона (или горячая клавиша **Alt+M**).

1. Нажмите микрофон, при первом разе браузер спросит разрешение на доступ к микрофону: нажмите «Разрешить».
2. Говорите: законченные фразы попадают в поле ответа (первая буква предложения становится заглавной), а ещё не законченные показываются рядом с индикатором «Слушаю…».
3. Нажмите «Отправить» или Enter: слова, которые вы только что произнесли, уйдут вместе с текстом, а диктовка остановится. Чтобы продолжить говорить, снова нажмите микрофон или Alt+M. Текст можно править руками до отправки.
4. **Язык диктовки** (RU / EN / PL) выбирается отдельно от языка интерфейса и запоминается. По умолчанию русский, потому что кейсы русские.

Что нужно знать:
- Работает в Chrome, Edge и Safari. В Firefox кнопки микрофона нет, остальное работает как раньше.
- Распознавание делает сам браузер. В Chrome и Edge звук для этого отправляется в сервис производителя браузера (у Chrome это Google). Через ваш сервер и через Supabase аудио не проходит, ничего не записывается и не хранится в приложении.
- Если доступ к микрофону запретили по ошибке: значок замка слева от адреса сайта, затем «Разрешения», микрофон, «Разрешить».
- Для работы на сайте в заголовках (`vercel.json`, `netlify.toml`) должно стоять `microphone=(self)`; тест `src/deploy.test.ts` следит за этим.
