import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/app', label: 'Dashboard', icon: '◎', end: true },
  { to: '/app/skills', label: 'Skills & Resume', icon: '⬡' },
  { to: '/app/analysis', label: 'AI Analysis', icon: '✦' },
  { to: '/app/companies', label: 'Companies', icon: '⬢' },
  { to: '/app/profile', label: 'Profile', icon: '☰' },
]

export function Logo({ size = 'text-xl' }) {
  return (
    <span className={`font-display font-bold tracking-tight ${size}`}>
      <span className="gradient-text">Resume</span>
      <span className="text-slate-300">Radar</span>
      <span className="ml-1 align-super text-xs text-neon-cyan">●</span>
    </span>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <NavLink to="/app" className="shrink-0">
            <Logo />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-slate-200">{user?.name}</div>
              <div className="text-[11px] text-slate-500">{user?.target_role || 'Set a goal'}</div>
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-neon-rose/40 hover:text-neon-rose"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-white/[0.08] text-white' : 'text-slate-400'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
