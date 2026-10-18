import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import ProgressRing from '../components/ProgressRing'

function readinessLabel(score) {
  if (score >= 80) return ['Job Ready', 'text-neon-emerald']
  if (score >= 60) return ['Interview Ready', 'text-neon-cyan']
  if (score >= 40) return ['Job Competitive', 'text-neon-violet']
  if (score >= 20) return ['Getting Started', 'text-neon-amber']
  return ['Early Stage', 'text-neon-rose']
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [skills, setSkills] = useState([])
  const [aiOk, setAiOk] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/analysis/latest'),
      api.get('/api/me/skills'),
      api.get('/api/health'),
    ]).then(([a, s, h]) => {
      if (a.status === 'fulfilled') setAnalysis(a.value.data)
      if (s.status === 'fulfilled') setSkills(s.value.data)
      if (h.status === 'fulfilled') setAiOk(h.value.data.ai_available)
      setLoading(false)
    })
  }, [])

  const score = analysis?.readiness_score ?? 0
  const [label, labelColor] = readinessLabel(score)
  const roadmapSteps = analysis?.roadmap_steps || []
  const doneSteps = roadmapSteps.filter((s) => s.done).length
  const roadmapPct = roadmapSteps.length ? Math.round((doneSteps / roadmapSteps.length) * 100) : 0
  const topMissing = (analysis?.missing_skills || []).slice(0, 8)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-violet border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-white">
          Hey {user?.name?.split(' ')[0]} <span className="wave inline-block">👋</span>
        </h1>
        <p className="mt-1 text-slate-400">
          {analysis
            ? `Your latest analysis: ${analysis.target_role}`
            : 'Let’s get your first analysis done.'}
        </p>
      </motion.div>

      {/* AI status banner */}
      {aiOk === false && (
        <div className="glass flex flex-wrap items-center justify-between gap-3 border-amber-400/20 p-4">
          <div className="flex items-center gap-3">
            <span className="text-amber-400">⚠</span>
            <div className="text-sm">
              <span className="font-semibold text-slate-200">Local AI is offline.</span>{' '}
              <span className="text-slate-400">
                All scoring still works. Install Ollama and run <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">ollama pull qwen2.5:3b</code> to unlock AI roadmaps & summaries.
              </span>
            </div>
          </div>
        </div>
      )}
      {aiOk === true && (
        <div className="glass flex items-center gap-3 p-4 text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-neon-emerald" />
          <span className="text-slate-300">
            Private AI connected — every insight is generated locally on your machine.
          </span>
        </div>
      )}

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Readiness card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass flex flex-col items-center p-8"
        >
          {analysis ? (
            <>
              <ProgressRing value={score} label="readiness" sublabel={label} size={170} />
              <div className={`mt-4 text-sm font-semibold ${labelColor}`}>{label}</div>
              <p className="mt-2 text-center text-xs text-slate-400">
                Target role: <span className="text-slate-200">{analysis.target_role}</span>
              </p>
              <Link to="/app/analysis" className="btn-gradient mt-5 w-full text-sm">
                View full analysis →
              </Link>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-white/15 text-3xl text-slate-500">◎</div>
              <p className="text-sm text-slate-400">
                No analysis yet. Add your skills and run your first gap analysis.
              </p>
              <Link to="/app/skills" className="btn-gradient mt-5 w-full text-sm">
                Get started →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Skills + Roadmap progress */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          <div className="glass p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-semibold text-white">Your skills</h3>
              <span className="text-xs text-slate-400">{skills.length} added</span>
            </div>
            {skills.length ? (
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 14).map((s) => (
                  <span
                    key={s.id}
                    className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-slate-300"
                    title={`Level ${s.level}/5 · via ${s.source}`}
                  >
                    {s.name} <span className="text-neon-cyan">{'★'.repeat(s.level)}</span>
                  </span>
                ))}
                {skills.length > 14 && (
                  <span className="px-2 py-1 text-xs text-slate-500">+{skills.length - 14} more</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No skills yet.</p>
            )}
            <button onClick={() => navigate('/app/skills')} className="btn-ghost mt-4 w-full text-sm">
              {skills.length ? 'Manage skills & resume' : 'Add skills'}
            </button>
          </div>

          <div className="glass p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-semibold text-white">Roadmap progress</h3>
              <span className="text-xs text-slate-400">
                {doneSteps}/{roadmapSteps.length} steps
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-neon-violet to-neon-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${roadmapPct}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {analysis
                ? `${roadmapPct}% of your personalized plan is complete.`
                : 'Run an analysis to unlock your AI roadmap.'}
            </p>
          </div>
        </motion.div>

        {/* Right column: best roles + quick actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-6">
          <div className="glass p-6">
            <h3 className="font-display mb-3 font-semibold text-white">Best-fit roles</h3>
            {analysis?.role_matches?.length ? (
              <div className="space-y-2.5">
                {analysis.role_matches.slice(0, 5).map((r) => (
                  <div key={r.role} className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-slate-300">{r.role}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-neon-violet to-neon-cyan"
                          style={{ width: `${r.score}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-semibold text-neon-cyan">{Math.round(r.score)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Run an analysis to see matched roles.</p>
            )}
          </div>

          <div className="glass p-6">
            <h3 className="font-display mb-3 font-semibold text-white">Quick actions</h3>
            <div className="grid gap-2">
              <button onClick={() => navigate('/app/companies')} className="btn-ghost justify-start text-sm">
                ⬢ Explore companies hiring for you
              </button>
              <a
                href="https://incruit.online"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost justify-start text-sm"
              >
                ⇄ Practice mock interview on incruit.online ↗
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top gaps */}
      {analysis && topMissing.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6">
          <h3 className="font-display mb-1 font-semibold text-white">
            Top skill gaps for {analysis.target_role}
          </h3>
          <p className="mb-4 text-xs text-slate-400">
            Close these first — they carry the most weight in hiring screens.
          </p>
          <div className="flex flex-wrap gap-2">
            {topMissing.map((m, i) => (
              <span
                key={m.skill}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  m.importance === 'required'
                    ? 'border-neon-rose/30 bg-neon-rose/10 text-neon-rose'
                    : 'border-white/10 bg-white/[0.05] text-slate-300'
                }`}
              >
                {m.skill}
                <span className="ml-1.5 opacity-60">
                  {m.importance === 'required' ? 'required' : 'preferred'}
                </span>
              </span>
            ))}
          </div>
          <Link to="/app/analysis" className="btn-gradient mt-5 inline-flex text-sm">
            See my roadmap →
          </Link>
        </motion.div>
      )}
    </div>
  )
}
