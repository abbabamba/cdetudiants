'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export function WelcomeBanner() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className="anim-slide-right"
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'var(--green-light)',
        border: '1px solid var(--green)',
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '24px',
      }}
    >
      {/* Icône checkmark animée */}
      <div style={{ flexShrink: 0, width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline
            points="8 12 11 15 16 9"
            strokeDasharray="100"
            style={{ animation: 'checkmark 0.6s ease forwards' }}
          />
        </svg>
      </div>

      <p style={{ flex: 1, fontSize: '14px', color: 'var(--green)', fontWeight: 500, margin: 0 }}>
        Bienvenue ! Votre compte étudiant est activé.
      </p>

      <button
        onClick={() => setVisible(false)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--green)', display: 'flex', alignItems: 'center',
          padding: '4px', flexShrink: 0, minHeight: '44px', minWidth: '44px',
          justifyContent: 'center',
        }}
        aria-label="Fermer"
      >
        <X size={16} />
      </button>
    </div>
  )
}
