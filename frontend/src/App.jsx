import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import CoeDashboard from './pages/CoeDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import SerppLoginPage from './pages/SerppLoginPage'
import ScriptAssignmentPage from './pages/ScriptAssignmentPage'
import ResultMappingPage from './pages/ResultMappingPage'
import TeacherEvaluationPage from './pages/TeacherEvaluationPage'
import SecurityLedgerPage from './pages/SecurityLedgerPage'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  const getDashboard = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard'
      case 'COE': return '/admin/dashboard'
      case 'TEACHER': return '/teacher/dashboard'
      case 'STUDENT': return '/student/dashboard'
      default: return '/login'
    }
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={getDashboard()} /> : <SerppLoginPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN', 'COE']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/scripts" element={<ProtectedRoute roles={['ADMIN', 'COE']}><ScriptAssignmentPage /></ProtectedRoute>} />
      <Route path="/admin/result-mapping" element={<ProtectedRoute roles={['ADMIN', 'COE']}><ResultMappingPage /></ProtectedRoute>} />
      <Route path="/admin/security-ledger" element={<ProtectedRoute roles={['ADMIN', 'COE']}><SecurityLedgerPage /></ProtectedRoute>} />
      
      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" element={<ProtectedRoute roles={['TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/evaluate" element={<ProtectedRoute roles={['TEACHER']}><TeacherEvaluationPage /></ProtectedRoute>} />
      
      {/* Student Routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
      
      {/* Legacy routes for compatibility */}
      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/coe" element={<ProtectedRoute roles={['COE']}><CoeDashboard /></ProtectedRoute>} />
      <Route path="/teacher" element={<ProtectedRoute roles={['TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e1b4b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
