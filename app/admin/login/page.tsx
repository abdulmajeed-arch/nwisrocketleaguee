"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LockKeyhole, Shield, Loader2, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError || !data.user) {
      setError(
        loginError?.message ||
          "Unable to sign in. Please check your credentials."
      );
      setLoading(false);
      return;
    }

    const { data: isAdmin, error: adminError } =
  await supabase.rpc("is_admin");

if (adminError || !isAdmin) {
  await supabase.auth.signOut();

  setError("This account does not have administrator access.");

  setLoading(false);
  return;
}

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-32">
      <div className="w-full max-w-md">
        {/* BRAND */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/[0.07] shadow-[0_0_40px_rgba(14,165,233,0.08)]">
            <Shield className="h-7 w-7 text-sky-400" />
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-sky-400">
            NWIS Rocket League
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
            Admin Portal
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Sign in to manage players, teams, matches, and
            tournament highlights.
          </p>
        </div>

        {/* FORM */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 shadow-2xl backdrop-blur-xl sm:p-7">
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@example.com"
                required
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-sky-400/30 focus:bg-white/[0.035]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition-all placeholder:text-slate-700 focus:border-sky-400/30 focus:bg-white/[0.035]"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3">
                <p className="text-xs leading-5 text-red-300">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 text-sm font-black text-[#04111a] transition-all duration-200 hover:bg-sky-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-600">
            <LockKeyhole className="h-3 w-3" />
            Authorized tournament administrators only
          </div>
        </div>
      </div>
    </main>
  );
}