import type { ClientEval, DebriefOut, LiveRequest } from "../../supabase/functions/_shared/live.ts";
import { ensureSupabase } from "../features/account/supabase";

export class LiveError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

const MESSAGES: Record<string, string> = {
  unauthorized: "Войдите в аккаунт, чтобы играть в живом режиме.",
  limit: "Дневной лимит живых игр исчерпан. Скриптовый режим доступен без ограничений.",
  not_configured: "Живой режим ещё не включён на сервере (нет ключа Claude).",
  provider_busy: "ИИ сейчас перегружен. Попробуйте через минуту.",
  provider_auth: "Сервер не смог авторизоваться у ИИ-провайдера. Сообщите владельцу приложения.",
  provider_error: "Ошибка ИИ-провайдера. Попробуйте ещё раз.",
  timeout: "ИИ слишком долго отвечал. Попробуйте ещё раз.",
  bad_model_output: "ИИ ответил некорректно. Отправьте реплику ещё раз.",
  too_large: "Слишком длинный запрос.",
  empty_message: "Напишите реплику.",
  network: "Нет связи с сервером. Проверьте интернет.",
  not_deployed: "Функция живого режима не развёрнута на сервере (см. README).",
};

export const liveMessage = (code: string) => MESSAGES[code] ?? "Не удалось выполнить запрос к ИИ.";

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
      throw new LiveError(code, body.detail ? `${liveMessage(code)} (${body.detail})` : liveMessage(code));
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
