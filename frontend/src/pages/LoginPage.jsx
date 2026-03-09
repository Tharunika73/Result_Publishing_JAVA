import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome, ${user.name}!`)
      const routes = { ADMIN: '/admin', COE: '/coe', TEACHER: '/teacher', STUDENT: '/student' }
      navigate(routes[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async (role) => {
    const creds = {
      ADMIN:   { email: 'admin@university.edu',   password: 'password' },
      TEACHER: { email: 'teacher@university.edu', password: 'password' },
      STUDENT: { email: 'student@university.edu', password: 'password' },
    }
    setLoading(true)
    try {
      const user = await login(creds[role].email, creds[role].password)
      toast.success(`Welcome, ${user.name}!`)
      const routes = { ADMIN: '/admin', COE: '/coe', TEACHER: '/teacher', STUDENT: '/student' }
      navigate(routes[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Demo login failed. Check if credentials exist in backend.')
      setEmail(creds[role].email)
      setPassword(creds[role].password)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f4f5f7]">

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 -right-8 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2" />

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Shield className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">SAERP</h2>
          <p className="text-primary-200 text-base leading-relaxed max-w-xs">
            Secure Anonymous Examination Result Portal — bias-free, encrypted, and tamper-proof.
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-col gap-3">
            {['🔐 AES-256 Encrypted Identities', '⛓️ Blockchain Result Integrity', '👤 Anonymous Evaluation'].map(f => (
              <div key={f} className="bg-white/10 text-primary-100 text-sm font-medium px-5 py-2.5 rounded-full">
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo (mobile) */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-800">SAERP</span>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Sign In</h1>
          <p className="text-sm text-gray-500 mb-8">Welcome back! Please enter your credentials.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                id="email" type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required disabled={loading}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button id="login-btn" type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : <><LogIn className="w-5 h-5" /> Sign In</>
              }
            </button>
          </form>

          {/* Demo access */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wider">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              {['ADMIN', 'TEACHER', 'STUDENT'].map(role => (
                <button key={role} onClick={() => demoLogin(role)}
                  className="text-xs py-2.5 px-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-700 font-bold transition-all shadow-sm">
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
