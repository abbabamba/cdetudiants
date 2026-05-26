'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, LayoutGroup } from 'framer-motion'
import {
  LayoutDashboard, FileCheck, Users, Building2,
  ArrowUpRight, LogOut, ChevronRight, Eye, GraduationCap, Home, Briefcase,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/* ── Palette ─────────────────────────────────────────────────── */
const C = {
  bg:          '#0C1526',
  bgItem:      'rgba(255,255,255,0.035)',
  activeBg:    'rgba(59,130,246,0.14)',
  activeGlow:  'rgba(59,130,246,0.08)',
  border:      'rgba(255,255,255,0.06)',
  accent:      '#3B82F6',
  accentLight: '#93C5FD',
  text:        '#E2E8F0',
  muted:       'rgba(148,163,184,0.65)',
  label:       'rgba(100,116,139,0.8)',
  danger:      'rgba(239,68,68,0.75)',
}

interface AdminSidebarProps {
  pendingCount: number
  adminEmail: string
  instanceId: 'desktop' | 'mobile'
  onLinkClick?: () => void
  noHeader?: boolean
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  badge?: number
  active: boolean
  instanceId: string
  onClick?: () => void
}

function NavItem({ href, icon, label, badge, active, instanceId, onClick }: NavItemProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative', borderRadius: '10px', marginBottom: '1px' }}>
      {active && (
        <motion.div
          layoutId={`active-${instanceId}`}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '10px',
            background: C.activeBg,
            boxShadow: `inset 0 0 0 1px rgba(59,130,246,0.2)`,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        />
      )}
      <Link
        href={href}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', gap: '9px',
          padding: '8px 10px 8px 12px',
          borderRadius: '10px',
          fontSize: '13.5px',
          fontWeight: active ? 600 : 450,
          textDecoration: 'none',
          color: active ? C.accentLight : (!active && hovered ? C.text : C.muted),
          background: !active && hovered ? C.bgItem : 'transparent',
          transition: 'color 0.12s, background 0.12s',
          minHeight: '38px',
          letterSpacing: '-0.01em',
        }}
      >
        {/* Icon container */}
        <span style={{
          width: '26px', height: '26px',
          borderRadius: '7px',
          background: active
            ? 'rgba(59,130,246,0.2)'
            : hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 0.12s',
          color: active ? C.accentLight : C.muted,
        }}>
          {icon}
        </span>

        <span style={{ flex: 1 }}>{label}</span>

        {/* Badge count */}
        {badge !== undefined && badge > 0 && (
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: '#fff',
              fontSize: '10px', fontWeight: 700,
              padding: '1px 6px', borderRadius: '99px',
              lineHeight: '16px', minWidth: '20px',
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(239,68,68,0.4)',
            }}
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}

        {/* Active indicator chevron */}
        {active && (
          <ChevronRight size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
        )}
      </Link>
    </div>
  )
}

function PreviewButton({
  label, icon, color, loading, onClick,
}: {
  label: string
  icon: React.ReactNode
  color: string
  loading: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        padding: '7px 10px 7px 12px',
        borderRadius: '10px',
        fontSize: '13px', fontWeight: 500,
        border: 'none', width: '100%', textAlign: 'left',
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.65 : 1,
        color: hovered ? '#fff' : C.muted,
        background: hovered ? `${color}22` : 'transparent',
        transition: 'color 0.12s, background 0.12s',
        letterSpacing: '-0.01em',
        minHeight: '36px',
      }}
    >
      <span style={{
        width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
        background: hovered ? `${color}33` : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hovered ? color : C.muted,
        transition: 'background 0.12s, color 0.12s',
      }}>
        {loading ? <Eye size={13} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
      </span>
      {label}
    </button>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: 600,
      color: C.label,
      textTransform: 'uppercase',
      letterSpacing: '0.09em',
      padding: '14px 12px 5px',
    }}>
      {children}
    </div>
  )
}

