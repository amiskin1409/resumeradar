import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Logo } from '../components/AppLayout'
import LogoMark from '../components/LogoMark'

const REPO = 'https://github.com/amiskin1409/resumeradar'

const taglines = [
  'Scan. Score. Get hired.',
  'Find your gap. Close it. Get hired.',
  'Your resume knows more than you think.',
  'From resume to offer — one radar.',
  'Stop guessing what to learn next.',
]

// Attractive alternate names considered for the project
const nameIdeas = [
  { name: 'ResumeRadar', note: 'chosen — the radar that scans your resume', picked: true },
  { name: 'SkillGap Radar', note: 'leads with the problem it solves' },
  { name: 'OfferRadar', note: 'outcome-focused, sounds premium' },
  { name: 'HireSight', note: 'short, modern, SaaS-style' },
  { name: 'CareerCompass', note: 'friendly, direction-focused' },
  { name: 'GapHunter', note: 'bold, action verb' },
]

const stack = [
  ['Frontend', 'React 19 · Vite · Tailwind CSS v4 · Framer Motion'],
  ['Backend', 'FastAPI · SQLAlchemy · Pydantic · JWT auth'],
  ['AI', 'Ollama (qwen2.5:1.5b) — 100% local, no cloud calls'],
  ['Data', 'Curated India-focused roles, skills taxonomy & 55 companies'],
]

export default function ProjectPage() {
  const [tagIdx, setTagIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTagIdx((i) => (i + 1) % taglines.length), 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="btn-ghost !px-4 !py-2 text-sm">← Back home</Link>
            <Link to="/register" className="btn-gradient !px-4 !py-2 text-sm">Get started</Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto max-w-6xl px-4 pt-16 pb-14 text-center sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <LogoMark className="h-24 w-24 drop-shadow-[0_0_50px_rgb(139_92_246/0.55)]" />
          </div>
          <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
            <span className="gradient-text">Resume</span>Radar
          </h1>
          <div className="mt-4 h-7 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={tagIdx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-lg text-slate-400"
              >
                {taglines[tagIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="mt-6 text-sm uppercase tracking-widest text-slate-500">
            created by <span className="text-neon-cyan">Anmol Miskin</span>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={REPO} target="_blank" rel="noreferrer" className="btn-gradient text-base">
              ⌁ Find it on GitHub
            </a>
            <Link to="/register" className="btn-ghost text-base">Try the live app →</Link>
          </div>
        </motion.div>
      </section>

      {/* where to find it */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">— Where to find it</p>
        <h2 className="font-display mb-8 text-center text-3xl font-bold text-white">One repo. Everything inside.</h2>

        <div className="grid gap-5 lg:grid-cols-2">
          <motion.a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass glass-hover group block p-6"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-neon-violet/30 to-neon-cyan/30 text-xl text-white">⌂</div>
            <h3 className="font-display text-lg font-semibold text-white">github.com/amiskin1409/resumeradar</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Source code, dataset pipeline, setup scripts and full README. MIT licensed — fork it, learn from it, make it yours.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neon-cyan transition group-hover:gap-2">
              Open repository →
            </span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-6"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-neon-violet/30 to-neon-cyan/30 text-lg text-neon-cyan">▸</div>
            <h3 className="font-display text-lg font-semibold text-white">Run it in 3 commands</h3>
            <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-ink-950/70 p-4 font-mono text-[13px] leading-relaxed text-slate-300">
              <p><span className="text-slate-600">$</span> git clone {REPO}</p>
              <p><span className="text-slate-600">$</span> cd resumeradar &amp;&amp; ./scripts/start_dev.ps1</p>
              <p><span className="text-slate-600">$</span> open <span className="text-neon-cyan">http://localhost:5173</span></p>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Needs Python 3.11+, Node 18+ and Ollama (pulls qwen2.5:1.5b, ~1 GB). Runs fine on a CPU-only laptop.
            </p>
          </motion.div>
        </div>
      </section>

      {/* name ideas */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">— The name</p>
        <h2 className="font-display mb-3 text-center text-3xl font-bold text-white">
          Why <span className="gradient-text">ResumeRadar</span>
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-center text-slate-400">
          A radar sees what you can’t — exactly what this does for your career. Here are the alternatives that made the shortlist:
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nameIdeas.map((n, i) => (
            <motion.div
              key={n.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`glass p-5 ${n.picked ? 'border-neon-violet/60 shadow-[0_0_60px_-24px_rgb(139_92_246/0.9)]' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-white">{n.name}</h3>
                {n.picked && (
                  <span className="rounded-full border border-neon-emerald/40 bg-neon-emerald/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neon-emerald">
                    ✓ picked
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-slate-400">{n.note}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* what it is / stack */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">— Under the hood</p>
        <h2 className="font-display mb-8 text-center text-3xl font-bold text-white">Built local, built to last.</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {stack.map(([label, value], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neon-violet">{label}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{value}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass relative mt-10 overflow-hidden p-8 text-center sm:p-10">
          <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-neon-violet/25 blur-3xl" />
          <h3 className="font-display relative text-2xl font-bold text-white sm:text-3xl">
            Ready to see your readiness score?
          </h3>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-gradient text-base">Get started free →</Link>
            <a href={REPO} target="_blank" rel="noreferrer" className="btn-ghost text-base">Star it on GitHub ⌁</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-slate-500">
        © 2026 Anmol Miskin · ResumeRadar — React + FastAPI + Ollama (local AI). MIT License.
      </footer>
    </div>
  )
}
