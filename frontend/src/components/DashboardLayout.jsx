import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Shield, LogOut, Menu, Search, Bell, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardLayout({ children, title, navItems, linkItems }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(navItems?.[0]?.id)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const currentContent = navItems?.find(n => n.id === activeTab)?.content

  return (
    <div className="flex h-screen bg-[#f4f5f7] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-primary-600 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow">
            <Shield className="w-5 h-5 text-primary-600" />
          </div>
          <span className="text-white font-extrabold text-lg tracking-tight">SAERP</span>
        </div>

        {/* Nav Items (tabs + links) */}
        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
          {/* Tab-based nav items */}
          {navItems?.map(item => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150
                  ${active ? 'bg-white text-primary-700 shadow' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </button>
            )
          })}

          {/* Divider between tabs and links */}
          {navItems?.length > 0 && linkItems?.length > 0 && (
            <div className="border-t border-white/20 my-3" />
          )}

          {/* Link-based nav items (route navigation) */}
          {linkItems?.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150
                  ${active ? 'bg-white text-primary-700 shadow' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-3 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">{user?.name}</div>
              <div className="text-xs text-primary-200">{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Log Out */}
        <div className="p-3 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-primary-100 hover:bg-red-500 hover:text-white transition-all duration-150"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Bar */}
        <header className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-400 hover:text-primary-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-extrabold text-gray-800">{title}</h1>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              className="bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none flex-1"
              placeholder="Search..."
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-gray-800 leading-tight">{user?.name}</div>
                <div className="text-xs text-gray-400">{user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {currentContent || children}
        </main>
      </div>
    </div>
  )
}
