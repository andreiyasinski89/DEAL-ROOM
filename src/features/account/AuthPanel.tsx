import { useState } from "react";
import { Cloud, CloudOff, LogIn, LogOut } from "lucide-react";
import type { AuthState } from "./useAuth";

/** Email + Google sign-in. Does nothing (and says so) when Supabase is not configured. */
export function AuthPanel({ auth, syncNote }: { auth: AuthState; syncNote: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!auth.configured)
    return (
      <div className="locked-box" style={{ fontSize: 12 }}>
        <CloudOff size={12} style={{ display: "inline", marginRight: 6 }} />
        ОБЛАКО НЕ НАСТРОЕНО. Прогресс хранится только в этом браузере. Чтобы включить вход и синхронизацию, добавьте ключи Supabase (инструкция в README).
      </div>
    );

  if (auth.loading) return <div className="dim t-mono" style={{ fontSize: 12 }}>загрузка аккаунта…</div>;

  if (auth.user)
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <div className="t-mono" style={{ fontSize: 12, color: "var(--hud-green)" }}>
          <Cloud size={12} style={{ display: "inline", marginRight: 6 }} />
          {auth.user.email ?? "аккаунт"}
        </div>
        {syncNote && <div className="dim" style={{ fontSize: 12 }}>{syncNote}</div>}
        <button className="btn ghost" onClick={auth.signOut}>
          <LogOut size={14} style={{ display: "inline", marginRight: 6 }} />Выйти
        </button>
      </div>
    );

  const run = (fn: (e: string, p: string) => Promise<void>) => async () => {
    setBusy(true);
    await fn(email.trim(), password);
    setBusy(false);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
      <label className="t-mono dim" style={{ fontSize: 11 }}>
        ПОЧТА
        <input className="notes" style={{ minHeight: 0, height: 36, display: "block", marginTop: 2 }} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="t-mono dim" style={{ fontSize: 11 }}>
        ПАРОЛЬ
        <input className="notes" style={{ minHeight: 0, height: 36, display: "block", marginTop: 2 }} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn" disabled={busy || !email || password.length < 6} onClick={run(auth.signInEmail)}>
          <LogIn size={14} style={{ display: "inline", marginRight: 6 }} />Войти
        </button>
        <button className="btn ghost" disabled={busy || !email || password.length < 6} onClick={run(auth.signUpEmail)}>
          Регистрация
        </button>
        <button className="btn gold" disabled={busy} onClick={() => auth.signInGoogle()}>
          Google
        </button>
      </div>
      <div className="dim" style={{ fontSize: 11 }}>Пароль не короче 6 символов. Ваш прогресс из этого браузера загрузится в аккаунт после входа.</div>
      {auth.message && <div role="status" style={{ color: "var(--hud-gold)", fontSize: 12 }}>{auth.message}</div>}
    </form>
  );
}
