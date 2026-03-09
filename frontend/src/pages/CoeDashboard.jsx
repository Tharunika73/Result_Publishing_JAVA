import { useState, useEffect, useCallback } from 'react'
import { coeApi, adminApi } from '../api/axiosInstance'
import DashboardLayout from '../components/DashboardLayout'
import toast from 'react-hot-toast'
import { Layers, UserCheck, CheckCircle2, Link, BarChart3, Loader, Shield, RefreshCw } from 'lucide-react'

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

// ─── Assign Teachers ────────────────────────────────────
function AssignTeachers() {
  const [exams, setExams] = useState([])
  const [sheets, setSheets] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedExam, setSelectedExam] = useState('')
  const [assigning, setAssigning] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([coeApi.getExams(), adminApi.getTeachers()]).then(([e, t]) => {
      setExams(e.data); setTeachers(t.data)
    })
  }, [])

  const handleExamChange = async (examId) => {
    setSelectedExam(examId)
    if (!examId) { setSheets([]); return }
    setLoading(true)
    try { const r = await coeApi.getSheets(examId); setSheets(r.data) }
    catch { toast.error('Failed to load sheets') }
    finally { setLoading(false) }
  }

  const handleAssign = async (sheetId, teacherId) => {
    setAssigning(sheetId)
    try {
      await coeApi.assignTeacher({ sheetId: +sheetId, teacherId: +teacherId })
      toast.success('Teacher assigned!')
      handleExamChange(selectedExam)
    } catch (err) { toast.error(err.response?.data?.error || 'Assignment failed') }
    finally { setAssigning(null) }
  }

  return (
    <div>
      <h2 className="section-title">Assign Teachers to Sheets</h2>
      <div className="mb-6">
        <select className="input-field max-w-sm" value={selectedExam} onChange={e => handleExamChange(e.target.value)}>
          <option value="" className="bg-white">Select Exam Session</option>
          {exams.map(ex => <option key={ex.examId} value={ex.examId} className="bg-white">{ex.subjectName} — {ex.examDate}</option>)}
        </select>
      </div>
      {loading ? <div className="flex justify-center py-8"><Loader className="w-6 h-6 animate-spin text-primary-600" /></div> : (
        sheets.length > 0 && (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-transparent border-b border-gray-100">
                <tr>{['Sheet Code','Status','Current Teacher','Assign To'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody>
                {sheets.map(s => (
                  <tr key={s.sheetId} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-mono text-primary-600 font-bold tracking-widest">{s.randomCode}</td>
                    <td className="table-cell"><span className={s.status === 'EVALUATED' ? 'badge-evaluated' : 'badge-pending'}>{s.status}</span></td>
                    <td className="table-cell text-sm text-gray-500">{s.assignedTeacherName || '—'}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <select className="input-field text-sm py-1.5 w-48" defaultValue=""
                          onChange={e => e.target.value && handleAssign(s.sheetId, e.target.value)}>
                          <option value="" className="bg-white">Select Teacher</option>
                          {teachers.map(t => <option key={t.id} value={t.id} className="bg-white">{t.name}</option>)}
                        </select>
                        {assigning === s.sheetId && <Loader className="w-4 h-4 animate-spin text-primary-600" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

// ─── Publish Results ────────────────────────────────────
function PublishResults() {
  const [exams, setExams] = useState([])
  const [publishing, setPublishing] = useState(null)
  const [results, setResults] = useState([])

  useEffect(() => { coeApi.getExams().then(r => setExams(r.data)) }, [])

  const handlePublish = async (examId) => {
    setPublishing(examId)
    try {
      const r = await coeApi.publishResults(examId)
      setResults(r.data)
      toast.success(`Published ${r.data.length} results!`)
    } catch (err) { toast.error(err.response?.data?.error || 'Publication failed') }
    finally { setPublishing(null) }
  }

  return (
    <div>
      <h2 className="section-title">Publish Exam Results</h2>
      <div className="glass-card overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-transparent border-b border-gray-100">
            <tr>{['Subject','Date','Total','Evaluated','Publish'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
          </thead>
          <tbody>
            {exams.map(ex => (
              <tr key={ex.examId} className="hover:bg-gray-50 transition-colors">
                <td className="table-cell font-medium text-gray-800">{ex.subjectName}</td>
                <td className="table-cell">{ex.examDate}</td>
                <td className="table-cell">{ex.totalSheets}</td>
                <td className="table-cell">
                  <span className={ex.evaluatedSheets === ex.totalSheets && ex.totalSheets > 0 ? 'badge-pass' : 'badge-pending'}>
                    {ex.evaluatedSheets}/{ex.totalSheets}
                  </span>
                </td>
                <td className="table-cell">
                  <button onClick={() => handlePublish(ex.examId)} disabled={publishing === ex.examId}
                    className="btn-success text-xs px-3 py-1.5 flex items-center gap-1">
                    {publishing === ex.examId ? <Loader className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Publish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {results.length > 0 && (
        <div className="glass-card overflow-hidden animate-slide-up">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Published Results ({results.length})</h3>
          </div>
          <table className="w-full">
            <thead className="bg-transparent"><tr>{['Student','Register','Subject','Marks','Grade','Status'].map(h => <th key={h} className="table-header">{h}</th>)}</tr></thead>
            <tbody>
              {results.map(r => (
                <tr key={r.resultId} className="hover:bg-gray-50">
                  <td className="table-cell">{r.studentName}</td>
                  <td className="table-cell font-mono text-xs">{r.registerNumber}</td>
                  <td className="table-cell">{r.subject}</td>
                  <td className="table-cell">{r.marks}/{r.maxMarks}</td>
                  <td className="table-cell font-bold text-primary-600">{r.grade}</td>
                  <td className="table-cell"><span className={r.status === 'PASS' ? 'badge-pass' : 'badge-fail'}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Chain Integrity ────────────────────────────────────
function ChainIntegrity() {
  const [chain, setChain] = useState([])
  const [integrity, setIntegrity] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [chainRes, verifyRes] = await Promise.all([coeApi.getChain(), coeApi.verifyChain()])
      setChain(chainRes.data)
      setIntegrity(verifyRes.data.integrity)
    } catch { toast.error('Failed to load chain') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title mb-0">Result Integrity Chain</h2>
        <div className="flex items-center gap-3">
          {integrity && <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${integrity === 'VALID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            <Shield className="w-4 h-4" /> {integrity}
          </span>}
          <button onClick={load} disabled={loading} className="btn-secondary text-sm flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Verify
          </button>
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-transparent border-b border-gray-100">
              <tr>{['Block','Sheet Code','Teacher','Marks','Hash (prev)','Hash (curr)','Status'].map(h => <th key={h} className="table-header text-xs">{h}</th>)}</tr>
            </thead>
            <tbody>
              {chain.map(b => (
                <tr key={b.blockId} className={`transition-colors ${b.tampered ? 'bg-red-500/10' : 'hover:bg-gray-50'}`}>
                  <td className="table-cell text-primary-600 font-mono">#{b.blockId}</td>
                  <td className="table-cell font-mono font-bold tracking-widest">{b.randomCode}</td>
                  <td className="table-cell text-xs">{b.teacherId}</td>
                  <td className="table-cell font-semibold">{b.marks}</td>
                  <td className="table-cell font-mono text-xs text-gray-500">{b.previousHash?.slice(0,12)}...</td>
                  <td className="table-cell font-mono text-xs text-gray-500">{b.currentHash?.slice(0,12)}...</td>
                  <td className="table-cell"><span className={b.tampered ? 'badge-fail' : 'badge-pass'}>{b.tampered ? 'TAMPERED' : 'VALID'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {chain.length === 0 && <div className="text-center py-12 text-gray-500">No chain blocks yet</div>}
        </div>
      </div>
    </div>
  )
}

export default function CoeDashboard() {
  const navItems = [
    { id: 'exams', label: 'Exam Sessions', icon: Layers, content: <ExamManagement /> },
    { id: 'assign', label: 'Assign Teachers', icon: UserCheck, content: <AssignTeachers /> },
    { id: 'publish', label: 'Publish Results', icon: CheckCircle2, content: <PublishResults /> },
    { id: 'chain', label: 'Result Chain', icon: Link, content: <ChainIntegrity /> },
  ]
  return <DashboardLayout title="COE Dashboard" navItems={navItems} />
}
