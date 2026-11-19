import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { cloudConfigured, ensureSupabase } from "./supabase";

export type AuthState = {
  configured: boolean;
  user: User | null;
  loading: boolean;
  /** Last message to show to the user (error or info). */
  message: string;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const RU: Record<string, string> = {
  "Invalid login credentials": "Неверная почта или пароль.",
  "User already registered": "Такой пользователь уже зарегистрирован — войдите.",
  "Email not confirmed": "Подтвердите почту по письму и войдите снова.",
};
const human = (m: string) => RU[m] ?? m;

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(cloudConfigured);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!cloudConfigured) return;
    let alive = true;
    let unsub: (() => void) | undefined;
    void ensureSupabase().then((client) => {
      if (!client || !alive) return;
      void client.auth.getSession().then(({ data }) => {
        if (!alive) return;
        setUser(data.session?.user ?? null);
        setLoading(false);
      });
      unsub = client.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null)).data.subscription.unsubscribe;
    });
    return () => {
      alive = false;
      unsub?.();
    };
  }, []);

  const guard = useCallback(async (fn: (c: NonNullable<Awaited<ReturnType<typeof ensureSupabase>>>) => Promise<string | undefined>) => {
    const client = await ensureSupabase();
    if (!client) return setMessage("Облако не настроено: добавьте ключи Supabase (см. README).");
    setMessage("");
    try {
      const err = await fn(client);
      if (err) setMessage(human(err));
    } catch (e) {
      setMessage(e instanceof Error ? human(e.message) : "Не удалось выполнить запрос.");
    }
  }, []);

  return {
    configured: cloudConfigured,
    user,
    loading,
    message,
    signInEmail: (email, password) => guard(async (c) => (await c.auth.signInWithPassword({ email, password })).error?.message),
    signUpEmail: (email, password) =>
      guard(async (c) => {
        const { data, error } = await c.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) return error.message;
        if (!data.session) setMessage("Мы отправили письмо: подтвердите почту, затем войдите.");
        return undefined;
      }),
    signInGoogle: () => guard(async (c) => (await c.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })).error?.message),
    signOut: () => guard(async (c) => (await c.auth.signOut()).error?.message),
  };
}
