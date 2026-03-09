import React, { useState } from 'react'
import { FileText, ClipboardCheck } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

const teacherLinkItems = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: FileText },
  { label: 'Evaluate Scripts', path: '/teacher/evaluate', icon: ClipboardCheck },
]

export default function TeacherEvaluationPage() {
  const [scripts, setScripts] = useState([
    { sheetId: 1, randomCode: 'S20260307001', subjectName: 'Database Systems', status: 'PENDING', marks: null },
    { sheetId: 2, randomCode: 'S20260307002', subjectName: 'Database Systems', status: 'PENDING', marks: null },
    { sheetId: 3, randomCode: 'S20260307003', subjectName: 'Database Systems', status: 'EVALUATED', marks: 85 },
    { sheetId: 4, randomCode: 'S20260307004', subjectName: 'Database Systems', status: 'PENDING', marks: null },
  ])
  const [selectedScript, setSelectedScript] = useState(null)
  const [marks, setMarks] = useState('')

  const handleSubmitMarks = (scriptId) => {
    if (!marks || marks < 0 || marks > 100) {
      alert('Please enter valid marks (0-100)')
      return
    }

    // Update the script status to EVALUATED and store marks
    setScripts(scripts.map(script => 
      script.sheetId === scriptId 
        ? { ...script, status: 'EVALUATED', marks: parseFloat(marks) }
        : script
    ))

    alert('Marks submitted successfully: ' + marks)
    setMarks('')
    setSelectedScript(null)
  }

  return (
    <DashboardLayout title="Evaluate Scripts" linkItems={teacherLinkItems}>
      <div className="animate-fade-in">
        <h1 className="section-title mb-2">Evaluate Answer Scripts</h1>
        <p className="text-sm text-gray-500 mb-6">Enter marks for each answer script. Student identities are kept anonymous.</p>

        <div className="glass-card overflow-hidden">
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
                    <td className="table-cell font-mono text-sm font-semibold text-primary-600">{script.randomCode}</td>
                    <td className="table-cell">{script.subjectName}</td>
                    <td className="table-cell">
                      <span className={script.status === 'EVALUATED' ? 'badge-pass' : 'badge-pending'}>
                        {script.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {script.status !== 'EVALUATED' && (
                        <button
                          onClick={() => setSelectedScript(script.sheetId)}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          Enter Marks
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  className="flex-1 btn-primary"
                >
                  Submit
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
