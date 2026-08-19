import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import ProfesseurDashboard from './pages/ProfesseurDashboard'
import EtudiantDashboard from './pages/EtudiantDashboard'

function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>Chargement...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRole && role !== allowedRole) return <Navigate to="/login" replace />
  return children
}

function HomeRedirect() {
  const { user, role, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />
  if (role === 'professeur') return <Navigate to="/professeur" replace />
  if (role === 'etudiant') return <Navigate to="/etudiant" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/professeur/*" element={
            <ProtectedRoute allowedRole="professeur">
              <ProfesseurDashboard />
            </ProtectedRoute>
          } />
          <Route path="/etudiant/*" element={
            <ProtectedRoute allowedRole="etudiant">
              <EtudiantDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
