import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { studentApi } from '../api/axiosInstance'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, BookOpen, BarChart2, GraduationCap,
  Calendar, Settings, LogOut, Shield, Search, Bell,
  MessageSquare, ChevronRight, Award, Download, ChevronLeft,
  Loader, User, Mail, Hash, Building, BookMarked
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

// ─── Color helpers ────────────────────────────────────────
const SUBJECT_COLORS = ['#7c3aed', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#06b6d4', '#8b5cf6']
const SUBJECT_BGS    = ['#ede9fe', '#fee2e2', '#d1fae5', '#fef3c7', '#dbeafe', '#fce7f3', '#cffafe', '#e9d5ff']
const SUBJECT_ICONS  = ['📊', '🌐', '🔬', '📐', '💻', '🎨', '📚', '🧪']
const GRADE_COLORS   = { 'O': '#10b981', 'A+': '#10b981', 'A': '#22c55e', 'B+': '#3b82f6', 'B': '#6366f1', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444' }

function getSubjectMeta(index) {
  return {
    color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
    bg: SUBJECT_BGS[index % SUBJECT_BGS.length],
    icon: SUBJECT_ICONS[index % SUBJECT_ICONS.length],
  }
}

// ─── Mini Calendar ────────────────────────────────────────
function MiniCalendar({ examDates }) {
  const today = new Date()
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year  = current.getFullYear()
  const month = current.getMonth()
  const monthName = current.toLocaleString('default', { month: 'long' })

  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  for (let i = 0; i < offset; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const isToday = (d) =>
    d && d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const isExamDay = (d) => {
    if (!d || !examDates) return false
    return examDates.some(ed => {
      const eDate = new Date(ed)
      return eDate.getDate() === d && eDate.getMonth() === month && eDate.getFullYear() === year
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-gray-800">{monthName}, {year}</span>
        <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((d, i) => (
          <div key={i} className="flex items-center justify-center">
            {d && (
              <button className={`w-7 h-7 text-xs rounded-full flex items-center justify-center font-semibold transition-colors
                ${isToday(d)    ? 'bg-primary-600 text-white shadow'           : ''}
                ${isExamDay(d) && !isToday(d) ? 'bg-red-500 text-white'     : ''}
                ${!isToday(d) && !isExamDay(d) ? 'hover:bg-gray-100 text-gray-700' : ''}
              `}>
                {d}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard Tab ────────────────────────────────────────
function DashboardTab({ results, courses, user, loading }) {
  if (loading) return <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>

  const passedCount = results.filter(r => r.status === 'PASS').length
  const registeredCourses = courses.filter(c => c.registered)

  return (
    <div className="space-y-5">
      {/* Hero Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Hello, {user?.name?.split(' ')[0] || 'Student'}!</h2>
            <p className="text-sm text-gray-500 max-w-xs">Learn anything, anywhere with us. Boost your skills with flexible online study.</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
            🎓
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Certificates Earned</p>
            <p className="text-xs text-gray-400">Pass the exam to earn your certificate.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center">
              <Award className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <div className="text-4xl font-black text-gray-800">{passedCount}</div>
              <div className="text-xs text-gray-500">Certificates</div>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">My Registered Courses</h3>
          <span className="text-xs text-gray-400">{registeredCourses.length} courses</span>
        </div>
        {registeredCourses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>You haven't registered for any courses yet. Go to the Courses tab to enroll!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {registeredCourses.map((c, i) => {
              const meta = getSubjectMeta(i)
              // Find result if evaluated
              const result = results.find(r => r.subject === c.subjectName)
              const pct = result && result.maxMarks > 0 ? Math.round((result.marks / result.maxMarks) * 100) : 0
              
              return (
                <div key={c.subjectId} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: meta.bg }}>
                      {meta.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-800 leading-tight">{c.subjectName}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{c.subjectCode} · Sem {c.semester}</div>
                    </div>
                  </div>
                  {result ? (
                    <>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                        <span>Your Score</span>
                        <span className="font-bold" style={{ color: meta.color }}>{pct}% ({result.grade})</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: meta.color }} />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 mt-4">
                      <span className="badge-pending opacity-80">Enrolled · Pending Exam</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Courses Tab ──────────────────────────────────────────
function CoursesTab({ courses, loadCourses, loading }) {
  const [registering, setRegistering] = useState(null)

  const handleRegister = async (subjectId) => {
    setRegistering(subjectId)
    try {
      await studentApi.registerCourse(subjectId)
      toast.success('Successfully registered for course!')
      loadCourses() // Reload courses to reflect updated registration status
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to register')
    } finally {
      setRegistering(null)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No courses available.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="section-title mb-6">Course Catalog</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((c, i) => {
          const meta = getSubjectMeta(i)
          return (
            <div key={c.subjectId} className={`bg-white rounded-2xl p-6 shadow-sm border transition-shadow ${c.registered ? 'border-primary-200 shadow-md ring-1 ring-primary-100' : 'border-gray-100 hover:shadow-md'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: meta.bg }}>
                  {meta.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 leading-tight">{c.subjectName}</h3>
                  <p className="text-xs text-gray-400 mt-1">{c.subjectCode} · Dept of {c.department}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm font-semibold text-gray-500">Semester {c.semester}</div>
                {c.registered ? (
                  <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Registered
                  </div>
                ) : (
                  <button 
                    onClick={() => handleRegister(c.subjectId)}
                    disabled={registering === c.subjectId}
                    className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2"
                  >
                    {registering === c.subjectId ? <Loader className="w-4 h-4 animate-spin" /> : 'Register Now'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Charts Tab ───────────────────────────────────────────
function ChartsTab({ results, loading }) {
  if (loading) return <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <BarChart2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No data to display charts. Results will appear here once published.</p>
      </div>
    )
  }

  // Bar chart data
  const barData = results.map((r, i) => ({
    subject: r.subject.length > 15 ? r.subject.substring(0, 15) + '…' : r.subject,
    Marks: Number(r.marks),
    MaxMarks: Number(r.maxMarks),
    fill: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }))

  // Pie chart - grade distribution
  const gradeCounts = {}
  results.forEach(r => {
    gradeCounts[r.grade] = (gradeCounts[r.grade] || 0) + 1
  })
  const pieData = Object.entries(gradeCounts).map(([grade, count]) => ({
    name: `Grade ${grade}`,
    value: count,
    color: GRADE_COLORS[grade] || '#6b7280',
  }))

  // Score distribution
  const scoreRanges = [
    { name: '≥80%', value: results.filter(r => (r.marks / r.maxMarks) * 100 >= 80).length, color: '#10b981' },
    { name: '60–80%', value: results.filter(r => { const p = (r.marks / r.maxMarks) * 100; return p >= 60 && p < 80 }).length, color: '#f59e0b' },
    { name: '40–60%', value: results.filter(r => { const p = (r.marks / r.maxMarks) * 100; return p >= 40 && p < 60 }).length, color: '#3b82f6' },
    { name: '<40%', value: results.filter(r => (r.marks / r.maxMarks) * 100 < 40).length, color: '#ef4444' },
  ].filter(s => s.value > 0)

  return (
    <div className="space-y-5">
      <h2 className="section-title">Performance Analytics</h2>

      {/* Marks Bar Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Marks by Subject</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Marks" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            <Bar dataKey="MaxMarks" fill="#e5e7eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Score Distribution</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
            {scoreRanges.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: s.color }} />
                {s.name}
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={scoreRanges} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                startAngle={90} endAngle={-270} paddingAngle={3} dataKey="value"
                label={({ value }) => value} labelLine={false}>
                {scoreRanges.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-gray-400 -mt-2">Number of Subjects</p>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Grade Distribution</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
            {pieData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: s.color }} />
                {s.name}
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                startAngle={90} endAngle={-270} paddingAngle={3} dataKey="value"
                label={({ value }) => value} labelLine={false}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-gray-400 -mt-2">By Grade</p>
        </div>
      </div>
    </div>
  )
}

// ─── Grades Tab ───────────────────────────────────────────
function GradesTab({ results, loading }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      const res = await studentApi.downloadPdf()
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'result.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF downloaded!')
    } catch (err) {
      toast.error('Failed to download PDF')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>

  // Compute summary stats
  const totalMarks = results.reduce((sum, r) => sum + Number(r.marks), 0)
  const totalMax = results.reduce((sum, r) => sum + Number(r.maxMarks), 0)
  const overallPct = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0
  const passedCount = results.filter(r => r.status === 'PASS').length
  const failedCount = results.filter(r => r.status === 'FAIL').length

  return (
    <div>
      {/* Summary stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Subjects', value: results.length, color: 'text-primary-600' },
            { label: 'Overall Score', value: `${overallPct}%`, color: 'text-blue-500' },
            { label: 'Passed', value: passedCount, color: 'text-emerald-500' },
            { label: 'Failed', value: failedCount, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">My Results</h3>
          {results.length > 0 && (
            <button onClick={handleDownloadPdf} disabled={downloading}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
              {downloading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          )}
        </div>
        {results.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">No results published yet. Check back after exams are evaluated.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Subject', 'Marks', 'Max', 'Percentage', 'Grade', 'Status', 'Published'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const meta = getSubjectMeta(i)
                  const pct = r.maxMarks > 0 ? Math.round((r.marks / r.maxMarks) * 100) : 0
                  return (
                    <tr key={r.resultId} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-semibold">{r.subject}</td>
                      <td className="table-cell">{r.marks}</td>
                      <td className="table-cell text-gray-400">{r.maxMarks}</td>
                      <td className="table-cell">
                        <span className="font-bold" style={{ color: meta.color }}>{pct}%</span>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black"
                          style={{ background: meta.bg, color: meta.color }}>{r.grade}</span>
                      </td>
                      <td className="table-cell">
                        <span className={r.status === 'PASS' ? 'badge-pass' : 'badge-fail'}>{r.status}</span>
                      </td>
                      <td className="table-cell text-xs text-gray-400">
                        {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Calendar Tab ─────────────────────────────────────────
function CalendarTab({ exams, loading }) {
  if (loading) return <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>

  const examDates = exams.map(e => e.examDate)
  const upcomingExams = exams
    .filter(e => new Date(e.examDate) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))

  return (
    <div className="space-y-5">
      <h2 className="section-title">Exam Calendar</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Calendar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <MiniCalendar examDates={examDates} />
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary-600 inline-block" /> Today
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Exam Day
            </div>
          </div>
        </div>

        {/* Upcoming Exams List */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Upcoming Exams</h3>
          {upcomingExams.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No upcoming exams scheduled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((ex, i) => {
                const meta = getSubjectMeta(i)
                return (
                  <div key={ex.examId} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: meta.bg }}>
                      📚
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-gray-800 leading-tight">{ex.subjectName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{ex.subjectCode}</div>
                      <div className="text-xs text-gray-400 mt-0.5">📅 {new Date(ex.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {ex.academicYear}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* All Exams Table */}
      {exams.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">All Exam Sessions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Subject', 'Code', 'Date', 'Academic Year'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exams.map(ex => (
                  <tr key={ex.examId} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-semibold">{ex.subjectName}</td>
                    <td className="table-cell font-mono text-xs text-primary-600">{ex.subjectCode}</td>
                    <td className="table-cell">{new Date(ex.examDate).toLocaleDateString()}</td>
                    <td className="table-cell text-gray-500">{ex.academicYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Settings Tab ─────────────────────────────────────────
function SettingsTab({ profile, loading }) {
  if (loading) return <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>

  if (!profile) {
    return (
      <div className="text-center py-16">
        <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Unable to load profile information.</p>
      </div>
    )
  }

  const fields = [
    { icon: User, label: 'Full Name', value: profile.name },
    { icon: Mail, label: 'Email Address', value: profile.email },
    { icon: Hash, label: 'Register Number', value: profile.registerNumber },
    { icon: Building, label: 'Department', value: profile.department },
    { icon: BookMarked, label: 'Year', value: `Year ${profile.year}` },
    { icon: Shield, label: 'Role', value: profile.role },
  ]

  return (
    <div>
      <h2 className="section-title">My Profile</h2>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-2xl">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {profile.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-800">{profile.name}</h3>
            <p className="text-sm text-gray-500">{profile.department} · Year {profile.year}</p>
            <p className="text-xs text-primary-600 font-mono mt-1">{profile.registerNumber}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
              <Icon className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase">{label}</div>
                <div className="text-sm font-bold text-gray-800">{value || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Student Dashboard ───────────────────────────────
export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data states
  const [results, setResults] = useState([])
  const [exams, setExams] = useState([])
  const [profile, setProfile] = useState(null)
  const [courses, setCourses] = useState([])
  
  const [loadingResults, setLoadingResults] = useState(true)
  const [loadingExams, setLoadingExams] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(true)

  const fetchCourses = useCallback(() => {
    studentApi.getCourses()
      .then(r => setCourses(r.data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoadingCourses(false))
  }, [])

  // Fetch all data on mount
  useEffect(() => {
    studentApi.getResults()
      .then(r => setResults(r.data))
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoadingResults(false))

    studentApi.getExams()
      .then(r => setExams(r.data))
      .catch(() => { /* exams might fail if student doesn't have access, that's ok */ })
      .finally(() => setLoadingExams(false))

    studentApi.getProfile()
      .then(r => setProfile(r.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoadingProfile(false))

    fetchCourses()
  }, [fetchCourses])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses',   label: 'Courses',   icon: BookOpen },
    { id: 'charts',    label: 'Charts',    icon: BarChart2 },
    { id: 'grades',    label: 'Grades',    icon: GraduationCap },
    { id: 'calendar',  label: 'Calendar',  icon: Calendar },
    { id: 'settings',  label: 'Settings',  icon: Settings },
  ]

  // Render active tab content
  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard': return <DashboardTab results={results} courses={courses} user={user} loading={loadingResults || loadingCourses} />
      case 'courses':   return <CoursesTab courses={courses} loadCourses={fetchCourses} loading={loadingCourses} />
      case 'charts':    return <ChartsTab results={results} loading={loadingResults} />
      case 'grades':    return <GradesTab results={results} loading={loadingResults} />
      case 'calendar':  return <CalendarTab exams={exams} loading={loadingExams} />
      case 'settings':  return <SettingsTab profile={profile} loading={loadingProfile} />
      default:          return <DashboardTab results={results} courses={courses} user={user} loading={loadingResults || loadingCourses} />
    }
  }

  // Extract exam dates for the right panel calendar
  const examDates = exams.map(e => e.examDate)
  const upcomingExams = exams
    .filter(e => new Date(e.examDate) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
    .slice(0, 3)

  return (
    <div className="flex h-screen bg-[#f4f5f7] overflow-hidden">

      {/* ── LEFT SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-primary-600 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow">
            <Shield className="w-4 h-4 text-primary-600" />
          </div>
          <span className="text-white font-extrabold text-base tracking-tight">SAERP</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navLinks.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id
            return (
              <button key={id} onClick={() => { setActiveNav(id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                  ${active ? 'bg-white text-primary-700 shadow' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" /> {label}
              </button>
            )
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-3 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">{user?.name || 'Student'}</div>
              <div className="text-xs text-primary-200">Student</div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-3 pb-6">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-primary-100 hover:bg-red-500 hover:text-white transition-all">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── MIDDLE CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-primary-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-extrabold text-gray-800">Dashboard</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 w-56">
            <Search className="w-4 h-4 text-gray-400" />
            <input className="bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none flex-1" placeholder="Search..." />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <main className="flex-1 overflow-y-auto p-5 animate-fade-in">
          {renderContent()}
        </main>
      </div>

      {/* ── RIGHT PANEL ── */}
      <aside className="hidden xl:flex w-64 flex-col bg-white border-l border-gray-100 p-5 flex-shrink-0 overflow-y-auto">
        {/* User */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div>
            <div className="font-bold text-sm text-gray-800 leading-tight">{user?.name || 'Student'}</div>
            <div className="text-xs text-gray-400">Student</div>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-6">
          <MiniCalendar examDates={examDates} />
        </div>

        {/* Upcoming Exams */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-sm">Upcoming Exams</h3>
            {upcomingExams.length > 0 && (
              <button onClick={() => setActiveNav('calendar')} className="text-xs text-primary-600 font-semibold hover:underline">See all</button>
            )}
          </div>
          {loadingExams ? (
            <div className="flex justify-center py-4"><Loader className="w-5 h-5 animate-spin text-primary-600" /></div>
          ) : upcomingExams.length === 0 ? (
            <p className="text-xs text-gray-400">No upcoming exams</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((ex, i) => {
                const meta = getSubjectMeta(i)
                return (
                  <div key={ex.examId} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: meta.bg }}>
                      📚
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-800 leading-tight truncate">{ex.subjectName}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{ex.subjectCode}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">📅 {new Date(ex.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
