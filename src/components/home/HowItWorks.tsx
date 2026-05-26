'use client'

import { StaggerContainer, StaggerItem } from '@/components/ui/animations'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  {
    num: '01',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="var(--blue)" strokeWidth="2" strokeLinecap="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    title: 'Inscription vérifiée',
    desc: 'Email universitaire ou certificat de scolarité validé par notre équipe sous 48h.',
    color: 'var(--blue)',
    bg: 'var(--blue-light)',
  },
  {
    num: '02',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    title: 'Explorez les offres',
    desc: 'Logements, emplois, stages, services et dons — tout est vérifié par notre équipe.',
    color: 'var(--green)',
    bg: 'var(--green-light)',
  },
  {
    num: '03',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
    title: 'Publiez une annonce',
    desc: "Bailleurs et particuliers publient gratuitement et touchent des milliers d'étudiants.",
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    num: '04',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="#7C3AED" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Échangez en sécurité',
    desc: 'Messagerie intégrée. Partagez vos coordonnées uniquement si vous le souhaitez.',
    color: '#7C3AED',
    bg: '#F3F0FF',
  },
]

export function HowItWorks() {
  const lineRef = useRef(null)
  const lineInView = useInView(lineRef, { once: true })
  const prefersReduced = useReducedMotion()

  return (
    <section style={{
      background: 'var(--bg)',
      padding: 'clamp(56px,8vw,96px) clamp(16px,4vw,24px)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vw,64px)' }}>
          <motion.p
            initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReduced ? 0 : 0.4 }}
            style={{
              fontSize: '12px', fontWeight: 700,
              color: 'var(--blue)', letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: '12px',
            }}
          >
            Comment ça marche
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: prefersReduced ? 0 : 0.1, duration: prefersReduced ? 0 : 0.5 }}
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(26px,4vw,40px)',
              color: 'var(--navy)', marginBottom: '16px',
            }}
          >
            Simple, rapide, sécurisé
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: prefersReduced ? 0 : 0.2, duration: prefersReduced ? 0 : 0.4 }}
            style={{
              fontSize: '16px', color: 'var(--text-muted)',
              maxWidth: '500px', margin: '0 auto', lineHeight: 1.7,
            }}
          >
            De l&apos;inscription à la mise en relation, tout est pensé
            pour vous protéger.
          </motion.p>
        </div>

        {/* Steps avec ligne de connexion */}
        <div style={{ position: 'relative' }}>

          {/* Ligne de connexion (desktop) */}
          <div ref={lineRef} style={{
            position: 'absolute',
            top: '44px', left: '12.5%', right: '12.5%',
            height: '2px',
            background: 'var(--border)',
            display: 'none',
          }}
            className="steps-line"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={lineInView ? { scaleX: 1 } : {}}
              transition={{
                duration: prefersReduced ? 0 : 1.4,
                delay: prefersReduced ? 0 : 0.5,
                ease: 'easeInOut',
              }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--blue), var(--green), #F59E0B, #7C3AED)',
                transformOrigin: 'left',
              }}
            />
          </div>

          <StaggerContainer staggerDelay={0.15}>
            <div
              className="how-it-works-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'clamp(16px,3vw,24px)',
              }}
            >
              {steps.map((step) => (
                <StaggerItem key={step.num}>
                  <motion.div
                    whileHover={prefersReduced ? {} : { y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      padding: '32px 28px',
                      textAlign: 'center',
                      position: 'relative',
                      height: '100%',
                    }}
                  >
                    {/* Numéro */}
                    <div style={{
                      position: 'absolute', top: '16px', right: '16px',
                      fontSize: '11px', fontWeight: 800,
                      color: step.color, opacity: 0.5,
                      letterSpacing: '0.05em',
                    }}>
                      {step.num}
                    </div>

                    {/* Icône */}
                    <div style={{
                      width: '72px', height: '72px',
                      borderRadius: '20px',
                      background: step.bg,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}>
                      {step.icon}
                    </div>

                    <h3 style={{
                      fontFamily: 'var(--font-playfair), serif',
                      fontSize: '20px', color: 'var(--navy)',
                      marginBottom: '10px',
                    }}>
                      {step.title}
                    </h3>
                    <p style={{
                      fontSize: '14px', color: 'var(--text-muted)',
                      lineHeight: 1.7, margin: 0,
                    }}>
                      {step.desc}
                    </p>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </div>
    </section>
  )
}
