export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <a
            href="/"
            className="text-2xl font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">

            <a
              href="/community"
              className="font-semibold text-slate-600 hover:text-blue-600"
            >
              Community
            </a>

            <a
              href="/login"
              className="font-semibold text-slate-700 hover:text-blue-600"
            >
              Log in
            </a>

            <a
              href="/signup"
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700"
            >
              Get Started
            </a>

          </div>

        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">

        <div className="max-w-4xl">

          <div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            Built for students 🚀
          </div>

          <h1 className="mt-7 text-5xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-7xl">
            Your student identity,
            <span className="text-blue-600">
              {" "}beyond the resume.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-xl leading-8 text-slate-600">
            Build your professional profile, showcase projects,
            share what you learn, connect with students and grow
            your professional network.
          </p>

          {/* Hero Buttons */}
          <div className="mt-9 flex flex-wrap gap-4">

            <a
              href="/signup"
              className="inline-block rounded-xl bg-blue-600 px-7 py-4 text-lg font-bold text-white shadow-sm hover:bg-blue-700"
            >
              Create your profile →
            </a>

            <a
              href="/community"
              className="inline-block rounded-xl border border-slate-300 bg-white px-7 py-4 text-lg font-bold text-slate-800 hover:bg-slate-50"
            >
              Explore community
            </a>

          </div>

        </div>

      </section>

      {/* Features */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="max-w-2xl">

            <p className="text-sm font-bold tracking-widest text-blue-600">
              EVERYTHING STUDENTS NEED
            </p>

            <h2 className="mt-3 text-4xl font-extrabold text-slate-950">
              Build more than a resume.
            </h2>

            <p className="mt-4 text-lg text-slate-600">
              Studexa brings your student journey into one
              professional space.
            </p>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <FeatureCard
              icon="👤"
              title="Student Profile"
              description="Create a professional identity with your education, skills, bio and achievements."
            />

            <FeatureCard
              icon="💻"
              title="Projects"
              description="Show the real things you build with technologies, GitHub links and live demos."
            />

            <FeatureCard
              icon="📝"
              title="Articles"
              description="Share your engineering knowledge, experiences and career journey."
            />

            <FeatureCard
              icon="🌐"
              title="Community"
              description="Discover articles from students, interact through likes and comments, and connect."
            />

            <FeatureCard
              icon="🚀"
              title="Grow Together"
              description="Build your network and learn from students who are on the same journey."
            />

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">

        <div className="rounded-3xl bg-slate-950 px-8 py-16 text-center md:px-16">

          <h2 className="text-4xl font-extrabold text-white md:text-5xl">
            Start building your student identity.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Your projects, skills and ideas deserve
            more than a single page on a resume.
          </p>

          <a
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-7 py-4 text-lg font-bold text-white hover:bg-blue-700"
          >
            Join Studexa →
          </a>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">

          <a
            href="/"
            className="font-extrabold text-slate-950"
          >
            Studexa<span className="text-blue-600">.</span>
          </a>

          <p className="text-sm text-slate-500">
            Learn. Build. Grow.
          </p>

        </div>

      </footer>

    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

      <div className="text-3xl">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-extrabold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>

    </div>
  );
}