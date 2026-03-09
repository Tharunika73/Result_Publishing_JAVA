import React, { useState, useEffect } from 'react'
import { coeApi, adminApi } from '../api/axiosInstance'
import toast from 'react-hot-toast'
import { Loader, Users, CheckCircle2, Activity, Layers, FileText, Database, Lock } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

const adminLinkItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: Activity },
  { label: 'Script Assignment', path: '/admin/scripts', icon: FileText },
  { label: 'Result Mapping', path: '/admin/result-mapping', icon: Database },
  { label: 'Security Ledger', path: '/admin/security-ledger', icon: Lock },
]

export default function ScriptAssignmentPage() {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState('')
  const [sheets, setSheets] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)

  // Load initial data
  useEffect(() => {
    Promise.all([coeApi.getExams(), adminApi.getTeachers()])
      .then(([eRes, tRes]) => {
        setExams(eRes.data)
        setTeachers(tRes.data)
      })
      .catch(() => toast.error('Failed to load initial data'))
  }, [])

  // Load sheets when exam changes
  useEffect(() => {
    if (!selectedExam) {
      setSheets([])
      return
    }
    setLoading(true)
    coeApi.getSheets(selectedExam)
      .then(r => setSheets(r.data))
      .catch(() => toast.error('Failed to load sheets'))
      .finally(() => setLoading(false))
  }, [selectedExam])

  const handleAutoAssign = async () => {
    if (teachers.length === 0) {
      toast.error('No teachers exist in the system to assign to!')
      return
    }
    
    const unassigned = sheets.filter(s => s.status === 'UNASSIGNED' || !s.assignedTeacherName)
    if (unassigned.length === 0) {
      toast.info('All sheets are already assigned!')
      return
    }

    setAssigning(true)
    let successCount = 0
    let failCount = 0

    // Simple round-robin assignment
    try {
      for (let i = 0; i < unassigned.length; i++) {
        const sheet = unassigned[i]
        const teacher = teachers[i % teachers.length]
        
        try {
          await coeApi.assignTeacher({
            sheetId: sheet.sheetId,
            teacherId: teacher.id
          })
          successCount++
        } catch (e) {
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully assigned ${successCount} scripts to teachers!`)
        // Reload sheets to reflect changes
        const res = await coeApi.getSheets(selectedExam)
        setSheets(res.data)
      }
      if (failCount > 0) {
        toast.error(`Failed to assign ${failCount} scripts.`)
      }

    } finally {
      setAssigning(false)
    }
  }

  return (
    <DashboardLayout title="Script Assignment" linkItems={adminLinkItems}>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="section-title mb-2">Script Assignment</h1>
          <p className="text-sm text-gray-500">Automatically or manually distribute anonymous exam answer sheets to evaluators.</p>
        </div>

        <div className="glass-card mb-6 p-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Select Active Exam Session</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="input-field max-w-md"
          >
            <option value="" className="bg-white">-- Select Exam Session --</option>
            {exams.map(exam => (
              <option key={exam.examId} value={exam.examId} className="bg-white">
                {exam.subjectName} ({exam.subjectCode}) - Date: {exam.examDate}
              </option>
            ))}
          </select>
        </div>

        {selectedExam && (
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-800">Answer Sheets ({sheets.length})</h3>
                <p className="text-xs text-gray-500">
                  Unassigned: {sheets.filter(s => !s.assignedTeacherName && s.status === 'UNASSIGNED').length}
                </p>
              </div>
              
              <button
                onClick={handleAutoAssign}
                disabled={assigning || sheets.length === 0 || teachers.length === 0}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                {assigning ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Assigning...</>
                ) : (
                  <><Users className="w-4 h-4" /> Auto-Assign All Unassigned</>
                )}
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-primary-600" /></div>
            ) : sheets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No sheets generated for this exam yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-transparent border-b border-gray-100">
                    <tr>
                      <th className="table-header">Script Code</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Assigned Teacher</th>
                      <th className="table-header">Teacher Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheets.map(script => (
                      <tr key={script.sheetId} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                        <td className="table-cell font-mono text-sm tracking-widest text-primary-600 font-bold">
                          {script.randomCode}
                        </td>
                        <td className="table-cell">
                          <span className={script.status === 'UNASSIGNED' ? 'badge-pending' : (script.status === 'EVALUATED' ? 'badge-evaluated' : 'badge-pass')}>
                            {script.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          {script.assignedTeacherName ? (
                            <div className="flex items-center gap-1.5 text-sm text-gray-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              {script.assignedTeacherName}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="table-cell text-xs text-gray-500">
                          {script.assignedTeacherEmail || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
