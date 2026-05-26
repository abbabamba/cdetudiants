'use client'

import { AnimatedCounter, FadeUp } from '@/components/ui/animations'
import { ClipboardList, Users, Clock, BadgeCheck } from 'lucide-react'

const stats = [
  {
    to: 500, suffix: '+', label: 'Offres publiées',
    Icon: ClipboardList, color: '#1B5FAD', bg: 'var(--blue-light)',
  },
  {
    to: 10000, suffix: '+', label: 'Étudiants inscrits',
    Icon: Users, color: '#059669', bg: 'var(--green-light)',
  },
  {
    to: 48, suffix: 'h', label: 'Délai de validation',
    Icon: Clock, color: '#F59E0B', bg: '#FEF3C7',
  },
  {
    to: 100, suffix: '%', label: 'Gratuit étudiant',
    Icon: BadgeCheck, color: '#7C3AED', bg: '#F3F0FF',
  },
]

export function StatsSection() {
  return (
    <section style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,24px)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div
          className="stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.1}>
              <div style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '28px 20px',
                textAlign: 'center',
              }}>
                {/* Icône Lucide dans un carré coloré */}
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '16px',
                  background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  color: s.color,
                }}>
                  <s.Icon size={24} />
                </div>

                {/* Chiffre animé */}
                <div style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: 'clamp(28px, 5vw, 40px)',
                  fontWeight: 700, color: 'var(--navy)',
                  lineHeight: 1, marginBottom: '6px',
                }}>
                  <AnimatedCounter to={s.to} suffix={s.suffix} />
                </div>

                {/* Label */}
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
