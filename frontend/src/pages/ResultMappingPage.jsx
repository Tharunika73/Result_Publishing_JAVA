import React, { useState, useEffect } from 'react'
import { coeApi } from '../api/axiosInstance'
import toast from 'react-hot-toast'
import { CheckCircle2, Loader, Database, Activity, FileText, Lock } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

const adminLinkItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: Activity },
  { label: 'Script Assignment', path: '/admin/scripts', icon: FileText },
  { label: 'Result Mapping', path: '/admin/result-mapping', icon: Database },
  { label: 'Security Ledger', path: '/admin/security-ledger', icon: Lock },
]

export default function ResultMappingPage() {
  const [exams, setExams] = useState([])
  const [publishing, setPublishing] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadExams = async () => {
    try {
      const res = await coeApi.getExams()
      // Only show exams that have at least some sheets generated or evaluated
      setExams(res.data.filter(e => e.totalSheets > 0))
    } catch (err) {
      toast.error('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExams()
  }, [])

  const handlePublish = async (examId) => {
    if (!window.confirm('Are you sure you want to map anonymous sheets to student identities and publish results? This action cannot be undone.')) return
    
    setPublishing(examId)
    try {
      const r = await coeApi.publishResults(examId)
      toast.success(`Successfully published ${r.data.length} results!`)
      loadExams()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Publication failed')
    } finally {
      setPublishing(null)
    }
  }

  return (
    <DashboardLayout title="Result Mapping" linkItems={adminLinkItems}>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="section-title mb-2">Result Mapping</h2>
          <p className="text-sm text-gray-500">Map anonymous script IDs back to student identities to publish final results.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-transparent border-b border-gray-100">
                <tr>
                  <th className="table-header">Subject</th>
                  <th className="table-header">Code</th>
                  <th className="table-header">Exam Date</th>
                  <th className="table-header">Evaluated / Total</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((ex) => (
                  <tr key={ex.examId} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-gray-800">{ex.subjectName}</td>
                    <td className="table-cell font-mono text-xs text-primary-600">{ex.subjectCode}</td>
                    <td className="table-cell">{ex.examDate}</td>
                    <td className="table-cell">
                      <span className={ex.evaluatedSheets === ex.totalSheets ? 'badge-pass' : 'badge-pending'}>
                        {ex.evaluatedSheets} / {ex.totalSheets}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handlePublish(ex.examId)}
                        disabled={publishing === ex.examId || ex.evaluatedSheets === 0}
                        className={ex.evaluatedSheets === 0 ? "btn-secondary text-xs px-3 py-1.5 opacity-50 cursor-not-allowed" : "btn-success text-xs px-3 py-1.5 flex items-center gap-1"}
                      >
                        {publishing === ex.examId ? <Loader className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
                        Publish Results
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {exams.length === 0 && (
              <div className="text-center py-12">
                <Database className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active exam sessions found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
