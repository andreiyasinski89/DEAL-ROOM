import {
  CLIENT_SYSTEM, CLIENT_TOOL, DEBRIEF_SYSTEM, DEBRIEF_TOOL, LIMITS, clientUser, debriefUser,
  mentionsRubles, parseRequest, validateDebrief, validateEval, type LiveRequest,
} from "./live.ts";

export type Consume = { allowed: boolean; reason?: string; sessionsLeft?: number };

/** Everything the handler needs from the outside world, so tests can fake it. */
export type Deps = {
  apiKey: string | undefined;
  model: string;
  getUser: (jwt: string) => Promise<{ id: string } | null>;
  consume: (jwt: string, newSession: boolean) => Promise<Consume>;
  fetchFn: typeof fetch;
  timeoutMs?: number;
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const MAX_BODY = 60_000;

type ToolUse = { type: string; name?: string; input?: unknown };

type Fail = { ok: false; status: number; error: string; detail?: string };

/** Short, safe description of what the provider said (never contains our key). */
async function providerDetail(res: Response): Promise<string> {
  try {
    const t = await res.text();
    try {
      const j = JSON.parse(t) as { error?: { type?: string; message?: string } };
      if (j.error?.message) return `${res.status} ${j.error.type ?? ""}: ${j.error.message}`.slice(0, 240);
    } catch {
      /* not json */
    }
    return `${res.status} ${t}`.slice(0, 240);
  } catch {
    return String(res.status);
  }
}

const NUDGE = "\n\n[НАПОМИНАНИЕ СИСТЕМЫ: ответь ТОЛЬКО вызовом инструмента, без обычного текста. Поля reply, trustDelta, interestDelta, irritationDelta, quality, coachNote, isEnding обязательны. Все суммы — только в долларах ($) или евро (€), без рублей.]";

async function callClaude(req: LiveRequest, deps: Deps, nudge = false): Promise<{ ok: true; input: unknown } | Fail> {
  const isTurn = req.action === "turn";
  const tool = isTurn ? CLIENT_TOOL : DEBRIEF_TOOL;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), deps.timeoutMs ?? 25_000);
  try {
    const res = await deps.fetchFn("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json", "x-api-key": deps.apiKey ?? "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: deps.model,
        max_tokens: isTurn ? 1200 : 1500,
        system: isTurn ? CLIENT_SYSTEM(req.scenario) : DEBRIEF_SYSTEM,
        messages: [{ role: "user", content: (isTurn ? clientUser(req) : debriefUser(req)) + (nudge ? NUDGE : "") }],
        tools: [tool],
        // some models reject a forced tool call; "auto" + the prompt rule "answer ONLY by calling the tool" works everywhere
        tool_choice: { type: "auto" },
      }),
    });
    if (!res.ok) {
      const detail = await providerDetail(res);
      console.error("anthropic error:", detail);
      if (res.status === 401 || res.status === 403) return { ok: false, status: 503, error: "provider_auth", detail };
      if (res.status === 429 || res.status === 529) return { ok: false, status: 503, error: "provider_busy", detail };
      return { ok: false, status: 502, error: "provider_error", detail };
    }
    const data = (await res.json()) as { content?: (ToolUse & { text?: string })[]; stop_reason?: string };
    const block = data.content?.find((b) => b.type === "tool_use" && b.name === tool.name);
    if (block) return { ok: true, input: block.input };
    // fallback: the model answered in plain text with a JSON object
    const text = data.content?.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n") ?? "";
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return { ok: true, input: JSON.parse(m[0]) };
      } catch {
        /* not json */
      }
    }
    const detail = `stop_reason=${data.stop_reason ?? "?"}, blocks=${(data.content ?? []).map((b) => b.type).join("+") || "none"}`;
    console.error("bad model output:", detail, text.slice(0, 200));
    return { ok: false, status: 502, error: "bad_model_output", detail };
  } catch (e) {
    const aborted = (e as Error)?.name === "AbortError";
    console.error("anthropic call failed:", (e as Error)?.message);
    return { ok: false, status: 504, error: aborted ? "timeout" : "provider_error", detail: aborted ? undefined : String((e as Error)?.message ?? e).slice(0, 200) };
  } finally {
    clearTimeout(timer);
  }
}

export async function handleLive(request: Request, deps: Deps): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });

  const jwt = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return json(401, { error: "unauthorized" });
  const user = await deps.getUser(jwt).catch(() => null);
  if (!user) return json(401, { error: "unauthorized" });

  const text = await request.text();
  if (text.length > MAX_BODY) return json(413, { error: "too_large" });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json(400, { error: "bad_json" });
  }
  const parsed = parseRequest(body);
  if (!parsed.ok) return json(400, { error: parsed.error });
  const req = parsed.req;

  if (!deps.apiKey) return json(503, { error: "not_configured" });

  const quota = await deps.consume(jwt, req.action === "turn" && req.turn === 0).catch(() => ({ allowed: false, reason: "quota_check_failed" }) as Consume);
  if (!quota.allowed) return json(429, { error: "limit", reason: quota.reason ?? "daily_limit", sessionsPerDay: LIMITS.sessionsPerDay });

  // up to 3 attempts: plain retry, then retries with an explicit reminder to use the tool
  let lastDetail: string | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await callClaude(req, deps, attempt > 0);
    if (!r.ok) {
      if (r.error === "bad_model_output" && attempt < 2) {
        lastDetail = r.detail;
        continue;
      }
      return json(r.status, { error: r.error, ...(r.detail ? { detail: r.detail } : {}) });
    }
    if (req.action === "turn") {
      const ev = validateEval(r.input, req);
      if (ev && mentionsRubles(`${ev.reply} ${ev.coachNote}`)) lastDetail = "reply used a currency other than USD/EUR";
      else if (ev) return json(200, { ok: true, eval: ev, sessionsLeft: quota.sessionsLeft });
      else lastDetail = "tool call had invalid or empty fields";
    } else {
      const d = validateDebrief(r.input);
      if (d && mentionsRubles([...d.good, ...d.bad, ...d.growth, ...d.hidden, d.forkAdvice ?? ""].join(" "))) lastDetail = "debrief used a currency other than USD/EUR";
      else if (d) return json(200, { ok: true, debrief: d, sessionsLeft: quota.sessionsLeft });
      else lastDetail = "tool call had invalid or empty fields";
    }
  }
  return json(502, { error: "bad_model_output", ...(lastDetail ? { detail: lastDetail } : {}) });
}
