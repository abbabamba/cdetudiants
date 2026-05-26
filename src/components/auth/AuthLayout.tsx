'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3].map(i => (
        <span
          key={i}
          style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: 'currentColor', display: 'inline-block',
            animation: 'pulse-dot 1.2s ease-in-out infinite',
            animationDelay: `${(i - 1) * 0.2}s`,
          }}
        />
      ))}
    </span>
  )
}

/* ── Panneau gauche bleu/vert/violet ──────────── */
export function AuthLeftPanel({
  color = 'blue',
  title,
  bullets,
  quote,
  quoteAuthor,
}: {
  color?: 'blue' | 'green' | 'purple'
  title: string
  bullets: string[]
  quote: string
  quoteAuthor: string
}) {
  const prefersReduced = useReducedMotion()
  const bg = color === 'green' ? 'var(--green)' : color === 'purple' ? '#7C3AED' : 'var(--blue)'
  const checkColor = color === 'green' ? '#86EFAC' : color === 'purple' ? '#C4B5FD' : '#4ADE80'

  return (
    <motion.div
      className="login-left"
      initial={{ opacity: 0, x: prefersReduced ? 0 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: bg,
        padding: '48px 40px',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <Link href="/">
          <img
            src="/images/logo.jpeg"
            alt="Coin des Étudiants"
            style={{
              height: '40px', objectFit: 'contain',
              filter: 'brightness(0) invert(1)', marginBottom: '48px',
            }}
          />
        </Link>

        <h2 style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '32px', fontStyle: 'italic',
          color: '#fff', lineHeight: 1.3, marginBottom: '32px',
        }}>
          {title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          {bullets.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: prefersReduced ? 0 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: prefersReduced ? 0 : 0.4 + i * 0.1, duration: 0.4 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={checkColor} strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                {item}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <blockquote style={{
        borderLeft: '3px solid rgba(255,255,255,0.3)',
        paddingLeft: '16px', margin: 0,
      }}>
        <p style={{
          fontSize: '14px', fontStyle: 'italic',
          color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '8px',
        }}>
          &ldquo;{quote}&rdquo;
        </p>
        <footer style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
          — {quoteAuthor}
        </footer>
      </blockquote>
    </motion.div>
  )
}

/* ── Champ avec label + erreur animée ────────── */
export function AnimatedInput({
  label,
  error,
  children,
  delay = 0,
}: {
  label: string
  error?: string
  children: React.ReactNode
  delay?: number
}) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.35, delay: prefersReduced ? 0 : delay }}
    >
      <label className="form-label">{label}</label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '4px' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="form-error"
            style={{ overflow: 'hidden' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Bouton submit animé ─────────────────────── */
export function SubmitButton({
  isSubmitting,
  label,
  loadingLabel = 'Chargement...',
  color = 'blue',
}: {
  isSubmitting: boolean
  label: React.ReactNode
  loadingLabel?: string
  color?: 'blue' | 'green' | 'purple'
}) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.button
      type="submit"
      className="btn-primary"
      disabled={isSubmitting}
      style={{
        minHeight: '48px',
        marginTop: '4px',
        ...(color === 'green' ? { background: 'var(--green)' } : {}),
        ...(color === 'purple' ? { background: '#7C3AED' } : {}),
      }}
      whileTap={prefersReduced ? {} : { scale: 0.97 }}
      whileHover={
        color === 'green' && !prefersReduced
          ? { background: 'var(--green-hover)' }
          : color === 'purple' && !prefersReduced
          ? { background: '#6D28D9' }
          : {}
      }
      animate={{ opacity: isSubmitting ? 0.6 : 1 }}
      transition={{ duration: 0.15 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isSubmitting ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <LoadingDots /> {loadingLabel}
          </motion.span>
        ) : (
          <motion.span
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ── Erreur serveur animée ───────────────────── */
export function ServerError({ message }: { message: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            background: 'var(--error-light)',
            border: '1px solid #FECACA',
            borderRadius: '8px', padding: '10px 14px',
            fontSize: '13px', color: 'var(--error)',
            display: 'flex', gap: '8px', alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