export default function AdminSidebar({
  pendingCount, adminEmail, instanceId, onLinkClick,
}: AdminSidebarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [previewLoading, setPreviewLoading] = useState<'etudiant' | 'bailleur' | 'particulier' | null>(null)
  const section = searchParams.get('section')

  async function activatePreview(role: 'etudiant' | 'bailleur' | 'particulier') {
    setPreviewLoading(role)
    try {
      await fetch('/api/admin/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      onLinkClick?.()
      router.push(role === 'etudiant' ? '/etudiant' : role === 'bailleur' ? '/bailleur' : '/particulier')
      router.refresh()
    } finally {
      setPreviewLoading(null)
    }
  }

  const isActive = (key: string | null) => {
    if (key === null) return !section || section === 'dashboard'
    if (key === 'utilisateurs') return section === 'utilisateurs' || section === 'utilisateur'
    return section === key
  }

  const initials = adminEmail
    ? adminEmail.split('@')[0].slice(0, 2).toUpperCase()
    : 'AD'

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <aside style={{
      width: '260px',
      height: '100%',
      background: C.bg,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>

      {/* ── Admin profile card ─────────────────────────────────── */}
      <div style={{
        padding: '16px 14px 12px',
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '12px',
          border: `1px solid ${C.border}`,
        }}>
          {/* Avatar gradient */}
          <div style={{
            width: '36px', height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: '#fff',
            flexShrink: 0,
            boxShadow: '0 2px 10px rgba(99,102,241,0.35)',
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize: '12px', fontWeight: 600, color: C.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              margin: 0, lineHeight: 1.3,
            }}>
              {adminEmail}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#10B981', display: 'inline-block',
                boxShadow: '0 0 6px #10B98180',
              }} />
              <p style={{ fontSize: '10.5px', color: C.muted, margin: 0 }}>
                Administrateur
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '8px 10px 0' }}>
        <LayoutGroup>
          <NavItem
            href="/admin"
            icon={<LayoutDashboard size={14} />}
            label="Vue d'ensemble"
            active={isActive(null)}
            instanceId={instanceId}
            onClick={onLinkClick}
          />

          <SectionLabel>Gestion</SectionLabel>

          <NavItem
            href="/admin?section=certificats"
            icon={<FileCheck size={14} />}
            label="Certificats"
            badge={pendingCount}
            active={isActive('certificats')}
            instanceId={instanceId}
            onClick={onLinkClick}
          />
          <NavItem
            href="/admin?section=utilisateurs"
            icon={<Users size={14} />}
            label="Utilisateurs"
            active={isActive('utilisateurs')}
            instanceId={instanceId}
            onClick={onLinkClick}
          />
          <NavItem
            href="/admin?section=annonces"
            icon={<Building2 size={14} />}
            label="Annonces"
            active={isActive('annonces')}
            instanceId={instanceId}
            onClick={onLinkClick}
          />
        </LayoutGroup>
      </nav>

      {/* ── Prévisualisation ───────────────────────────────────── */}
      <div style={{ padding: '0 10px 8px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <SectionLabel>Prévisualisation</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <PreviewButton
            label="Voir comme Étudiant"
            icon={<GraduationCap size={13} />}
            color="#3B82F6"
            loading={previewLoading === 'etudiant'}
            onClick={() => activatePreview('etudiant')}
          />
          <PreviewButton
            label="Voir comme Bailleur"
            icon={<Home size={13} />}
            color="#10B981"
            loading={previewLoading === 'bailleur'}
            onClick={() => activatePreview('bailleur')}
          />
          <PreviewButton
            label="Voir comme Particulier"
            icon={<Briefcase size={13} />}
            color="#7C3AED"
            loading={previewLoading === 'particulier'}
            onClick={() => activatePreview('particulier')}
          />
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div style={{
        padding: '10px',
        borderTop: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <Link
          href="/"
          onClick={onLinkClick}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', borderRadius: '9px',
            fontSize: '12.5px', color: C.muted,
            textDecoration: 'none',
            transition: 'color 0.12s, background 0.12s',
            marginBottom: '2px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.bgItem
            e.currentTarget.style.color = C.text
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = C.muted
          }}
        >
          <ArrowUpRight size={13} style={{ opacity: 0.6 }} />
          Voir le site
        </Link>

        <button
          onClick={handleSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            width: '100%', padding: '8px 12px', borderRadius: '9px',
            fontSize: '12.5px', color: C.danger,
            background: 'transparent', border: 'none',
            cursor: 'pointer', textAlign: 'left',
            transition: 'background 0.12s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut size={13} style={{ opacity: 0.7 }} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
