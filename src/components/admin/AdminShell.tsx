'use client'

import { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Shield } from 'lucide-react'
import Link from 'next/link'
import AdminSidebar from './AdminSidebar'

interface AdminShellProps {
  pendingCount: number
  adminEmail: string
  children: React.ReactNode
}

export function AdminShell({ pendingCount, adminEmail, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    /*
     * position:fixed + inset:0 garantit que l'admin remplit exactement
     * le viewport, indépendamment du padding du root layout.
     */
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      background: '#F1F5F9',
    }}>

      {/* ── Topbar ─────────────────────────────────────────────────── */}
      <header style={{
        height: '56px',
        flexShrink: 0,
        background: '#0C1526',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 40,
      }}>

        {/* Left: logo zone */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 20px',
            height: '100%',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 12px rgba(99,102,241,0.4)',
          }}>
            <Shield size={15} color="#fff" />
          </div>
          <div className="hidden md:block">
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', margin: 0, lineHeight: 1.2 }}>
              Coin des Étudiants
            </p>
            <p style={{ fontSize: '10px', color: 'rgba(148,163,184,0.65)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Administration
            </p>
          </div>
        </div>

        {/* Separator desktop uniquement */}
        <div className="hidden md:block" style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />

        {/* Center flex spacer */}
        <div style={{ flex: 1 }} />

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '16px' }}>
          <Link
            href="/"
            className="hidden sm:flex"
            style={{
              alignItems: 'center', gap: '6px',
              fontSize: '12px', color: 'rgba(148,163,184,0.75)',
              padding: '6px 12px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.04)',
              letterSpacing: '-0.01em',
            }}
          >
            ← Retour au site
          </Link>

          {/* Hamburger mobile */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            style={{
              width: '36px', height: '36px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)',
            }}
            aria-label="Menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Desktop sidebar */}
        <div className="hidden md:flex" style={{ flexShrink: 0, flexDirection: 'column', height: '100%' }}>
          <Suspense fallback={<div style={{ width: '260px', height: '100%', background: '#0C1526' }} />}>
            <AdminSidebar
              pendingCount={pendingCount}
              adminEmail={adminEmail}
              instanceId="desktop"
            />
          </Suspense>
        </div>

        {/* Main content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          height: '100%',
          padding: 'clamp(24px, 3vw, 40px) clamp(16px, 3vw, 36px)',
        }}>
          {children}
        </main>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(3px)',
                zIndex: 48,
              }}
            />
            <motion.div
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{
                position: 'fixed', top: 0, left: 0,
                height: '100dvh', zIndex: 49,
                display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px',
                background: '#0C1526',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '7px',
                    background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Shield size={13} color="#fff" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
                    Administration
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{
                    width: '30px', height: '30px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                <Suspense fallback={null}>
                  <AdminSidebar
                    pendingCount={pendingCount}
                    adminEmail={adminEmail}
                    instanceId="mobile"
                    onLinkClick={() => setMobileOpen(false)}
                    noHeader
                  />
                </Suspense>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
