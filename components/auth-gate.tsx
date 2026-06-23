"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient, getSupabaseConfigurationErrorMessage, isSupabaseConfigured } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthGate.");
  }

  return value;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const supabaseConfigured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [error, setError] = useState<string | null>(() => (supabaseConfigured ? null : getSupabaseConfigurationErrorMessage()));
  const supabase = useMemo(() => (supabaseConfigured ? createClient() : null), [supabaseConfigured]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getUser().then(({ data, error: userError }) => {
      if (!mounted) return;
      if (userError) setError(userError.message);
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithGoogle: async () => {
        if (!supabase) {
          const configurationError = new Error(getSupabaseConfigurationErrorMessage());
          setError(configurationError.message);
          throw configurationError;
        }

        setError(null);
        const { error: signInError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
            queryParams: { prompt: "select_account" }
          }
        });

        if (signInError) throw signInError;
      },
      signOutUser: async () => {
        if (!supabase) {
          return;
        }

        setError(null);
        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) throw signOutError;
      }
    }),
    [user, loading, supabase]
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">Loading authentication...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">Investment intelligence</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">Sign in to continue</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {supabase
              ? "Access your private portfolio research workspace. Records are stored under your authenticated Supabase user account."
              : "Supabase environment variables are missing, so authentication is unavailable until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are configured."}
          </p>
          {error ? <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
          <button
            onClick={() => {
              value.signInWithGoogle().catch((signInError) => {
                setError(signInError instanceof Error ? signInError.message : "Unable to sign in with Google.");
              });
            }}
            disabled={!supabase}
            className="mt-6 w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {supabase ? "Sign in with Google" : "Supabase configuration required"}
          </button>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Informational and research use only. No brokerage connection, trading execution, or financial advice.
          </p>
        </section>
      </main>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
