import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import api, { errorMessage } from '../api/client'

const MODES = [
  { value: '', label: 'All modes' },
  { value: 'onsite', label: '🏢 On-site' },
  { value: 'hybrid', label: '🔀 Hybrid' },
  { value: 'remote', label: '🏠 Remote' },
]

function formatSalary(p) {
  if (!p.salary_min && !p.salary_max) return null
  const fmt = (n) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Math.round(n / 1000)}k`
  if (p.salary_min && p.salary_max) return `${fmt(p.salary_min)} – ${fmt(p.salary_max)} / yr`
  return `${fmt(p.salary_max || p.salary_min)} / yr`
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [industries, setIndustries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)

  const [mode, setMode] = useState('')
  const [industry, setIndustry] = useState('')
  const [city, setCity] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('match')

  const query = useMemo(() => {
    const q = new URLSearchParams()
    if (mode) q.set('mode', mode)
    if (industry) q.set('industry', industry)
    if (city) q.set('city', city)
    if (search) q.set('search', search)
    if (sort) q.set('sort', sort)
    return q.toString()
  }, [mode, industry, city, search, sort])

  useEffect(() => {
    api
      .get('/api/companies/industries')
      .then(({ data }) => setIndustries(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      api
        .get(`/api/companies${query ? `?${query}` : ''}`)
        .then(({ data }) => {
          setCompanies(data)
          setError('')
        })
        .catch((err) => setError(errorMessage(err, 'Could not load companies')))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-white">Companies hiring</h1>
        <p className="mt-1 text-slate-400">
          Ranked by your fit — filtered from a curated dataset of real companies and public job postings.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass flex flex-wrap items-center gap-3 p-4">
        <div className="flex gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                mode === m.value
                  ? 'bg-neon-violet/20 text-neon-violet shadow-[0_0_18px_-6px_rgb(139_92_246/0.8)]'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input !w-auto !py-2 text-xs">
          <option value="" className="bg-ink-800">All industries</option>
          {industries.map((i) => (
            <option key={i} value={i} className="bg-ink-800">{i}</option>
          ))}
        </select>

        <input
          className="input !w-auto !py-2 text-xs"
          placeholder="🏙 City (e.g. Bengaluru)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          className="input !w-44 !py-2 text-xs"
          placeholder="Search company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !ml-auto !w-auto !py-2 text-xs">
          <option value="match" className="bg-ink-800">Sort: Best match</option>
          <option value="name" className="bg-ink-800">Sort: Name A–Z</option>
          <option value="openings" className="bg-ink-800">Sort: Most openings</option>
        </select>
      </motion.div>

      {error && (
        <div className="rounded-xl border border-neon-rose/30 bg-neon-rose/10 px-4 py-3 text-sm text-neon-rose">{error}</div>
      )}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass shimmer h-56 p-6" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="glass p-12 text-center">
          <div className="mb-3 text-4xl">⬢</div>
          <h3 className="font-display text-lg font-semibold text-white">No companies match these filters</h3>
          <p className="mt-2 text-sm text-slate-400">
            Try clearing the city/industry filters, or set a target role in Skills &amp; Resume so we can rank by your fit.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {companies.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="glass glass-hover flex flex-col p-6"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">{c.name}</h3>
                  <p className="text-xs text-slate-500">
                    {c.industry || 'Various'} · {c.headquarters || 'India'} {c.size && `· ${c.size}`}
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-neon-cyan/25 bg-neon-cyan/10">
                  <span className="font-display text-sm font-bold text-neon-cyan">{Math.round(c.match_score)}</span>
                  <span className="text-[9px] text-slate-500">fit</span>
                </div>
              </div>

              {c.description && <p className="mb-3 text-xs leading-relaxed text-slate-400">{c.description}</p>}

              <div className="mb-3 flex flex-wrap gap-1.5">
                {c.modes.map((m) => (
                  <span key={m} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] text-slate-300">
                    {m === 'remote' ? '🏠' : m === 'hybrid' ? '🔀' : '🏢'} {m}
                  </span>
                ))}
                {c.locations.slice(0, 3).map((l) => (
                  <span key={l} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] text-slate-400">
                    📍 {l}
                  </span>
                ))}
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {c.hiring_roles.slice(0, 5).map((r) => (
                  <span key={r} className="rounded-md border border-neon-violet/20 bg-neon-violet/10 px-2 py-0.5 text-[10px] text-neon-violet">
                    {r}
                  </span>
                ))}
                {c.hiring_roles.length > 5 && (
                  <span className="px-1 py-0.5 text-[10px] text-slate-500">+{c.hiring_roles.length - 5}</span>
                )}
              </div>

              {c.match_reasons?.length > 0 && (
                <ul className="mb-4 space-y-1">
                  {c.match_reasons.map((r) => (
                    <li key={r} className="text-[11px] text-neon-emerald">✓ {r}</li>
                  ))}
                </ul>
              )}

              <div className="mt-auto flex flex-wrap gap-2">
                <button
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  className="btn-ghost !px-3 !py-1.5 text-xs"
                >
                  {expanded === c.id ? 'Hide openings' : `View openings (${c.sample_postings.length})`}
                </button>
                <a href={c.careers_url || c.website} target="_blank" rel="noreferrer" className="btn-gradient !px-3 !py-1.5 text-xs">
                  Apply ↗
                </a>
              </div>

              {expanded === c.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-2 overflow-hidden">
                  {c.sample_postings.map((p) => (
                    <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-slate-200">{p.title}</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            📍 {p.location || 'India'} · {p.mode}
                            {p.experience && ` · ${p.experience}`}
                          </div>
                          {formatSalary(p) && (
                            <div className="mt-1 text-[11px] font-medium text-neon-emerald">{formatSalary(p)}</div>
                          )}
                        </div>
                        <a
                          href={p.apply_url || c.careers_url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-2.5 py-1 text-[11px] font-medium text-neon-cyan transition-colors hover:bg-neon-cyan/20"
                        >
                          Apply ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
