import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api, { errorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    field_of_study: user?.field_of_study || '',
    graduation_year: user?.graduation_year || '',
    target_role: user?.target_role || '',
  })
  const [roles, setRoles] = useState([])
  const [skills, setSkills] = useState([])
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    Promise.allSettled([api.get('/api/meta/roles'), api.get('/api/me/skills')]).then(([r, s]) => {
      if (r.status === 'fulfilled') setRoles(r.value.data)
      if (s.status === 'fulfilled') setSkills(s.value.data)
    })
  }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      const { data } = await api.put('/api/me', {
        name: form.name,
        field_of_study: form.field_of_study || null,
        graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
        target_role: form.target_role || null,
      })
      setUser(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(errorMessage(err, 'Could not save profile'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-slate-400">Your details shape every recommendation ResumeRadar makes.</p>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} onSubmit={save} className="glass space-y-4 p-6">
        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.name} onChange={set('name')} required minLength={2} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Field of study</label>
            <input className="input" value={form.field_of_study} onChange={set('field_of_study')} placeholder="B.Tech CSE" />
          </div>
          <div>
            <label className="label">Graduation year</label>
            <input className="input" type="number" min={2020} max={2035} value={form.graduation_year} onChange={set('graduation_year')} placeholder="2027" />
          </div>
        </div>
        <div>
          <label className="label">Target role (main goal)</label>
          <select className="input" value={form.target_role} onChange={set('target_role')}>
            <option value="" className="bg-ink-800">— Not set —</option>
            {roles.map((r) => (
              <option key={r.title} value={r.title} className="bg-ink-800">
                {r.title} ({r.category})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-neon-rose/30 bg-neon-rose/10 px-4 py-3 text-sm text-neon-rose">{error}</div>
        )}
        {saved && (
          <div className="rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 px-4 py-3 text-sm text-neon-emerald">
            ✓ Profile saved
          </div>
        )}

        <button className="btn-gradient" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </motion.form>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6">
        <h3 className="font-display mb-4 font-semibold text-white">Account & data</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">Email</dt>
            <dd className="text-slate-200">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Skills tracked</dt>
            <dd className="text-slate-200">{skills.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Member since</dt>
            <dd className="text-slate-200">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-lg bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-500">
          🔒 Your password is bcrypt-hashed. Resume files, skills and analyses live in your local
          database. AI processing happens on-device via Ollama — nothing is sent to external servers.
          Job &amp; company data is sourced from public LinkedIn posting datasets.
        </p>
      </motion.div>
    </div>
  )
}
