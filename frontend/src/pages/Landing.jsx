import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '../components/AppLayout'
import SpiralJourney from '../components/SpiralJourney'
import { useState, useEffect } from 'react'

const features = [
  {
    icon: '◎',
    title: 'Skill Gap Analysis',
    text: 'Upload your resume and pick a target role — get an exact readiness % against real job requirements.',
  },
  {
    icon: '✦',
    title: 'Private Local AI',
    text: 'Powered by Ollama running locally. Summaries, roadmaps, projects and prep never leave your machine.',
  },
  {
    icon: '⬡',
    title: 'Personalized Roadmap',
    text: 'A 3-phase plan with resources, hours and checkboxes to close every missing skill.',
  },
  {
    icon: '⬢',
    title: 'Company Matchmaker',
    text: 'India-focused curated companies with remote/hybrid/onsite filters, fit scores and Apply links.',
  },
  {
    icon: '⚙',
    title: 'Project Recommender',
    text: 'Projects tailored to fill gaps and strengthen your portfolio with AI consistency checks.',
  },
  {
    icon: '⇄',
    title: 'Mock Interview Prep',
    text: 'Role-specific checklist plus one-click launch to incruit.online for AI mock interviews.',
  },
]

const stats = [
  ['18', 'Career roles mapped'],
  ['185+', 'Skills in taxonomy'],
  ['55', 'Curated Indian companies'],
  ['100%', 'Private & local'],
]

// The journey shown along the spiral: each step builds on the previous one.
// Private Local AI sits at the core — it powers every step.
const journeyOrder = [
  'Skill Gap Analysis',
  'Personalized Roadmap',
  'Project Recommender',
  'Company Matchmaker',
  'Mock Interview Prep',
]
const journey = journeyOrder.map((t) => features.find((f) => f.title === t)).filter(Boolean)

const spiralCore = { icon: '✦', title: 'Private Local AI', sub: 'Ollama · on-device' }

// — Why ResumeRadar exists: the problems it closes
const problems = [
  { icon: '✕', title: 'Resumes rejected in silence', text: 'ATS filters quietly throw resumes away and nobody tells you which line cost you the interview.' },
  { icon: '?', title: 'No idea what’s missing', text: 'Job posts list 20 skills — you know which you have, but never which of them you lack for THAT role.' },
  { icon: '↻', title: 'Roadmaps nobody finishes', text: 'Bookmarks, playlists and PDFs scattered everywhere — unstructured, untracked, abandoned by week two.' },
  { icon: '☁', title: 'Career tools leak your data', text: 'Most AI career tools upload your resume to someone else’s server. Yours never leaves your machine.' },
  { icon: '⚙', title: 'Random project advice', text: 'Freshers keep building the same to-do apps instead of projects that actually close their skill gaps.' },
  { icon: '⚑', title: 'Interview prep guesswork', text: 'Practising random questions with no role-specific checklist, no gaps to address, no feedback loop.' },
]

// — How to access the project
const accessSteps = [
  { title: 'Clone the repository', code: 'git clone https://github.com/amiskin1409/resumeradar.git', note: 'MIT licensed — source, dataset pipeline and scripts are all inside.' },
  { title: 'Start the stack (Windows)', code: '.\\scripts\\start_ollama.ps1\n.\\scripts\\start_dev.ps1', note: 'Installs deps, boots FastAPI on :8000 + Vite on :5173, pulls qwen2.5:1.5b for Ollama.' },
  { title: 'Open & register', code: '→ http://localhost:5173', note: 'Upload your PDF resume, add skills, pick a target role, run the AI gap analysis.' },
]

// — Discussion area
const discussionLinks = [
  { icon: '💬', title: 'GitHub Discussions', text: 'Ask questions, share ideas and request features. Everything about improving ResumeRadar lives here.', href: 'https://github.com/amiskin1409/resumeradar/discussions', cta: 'Start a discussion' },
  { icon: '🐛', title: 'Bug reports', text: 'Something broken or behaves oddly? Open an issue with steps to reproduce and it gets fixed.', href: 'https://github.com/amiskin1409/resumeradar/issues', cta: 'File an issue' },
  { icon: '⭐', title: 'Rate your experience', text: 'Used the project already? Leave honest feedback below — it’s shown live on this page.', href: '#feedback', cta: 'Write feedback' },
]

