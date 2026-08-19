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
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

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

    /*
      Check whether the student already has a profile.
    */
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select(
          "full_name, college, branch, graduation_year, bio, skills"
        )
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(profileError);

      // If the profile cannot be checked, send the user
      // to profile setup rather than blocking login.
      router.push("/profile/setup");
      return;
    }

    /*
      A profile is considered complete when the important
      student information has been filled in.
    */
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">

          <Link
            href="/"
            className="text-3xl font-extrabold tracking-tight text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </Link>

          <h1 className="mt-8 text-3xl font-bold text-slate-950">
            Welcome back
          </h1>

          <p className="mt-3 text-slate-600">
            Log in to continue your journey.
          </p>

        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking your profile..." : "Log in"}
            </button>

          </form>

          {/* Signup */}
          <p className="mt-6 text-center text-sm text-slate-500">

            Don't have an account?{" "}

            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create one
            </Link>

          </p>

        </div>

      </div>

    </main>
  );
}