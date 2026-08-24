"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
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

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          full_name: fullName.trim(),
        });

      if (profileError) {
        console.error(profileError);
      }
    }

    setSuccess(true);
    setLoading(false);
  }

  /* ---------------- SUCCESS SCREEN ---------------- */

  if (success) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050b24] px-6 py-12 text-white">

        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />

        <div className="relative w-full max-w-md">

          <div className="mb-8 text-center">

            <button
              onClick={() => router.push("/")}
              className="text-3xl font-black tracking-tight text-white"
            >
              Studexa<span className="text-blue-500">.</span>
            </button>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur-xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-3xl">
              📧
            </div>

            <h1 className="mt-6 text-3xl font-black">
              Check your email
            </h1>

            <p className="mt-4 leading-7 text-slate-400">
              We've sent a confirmation link to:
            </p>

            <p className="mt-2 break-all font-bold text-white">
              {email}
            </p>

            <p className="mt-5 leading-7 text-slate-400">
              Confirm your email address, then log in to continue
              setting up your Studexa profile.
            </p>

            <button
              onClick={() => router.push("/login")}
              className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-500"
            >
              Go to Login →
            </button>

            <button
              onClick={() => router.push("/")}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Back to Home
            </button>

          </div>

        </div>

      </main>
    );
  }

  /* ---------------- SIGNUP PAGE ---------------- */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b24] text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[130px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />

      {/* Navbar */}
      <nav className="relative border-b border-white/10 bg-[#050b24]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-black tracking-tight"
          >
            Studexa<span className="text-blue-500">.</span>
          </button>

          <button
            onClick={() => router.push("/login")}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            Already have an account?{" "}
            <span className="text-blue-400">Log in</span>
          </button>

        </div>

      </nav>

      {/* Main */}
      <section className="relative flex justify-center px-6 py-14 md:py-20">

        <div className="w-full max-w-xl">

          {/* Header */}
          <div className="text-center">

            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-5 py-2 text-sm font-bold text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Built for students 🚀
            </div>

            <h1 className="mt-7 text-4xl font-black tracking-tight md:text-5xl">
              Create your{" "}
              <span className="text-blue-500">
                student identity.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-slate-400">
              Build your professional profile, showcase your projects,
              share what you learn and grow your network.
            </p>

          </div>

          {/* Signup Card */}
          <form
            onSubmit={handleSignup}
            className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl md:p-9"
          >

            {/* Full Name */}
            <div>

              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-bold text-slate-200"
              >
                Full name
              </label>

              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            {/* Email */}
            <div className="mt-5">

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-slate-200"
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
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            {/* Password */}
            <div className="mt-5">

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-slate-200"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/20"
              />

              <p className="mt-2 text-xs text-slate-500">
                Use at least 6 characters.
              </p>

            </div>

            {/* Confirm Password */}
            <div className="mt-5">

              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-bold text-slate-200"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Enter your password again"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-4 text-base font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating your account..."
                : "Create your profile →"}
            </button>

            <p className="mt-5 text-center text-xs leading-6 text-slate-500">
              By creating an account, you agree to use Studexa
              responsibly.
            </p>

          </form>

          {/* Bottom text */}
          <p className="mt-7 text-center text-sm text-slate-500">
            Already part of Studexa?{" "}
            <button
              onClick={() => router.push("/login")}
              className="font-bold text-blue-400 transition hover:text-blue-300"
            >
              Log in
            </button>
          </p>

        </div>

      </section>

    </main>
  );
}