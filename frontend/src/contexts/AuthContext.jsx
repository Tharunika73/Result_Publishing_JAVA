import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('saerp_token')
    const userData = localStorage.getItem('saerp_user')
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      console.log('Login attempt:', email)
      const res = await authApi.login({ email, password })
      console.log('Login response:', res.data)
      const { token, ...userData } = res.data
      console.log('Extracted token:', token, 'userData:', userData)
      localStorage.setItem('saerp_token', token)
      localStorage.setItem('saerp_user', JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      throw error
    }
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
