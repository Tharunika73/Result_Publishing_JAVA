import React, { useState } from 'react'
import { Activity, FileText, Database, Lock } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

const adminLinkItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: Activity },
  { label: 'Script Assignment', path: '/admin/scripts', icon: FileText },
  { label: 'Result Mapping', path: '/admin/result-mapping', icon: Database },
  { label: 'Security Ledger', path: '/admin/security-ledger', icon: Lock },
]

export default function SecurityLedgerPage() {
  const [ledger] = useState([
    { scriptId: 'S20260307001', teacherId: 101, marks: 85, previousHash: 'abc123def456abc', currentHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d', timestamp: '2026-03-07T10:15:30', isTampered: false },
    { scriptId: 'S20260307002', teacherId: 102, marks: 72, previousHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d', currentHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', timestamp: '2026-03-07T10:16:45', isTampered: false },
    { scriptId: 'S20260307003', teacherId: 103, marks: 65, previousHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d', currentHash: 'f0e1d2c3b4a59687968574635241302e', timestamp: '2026-03-07T10:18:12', isTampered: false },
    { scriptId: 'S20260307004', teacherId: 101, marks: 78, previousHash: 'f0e1d2c3b4a59687968574635241302e', currentHash: '2e1d3c4b5a6f7e8d9c0b1a2f3e4d5c6b', timestamp: '2026-03-07T10:19:55', isTampered: false },
  ])

  const [filter, setFilter] = useState('')

  const filteredLedger = filter
    ? ledger.filter(entry =>
        entry.scriptId.includes(filter) ||
        entry.teacherId.toString().includes(filter)
      )
    : ledger

  return (
    <DashboardLayout title="Security Ledger" linkItems={adminLinkItems}>
      <div className="animate-fade-in">
        <h1 className="section-title mb-2">Security Ledger</h1>
        <p className="text-sm text-gray-500 mb-6">Tamper-proof cryptographic record of all marks entries</p>

        <div className="glass-card p-6 mb-6">
          <input
            type="text"
            placeholder="Search by Script ID or Teacher ID..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-full"
          />
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-transparent border-b border-gray-100">
                <tr>
                  <th className="table-header">Script ID</th>
                  <th className="table-header">Teacher ID</th>
                  <th className="table-header">Marks</th>
                  <th className="table-header">Previous Hash</th>
                  <th className="table-header">Current Hash</th>
                  <th className="table-header">Timestamp</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-mono text-sm">{entry.scriptId}</td>
                    <td className="table-cell">{entry.teacherId}</td>
                    <td className="table-cell font-semibold">{entry.marks}</td>
                    <td className="table-cell">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                        {entry.previousHash.substring(0, 12)}...
                      </code>
                    </td>
                    <td className="table-cell">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                        {entry.currentHash.substring(0, 12)}...
                      </code>
                    </td>
                    <td className="table-cell text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="table-cell">
                      <span className={entry.isTampered ? 'badge-fail' : 'badge-pass'}>
                        {entry.isTampered ? 'TAMPERED' : 'VALID'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLedger.length === 0 && <div className="text-center py-12 text-gray-500">No entries found</div>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