export default function Landing() {
  const [feedbacks, setFeedbacks] = useState(() => {
    try {
      const saved = localStorage.getItem('resumeradar_feedbacks')
      return saved ? JSON.parse(saved) : [
        { name: 'Amit K.', role: 'Full Stack Developer', text: 'Helped me see exactly what to learn next. Roadmap is very actionable.', rating: 5 },
        { name: 'Sneha R.', role: 'Data Analyst', text: 'Clean UI, local AI is a huge plus. Companies tab saved me time.', rating: 5 },
        { name: 'Rahul M.', role: 'Frontend Developer', text: 'Resume parsing + gap % gave clarity. Great for focused prep.', rating: 4 },
      ]
    } catch {
      return []
    }
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', text: '', rating: 5 })

  useEffect(() => {
    localStorage.setItem('resumeradar_feedbacks', JSON.stringify(feedbacks))
  }, [feedbacks])

  const submitFeedback = (e) => {
    e.preventDefault()
    if (!form.text.trim()) return
    setFeedbacks((prev) => [{ ...form, name: form.name || 'Anonymous' }, ...prev].slice(0, 6))
    setForm({ name: '', role: '', text: '', rating: 5 })
    setShowForm(false)
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 text-sm text-slate-400 lg:flex">
            {[
              ['#problems', 'Why us'],
              ['#features', 'Features'],
              ['#access', 'How to access'],
              ['#feedback', 'Feedback'],
              ['/project', 'This project'],
            ].map(([href, label]) =>
              href.startsWith('#') ? (
                <a
                  key={label}
                  href={href}
                  className="rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.05] hover:text-slate-100"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  to={href}
                  className="rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.05] hover:text-slate-100"
                >
                  {label}
                </Link>
              ),
            )}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost !px-4 !py-2 text-sm">Sign in</Link>
            <Link to="/register" className="btn-gradient !px-4 !py-2 text-sm">Get started</Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-2 lg:pt-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon-violet/30 bg-neon-violet/10 px-4 py-1.5 text-xs font-medium text-neon-violet">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-violet" />
            Find your gap. Close it. Get hired.
          </span>
          <h1 className="font-display text-5xl leading-[1.05] font-bold text-white sm:text-6xl">
            Turn your resume into a <span className="gradient-text">job-ready roadmap</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            ResumeRadar analyzes your skills against real India-focused job roles, gives you an exact readiness score, builds a private AI roadmap, recommends projects and companies with direct Apply links — all powered by a local LLM.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="btn-gradient text-base">Analyze my resume →</Link>
            <Link to="/login" className="btn-ghost text-base">I have an account</Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map(([num, label]) => (
              <div key={label}>
                <div className="font-display text-2xl font-bold text-white">{num}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }} className="relative mx-auto hidden lg:block">
          <div className="glass float-slow relative h-[420px] w-[420px] overflow-hidden !rounded-full">
            {[140, 220, 300, 380].map((d, i) => (
              <div key={d} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" style={{ width: d, height: d, opacity: 0.4 + i * 0.15 }} />
            ))}
            <div className="sweep absolute top-1/2 left-1/2 h-1/2 w-1/2 origin-bottom-left">
              <div className="h-full w-full rounded-tl-full" style={{ background: 'conic-gradient(from 270deg, rgb(34 211 238 / 0.55), rgb(34 211 238 / 0) 60deg)' }} />
            </div>
            <div className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-violet shadow-[0_0_20px_4px_rgb(139_92_246/0.7)]" />
            {[
              ['72%', 'top-[22%] left-[62%]', 'text-neon-cyan'],
              ['41%', 'top-[58%] left-[24%]', 'text-neon-amber'],
              ['88%', 'top-[70%] left-[66%]', 'text-neon-emerald'],
            ].map(([v, pos, c]) => (
              <div key={v} className={`absolute ${pos} rounded-lg border border-white/10 bg-ink-900/90 px-2.5 py-1 font-display text-sm font-bold ${c} backdrop-blur`}>{v} ready</div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* —— Why ResumeRadar exists (incruit-style problem section) —— */}
      <section id="problems" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"
        >
          — Why ResumeRadar exists
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl"
        >
          Most candidates guess their way through job prep — <span className="gradient-text">we measured it instead.</span>
        </motion.h2>

        {/* the relatable rant */}
        <motion.blockquote
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass relative mt-8 max-w-4xl overflow-hidden p-6 sm:p-8"
        >
          <div className="absolute -top-20 -left-16 h-44 w-44 rounded-full bg-neon-violet/20 blur-3xl" />
          <p className="relative text-[15px] leading-relaxed italic text-slate-300">
            “so my resume got rejected again and i don’t even know why… i’ve been applying to dev roles for months,
            i know React and SQL but every posting wants Docker, CI/CD, system design — half of it i’ve never touched.
            my friends say ‘just build projects’, but which projects? my resume still has two college projects nobody
            asks about, and i can’t afford ₹15,000 coaching programs… i just wish someone would look at my resume and
            tell me <span className="not-italic text-neon-cyan">exactly what’s missing and what to learn first</span>.”
          </p>
          <footer className="relative mt-4 text-xs uppercase tracking-widest text-slate-500">
            — the average fresher, 2026
          </footer>
        </motion.blockquote>

        <p className="mt-6 max-w-3xl text-slate-400">
          ResumeRadar closes that gap: an exact readiness score against real role requirements, a private AI roadmap,
          gap-filling projects and India-focused company matches — running entirely on your own machine.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass glass-hover p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-rose/25 to-neon-amber/20 text-lg text-neon-rose">
                {p.icon}
              </div>
              <h3 className="font-display mb-2 text-base font-semibold text-white">{p.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-display mb-3 text-center text-3xl font-bold text-white">
          Everything you need to <span className="gradient-text">bridge the gap</span>
        </motion.h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-slate-400">
          Resume intelligence + local AI coaching + real job matches — arranged as one continuous journey from “where am I?” to “hired”.
        </p>
        <SpiralJourney
          items={journey}
          fallbackItems={features}
          core={spiralCore}
          endLabel="Job-ready"
        />
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="glass relative overflow-hidden p-8 sm:p-10">
          <h3 className="font-display text-2xl font-bold text-white mb-2">How it works</h3>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-6">
            {['Upload resume & add skills', 'Pick target role → get readiness %', 'Generate roadmap + projects (local AI)', 'Apply to matched companies or prep for interviews'].map((step, i) => (
              <li key={step} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-violet to-neon-cyan text-ink-950 font-semibold text-sm mb-3">0{i+1}</span>
                <p className="text-sm text-slate-200">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="feedback" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-1">Candidate feedback</h3>
            <p className="text-slate-400 text-sm">Share your experience after using ResumeRadar</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn-ghost mt-4 md:mt-0">{showForm ? 'Close' : 'Leave feedback'}</button>
        </div>

        {showForm && (
          <form onSubmit={submitFeedback} className="glass p-5 sm:p-6 mb-6 grid gap-4 sm:grid-cols-2">
            <input className="input" placeholder="Your name (optional)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="input" placeholder="Target role (e.g. Frontend Developer)" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
            <textarea className="input sm:col-span-2 min-h-[90px]" placeholder="What helped you most? How can we improve?" value={form.text} onChange={e => setForm({...form, text: e.target.value})} required />
            <div className="sm:col-span-2 flex items-center gap-3">
              <span className="text-sm text-slate-400">Rating</span>
              {[1,2,3,4,5].map(n => (
                <button type="button" key={n} onClick={() => setForm({...form, rating: n})} className={`h-8 w-8 rounded-full border ${form.rating>=n ? 'border-neon-amber bg-neon-amber/20 text-neon-amber' : 'border-white/10 text-slate-500'}`}>★</button>
              ))}
              <button type="submit" className="btn-gradient ml-auto">Submit feedback</button>
            </div>
          </form>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-200">{f.name}</p>
                  {f.role && <p className="text-xs text-slate-500">{f.role}</p>}
                </div>
                <div className="text-neon-amber text-sm">{'★'.repeat(f.rating)}{'☆'.repeat(5-f.rating)}</div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass relative overflow-hidden p-8 text-center sm:p-10">
          <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-neon-violet/25 blur-3xl" />
          <h3 className="font-display relative text-3xl font-bold text-white">See your exact readiness score in minutes</h3>
          <p className="relative mx-auto mt-3 max-w-xl text-slate-400">
            Upload your resume, pick a role, run analysis. Get roadmap + projects + matched companies. AI runs entirely on your machine.
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-gradient text-base">Get started free →</Link>
            <a href="https://incruit.online" target="_blank" rel="noreferrer" className="btn-ghost text-base">Mock interviews via incruit.online</a>
          </div>
        </motion.div>
      </section>

      {/* —— How to access —— */}
      <section id="access" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"
        >
          — How to access
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display mb-3 text-3xl font-bold text-white"
        >
          Up and running in <span className="gradient-text">three commands.</span>
        </motion.h2>
        <p className="mb-8 max-w-2xl text-slate-400">
          Open source and free. Runs on any laptop — no GPU, no cloud bill, no data leaving your machine.
        </p>

        <div className="grid gap-5 lg:grid-cols-3">
          {accessSteps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass glass-hover flex flex-col p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-violet to-neon-cyan text-sm font-bold text-ink-950">
                  0{i + 1}
                </span>
                <h3 className="font-display text-base font-semibold text-white">{s.title}</h3>
              </div>
              <pre className="mb-3 overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-white/10 bg-ink-950/70 p-3.5 font-mono text-[12.5px] leading-relaxed text-neon-cyan">
                {s.code}
              </pre>
              <p className="mt-auto text-xs leading-relaxed text-slate-500">{s.note}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href="https://github.com/amiskin1409/resumeradar" target="_blank" rel="noreferrer" className="btn-gradient">
            ⌁ View source on GitHub
          </a>
          <a href="https://github.com/amiskin1409/resumeradar#readme" target="_blank" rel="noreferrer" className="btn-ghost">
            Read the README
          </a>
          <Link to="/project" className="btn-ghost">About this project →</Link>
        </div>
      </section>

      {/* —— Discussion area —— */}
      <section id="discussion" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"
        >
          — Discussion
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display mb-3 text-3xl font-bold text-white"
        >
          Let’s <span className="gradient-text">talk about it.</span>
        </motion.h2>
        <p className="mb-8 max-w-2xl text-slate-400">
          Ideas, doubts, bug reports, feature requests — every thread is read and answered. This project grows from
          the discussion, not in isolation.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {discussionLinks.map((d, i) => (
            <motion.a
              key={d.title}
              href={d.href}
              target={d.href.startsWith('#') ? undefined : '_blank'}
              rel={d.href.startsWith('#') ? undefined : 'noreferrer'}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass glass-hover group block p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-violet/25 to-neon-cyan/25 text-lg">
                {d.icon}
              </div>
              <h3 className="font-display mb-2 text-base font-semibold text-white">{d.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{d.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neon-cyan transition group-hover:gap-2">
                {d.cta} →
              </span>
            </motion.a>
          ))}
        </div>
      </section>

      {/* —— Footer (incruit-style columns) —— */}
      <footer className="border-t border-white/[0.06] bg-ink-900/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div>
            <Logo size="text-lg" markSize="h-8 w-8" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Find your gap. Close it. Get hired. Private AI skill analysis, roadmaps and India-focused job matches —
              100% on your machine.
            </p>
            <a
              href="https://github.com/amiskin1409/resumeradar"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/25 hover:bg-white/[0.08]"
            >
              ⌁ GitHub
            </a>
          </div>

          {[
            {
              title: 'Explore',
              links: [
                ['#problems', 'Why it exists'],
                ['#features', 'Features'],
                ['#how', 'How it works'],
                ['#feedback', 'Candidate feedback'],
              ],
            },
            {
              title: 'Product',
              links: [
                ['#features', 'Skill gap analysis'],
                ['#features', 'AI roadmap & projects'],
                ['#features', 'Company matchmaker'],
                ['https://incruit.online', 'Mock interviews'],
              ],
            },
            {
              title: 'Connect',
              links: [
                ['/project', 'This project'],
                ['https://github.com/amiskin1409/resumeradar/discussions', 'Discussions'],
                ['https://github.com/amiskin1409/resumeradar/issues', 'Report an issue'],
                ['/register', 'Create account'],
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([href, label]) =>
                  href.startsWith('#') ? (
                    <li key={label}>
                      <a href={href} className="text-sm text-slate-400 transition hover:text-slate-100">{label}</a>
                    </li>
                  ) : href.startsWith('/') ? (
                    <li key={label}>
                      <Link to={href} className="text-sm text-slate-400 transition hover:text-slate-100">{label}</Link>
                    </li>
                  ) : (
                    <li key={label}>
                      <a href={href} target="_blank" rel="noreferrer" className="text-sm text-slate-400 transition hover:text-slate-100">{label}</a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] py-6 text-center text-xs text-slate-500">
          © 2026 <span className="text-slate-300">Anmol Miskin</span> · ResumeRadar — React + FastAPI + Ollama (local AI). MIT License.
        </div>
      </footer>
    </div>
  )
}