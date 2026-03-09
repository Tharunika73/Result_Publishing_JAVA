import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { teacherApi } from '../api/axiosInstance'
import toast from 'react-hot-toast'
import { FileText, CheckCircle, AlertCircle, ClipboardCheck } from 'lucide-react'

function AssignedSheets() {
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [marksForm, setMarksForm] = useState({})
  const [submitting, setSubmitting] = useState(null)

  const loadSheets = async () => {
    try {
      const res = await teacherApi.getSheets()
      setSheets(res.data)
    } catch (err) {
      toast.error('Failed to load sheets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSheets()
  }, [])

  const handleSubmit = async (sheetId) => {
    const marks = marksForm[sheetId]
    if (marks === undefined || marks === '') { 
      toast.error('Please enter marks')
      return 
    }
    if (+marks < 0 || +marks > 100) { 
      toast.error('Marks must be between 0-100')
      return 
    }
    setSubmitting(sheetId)
    try {
      await teacherApi.submitMarks({ sheetId, marks })
      toast.success(`Marks submitted for ${sheets.find(s => s.sheetId === sheetId)?.randomCode}!`)
      setMarksForm(prev => { const n = {...prev}; delete n[sheetId]; return n })
      loadSheets()
    } catch (err) {
      toast.error('Failed to submit marks')
    } finally {
      setSubmitting(null)
    }
  }

  const pending = sheets.filter(s => s.status === 'PENDING')
  const evaluated = sheets.filter(s => s.status === 'EVALUATED')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title mb-0">My Assigned Sheets</h2>
        <div className="flex gap-3">
          <div className="stat-card py-2 px-4 flex-row items-center gap-2">
            <span className="text-primary-600 font-bold text-lg">{pending.length}</span>
            <span className="text-xs text-gray-500">Pending</span>
          </div>
          <div className="stat-card py-2 px-4 flex-row items-center gap-2">
            <span className="text-emerald-400 font-bold text-lg">{evaluated.length}</span>
            <span className="text-xs text-gray-500">Done</span>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
          <div className="glass-card p-4 mb-6 flex items-start gap-3 border-yellow-500/30">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Anonymous Evaluation Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">You can only see anonymous sheet codes. Student identities are hidden to ensure unbiased evaluation.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><span className="animate-spin text-primary-600">⏳ Loading...</span></div>
          ) : (
            <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-transparent border-b border-gray-100">
                <tr>{['Sheet Code (Anonymous)','Subject','Exam Date','Status','Enter Marks'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody>
                {sheets.map(s => (
                  <tr key={s.sheetId} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <span className="font-mono font-black text-lg text-primary-600 tracking-widest">{s.randomCode}</span>
                    </td>
                    <td className="table-cell">{s.subjectName}</td>
                    <td className="table-cell text-gray-500">{s.examDate}</td>
                    <td className="table-cell"><span className={s.status === 'EVALUATED' ? 'badge-evaluated' : 'badge-pending'}>{s.status}</span></td>
                    <td className="table-cell">
                      {s.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min="0" max="100" step="0.5" placeholder="0–100"
                            className="input-field w-28 py-1.5 text-sm"
                            value={marksForm[s.sheetId] ?? ''}
                            onChange={e => setMarksForm(prev => ({...prev, [s.sheetId]: e.target.value}))}
                          />
                          <button onClick={() => handleSubmit(s.sheetId)} disabled={submitting === s.sheetId}
                            className="btn-success text-xs px-3 py-1.5 flex items-center gap-1">
                            {submitting === s.sheetId ? <span className="animate-spin">⏳</span> : <CheckCircle className="w-3 h-3" />}
                            Submit
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Submitted
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sheets.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No sheets assigned to you yet</p>
              </div>
            )}
          </div>
          )}
    </div>
  )
}

export default function TeacherDashboard() {
  const navItems = [
    { id: 'sheets', label: 'My Sheets', icon: FileText, content: <AssignedSheets /> },
  ]

  const linkItems = [
    { label: 'Evaluate Scripts', path: '/teacher/evaluate', icon: ClipboardCheck },
  ]

  return <DashboardLayout title="Teacher Dashboard" navItems={navItems} linkItems={linkItems} />
}
