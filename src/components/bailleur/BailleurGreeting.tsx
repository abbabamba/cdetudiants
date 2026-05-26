'use client'

import { motion } from 'framer-motion'

export function BailleurGreeting({ prenom, count }: { prenom?: string; count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ marginBottom: 'clamp(18px, 3vw, 28px)' }}
    >
      <h1 style={{
        fontFamily: 'var(--font-playfair), serif',
        fontSize: 'clamp(22px, 5vw, 30px)',
        color: 'var(--navy)',
        marginBottom: '8px',
        fontWeight: 700,
        lineHeight: 1.2,
      }}>
        Bonjour{prenom ? ` ${prenom}` : ''}&nbsp;👋
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 18 }}
          style={{
            background: count > 0 ? 'var(--blue)' : 'var(--border)',
            color: count > 0 ? '#fff' : 'var(--text-muted)',
            fontSize: '13px', fontWeight: 700,
            padding: '3px 11px', borderRadius: '99px',
            display: 'inline-flex', alignItems: 'center',
          }}
        >
          {count}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.3 }}
          style={{ fontSize: '14px', color: 'var(--text-muted)' }}
        >
          annonce{count !== 1 ? 's' : ''} publiée{count !== 1 ? 's' : ''}
        </motion.span>
      </div>
    </motion.div>
  )
}
