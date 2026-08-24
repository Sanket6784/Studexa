import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.05] p-10 text-center shadow-2xl backdrop-blur-xl sm:p-14">
        <div className="text-6xl">404</div>

        <p className="mt-5 text-sm font-bold tracking-[0.2em] text-blue-400">
          PAGE NOT FOUND
        </p>

        <h1 className="mt-3 text-3xl font-black sm:text-4xl">
          This page doesn't exist.
        </h1>

        <p className="mx-auto mt-4 max-w-md leading-7 text-slate-400">
          The page may have been moved, removed, or the URL may be incorrect.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500"
          >
            Back to Home
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-slate-200 transition hover:bg-white/10"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
