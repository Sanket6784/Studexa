import FeedbackReviews from "./components/FeedbackReviews";
import { siteConfig } from "./site-config";

const features = [
  {
    number: "01",
    title: "Engineering Profiles",
    description:
      "Build a professional identity around your education, skills, projects, experience and goals.",
  },
  {
    number: "02",
    title: "Projects",
    description:
      "Show what you can actually build with technology, GitHub links, live demos and clear project stories.",
  },
  {
    number: "03",
    title: "Blogs",
    description:
      "Share technical knowledge, engineering experiences, project journeys and lessons learned.",
  },
  {
    number: "04",
    title: "Connections",
    description:
      "Discover engineering students, connect with people who share your interests and find collaborators.",
  },
  {
    number: "05",
    title: "Opportunities",
    description:
      "Create a stronger professional presence for internships, hackathons, research and future opportunities.",
  },
  {
    number: "06",
    title: "Community",
    description:
      "Learn from what other engineers are building and contribute your own ideas to the ecosystem.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[680px] overflow-hidden">
        <div className="technerva-grid absolute inset-0 opacity-70" />
        <div className="absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-blue-100/70 blur-3xl" />
      </div>

      <header className="relative z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2.5" aria-label="Technerva home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white shadow-sm">
              T
            </span>
            <span className="text-xl font-black tracking-tight text-slate-950">Technerva</span>
          </a>

          <div className="hidden items-center gap-7 md:flex">
            <a href="/community" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">Community</a>
            <a href="/projects" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">Projects</a>
            <a href="/students" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">Students</a>
            <a href="/publish-your-works" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">Publications</a>
            <a href="/login" className="text-sm font-semibold text-slate-700 transition hover:text-slate-950">Log in</a>
            <a href="/signup" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800">Create profile</a>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-6 md:pt-24 lg:px-8 lg:pb-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Built for engineers
            </div>

            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Build your engineering identity.
              <span className="mt-2 block text-blue-600">Beyond the resume.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Technerva brings engineering students together to showcase projects, publish blogs, discover people and build meaningful professional connections.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="/signup" className="rounded-xl bg-blue-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition hover:-translate-y-0.5 hover:bg-blue-700">Create your profile</a>
              <a href="/students" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">Explore engineers</a>
            </div>

            <div className="mt-11 flex flex-wrap gap-x-8 gap-y-5 border-t border-slate-200 pt-7">
              <Stat value="Profiles" label="Your engineering identity" />
              <Stat value="Projects" label="Proof of what you build" />
              <Stat value="Connections" label="People you can grow with" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-blue-100/60 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
              <div className="rounded-[1.25rem] bg-slate-950 p-5 text-white sm:p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Technerva</p>
                    <p className="mt-1 text-sm text-slate-400">Engineering student network</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">Profile</span>
                </div>

                <div className="mt-7 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black">AM</div>
                  <div>
                    <p className="text-lg font-bold">Arjun Mehta</p>
                    <p className="text-sm text-slate-400">Computer Science Engineering</p>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  <MiniPanel title="Projects" value="12" />
                  <MiniPanel title="Blogs" value="08" />
                  <MiniPanel title="Connections" value="42" />
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Currently building</p>
                  <p className="mt-2 font-bold">Real-time collaboration platform</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Next.js', 'Supabase', 'WebRTC'].map((item) => (
                      <span key={item} className="rounded-lg bg-white/7 px-2.5 py-1 text-xs font-semibold text-slate-300">{item}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold text-slate-500">Latest blog</p>
                    <p className="mt-2 text-sm font-bold leading-5">Building systems that scale</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold text-slate-500">Network</p>
                    <p className="mt-2 text-sm font-bold leading-5">5 people to connect with</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">One platform. Your whole journey.</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-5xl">Everything that makes your engineering journey visible.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">A professional space where your work is more than a line on a resume.</p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.number} className="bg-white p-7 transition hover:bg-slate-50 sm:p-8">
                <p className="text-xs font-black tracking-[0.16em] text-blue-600">{feature.number}</p>
                <h3 className="mt-6 text-xl font-extrabold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">Technerva Publications</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.03em] sm:text-5xl">Have something worth sharing?</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">Submit your engineering blog, project story, research, experience or technical work for consideration.</p>
              <p className="mt-6 text-sm font-semibold text-slate-300">Send submissions to <a className="text-blue-300 hover:text-blue-200" href={`mailto:${siteConfig.publicationEmail}`}>{siteConfig.publicationEmail}</a></p>
            </div>
            <a href="/publish-your-works" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-blue-50">Submit your work →</a>
          </div>
        </div>
      </section>

      <FeedbackReviews />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12 lg:p-16">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Start building</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-5xl">Your work deserves a place of its own.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">Create your profile, put your work in front of the right people and start building your engineering network.</p>
            <a href="/signup" className="mt-8 inline-flex rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800">Join Technerva →</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white">T</span>
              <span className="font-black tracking-tight text-slate-950">Technerva</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">The engineering student network for people who build, learn and connect.</p>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-950">Explore</p>
            <div className="mt-3 space-y-2 text-sm text-slate-500">
              <a href="/students" className="block hover:text-slate-950">Students</a>
              <a href="/projects" className="block hover:text-slate-950">Projects</a>
              <a href="/community" className="block hover:text-slate-950">Community</a>
              <a href="/publish-your-works" className="block hover:text-slate-950">Technerva Publications</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-950">Publications</p>
            <div className="mt-3 space-y-2 text-sm text-slate-500">
              <a href={`mailto:${siteConfig.publicationEmail}`} className="block break-all hover:text-slate-950">{siteConfig.publicationEmail}</a>
              <a href={siteConfig.publicationInstagram} target="_blank" rel="noreferrer" className="block hover:text-slate-950">Instagram · @Technervapublications</a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} Technerva. All rights reserved.</div>
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-sm font-extrabold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function MiniPanel({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[11px] font-semibold text-slate-500">{title}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}
