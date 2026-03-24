import { useState, useEffect, useCallback } from 'react'
import { adminApi, coeApi } from '../api/axiosInstance'
import DashboardLayout from '../components/DashboardLayout'
import toast from 'react-hot-toast'
import {
  Users, UserPlus, Upload, BookOpen, ToggleLeft, Loader,
  Activity, Layers, FileText, Database, Lock, ChevronRight,
  CheckCircle2, Clock, AlertCircle, GraduationCap, Send,
  RefreshCw, BarChart2, BookMarked
} from 'lucide-react'

// ─── Year-wise Semester Publishing ──────────────────────────────
const YEAR_CONFIG = [
  { year: 1, semester: 1, label: 'First Year',  semLabel: 'Semester 1 (S1)', color: 'blue',   gradient: 'from-blue-500 to-blue-600' },
  { year: 2, semester: 3, label: 'Second Year', semLabel: 'Semester 3 (S3)', color: 'violet', gradient: 'from-violet-500 to-violet-600' },
  { year: 3, semester: 5, label: 'Third Year',  semLabel: 'Semester 5 (S5)', color: 'emerald',gradient: 'from-emerald-500 to-emerald-600' },
  { year: 4, semester: 7, label: 'Fourth Year', semLabel: 'Semester 7 (S7)', color: 'rose',   gradient: 'from-rose-500 to-rose-600' },
]

const COLOR_MAP = {
  blue:    { tab: 'bg-blue-600 text-white',    tabInactive: 'text-blue-600 hover:bg-blue-50',    badge: 'bg-blue-100 text-blue-700',    bar: 'bg-blue-500',    ring: 'ring-blue-200',    border: 'border-blue-200', icon: 'text-blue-500' },
  violet:  { tab: 'bg-violet-600 text-white',  tabInactive: 'text-violet-600 hover:bg-violet-50', badge: 'bg-violet-100 text-violet-700', bar: 'bg-violet-500', ring: 'ring-violet-200', border: 'border-violet-200', icon: 'text-violet-500' },
  emerald: { tab: 'bg-emerald-600 text-white', tabInactive: 'text-emerald-600 hover:bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', ring: 'ring-emerald-200', border: 'border-emerald-200', icon: 'text-emerald-500' },
  rose:    { tab: 'bg-rose-600 text-white',    tabInactive: 'text-rose-600 hover:bg-rose-50',    badge: 'bg-rose-100 text-rose-700',    bar: 'bg-rose-500',    ring: 'ring-rose-200',    border: 'border-rose-200', icon: 'text-rose-500' },
}

