import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, LogOut } from 'lucide-react'

export default function SidebarLayout({ children, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const adminMenuItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Script Assignment', path: '/admin/scripts' },
    { label: 'Result Mapping', path: '/admin/result-mapping' },
    { label: 'Security Ledger', path: '/admin/security-ledger' },
  ]

  const teacherMenuItems = [
    { label: 'Dashboard', path: '/teacher/dashboard' },
    { label: 'Evaluate Scripts', path: '/teacher/evaluate' },
  ]

  const studentMenuItems = [
    { label: 'Dashboard', path: '/student/dashboard' },
  ]

  const menuItems = role === 'admin' ? adminMenuItems : role === 'teacher' ? teacherMenuItems : studentMenuItems

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:translate-x-0 md:static w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out z-20 h-full flex flex-col`}>
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">SERPP</h1>
          <p className="text-xs text-gray-400 mt-1">Exam Result Portal</p>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
            <div className="text-sm">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="md:hidden bg-gray-900 text-white p-4 flex items-center justify-between">
          <h1 className="font-bold">SERPP</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
