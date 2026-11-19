import type { ClientEval, DebriefOut, LiveRequest } from "../../supabase/functions/_shared/live.ts";
import { T, type Tr } from "../i18n";
import { ensureSupabase } from "../features/account/supabase";

export class LiveError extends Error {
  /** `message` is a translation key (see MESSAGES); show it with tr(). `detail` is the provider's own short note. */
  constructor(public code: string, message: string, public detail?: string) {
    super(message);
  }
}

const MESSAGES: Record<string, string> = {
  unauthorized: T("Войдите в аккаунт, чтобы играть в живом режиме."),
  limit: T("Дневной лимит живых игр исчерпан. Скриптовый режим доступен без ограничений."),
  not_configured: T("Живой режим ещё не включён на сервере (нет ключа Claude)."),
  provider_busy: T("ИИ сейчас перегружен. Попробуйте через минуту."),
  provider_auth: T("Сервер не смог авторизоваться у ИИ-провайдера. Сообщите владельцу приложения."),
  provider_error: T("Ошибка ИИ-провайдера. Попробуйте ещё раз."),
  timeout: T("ИИ слишком долго отвечал. Попробуйте ещё раз."),
  bad_model_output: T("ИИ ответил некорректно. Отправьте реплику ещё раз."),
  too_large: T("Слишком длинный запрос."),
  empty_message: T("Напишите реплику."),
  network: T("Нет связи с сервером. Проверьте интернет."),
  not_deployed: T("Функция живого режима не развёрнута на сервере (см. README)."),
};

export const liveMessage = (code: string) => MESSAGES[code] ?? T("Не удалось выполнить запрос к ИИ.");

/** The text to show for any error thrown by this module, in the player's language. */
export const liveErrorText = (e: unknown, tr: Tr) =>
  e instanceof LiveError ? tr(e.message) + (e.detail ? ` (${e.detail})` : "") : tr(liveMessage("network"));

type Ok = { ok: true; eval?: ClientEval; debrief?: DebriefOut; sessionsLeft?: number };

async function call(req: LiveRequest): Promise<Ok> {
  const client = await ensureSupabase();
  if (!client) throw new LiveError("not_configured", liveMessage("not_configured"));
  const { data, error } = await client.functions.invoke("live-client", { body: req });
  if (error) {
    // FunctionsHttpError: the function answered with a non-2xx status (duck-typed to keep the client library out of this chunk)
    const ctx = (error as { name?: string; context?: Response }).context;
    if ((error as { name?: string }).name === "FunctionsHttpError" && ctx) {
      const status = ctx.status;
      const body = (await ctx.json().catch(() => ({}))) as { error?: string; detail?: string };
      const code = body.error ?? (status === 404 ? "not_deployed" : "provider_error");
      // the server adds the provider's own short explanation (never a secret): show it to help diagnose
      throw new LiveError(code, liveMessage(code), body.detail);
    }
    throw new LiveError("network", liveMessage("network"));
  }
  if (!data || !(data as Ok).ok) throw new LiveError("bad_model_output", liveMessage("bad_model_output"));
  return data as Ok;
}

export async function liveTurn(req: LiveRequest): Promise<{ eval: ClientEval; sessionsLeft?: number }> {
  const r = await call(req);
  if (!r.eval) throw new LiveError("bad_model_output", liveMessage("bad_model_output"));
  return { eval: r.eval, sessionsLeft: r.sessionsLeft };
}

export async function liveDebrief(req: LiveRequest): Promise<DebriefOut> {
  const r = await call(req);
  if (!r.debrief) throw new LiveError("bad_model_output", liveMessage("bad_model_output"));
  return r.debrief;
}
