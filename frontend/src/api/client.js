import axios from 'axios'

/**
 * Pre-configured axios client.
 * In dev, Vite proxies /api -> FastAPI (localhost:8000).
 * In production, set VITE_API_URL (e.g. https://your-api.onrender.com).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 180000, // AI-enhance calls on CPU can be slow
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('rr_token')
      localStorage.removeItem('rr_user')
      if (!location.pathname.includes('/login')) location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export const errorMessage = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.detail || err?.message || fallback

export default api
