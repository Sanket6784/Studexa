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

    /*
      If Supabase returns a user, create the initial profile.
      The remaining profile information can be completed later.
    */
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

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">

        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <div className="text-5xl">📧</div>

          <h1 className="mt-5 text-3xl font-extrabold text-slate-950">
            Check your email
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            We've sent a confirmation link to:
          </p>

          <p className="mt-2 break-all font-bold text-slate-900">
            {email}
          </p>

          <p className="mt-5 leading-7 text-slate-600">
            Confirm your email address, then log in to continue
            setting up your Studexa profile.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
          >
            Go to Login
          </button>

          <button
            onClick={() => router.push("/")}
            className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 hover:bg-slate-50"
          >
            Back to Home
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </button>

          <button
            onClick={() => router.push("/login")}
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            Already have an account? Log in
          </button>

        </div>
      </nav>

      {/* Signup */}
      <section className="flex justify-center px-6 py-12 md:py-20">

        <div className="w-full max-w-lg">

          <div className="text-center">

            <p className="text-sm font-bold tracking-widest text-blue-600">
              JOIN STUDEXA
            </p>

            <h1 className="mt-2 text-4xl font-extrabold text-slate-950">
              Create your account
            </h1>

            <p className="mt-3 text-slate-600">
              Start building your professional student identity.
            </p>

          </div>

          <form
            onSubmit={handleSignup}
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
          >

            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-bold text-slate-800"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}
            <div className="mt-6">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-slate-800"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div className="mt-6">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-slate-800"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Confirm password */}
            <div className="mt-6">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter your password again"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>

            <p className="mt-5 text-center text-sm text-slate-500">
              By creating an account, you agree to use Studexa
              responsibly.
            </p>

          </form>

        </div>

      </section>

    </main>
  );
}