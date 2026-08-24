import FeedbackReviews from "./components/FeedbackReviews";
import { siteConfig } from "./site-config";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute right-[-200px] top-[500px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <nav className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-2xl font-extrabold tracking-tight text-white">
            Studexa<span className="text-blue-500">.</span>
          </a>
          <div className="hidden items-center gap-7 md:flex">
            <a href="/community" className="font-semibold text-slate-300 transition hover:text-white">Community</a>
            <a href="/publish-your-works" className="font-semibold text-blue-300 transition hover:text-blue-200">Publish Your Works</a>
            <a href="/login" className="font-semibold text-slate-300 transition hover:text-white">Log in</a>
            <a href="/signup" className="rounded-xl bg-white px-5 py-2.5 font-bold text-slate-950 shadow-lg transition hover:bg-blue-50">Get Started</a>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-blue-400" /> Built for students 🚀
          </div>
          <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
            Your student identity.
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">Beyond the resume.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            Build your professional profile, showcase your projects, share what you learn, discover students and grow your network.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <a href="/signup" className="rounded-xl bg-blue-600 px-7 py-4 text-lg font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500">Create your profile →</a>
            <a href="/publish-your-works" className="rounded-xl border border-white/10 bg-white/5 px-7 py-4 text-lg font-bold text-white backdrop-blur-xl transition hover:bg-white/10">Publish Your Works</a>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-5xl rounded-3xl border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-blue-950/40 backdrop-blur-xl">
          <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-400">STUDENT PROFILE</p>
                <h3 className="mt-2 text-2xl font-extrabold">Build. Share. Grow.</h3>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-xl sm:flex">✨</div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <PreviewCard title="Projects" value="Showcase" icon="💻" />
              <PreviewCard title="Community" value="Connect" icon="🌐" />
              <PreviewCard title="Skills" value="Grow" icon="🚀" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="text-sm font-bold tracking-[0.2em] text-blue-400">EVERYTHING STUDENTS NEED</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Build more than a resume.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">Studexa brings your student journey into one professional space.</p>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard large icon="👤" title="Student Profile" description="Create a professional identity with your education, skills, bio and achievements." />
            <FeatureCard icon="💻" title="Projects" description="Show the real things you build with technologies, GitHub links and live demos." />
            <FeatureCard icon="📝" title="Articles" description="Share your engineering knowledge, experiences and career journey." />
            <FeatureCard icon="🌐" title="Community" description="Discover articles, interact with students and grow your network." />
            <FeatureCard large icon="🚀" title="Grow Together" description="Learn from students who are building, experimenting and growing just like you." />
          </div>
        </div>
      </section>

      <FeedbackReviews />

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent p-8 text-center backdrop-blur-xl md:p-16">
          <p className="text-sm font-bold tracking-[0.2em] text-blue-300">YOUR JOURNEY STARTS HERE</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">Start building your student identity.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">Your projects, skills and ideas deserve more than a single page on a resume.</p>
          <a href="/signup" className="mt-8 inline-block rounded-xl bg-white px-7 py-4 text-lg font-bold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50">Join Studexa →</a>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <a href="/" className="font-extrabold text-white">Studexa<span className="text-blue-500">.</span></a>
              <p className="mt-2 text-sm text-slate-500">Learn. Build. Grow.</p>
            </div>
            <div>
              <p className="font-bold text-white">Contact</p>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                {siteConfig.contactEmails.length > 0 ? siteConfig.contactEmails.map((email) => (
                  <a key={email} href={`mailto:${email}`} className="block transition hover:text-white">{email}</a>
                )) : <p>Contact details coming soon.</p>}
              </div>
            </div>
            <div>
              <p className="font-bold text-white">Follow Studexa</p>
              <div className="mt-3 flex gap-4 text-sm font-semibold">
                {siteConfig.linkedinUrl && <a href={siteConfig.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-white">LinkedIn</a>}
                {siteConfig.instagramUrl && <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer" className="text-pink-300 hover:text-white">Instagram</a>}
                {!siteConfig.linkedinUrl && !siteConfig.instagramUrl && <span className="text-slate-500">Social links coming soon.</span>}
              </div>
            </div>
            <div>
              <p className="font-bold text-white">For creators</p>
              <a href="/publish-your-works" className="mt-3 block text-sm font-semibold text-blue-300 hover:text-white">Publish Your Works →</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description, large = false }: { icon: string; title: string; description: string; large?: boolean }) {
  return (
    <div className={`group rounded-3xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-400/20 hover:bg-white/[0.08] ${large ? "lg:col-span-2" : ""}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-2xl">{icon}</div>
      <h3 className="mt-6 text-2xl font-extrabold text-white">{title}</h3>
      <p className="mt-3 max-w-xl leading-7 text-slate-400">{description}</p>
    </div>
  );
}

function PreviewCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-400">{title}</span>
        <span>{icon}</span>
      </div>
      <p className="mt-3 text-xl font-extrabold text-white">{value}</p>
    </div>
  );
}
