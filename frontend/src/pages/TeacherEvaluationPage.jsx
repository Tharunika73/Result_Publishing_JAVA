import { FileText, ClipboardCheck, Loader2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { teacherApi } from '../api/axiosInstance'
import { toast } from 'react-hot-toast'
import { useEffect, useState } from 'react'

const teacherLinkItems = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: FileText },
  { label: 'Evaluate Scripts', path: '/teacher/evaluate', icon: ClipboardCheck },
]

export default function TeacherEvaluationPage() {
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedScript, setSelectedScript] = useState(null)
  const [marks, setMarks] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadScripts = async () => {
    try {
      const res = await teacherApi.getSheets()
      setScripts(res.data)
    } catch (err) {
      toast.error('Failed to load assigned scripts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadScripts()
  }, [])

  const handleSubmitMarks = async (scriptId) => {
    if (!marks || marks < 0 || marks > 100) {
      toast.error('Please enter valid marks (0-100)')
      return
    }

    setSubmitting(true)
    try {
      await teacherApi.submitMarks({ sheetId: scriptId, marks: parseFloat(marks) })
      toast.success('Marks submitted successfully and results published!')
      setMarks('')
      setSelectedScript(null)
      loadScripts()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit marks')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Evaluate Scripts" linkItems={teacherLinkItems}>
      <div className="animate-fade-in">
        <h1 className="section-title mb-2">Evaluate Answer Scripts</h1>
        <p className="text-sm text-gray-500 mb-6">Enter marks for each answer script. Student identities are kept anonymous.</p>

        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Loading assigned scripts...</p>
            </div>
          ) : scripts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-transparent border-b border-gray-100">
                  <tr>
                    <th className="table-header">Script ID</th>
                    <th className="table-header">Subject</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scripts.map((script, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-mono text-sm font-semibold text-primary-600">
                        {script.randomCode}
                      </td>
                      <td className="table-cell">{script.subjectName}</td>
                      <td className="table-cell">
                        <span className={script.status === 'EVALUATED' ? 'badge-pass' : 'badge-pending'}>
                          {script.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        {script.status !== 'EVALUATED' ? (
                          <button
                            onClick={() => setSelectedScript(script.sheetId)}
                            className="btn-primary text-xs px-3 py-1.5"
                          >
                            Enter Marks
                          </button>
                        ) : (
                          <span className="text-emerald-500 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-full">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No scripts assigned for evaluation.</p>
            </div>
          )}
        </div>

        {/* Marks Input Modal */}
        {selectedScript && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Enter Marks</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Marks (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter marks"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleSubmitMarks(selectedScript)}
                  disabled={submitting}
                  className="flex-1 btn-primary flex justify-center items-center"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                </button>
                <button
                  onClick={() => {
                    setSelectedScript(null)
                    setMarks('')
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
