import { Navigate, Route, Routes } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import SkillsPage from './pages/SkillsPage'
import AnalysisPage from './pages/AnalysisPage'
import CompaniesPage from './pages/CompaniesPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
