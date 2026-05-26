'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'

type Statut = 'non_verifie' | 'verifie_email' | 'en_attente_admin' | 'verifie_admin'

interface Props {
  statut: Statut
}

const STEPS = [
  { label: 'Compte créé',          done: (_: Statut) => true },
  { label: 'Email vérifié',        done: (s: Statut) => s === 'verifie_email' || s === 'en_attente_admin' || s === 'verifie_admin' },
  { label: 'Documents envoyés',    done: (s: Statut) => s === 'en_attente_admin' || s === 'verifie_admin' },
  { label: 'Validation (48h)',      done: (s: Statut) => s === 'verifie_admin' },
]

const MESSAGES: Record<Statut, string> = {
  non_verifie:      'Vérifiez votre email pour continuer',
  verifie_email:    'Téléchargez vos documents pour avancer',
  en_attente_admin: "Votre dossier est en cours d'examen",
  verifie_admin:    'Votre profil est vérifié !',
}

const COLORS: Record<Statut, { bg: string; border: string; text: string; accent: string }> = {
  non_verifie:      { bg: '#FEF9EE', border: '#FDE68A', text: '#92400E', accent: '#D97706' },
  verifie_email:    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', accent: '#3B82F6' },
  en_attente_admin: { bg: '#FFF7ED', border: '#FED7AA', text: '#92400E', accent: '#D97706' },
  verifie_admin:    { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', accent: '#22C55E' },
}

export function VerificationTimeline({ statut }: Props) {
  const c = COLORS[statut]
  const currentStep = STEPS.findIndex(s => !s.done(statut))
  const activeIdx = currentStep === -1 ? STEPS.length - 1 : currentStep

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: c.accent,
            animation: statut !== 'verifie_admin' ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
            flexShrink: 0, display: 'inline-block',
          }} />
          <p style={{ fontSize: '13px', fontWeight: 600, color: c.text, margin: 0 }}>
            {MESSAGES[statut]}
          </p>
        </div>
        {statut !== 'verifie_admin' && (
          <Link
            href="/etudiant/profil"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              fontSize: '12px', color: c.accent, fontWeight: 600,
              textDecoration: 'none', flexShrink: 0,
            }}
          >
            Compléter <ChevronRight size={12} />
          </Link>
        )}
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        {STEPS.map((step, i) => {
          const done = step.done(statut)
          const isActive = i === activeIdx && statut !== 'verifie_admin'
          const isLast = i === STEPS.length - 1

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: isLast ? '0 0 auto' : 1, minWidth: 0 }}>
              {/* Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 18 }}
                >
                  {done ? (
                    <CheckCircle2
                      size={18}
                      color={c.accent}
                      fill={c.bg}
                    />
                  ) : (
                    <Circle
                      size={18}
                      color={isActive ? c.accent : '#CBD5E1'}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  )}
                </motion.div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: done || isActive ? 600 : 400,
                  color: done || isActive ? c.text : '#94A3B8',
                  whiteSpace: 'nowrap',
                  maxWidth: '64px',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}>
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div style={{ flex: 1, height: '2px', margin: '0 4px', marginBottom: '14px', background: '#E2E8F0', borderRadius: '1px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: done ? 1 : 0 }}
                    transition={{ delay: i * 0.08 + 0.1, duration: 0.3, ease: 'easeOut' }}
                    style={{ height: '100%', background: c.accent, transformOrigin: 'left', borderRadius: '1px' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
