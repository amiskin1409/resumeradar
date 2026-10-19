import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'

// Route-level code splitting keeps the initial bundle tiny.
const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const ProjectPage = lazy(() => import('./pages/ProjectPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SkillsPage = lazy(() => import('./pages/SkillsPage'))
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'))
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon-violet border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/project" element={<ProjectPage />} />

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
    </Suspense>
  )
}