function ProgressBar({ value, max, colorClass }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`${colorClass} h-full rounded-full transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function SubjectRow({ sub, barColor }) {
  const done   = sub.totalSheets > 0 && sub.evaluatedSheets === sub.totalSheets
  const noExam = sub.totalSheets === 0
  const pct    = sub.totalSheets === 0 ? 0 : Math.round((sub.evaluatedSheets / sub.totalSheets) * 100)

  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start justify-between gap-4 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-gray-500">{sub.subjectCode}</span>
            {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
            {noExam && <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
          </div>
          <p className="text-sm font-medium text-gray-800 truncate">{sub.subjectName}</p>
        </div>
        <div className="text-right flex-shrink-0">
          {noExam ? (
            <span className="text-xs text-gray-400 italic">No Exam</span>
          ) : (
            <span className={`text-xs font-bold ${done ? 'text-emerald-600' : 'text-amber-500'}`}>
              {sub.evaluatedSheets}/{sub.totalSheets}
              <span className="text-gray-400 font-normal ml-1">({pct}%)</span>
            </span>
          )}
        </div>
      </div>
      {!noExam && <ProgressBar value={sub.evaluatedSheets} max={sub.totalSheets} colorClass={done ? 'bg-emerald-400' : barColor} />}
    </div>
  )
}

function YearSemesterCard({ cfg, data, publishing, onPublish }) {
  const c   = COLOR_MAP[cfg.color]
  if (!data) return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-6 bg-gray-100 rounded-xl w-1/2 mb-3" />
      <div className="h-4 bg-gray-50 rounded-xl w-full mb-2" />
      <div className="h-4 bg-gray-50 rounded-xl w-3/4" />
    </div>
  )

  const totalSubjects   = data.subjects.length
  const doneSubjects    = data.subjects.filter(s => s.totalSheets > 0 && s.evaluatedSheets === s.totalSheets).length
  const noExamSubjects  = data.subjects.filter(s => s.totalSheets === 0).length
  const overallPct      = totalSubjects === 0 ? 0 : Math.round((doneSubjects / totalSubjects) * 100)
  const isPublishing    = publishing === data.semester

  return (
    <div className={`glass-card overflow-hidden flex flex-col ring-1 ${c.ring} transition-shadow hover:shadow-lg`}>
      {/* Card header */}
      <div className={`bg-gradient-to-r ${cfg.gradient} p-5 text-white`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 opacity-90" />
            <span className="font-extrabold text-lg tracking-tight">{cfg.label}</span>
          </div>
          {data.alreadyPublished ? (
            <span className="bg-white/20 border border-white/30 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Published
            </span>
          ) : data.readyToPublish ? (
            <span className="bg-white/20 border border-white/30 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          ) : (
            <span className="bg-black/20 text-white/80 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" /> Evaluating
            </span>
          )}
        </div>
        <p className="text-white/75 text-sm font-medium">{cfg.semLabel}</p>

        {/* Overall progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/80 mb-1.5">
            <span>Evaluation Progress</span>
            <span className="font-bold">{doneSubjects}/{totalSubjects} subjects</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white/80 h-full rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="text-right text-xs text-white/70 mt-1">{overallPct}% complete</div>
        </div>
      </div>

      {/* Subjects list */}
      <div className="flex-1 p-4 bg-gray-50/40 overflow-y-auto max-h-72">
        {data.subjects.length === 0 ? (
          <div className="text-center py-8">
            <BookMarked className={`w-8 h-8 mx-auto mb-2 ${c.icon}`} />
            <p className="text-sm text-gray-400">No subjects configured for this semester.</p>
          </div>
        ) : (
          <>
            {noExamSubjects > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700">{noExamSubjects} subject(s) have no exam session yet.</p>
              </div>
            )}
            {data.subjects.map(sub => (
              <SubjectRow key={sub.subjectCode || sub.subjectName} sub={sub} barColor={c.bar} />
            ))}
          </>
        )}
      </div>

      {/* Publish footer */}
      <div className="p-4 border-t border-gray-100 bg-white">
        {data.alreadyPublished ? (
          <div className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl py-2.5">
            <CheckCircle2 className="w-4 h-4" /> Results Already Published
          </div>
        ) : (
          <button
            onClick={() => {
              if (!data.readyToPublish) {
                toast.error('We cannot publish results yet. All subjects must be fully evaluated.')
              } else {
                onPublish(data.semester)
              }
            }}
            disabled={isPublishing}
            className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl transition-all duration-200
              ${data.readyToPublish
                ? `bg-gradient-to-r ${cfg.gradient} text-white hover:opacity-90 hover:shadow-md active:scale-95`
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {isPublishing
              ? <><Loader className="w-4 h-4 animate-spin" /> Publishing...</>
              : data.readyToPublish
                ? <><Send className="w-4 h-4" /> Publish Semester {data.semester} Results</>
                : <><Clock className="w-4 h-4" /> Awaiting Full Evaluation</>}
          </button>
        )}
        {!data.alreadyPublished && !data.readyToPublish && data.subjects.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-2">
            All {totalSubjects - doneSubjects} remaining subject(s) must be fully evaluated to publish.
          </p>
        )}
      </div>
    </div>
  )
}

function YearWisePublishing() {
  const [semesterData, setSemesterData] = useState({})   // { [semester]: SemesterStatusDTO }
  const [loading, setLoading]           = useState(true)
  const [publishing, setPublishing]     = useState(null)
  const [academicYear, setAcademicYear] = useState('2024-25')
  const [activeYear, setActiveYear]     = useState(1)    // 1-4

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await coeApi.getSemesterStatuses(academicYear)
      const map = {}
      res.data.forEach(s => { map[s.semester] = s })
      setSemesterData(map)
    } catch { toast.error('Failed to load semester data') }
    finally { setLoading(false) }
  }, [academicYear])

  useEffect(() => { load() }, [load])

  const handlePublish = async (semester) => {
    setPublishing(semester)
    try {
      const r = await coeApi.publishSemester(semester, academicYear)
      toast.success(`✅ Published ${r.data.length} results for Semester ${semester}!`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Publish failed')
    } finally {
      setPublishing(null)
    }
  }

  const currentCfg  = YEAR_CONFIG[activeYear - 1]
  const currentData = semesterData[currentCfg.semester]

  // Summary counts
  const publishedCount = YEAR_CONFIG.filter(cfg => semesterData[cfg.semester]?.alreadyPublished).length
  const readyCount     = YEAR_CONFIG.filter(cfg => semesterData[cfg.semester]?.readyToPublish && !semesterData[cfg.semester]?.alreadyPublished).length

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="section-title mb-0">Year-wise Result Publishing</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage and publish semester results for each engineering year</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Academic Year</label>
          <input
            className="input-field py-1.5 px-3 text-sm w-28"
            value={academicYear}
            onChange={e => setAcademicYear(e.target.value)}
            placeholder="2024-25"
          />
          <button onClick={load} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" /> {publishedCount} / 4 Published
        </div>
        {readyCount > 0 && (
          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
            <BarChart2 className="w-3.5 h-3.5" /> {readyCount} Ready to Publish
          </div>
        )}
        <div className="flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full">
          <Clock className="w-3.5 h-3.5" /> {4 - publishedCount - readyCount} Pending Evaluation
        </div>
      </div>

      {/* Year tab selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {YEAR_CONFIG.map(cfg => {
          const d   = semesterData[cfg.semester]
          const c   = COLOR_MAP[cfg.color]
          const isActive = activeYear === cfg.year
          return (
            <button
              key={cfg.year}
              onClick={() => setActiveYear(cfg.year)}
              className={`relative flex flex-col items-center py-4 px-3 rounded-2xl border-2 transition-all duration-200 font-semibold text-sm
                ${isActive
                  ? `${c.tab} border-transparent shadow-lg shadow-${cfg.color}-200`
                  : `bg-white border-gray-100 ${c.tabInactive} hover:border-${cfg.color}-200`}`}
            >
              {/* Status dot */}
              {d && (
                <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${
                  d.alreadyPublished ? 'bg-emerald-400' : d.readyToPublish ? 'bg-blue-400 animate-pulse' : 'bg-amber-400'
                }`} />
              )}
              <GraduationCap className={`w-6 h-6 mb-1.5 ${isActive ? 'opacity-90' : ''}`} />
              <span className="font-extrabold">Year {cfg.year}</span>
              <span className={`text-xs mt-0.5 ${isActive ? 'opacity-75' : 'text-gray-400'}`}>{cfg.semLabel}</span>
              {d && !loading && (
                <span className={`mt-2 text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : d.alreadyPublished
                      ? 'bg-emerald-100 text-emerald-700'
                      : d.readyToPublish
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                }`}>
                  {d.alreadyPublished ? 'Published' : d.readyToPublish ? 'Ready' : 'Pending'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Detail card for selected year */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main detail card */}
          <div className="lg:col-span-2">
            <YearSemesterCard
              cfg={currentCfg}
              data={currentData}
              publishing={publishing}
              onPublish={handlePublish}
            />
          </div>

          {/* Right panel - all years overview */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">All Years Overview</h3>
            {YEAR_CONFIG.map(cfg => {
              const d = semesterData[cfg.semester]
              const c = COLOR_MAP[cfg.color]
              const doneCount = d ? d.subjects.filter(s => s.totalSheets > 0 && s.evaluatedSheets === s.totalSheets).length : 0
              const totalCount = d ? d.subjects.length : 0
              const pct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100)
              return (
                <button
                  key={cfg.year}
                  onClick={() => setActiveYear(cfg.year)}
                  className={`w-full text-left glass-card p-4 rounded-xl hover:shadow-md transition-all duration-200 border-l-4 ${
                    activeYear === cfg.year ? `${c.border} shadow-md` : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-sm text-gray-800">{cfg.label}</span>
                      <span className="text-xs text-gray-400 ml-2">{cfg.semLabel}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeYear === cfg.year ? c.icon : 'text-gray-300'}`} />
                  </div>
                  {d ? (
                    <>
                      <ProgressBar value={doneCount} max={totalCount} colorClass={c.bar} />
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-gray-500">{doneCount}/{totalCount} subjects evaluated</span>
                        <span className={`text-xs font-bold ${
                          d.alreadyPublished ? 'text-emerald-600' : d.readyToPublish ? 'text-blue-600' : 'text-amber-500'
                        }`}>
                          {d.alreadyPublished ? '✓ Published' : d.readyToPublish ? '▶ Ready' : `${pct}%`}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="h-1.5 bg-gray-100 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Exam Management ────────────────────────────────────
function ExamManagement() {
  const [exams, setExams]       = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ subjectId: '', examDate: '', academicYear: '2024-25' })
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
              {subjects.map(s => <option key={s.subjectId} value={s.subjectId} className="bg-white">{s.subjectName} ({s.subjectCode}) - Sem {s.semester}</option>)}
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
              <tr>{['Subject','Code','Semester','Date','Year','Total','Evaluated','Action'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody>
              {exams.map(ex => (
                <tr key={ex.examId} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-medium text-gray-800">{ex.subjectName}</td>
                  <td className="table-cell font-mono text-xs text-primary-600">{ex.subjectCode}</td>
                  <td className="table-cell">
                    <span className="text-xs bg-primary-50 text-primary-700 font-bold px-2 py-0.5 rounded-full">S{ex.semester ?? '—'}</span>
                  </td>
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

// ─── User Management ────────────────────────────────────
function UserManagement() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'STUDENT', department: '', registerNumber: '', year: 1 })
  const [saving, setSaving]   = useState(false)

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

  const roleBadge = {
    ADMIN:   'bg-red-500/20 text-red-400 border-red-500/30',
    COE:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
    TEACHER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    STUDENT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }

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
                <tr>{['Name','Email','Role','Status','Action'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
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

// ─── CSV Import ─────────────────────────────────────────
function CsvImport() {
  const [file, setFile]         = useState(null)
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

// ─── Audit Logs ─────────────────────────────────────────
function AuditLogs() {
  const [logs, setLogs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]     = useState(0)
  const [total, setTotal]   = useState(0)

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

// ─── Overview ───────────────────────────────────────────
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
          { label: 'Students',    value: stats.students, color: 'text-purple-400' },
          { label: 'Teachers',    value: stats.teachers, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setActiveTab('yearwise')} className="btn-primary text-sm flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Year-wise Results</button>
          <button onClick={() => setActiveTab('exams')}   className="btn-secondary text-sm flex items-center gap-2"><Layers className="w-4 h-4" /> Manage Exams</button>
          <button onClick={() => setActiveTab('users')}   className="btn-secondary text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Manage Users</button>
          <button onClick={() => setActiveTab('import')}  className="btn-secondary text-sm flex items-center gap-2"><Upload className="w-4 h-4" /> Import Students</button>
        </div>
      </div>
    </div>
  )
}

// ─── Admin Dashboard Root ───────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const navItems = [
    { id: 'overview',  label: 'Overview',         icon: Activity,      content: <Overview setActiveTab={setActiveTab} /> },
    { id: 'yearwise',  label: 'Year-wise Results', icon: GraduationCap, content: <YearWisePublishing /> },
    { id: 'exams',     label: 'Exam Sessions',     icon: Layers,        content: <ExamManagement /> },
    { id: 'users',     label: 'Users',             icon: Users,         content: <UserManagement /> },
    { id: 'import',    label: 'Import CSV',        icon: Upload,        content: <CsvImport /> },
    { id: 'audit',     label: 'Audit Logs',        icon: BookOpen,      content: <AuditLogs /> },
  ]

  const linkItems = [
    { label: 'Script Assignment', path: '/admin/scripts',         icon: FileText },
    { label: 'Result Mapping',    path: '/admin/result-mapping',  icon: Database },
    { label: 'Security Ledger',   path: '/admin/security-ledger', icon: Lock },
  ]

  return (
    <DashboardLayout title="Admin Dashboard" navItems={navItems} linkItems={linkItems} />
  )
}
