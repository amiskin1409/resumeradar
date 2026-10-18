import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '../components/AppLayout'

const features = [
  {
    icon: '◎',
    title: 'Skill Gap Analysis',
    text: 'Upload your resume, add your skills, pick a goal role — get an exact readiness percentage against real job requirements.',
  },
  {
    icon: '✦',
    title: 'Private AI Coach',
    text: 'A local, open-source LLM (Ollama) generates your roadmap, project ideas and interview prep. Your data never leaves your machine.',
  },
  {
    icon: '⬡',
    title: 'Personal Roadmap',
    text: 'A phased, step-by-step plan with resources and hours to take you from where you are to job-ready.',
  },
  {
    icon: '⬢',
    title: 'Company Matchmaker',
    text: 'Explore companies actually hiring for your role — filtered by remote / hybrid / onsite, ranked by your fit.',
  },
  {
    icon: '⚙',
    title: 'Project Recommender',
    text: 'AI-checked consistency between your resume and skills, plus projects that force-close your gaps.',
  },
  {
    icon: '⇄',
    title: 'Mock Interview Ready',
    text: 'A role-tailored prep checklist and one-click access to incruit.online AI mock interviews.',
  },
]

const stats = [
  ['18', 'career roles mapped'],
  ['185+', 'skills tracked'],
  ['45+', 'companies in dataset'],
  ['100%', 'private AI'],
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost !px-4 !py-2 text-sm">
              Sign in
            </Link>
            <Link to="/register" className="btn-gradient !px-4 !py-2 text-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-2 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-neon-violet/30 bg-neon-violet/10 px-4 py-1.5 text-xs font-medium text-neon-violet">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-violet" />
            Powered by a private, local AI model
          </span>
          <h1 className="font-display text-5xl leading-[1.05] font-bold text-white sm:text-6xl">
            Find your gap.
            <br />
            <span className="gradient-text">Close it. Get hired.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            ResumeRadar analyzes your resume and skills against real market demand, scores your
            readiness for any job role, and builds an AI roadmap that takes you from{' '}
            <em className="not-italic text-slate-200">“what am I missing?”</em> to{' '}
            <em className="not-italic text-neon-cyan">“I’m ready.”</em>
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="btn-gradient text-base">
              Analyze my resume →
            </Link>
            <Link to="/login" className="btn-ghost text-base">
              I have an account
            </Link>
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

        {/* Radar visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative mx-auto hidden lg:block"
        >
          <div className="glass float-slow relative h-[420px] w-[420px] overflow-hidden !rounded-full">
            {[140, 220, 300, 380].map((d, i) => (
              <div
                key={d}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
                style={{ width: d, height: d, opacity: 0.4 + i * 0.15 }}
              />
            ))}
            <div className="sweep absolute top-1/2 left-1/2 h-1/2 w-1/2 origin-bottom-left">
              <div
                className="h-full w-full rounded-tl-full"
                style={{
                  background:
                    'conic-gradient(from 270deg, rgb(34 211 238 / 0.55), rgb(34 211 238 / 0) 60deg)',
                }}
              />
            </div>
            <div className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-violet shadow-[0_0_20px_4px_rgb(139_92_246/0.7)]" />
            {[
              ['72%', 'top-[22%] left-[62%]', 'text-neon-cyan'],
              ['41%', 'top-[58%] left-[24%]', 'text-neon-amber'],
              ['88%', 'top-[70%] left-[66%]', 'text-neon-emerald'],
            ].map(([v, pos, c]) => (
              <div
                key={v}
                className={`absolute ${pos} rounded-lg border border-white/10 bg-ink-900/90 px-2.5 py-1 font-display text-sm font-bold ${c} backdrop-blur`}
              >
                {v} match
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display mb-3 text-center text-3xl font-bold text-white"
        >
          Everything between <span className="gradient-text">you and your offer letter</span>
        </motion.h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-slate-400">
          One platform that analyzes, plans, recommends and prepares — powered by AI that runs
          entirely on your machine.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass glass-hover p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-violet/25 to-neon-cyan/25 text-lg text-neon-cyan">
                {f.icon}
              </div>
              <h3 className="font-display mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass relative overflow-hidden p-10 text-center"
        >
          <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-neon-violet/25 blur-3xl" />
          <h3 className="font-display relative text-3xl font-bold text-white">
            Ready to see your readiness score?
          </h3>
          <p className="relative mx-auto mt-3 max-w-xl text-slate-400">
            Create a free account, upload your resume, and get your personalized gap analysis in
            under a minute.
          </p>
          <Link to="/register" className="btn-gradient relative mt-6 text-base">
            Start free →
          </Link>
          <p className="relative mt-4 text-xs text-slate-500">
            Mock interviews powered by{' '}
            <a href="https://incruit.online" target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline">
              incruit.online
            </a>{' '}
            · Datasets from public LinkedIn job postings
          </p>
        </motion.div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-slate-500">
        ResumeRadar — built with React, FastAPI & a local LLM. MIT License.
      </footer>
    </div>
  )
}
