import { useState, useEffect, useCallback } from 'react'
import { adminApi, coeApi } from '../api/axiosInstance'
import DashboardLayout from '../components/DashboardLayout'
import toast from 'react-hot-toast'
import { Users, UserPlus, Upload, BookOpen, ToggleLeft, Loader, Activity, Layers, FileText, Database, Lock } from 'lucide-react'

// ─── Exam Management ────────────────────────────────────
function ExamManagement() {
  const [exams, setExams] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subjectId: '', examDate: '', academicYear: '2024-25' })
  const [generating, setGenerating] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [examRes, subRes] = await Promise.all([coeApi.getExams(), coeApi.getSubjects()])
      setExams(examRes.data)
      setSubjects(subRes.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await coeApi.createExam({ ...form, subjectId: +form.subjectId })
      toast.success('Exam session created!')
      setShowForm(false)
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create') }
  }

  const handleGenerate = async (examId) => {
    setGenerating(examId)
    try {
      const r = await coeApi.generateSheets(examId)
      toast.success(`Generated ${r.data.length} answer sheets!`)
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Generation failed') }
    finally { setGenerating(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title mb-0">Exam Sessions</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-2">
          <Layers className="w-4 h-4" /> Create Exam
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6 animate-slide-up">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className="input-field" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} required>
              <option value="" className="bg-white">Select Subject</option>
              {subjects.map(s => <option key={s.subjectId} value={s.subjectId} className="bg-white">{s.subjectName} ({s.subjectCode})</option>)}
            </select>
            <input className="input-field" type="date" value={form.examDate} onChange={e => setForm({...form, examDate: e.target.value})} required />
            <input className="input-field" placeholder="Academic Year (e.g. 2024-25)" value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} required />
            <div className="md:col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" className="btn-primary text-sm">Create Session</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-transparent border-b border-gray-100">
              <tr>{['Subject','Code','Date','Year','Total Sheets','Evaluated','Action'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody>
              {exams.map(ex => (
                <tr key={ex.examId} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-medium text-gray-800">{ex.subjectName}</td>
                  <td className="table-cell font-mono text-xs text-primary-600">{ex.subjectCode}</td>
                  <td className="table-cell">{ex.examDate}</td>
                  <td className="table-cell">{ex.academicYear}</td>
                  <td className="table-cell">{ex.totalSheets}</td>
                  <td className="table-cell">{ex.evaluatedSheets}</td>
                  <td className="table-cell">
                    <button onClick={() => handleGenerate(ex.examId)} disabled={generating === ex.examId}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      {generating === ex.examId ? <Loader className="w-3 h-3 animate-spin" /> : <Layers className="w-3 h-3" />}
                      Generate IDs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {exams.length === 0 && <div className="text-center py-12 text-gray-500">No exam sessions yet</div>}
        </div>
      )}
    </div>
  )
}

// ─── User Management tab ────────────────────────────────
function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT', department: '', registerNumber: '', year: 1 })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try { const r = await adminApi.getUsers(); setUsers(r.data) }
    catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminApi.createUser(form)
      toast.success('User created!')
      setShowForm(false)
      setForm({ name: '', email: '', password: '', role: 'STUDENT', department: '', registerNumber: '', year: 1 })
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create user') }
    finally { setSaving(false) }
  }

  const handleToggle = async (id) => {
    try { await adminApi.toggleUser(id); toast.success('Status updated'); load() }
    catch { toast.error('Failed to toggle') }
  }

  const roleBadge = { ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30', COE: 'bg-blue-500/20 text-blue-400 border-blue-500/30', TEACHER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', STUDENT: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title mb-0">User Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6 animate-slide-up">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Create New User</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input-field" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              {['ADMIN','COE','TEACHER','STUDENT'].map(r => <option key={r} value={r} className="bg-white">{r}</option>)}
            </select>
            <input className="input-field" placeholder="Department" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
            {form.role === 'STUDENT' && <>
              <input className="input-field" placeholder="Register Number" value={form.registerNumber} onChange={e => setForm({...form, registerNumber: e.target.value})} />
              <input className="input-field" type="number" placeholder="Year (1-4)" min="1" max="4" value={form.year} onChange={e => setForm({...form, year: +e.target.value})} />
            </>}
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Create
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-transparent border-b border-gray-100">
                <tr>
                  {['Name','Email','Role','Status','Action'].map(h => <th key={h} className="table-header">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-gray-800">{u.name}</td>
                    <td className="table-cell text-gray-500">{u.email}</td>
                    <td className="table-cell"><span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border ${roleBadge[u.role]}`}>{u.role}</span></td>
                    <td className="table-cell"><span className={u.isActive ? 'badge-pass' : 'badge-fail'}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="table-cell">
                      <button onClick={() => handleToggle(u.id)} className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors">
                        <ToggleLeft className="w-4 h-4" /> Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="text-center py-12 text-gray-500">No users found</div>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CSV Import tab ─────────────────────────────────────
function CsvImport() {
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)

  const handleImport = async () => {
    if (!file) { toast.error('Please select a CSV file'); return }
    setImporting(true)
    try {
      const r = await adminApi.importCsv(file)
      toast.success(`Imported ${r.data.imported} students successfully!`)
      setFile(null)
    } catch (err) { toast.error(err.response?.data?.error || 'Import failed') }
    finally { setImporting(false) }
  }

  return (
    <div>
      <h2 className="section-title">Import Students from CSV</h2>
      <div className="glass-card p-8 max-w-lg">
        <p className="text-gray-500 text-sm mb-6">Upload a CSV with columns: <code className="bg-primary-50 px-1.5 py-0.5 rounded text-primary-600">name, email, password, registerNumber, department, year</code></p>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-6 hover:border-primary-500/40 transition-colors">
          <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-3">Drop your CSV here or</p>
          <label className="btn-secondary text-sm cursor-pointer">
            Browse File
            <input type="file" accept=".csv" className="hidden" onChange={e => setFile(e.target.files[0])} />
          </label>
          {file && <p className="text-primary-600 text-sm mt-3">{file.name}</p>}
        </div>
        <button onClick={handleImport} disabled={importing || !file} className="btn-primary w-full flex items-center justify-center gap-2">
          {importing ? <><Loader className="w-4 h-4 animate-spin" /> Importing...</> : <><Upload className="w-4 h-4" /> Import</>}
        </button>
      </div>
    </div>
  )
}

// ─── Audit Logs tab ─────────────────────────────────────
function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    adminApi.getAuditLogs(page, 20).then(r => {
      setLogs(r.data.content || [])
      setTotal(r.data.totalPages || 1)
    }).catch(() => toast.error('Failed to load logs')).finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      <h2 className="section-title">Audit Trail</h2>
      {loading ? <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-transparent border-b border-gray-100">
                <tr>{['Action','Resource','IP','Timestamp','Details'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.logId} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-mono text-xs text-primary-600">{l.action}</td>
                    <td className="table-cell text-xs">{l.resourceType}</td>
                    <td className="table-cell text-xs text-gray-500">{l.ipAddress}</td>
                    <td className="table-cell text-xs text-gray-500">{l.timestamp ? new Date(l.timestamp).toLocaleString() : '-'}</td>
                    <td className="table-cell text-xs text-gray-500 max-w-xs truncate">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <div className="text-center py-12 text-gray-500">No audit logs found</div>}
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary text-xs px-3 py-1.5">Previous</button>
            <span className="text-xs text-gray-500">Page {page + 1} of {total}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= total - 1} className="btn-secondary text-xs px-3 py-1.5">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stats ──────────────────────────────────────────────
function Overview({ setActiveTab }) {
  const [stats, setStats] = useState({ users: 0, students: 0, teachers: 0 })
  useEffect(() => {
    adminApi.getUsers().then(r => {
      const users = r.data
      setStats({ users: users.length, students: users.filter(u => u.role === 'STUDENT').length, teachers: users.filter(u => u.role === 'TEACHER').length })
    })
  }, [])
  return (
    <div>
      <h2 className="section-title">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.users, color: 'text-primary-600' },
          { label: 'Students', value: stats.students, color: 'text-purple-400' },
          { label: 'Teachers', value: stats.teachers, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-800 mb-2">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap mt-4">
          <button onClick={() => setActiveTab('exams')} className="btn-primary text-sm flex items-center gap-2"><Layers className="w-4 h-4" /> Manage Exams</button>
          <button onClick={() => setActiveTab('users')} className="btn-secondary text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Manage Users</button>
          <button onClick={() => setActiveTab('import')} className="btn-secondary text-sm flex items-center gap-2"><Upload className="w-4 h-4" /> Import Students</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity, content: <Overview setActiveTab={setActiveTab} /> },
    { id: 'exams', label: 'Exam Sessions', icon: Layers, content: <ExamManagement /> },
    { id: 'users', label: 'Users', icon: Users, content: <UserManagement /> },
    { id: 'import', label: 'Import CSV', icon: Upload, content: <CsvImport /> },
    { id: 'audit', label: 'Audit Logs', icon: BookOpen, content: <AuditLogs /> },
  ]

  const linkItems = [
    { label: 'Script Assignment', path: '/admin/scripts', icon: FileText },
    { label: 'Result Mapping', path: '/admin/result-mapping', icon: Database },
    { label: 'Security Ledger', path: '/admin/security-ledger', icon: Lock },
  ]

  const navItemsWithActive = navItems.map(n => ({ ...n }))

  return (
    <DashboardLayout title="Admin Dashboard" navItems={navItemsWithActive} linkItems={linkItems} />
  )
}

