"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const hash = window.location.hash;

      if (hash.includes("error=")) {
        const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
        const description = hashParams.get("error_description");

        if (mounted) {
          setError(
            description
              ? decodeURIComponent(description.replace(/\+/g, " "))
              : "This password reset link is invalid or has expired."
          );
          setHasRecoverySession(false);
          setCheckingSession(false);
        }

        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!mounted) return;

      if (sessionError) {
        console.error("RECOVERY SESSION ERROR:", sessionError);
        setError("Unable to verify this password reset link. Please request a new one.");
        setHasRecoverySession(false);
      } else if (data.session) {
        setHasRecoverySession(true);
      } else {
        setError("This password reset link is invalid or has expired. Please request a new one.");
        setHasRecoverySession(false);
      }

      setCheckingSession(false);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === "PASSWORD_RECOVERY" && session) {
          setHasRecoverySession(true);
          setError("");
          setCheckingSession(false);
        }
      }
    );

    checkRecoverySession();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!hasRecoverySession) {
      setError("This reset session is no longer valid. Request a new password reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      console.error("PASSWORD UPDATE ERROR:", updateError);
      setError(
        updateError.message === "Auth session missing!"
          ? "This reset link has expired. Request a new password reset link."
          : updateError.message
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050b24] px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-black">Password updated</h1>

          <p className="mt-4 leading-7 text-slate-400">
            Your Studexa password has been changed successfully.
          </p>

          <button
            onClick={() => router.replace("/dashboard")}
            className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-500"
          >
            Continue to Dashboard →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050b24] px-6 py-12 text-white">
      <div className="pointer-events-none absolute left-1/2 top-[-250px] h-[550px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-black tracking-tight">
            Studexa<span className="text-blue-500">.</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
          <h1 className="text-3xl font-black">Set a new password</h1>

          <p className="mt-3 leading-7 text-slate-400">
            Choose a new password for your Studexa account.
          </p>

          {checkingSession ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />
              <p className="mt-4 text-sm font-semibold text-slate-400">
                Verifying your reset link...
              </p>
            </div>
          ) : hasRecoverySession ? (
            <form onSubmit={handleReset} className="mt-7 space-y-5">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-300">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-white/10 bg-[#080f2d] px-4 py-3.5 text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-slate-300">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter it again"
                  className="w-full rounded-xl border border-white/10 bg-[#080f2d] px-4 py-3.5 text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-5 py-4 font-extrabold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Updating password..." : "Update Password →"}
              </button>
            </form>
          ) : (
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
              <p className="font-bold text-red-300">Reset link unavailable</p>
              <p className="mt-2 text-sm leading-6 text-red-200/80">
                {error || "This password reset link is no longer valid."}
              </p>

              <button
                onClick={() => router.push("/login")}
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white transition hover:bg-blue-500"
              >
                Request a new link →
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-bold text-blue-400 hover:text-blue-300">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
