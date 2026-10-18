import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rr_user')) || null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(!!localStorage.getItem('rr_token'))

  // Validate the stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('rr_token')
    if (!token) return
    api
      .get('/api/auth/me')
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem('rr_user', JSON.stringify(data))
      })
      .catch(() => {
        localStorage.removeItem('rr_token')
        localStorage.removeItem('rr_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const saveSession = useCallback((data) => {
    localStorage.setItem('rr_token', data.access_token)
    localStorage.setItem('rr_user', JSON.stringify(data.user))
    setUser(data.user)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    saveSession(data)
    return data.user
  }, [saveSession])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/api/auth/register', payload)
    saveSession(data)
    return data.user
  }, [saveSession])

  const logout = useCallback(() => {
    localStorage.removeItem('rr_token')
    localStorage.removeItem('rr_user')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
