'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface ProgressBar {
  label: string
  pct: number
  color: string
  value: number
}

export function DashboardProgressClient({ bars }: { bars: ProgressBar[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 4px rgba(26,45,79,0.04)',
    }}>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--navy)', margin: '0 0 20px' }}>
        Vérifications étudiants
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {bars.map((bar, i) => (
          <div key={bar.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{bar.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '12px', fontWeight: 700,
                  color: '#fff', background: bar.color,
                  padding: '1px 7px', borderRadius: '99px',
                }}>
                  {bar.value}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>
                  {bar.pct}%
                </span>
              </div>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: `${bar.pct}%` } : { width: 0 }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  height: '100%',
                  borderRadius: '99px',
                  background: bar.color,
                  boxShadow: `0 0 8px ${bar.color}60`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
