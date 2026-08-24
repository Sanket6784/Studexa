"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResetMessage("");

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setError("Unable to log in. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "full_name, college, branch, graduation_year, bio, skills"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(profileError);
      router.push("/profile/setup");
      return;
    }

    const profileComplete =
      !!profile &&
      !!profile.full_name?.trim() &&
      !!profile.college?.trim() &&
      !!profile.branch?.trim() &&
      !!profile.graduation_year &&
      !!profile.bio?.trim() &&
      Array.isArray(profile.skills) &&
      profile.skills.length > 0;

    if (profileComplete) {
      router.push("/dashboard");
    } else {
      router.push("/profile/setup");
    }
  }

  async function handleForgotPassword() {
    const normalizedEmail = email.trim();

    setError("");
    setResetMessage("");

    if (!normalizedEmail) {
      setError("Enter your email address first, then click Forgot password.");
      return;
    }

    setResetting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (resetError) {
      console.error(resetError);
      setError(resetError.message);
      setResetting(false);
      return;
    }

    setResetMessage(
      "If an account exists for that email, a password reset link has been sent. Check your inbox."
    );
    setResetting(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b24] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-250px] h-[550px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute bottom-[-250px] left-[-150px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute right-[-150px] top-[35%] h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <nav className="relative z-10 border-b border-white/10 bg-[#050b24]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-black tracking-tight">
            Studexa<span className="text-blue-500">.</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-400 sm:block">
              New to Studexa?
            </span>
            <Link
              href="/signup"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:border-blue-400/40 hover:bg-white/10"
            >
              Create account
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-5 py-2.5 text-sm font-bold text-blue-300 shadow-[0_0_30px_rgba(37,99,235,0.12)]">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              Built for students
            </div>
          </div>

          <div className="mt-8 text-center">
            <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
              Welcome
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                back.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-slate-400 sm:text-xl">
              Log in to continue building your student identity, projects and
              professional network.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <div className="mb-7">
              <h2 className="text-xl font-extrabold text-white">
                Log in to Studexa
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter your account details below.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-[#080f2d] px-4 py-3.5 text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-slate-300"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetting}
                    className="text-xs font-bold text-blue-400 transition hover:text-blue-300 disabled:opacity-50"
                  >
                    {resetting ? "Sending..." : "Forgot password?"}
                  </button>
                </div>

                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full rounded-xl border border-white/10 bg-[#080f2d] px-4 py-3.5 text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
                  {error}
                </div>
              )}

              {resetMessage && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-semibold leading-6 text-emerald-300">
                  {resetMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || resetting}
                className="group relative w-full overflow-hidden rounded-xl bg-blue-600 px-5 py-4 text-base font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10">
                  {loading ? "Checking your profile..." : "Log in →"}
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </form>

            <div className="mt-7 border-t border-white/10 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-blue-400 transition hover:text-cyan-300"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs font-medium text-slate-600">
            Your student identity. Beyond the resume.
          </p>
        </div>
      </section>
    </main>
  );
}
