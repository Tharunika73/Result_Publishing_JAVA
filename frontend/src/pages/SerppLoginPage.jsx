import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)
      console.log('Login successful, user:', user)
      
      // Route based on role
      if (user.role === 'ADMIN') {
        console.log('Navigating to admin dashboard')
        navigate('/admin/dashboard')
      }
      else if (user.role === 'TEACHER') {
        console.log('Navigating to teacher dashboard')
        navigate('/teacher/dashboard')
      }
      else if (user.role === 'STUDENT') {
        console.log('Navigating to student dashboard')
        navigate('/student/dashboard')
      }
      else {
        console.error('Unknown role:', user.role)
        setError('Unknown user role')
      }
    } catch (err) {
      console.error('Login error details:', err)
      setError(err.response?.data?.error || 'Invalid credentials or server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
              S
            </div>
            <h1 className="text-3xl font-bold text-slate-800">SAERP</h1>
          </div>
          <p className="text-slate-500 font-medium">Secure Anonymous Exam Result Processing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 pl-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 pl-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm disabled:opacity-70 mt-4"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-sm text-slate-500">
          <p className="font-medium text-slate-700 mb-3">Demo Credentials:</p>
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="flex justify-between"><span className="font-medium">Admin:</span> admin@university.edu</p>
            <p className="flex justify-between"><span className="font-medium">Teacher:</span> teacher@university.edu</p>
            <p className="flex justify-between"><span className="font-medium">Student:</span> student@university.edu</p>
            <p className="text-center text-xs mt-2 text-slate-400 font-mono">Password: password</p>
          </div>
        </div>
      </div>
    </div>
  )
}
