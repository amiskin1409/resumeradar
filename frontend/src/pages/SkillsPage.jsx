import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api, { errorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'

const LEVEL_LABELS = { 1: 'Beginner', 2: 'Basic', 3: 'Comfortable', 4: 'Advanced', 5: 'Expert' }

export default function SkillsPage() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const [skills, setSkills] = useState([])
  const [catalogue, setCatalogue] = useState([])
  const [roles, setRoles] = useState([])
  const [resume, setResume] = useState(null)
  const [goal, setGoal] = useState(user?.target_role || '')

  const [input, setInput] = useState('')
  const [level, setLevel] = useState(3)
  const [suggestions, setSuggestions] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/me/skills'),
      api.get('/api/meta/skills'),
      api.get('/api/meta/roles'),
      api.get('/api/resume/latest'),
    ]).then(([s, c, r, res]) => {
      if (s.status === 'fulfilled') setSkills(s.value.data)
      if (c.status === 'fulfilled') setCatalogue(c.value.data.skills)
      if (r.status === 'fulfilled') setRoles(r.value.data)
      if (res.status === 'fulfilled' && res.value.data) setResume(res.value.data)
    })
  }, [])

  const roleGroups = useMemo(() => {
    const groups = {}
    for (const r of roles) (groups[r.category] ||= []).push(r)
    return groups
  }, [roles])

  const filteredSuggestions = useMemo(() => {
    const q = input.trim().toLowerCase()
    if (!q) return []
    return catalogue
      .filter((s) => s.name.toLowerCase().includes(q) && !skills.some((k) => k.name === s.name))
      .slice(0, 8)
  }, [input, catalogue, skills])

  useEffect(() => setSuggestions(filteredSuggestions), [filteredSuggestions])

  const saveSkills = async (next) => {
    setSkills(next)
    try {
      const { data } = await api.post('/api/me/skills', {
        skills: next.map((s) => ({ name: s.name, level: s.level })),
      })
      setSkills(data)
    } catch (err) {
      setError(errorMessage(err, 'Could not save skills'))
    }
  }

  const addSkill = (name) => {
    const clean = name.trim()
    if (!clean) return
    if (skills.some((s) => s.name.toLowerCase() === clean.toLowerCase())) {
      setInput('')
      return
    }
    saveSkills([...skills, { name: clean, level, source: 'manual' }])
    setInput('')
  }

  const removeSkill = (name) => saveSkills(skills.filter((s) => s.name !== name))

  const cycleLevel = (name) => {
    saveSkills(
      skills.map((s) =>
        s.name === name ? { ...s, level: (s.level % 5) + 1 } : s,
      ),
    )
  }

  const uploadResume = async (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please choose a PDF file')
      return
    }
    setError('')
    setBusy('resume')
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await api.post('/api/resume/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResume(data)
      const refreshed = await api.get('/api/me/skills')
      setSkills(refreshed.data)
      setNotice(
        `Resume parsed: found ${data.detected_skills.length} skills and ${data.detected_projects.length} projects.`,
      )
    } catch (err) {
      setError(errorMessage(err, 'Resume upload failed'))
    } finally {
      setBusy('')
    }
  }

  const saveGoal = async (role) => {
    setGoal(role)
    try {
      const { data } = await api.put('/api/me', { target_role: role || null })
      setUser(data)
    } catch (err) {
      setError(errorMessage(err, 'Could not save goal'))
    }
  }

  const runAnalysis = async () => {
    if (!goal) {
      setError('Pick your target role first')
      return
    }
    if (!skills.length) {
      setError('Add at least one skill or upload your resume')
      return
    }
    setBusy('analysis')
    setError('')
    try {
      await api.post('/api/analysis', { target_role: goal })
      navigate('/app/analysis')
    } catch (err) {
      setError(errorMessage(err, 'Analysis failed'))
      setBusy('')
    }
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-white">Skills & Resume</h1>
        <p className="mt-1 text-slate-400">
          Tell Radar what you know. We’ll do the rest — parsing, matching and gap-finding.
        </p>
      </motion.div>

      {error && (
        <div className="rounded-xl border border-neon-rose/30 bg-neon-rose/10 px-4 py-3 text-sm text-neon-rose">{error}</div>
      )}
      {notice && (
        <div className="rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 px-4 py-3 text-sm text-neon-emerald">{notice}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Manual skills */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass p-6">
          <h2 className="font-display mb-1 text-lg font-semibold text-white">Your skills</h2>
          <p className="mb-4 text-xs text-slate-400">
            Type a skill and pick a proficiency. Click a chip to cycle its level (★ to ★★★★★).
          </p>

          <div className="relative">
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="e.g. React, Power BI, Docker…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const match = suggestions[0]?.name || input
                    addSkill(match)
                  }
                }}
              />
              <select className="input !w-36" value={level} onChange={(e) => setLevel(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((l) => (
                  <option key={l} value={l} className="bg-ink-800">
                    {l} · {LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
            </div>
            {suggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-ink-800/95 backdrop-blur-xl">
                {suggestions.map((s) => (
                  <button
                    key={s.name}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      addSkill(s.name)
                    }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-neon-violet/20"
                  >
                    <span>{s.name}</span>
                    <span className="text-xs text-slate-500">{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {skills.map((s) => (
              <button
                key={s.id || s.name}
                onClick={() => cycleLevel(s.name)}
                title={`Level ${s.level}/5 (${LEVEL_LABELS[s.level]}) — click to cycle · via ${s.source}`}
                className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-neon-violet/50"
              >
                {s.name}
                <span className="text-xs text-neon-cyan">{'★'.repeat(s.level)}</span>
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSkill(s.name)
                  }}
                  className="ml-1 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-neon-rose"
                >
                  ✕
                </span>
              </button>
            ))}
            {!skills.length && (
              <p className="text-sm text-slate-500">No skills yet — add a few or upload your resume below.</p>
            )}
          </div>
        </motion.section>

        {/* Resume upload */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6">
          <h2 className="font-display mb-1 text-lg font-semibold text-white">Resume (PDF)</h2>
          <p className="mb-4 text-xs text-slate-400">
            We extract your skills and projects locally — the file never leaves your machine.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              uploadResume(e.dataTransfer.files[0])
            }}
            onClick={() => fileRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              dragOver
                ? 'border-neon-cyan/60 bg-neon-cyan/5'
                : 'border-white/15 hover:border-neon-violet/50 hover:bg-white/[0.02]'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => uploadResume(e.target.files[0])}
            />
            {busy === 'resume' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-violet border-t-transparent" />
                <span className="text-sm text-slate-400 shimmer rounded-lg px-3 py-1">AI is reading your resume…</span>
              </div>
            ) : (
              <>
                <div className="mb-3 text-3xl">📄</div>
                <p className="text-sm font-medium text-slate-200">
                  Drop your resume here or <span className="text-neon-cyan">browse</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">PDF up to 8 MB</p>
              </>
            )}
          </div>

          {resume && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="truncate text-sm font-medium text-slate-200">{resume.filename}</span>
                <span className="text-xs text-neon-emerald">✓ parsed</span>
              </div>
              <p className="text-xs text-slate-400">
                Detected <span className="text-neon-cyan">{resume.detected_skills.length}</span> skills and{' '}
                <span className="text-neon-cyan">{resume.detected_projects.length}</span> projects.
              </p>
              {resume.detected_projects?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                    View detected projects
                  </summary>
                  <ul className="mt-2 space-y-1.5">
                    {resume.detected_projects.map((p, i) => (
                      <li key={i} className="rounded-lg bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-slate-300">
                        {p}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </motion.section>
      </div>

      {/* Goal role + run */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass p-6">
        <h2 className="font-display mb-1 text-lg font-semibold text-white">Your main goal</h2>
        <p className="mb-4 text-xs text-slate-400">
          Pick the role you’re aiming for — everything (score, roadmap, companies, projects) is tailored to it.
        </p>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(roleGroups).map(([category, list]) => (
            <div key={category}>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">{category}</div>
              <div className="space-y-1.5">
                {list.map((r) => (
                  <button
                    key={r.title}
                    onClick={() => saveGoal(r.title)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                      goal === r.title
                        ? 'border-neon-violet/60 bg-neon-violet/15 text-white shadow-[0_0_24px_-10px_rgb(139_92_246/0.8)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
                    }`}
                  >
                    {r.title}
                    <span className="block text-[10px] text-slate-500">{r.skill_count} skills · {r.required.length} required</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button onClick={runAnalysis} disabled={busy === 'analysis'} className="btn-gradient">
            {busy === 'analysis' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950 border-t-transparent" />
                Analyzing…
              </>
            ) : (
              'Run AI gap analysis →'
            )}
          </button>
          <span className="text-xs text-slate-500">
            {skills.length} skills · {goal ? `goal: ${goal}` : 'no goal selected'}
          </span>
        </div>
      </motion.section>
    </div>
  )
}
