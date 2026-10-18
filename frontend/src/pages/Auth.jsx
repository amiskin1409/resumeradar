import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../api/client'
import { Logo } from '../components/AppLayout'

export default function Auth({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    field_of_study: '',
    graduation_year: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          field_of_study: form.field_of_study || null,
          graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
        })
      }
      navigate('/app')
    } catch (err) {
      setError(errorMessage(err, 'Could not sign in'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/">
            <Logo size="text-2xl" />
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8"
        >
          <h1 className="font-display text-2xl font-bold text-white">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isLogin
              ? 'Sign in to continue your journey.'
              : 'Start analyzing your resume in under a minute.'}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="label">Full name</label>
                  <input className="input" required minLength={2} value={form.name} onChange={set('name')} placeholder="Ada Lovelace" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Field of study</label>
                    <input className="input" value={form.field_of_study} onChange={set('field_of_study')} placeholder="B.Tech CSE" />
                  </div>
                  <div>
                    <label className="label">Graduation year</label>
                    <input className="input" type="number" min={2020} max={2035} value={form.graduation_year} onChange={set('graduation_year')} placeholder="2027" />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder={isLogin ? 'Your password' : 'At least 6 characters'} />
            </div>

            {error && (
              <div className="rounded-xl border border-neon-rose/30 bg-neon-rose/10 px-4 py-3 text-sm text-neon-rose">
                {error}
              </div>
            )}

            <button className="btn-gradient w-full" disabled={busy}>
              {busy ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950 border-t-transparent" />
              ) : isLogin ? (
                'Sign in →'
              ) : (
                'Create account →'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'} className="font-medium text-neon-cyan hover:underline">
              {isLogin ? 'Sign up free' : 'Sign in'}
            </Link>
          </p>
        </motion.div>
        <p className="mt-6 text-center text-xs text-slate-500">
          🔒 Passwords are bcrypt-hashed. Your analysis data stays in your local database.
        </p>
      </div>
    </div>
  )
}
