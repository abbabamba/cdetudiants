'use client'

import { Eye, X, LayoutDashboard, ArrowLeft } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  previewRole: 'etudiant' | 'bailleur' | 'particulier'
}

export function AdminPreviewBar({ previewRole }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Hidden on admin pages (covered by fixed admin panel anyway, but keep it clean)
  if (pathname.startsWith('/admin')) return null

  const config = {
    etudiant:    { label: 'Étudiant',    href: '/etudiant',    bg: 'linear-gradient(90deg, #1B5FAD 0%, #2563EB 100%)' },
    bailleur:    { label: 'Bailleur',    href: '/bailleur',    bg: 'linear-gradient(90deg, #059669 0%, #10B981 100%)' },
    particulier: { label: 'Particulier', href: '/particulier', bg: 'linear-gradient(90deg, #6D28D9 0%, #7C3AED 100%)' },
  }
  const { label, href: dashboardHref, bg } = config[previewRole]

  async function quit() {
    setLoading(true)
    await fetch('/api/admin/preview', { method: 'DELETE' })
    router.push('/admin')
    router.refresh()
  }

  return (
    <motion.div
      initial={{ y: -38, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      style={{
        background: bg,
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '0 16px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 60,
      }}
    >
      {/* Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Eye size={13} color="#fff" style={{ opacity: 0.85 }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
          Prévisualisation
        </span>
        <span style={{
          fontSize: '11px', fontWeight: 700,
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          padding: '1px 8px', borderRadius: '99px',
        }}>
          {label}
        </span>
      </div>

      <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.25)' }} />

      {/* Dashboard link */}
      <a
        href={dashboardHref}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '12px', fontWeight: 500, color: '#fff',
          textDecoration: 'none',
          padding: '3px 9px', borderRadius: '5px',
          background: 'rgba(255,255,255,0.14)',
          border: '1px solid rgba(255,255,255,0.18)',
          transition: 'background 0.12s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)' }}
      >
        <LayoutDashboard size={11} />
        Dashboard {label}
      </a>

      {/* Back to admin */}
      <a
        href="/admin"
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '12px', fontWeight: 500, color: '#fff',
          textDecoration: 'none',
          padding: '3px 9px', borderRadius: '5px',
          background: 'rgba(255,255,255,0.10)',
          border: '1px solid rgba(255,255,255,0.14)',
          transition: 'background 0.12s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)' }}
      >
        <ArrowLeft size={11} />
        Admin
      </a>

      {/* Quit preview */}
      <button
        onClick={quit}
        disabled={loading}
        title="Quitter la prévisualisation"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '24px', height: '24px',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '6px',
          cursor: loading ? 'wait' : 'pointer',
          color: '#fff',
          opacity: loading ? 0.6 : 1,
          transition: 'background 0.12s',
          padding: 0,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
      >
        <X size={12} />
      </button>
    </motion.div>
  )
}
