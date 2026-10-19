import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api, { errorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'

const LEVEL_LABELS = { 1: 'Beginner', 2: 'Basic', 3: 'Comfortable', 4: 'Advanced', 5: 'Expert' }
const LEVEL_COLORS = { 1: '#fb7185', 2: '#fbbf24', 3: '#22d3ee', 4: '#34d399', 5: '#a78bfa' }

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
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const fileRef = useRef()
  const inputRef = useRef()
  const dropdownRef = useRef()

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

  const catalogueGrouped = useMemo(() => {
    const groups = {}
    const q = input.trim().toLowerCase()
    const filtered = q
      ? catalogue.filter((s) => s.name.toLowerCase().includes(q) && !skills.some((k) => k.name.toLowerCase() === s.name.toLowerCase()))
      : catalogue.filter((s) => !skills.some((k) => k.name.toLowerCase() === s.name.toLowerCase()))
    for (const s of filtered.slice(0, 40)) {
      const cat = s.category || 'Other'
      groups[cat] ||= []
      groups[cat].push(s)
    }
    return groups
  }, [input, catalogue, skills])

  const flattenedSuggestions = useMemo(() => {
    const out = []
    Object.entries(catalogueGrouped).forEach(([cat, items]) => items.forEach((it) => out.push({ ...it, _cat: cat })))
    return out
  }, [catalogueGrouped])

  useEffect(() => setHighlightedIndex(0), [input])

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && inputRef.current !== e.target) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

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
      setShowDropdown(false)
      return
    }
    saveSkills([...skills, { name: clean, level, source: 'manual' }])
    setInput('')
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const removeSkill = (name) => saveSkills(skills.filter((s) => s.name !== name))

  const cycleLevel = (name) => {
    saveSkills(
      skills.map((s) => (s.name === name ? { ...s, level: (s.level % 5) + 1 } : s)),
    )
  }

  const handleKeyDown = (e) => {
    if (!showDropdown || flattenedSuggestions.length === 0) {
      if (e.key === 'ArrowDown' || e.key === 'Tab') {
        setShowDropdown(true)
        e.preventDefault()
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => (i + 1) % flattenedSuggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => (i - 1 + flattenedSuggestions.length) % flattenedSuggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      addSkill(flattenedSuggestions[highlightedIndex]?.name || input)
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
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
      setNotice(`Resume parsed: found ${data.detected_skills.length} skills and ${data.detected_projects.length} projects.`)
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
    <div className="space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold text-white tracking-tight">Skills & Resume</h1>
        <p className="mt-2 text-base text-slate-400 max-w-3xl">
          Build your skill profile with precision. Upload your resume to auto-detect what you know, refine your proficiencies, and set your target role.
        </p>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-neon-rose/40 bg-neon-rose/10 px-5 py-3 text-sm text-neon-rose shadow-[0_0_60px_-20px_rgb(251_113_133/0.8)]">
          {error}
        </motion.div>
      )}
      {notice && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-neon-emerald/40 bg-neon-emerald/10 px-5 py-3 text-sm text-neon-emerald shadow-[0_0_60px_-20px_rgb(52_211_153/0.8)]">
          {notice}
        </motion.div>
      )}

      <div className="grid gap-6 xl:grid-cols-5">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass glass-hover relative overflow-hidden p-6 xl:col-span-3">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-neon-violet/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-neon-cyan/15 blur-3xl" />
          <div className="relative z-10">
            <h2 className="font-display mb-1 text-xl font-semibold text-white flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-violet to-neon-cyan text-ink-950 shadow-[0_0_40px_-12px_rgb(139_92_246/0.9)]">⚡</span>
              Your Skills
            </h2>
            <p className="mb-5 text-sm text-slate-400">
              Search from the catalogue, pick proficiency, and build your stack. Click any chip to cycle its level with a subtle glow.
            </p>

            <div className="relative" ref={dropdownRef}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    className="input h-12 pr-10 shadow-inner"
                    placeholder="Search skills (React, TypeScript, Docker, LangChain...)"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDropdown((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
                  >
                    {showDropdown ? '▲' : '▼'}
                  </button>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] p-1 shadow-inner backdrop-blur-xl">
                  {[1, 2, 3, 4, 5].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 ${
                        level === l
                          ? 'bg-white/15 text-white shadow-[0_0_40px_-16px_rgb(139_92_246/0.9)]'
                          : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      {level === l && <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-neon-violet/40 to-neon-cyan/40 blur-sm" />}
                      <span style={{ color: LEVEL_COLORS[l] }}>{'★'.repeat(l)}</span>
                      <span className="hidden sm:inline">{LEVEL_LABELS[l]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {showDropdown && flattenedSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.995 }}
                    animate={{ opacity: 1, y: 8, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.995 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 mt-2 max-h-[420px] w-full overflow-hidden overflow-y-auto rounded-2xl border border-white/15 bg-ink-900/98 shadow-[0_24px_80px_-30px_rgb(0_0_0/0.95)] backdrop-blur-2xl"
                  >
                    {Object.entries(catalogueGrouped).map(([cat, items]) => (
                      <div key={cat} className="border-b border-white/5 last:border-0">
                        <div className="sticky top-0 z-10 bg-ink-900/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500 backdrop-blur-xl">
                          {cat}
                        </div>
                        {items.map((s, i) => {
                          const globalIdx = flattenedSuggestions.findIndex((f) => f.name === s.name && f._cat === cat)
                          const isActive = globalIdx === highlightedIndex
                          return (
                            <button
                              key={`${cat}-${s.name}`}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                addSkill(s.name)
                              }}
                              onMouseEnter={() => setHighlightedIndex(globalIdx)}
                              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-all duration-150 ${
                                isActive ? 'bg-neon-violet/25 text-white' : 'text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs">{s.name.slice(0, 1).toUpperCase()}</span>
                                <span className="font-medium">{s.name}</span>
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-slate-500">{cat}</span>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex max-h-[420px] flex-wrap gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4 shadow-inner backdrop-blur-xl">
              <AnimatePresence>
                {skills.map((s) => (
                  <motion.button
                    key={s.id || s.name}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => cycleLevel(s.name)}
                    title={`Level ${s.level}/5 (${LEVEL_LABELS[s.level]}) — click to cycle (source: ${s.source})`}
                    className="group relative flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1.5 text-sm text-slate-100 shadow-[0_0_40px_-18px_rgb(139_92_246/0.9)] transition-all hover:border-white/30 hover:bg-white/[0.12]"
                  >
                    <span className="absolute inset-0 -z-10 rounded-full opacity-60 blur-md transition-opacity group-hover:opacity-90" style={{ background: `radial-gradient(circle at 50% 0%, ${LEVEL_COLORS[s.level]}33 0%, transparent 70%)` }} />
                    <span className="font-medium">{s.name}</span>
                    <span className="flex items-center gap-0.5" style={{ color: LEVEL_COLORS[s.level] }}>
                      {'★'.repeat(s.level)}
                      {'☆'.repeat(5 - s.level)}
                    </span>
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSkill(s.name)
                      }}
                      className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-neon-rose/20 hover:text-neon-rose"
                    >
                      ×
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
              {!skills.length && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 text-center text-sm text-slate-500">
                  <span className="mb-2 text-3xl">✨</span>
                  No skills yet — start typing above or upload your resume to auto-detect them.
                </motion.p>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass glass-hover relative overflow-hidden p-6 xl:col-span-2">
          <div className="absolute -top-28 -right-28 h-56 w-56 rounded-full bg-neon-cyan/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-neon-emerald/15 blur-3xl" />
          <div className="relative z-10">
            <h2 className="font-display mb-1 flex items-center gap-2 text-xl font-semibold text-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan to-neon-emerald text-ink-950 shadow-[0_0_40px_-12px_rgb(34_211_238/0.9)]">📄</span>
              Resume (PDF)
            </h2>
            <p className="mb-5 text-sm text-slate-400">
              Extracted locally. No file ever leaves your machine.
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
              className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                dragOver
                  ? 'border-neon-cyan/70 bg-neon-cyan/10 shadow-[0_0_80px_-30px_rgb(34_211_238/0.9)]'
                  : 'border-white/20 bg-white/[0.02] hover:border-neon-violet/60 hover:bg-white/[0.04]'
              }`}
            >
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => uploadResume(e.target.files[0])} />
              {busy === 'resume' ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-10 w-10">
                    <div className="absolute inset-0 rounded-full border-2 border-neon-violet/30" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-neon-violet border-t-transparent" />
                  </div>
                  <span className="shimmer rounded-full px-4 py-1.5 text-sm text-slate-200">Reading and parsing your resume...</span>
                </div>
              ) : (
                <>
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }} className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-violet/90 to-neon-cyan/90 text-2xl text-ink-950 shadow-[0_0_60px_-20px_rgb(139_92_246/0.9)]">
                    📄
                  </motion.div>
                  <p className="text-base font-medium text-slate-100">
                    Drop your PDF here or <span className="gradient-text">browse files</span>
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">Supports PDF • Up to ~8 MB • 100% local</p>
                </>
              )}
            </div>

            {resume && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4 rounded-2xl border border-white/15 bg-white/[0.04] p-5 shadow-inner backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{resume.filename}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {resume.detected_skills.length} skills detected • {resume.detected_projects.length} projects extracted
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-emerald/40 bg-neon-emerald/15 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-neon-emerald">
                    ✓ Parsed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-widest text-slate-500">Skills</p>
                    <p className="mt-0.5 text-lg font-semibold text-neon-cyan">{resume.detected_skills.length}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-widest text-slate-500">Projects</p>
                    <p className="mt-0.5 text-lg font-semibold text-neon-violet">{resume.detected_projects.length}</p>
                  </div>
                </div>

                {resume.detected_skills?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Detected Skills</p>
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-ink-950/40 p-2">
                      <div className="flex flex-wrap gap-1.5">
                        {resume.detected_skills.slice(0, 40).map((s) => (
                          <span key={s} className="rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-0.5 text-xs text-slate-200">
                            {s}
                          </span>
                        ))}
                        {resume.detected_skills.length > 40 && (
                          <span className="px-2 py-0.5 text-xs text-slate-500">+{resume.detected_skills.length - 40} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {resume.detected_projects?.length > 0 && (
                  <details className="group">
                    <summary className="cursor-pointer list-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] group-open:border-neon-violet/40">
                      <span className="flex items-center justify-between">
                        View extracted projects ({resume.detected_projects.length})
                        <span className="transition-transform group-open:rotate-180">▼</span>
                      </span>
                    </summary>
                    <ul className="mt-3 space-y-2">
                      {resume.detected_projects.map((p, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs leading-relaxed text-slate-300"
                        >
                          {p}
                        </motion.li>
                      ))}
                    </ul>
                  </details>
                )}
              </motion.div>
            )}
          </div>
        </motion.section>
      </div>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass glass-hover relative overflow-hidden p-6">
        <div className="absolute -top-36 -right-36 h-72 w-72 rounded-full bg-neon-violet/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-28 h-60 w-60 rounded-full bg-neon-cyan/15 blur-3xl" />
        <div className="relative z-10">
          <h2 className="font-display mb-1 flex items-center gap-2 text-xl font-semibold text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-violet to-neon-cyan text-ink-950 shadow-[0_0_40px_-12px_rgb(139_92_246/0.9)]">🎯</span>
            Your Target Role
          </h2>
          <p className="mb-5 text-sm text-slate-400">
            Choose your goal — every score, roadmap, project recommendation and company match will be tailored to it.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(roleGroups).map(([category, list], gIdx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + gIdx * 0.03 }}
                className="flex flex-col rounded-2xl border border-white/15 bg-white/[0.03] p-4 shadow-inner backdrop-blur-xl"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{category}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-400">{list.length} roles</span>
                </div>
                <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                  {list.map((r) => (
                    <motion.button
                      key={r.title}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => saveGoal(r.title)}
                      className={`group w-full rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 ${
                        goal === r.title
                          ? 'border-neon-violet/70 bg-gradient-to-br from-neon-violet/25 to-neon-cyan/20 text-white shadow-[0_0_60px_-24px_rgb(139_92_246/0.9)]'
                          : 'border-white/15 bg-white/[0.04] text-slate-200 hover:border-white/30 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{r.title}</span>
                        {goal === r.title && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neon-emerald/90 text-xs text-ink-950 shadow-[0_0_40px_-12px_rgb(52_211_153/0.9)]">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="mt-0.5 block text-[11px] text-slate-400 transition group-hover:text-slate-300">
                        {r.skill_count} skills • {r.required?.length || 0} required
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/[0.04] p-4 shadow-inner backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={runAnalysis} disabled={busy === 'analysis'} className="btn-gradient group">
                {busy === 'analysis' ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950 border-t-transparent" />
                    Analyzing your profile...
                  </>
                ) : (
                  <>
                    Run AI Gap Analysis
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </>
                )}
              </button>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                  <span className="text-neon-cyan">{skills.length}</span> skills tracked
                </span>
                {goal && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                    Goal: <span className="text-neon-violet">{goal}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}