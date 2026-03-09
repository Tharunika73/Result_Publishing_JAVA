import { Link } from 'react-router-dom'
import { Shield, ChevronRight, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold text-gray-800 tracking-tight">SAERP</span>
        </div>
        <Link to="/login" className="btn-primary flex items-center gap-2 text-sm">
          Login <ChevronRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-28 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-100 border border-primary-200 text-primary-700 text-sm font-semibold mb-8">
          <CheckCircle className="w-4 h-4" /> Secure · Anonymous · Tamper-Proof
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
          Secure Anonymous<br />
          <span className="text-primary-600">Examination Portal</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
          SAERP ensures bias-free evaluation with encrypted identities, blockchain-backed result integrity,
          and role-based access control — from examination to publication.
        </p>

        <Link to="/login" className="btn-primary text-base px-10 py-4 flex items-center gap-2 shadow-lg shadow-primary-500/30">
          Get Started <ChevronRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  )
}
