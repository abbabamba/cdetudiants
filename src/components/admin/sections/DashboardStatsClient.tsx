'use client'

import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/ui/animations'
import { GraduationCap, Building, Home, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

type IconType = 'students' | 'landlords' | 'listings' | 'pending' | 'flagged'

const iconMap: Record<IconType, { el: React.ReactNode; bg: string }> = {
  students:  { el: <GraduationCap size={20} color="var(--blue)" />,       bg: 'var(--blue-light)'  },
  landlords: { el: <Building size={20} color="var(--green)" />,            bg: 'var(--green-light)' },
  listings:  { el: <Home size={20} color="var(--blue)" />,                 bg: 'var(--blue-light)'  },
  pending:   { el: <Clock size={20} color="#F59E0B" />,                    bg: '#FEF3C7'            },
  flagged:   { el: <AlertTriangle size={20} color="var(--error)" />,       bg: 'var(--error-light)' },
}

export interface StatData {
  type: IconType
  value: number
  label: string
  highlight?: boolean
  linkLabel?: string
  linkHref?: string
  linkColor?: string
}

export function DashboardStatsClient({ stats }: { stats: StatData[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
      gap: '16px',
      marginBottom: '32px',
    }}>
      {stats.map((stat, i) => {
        const { el: icon, bg: iconBg } = iconMap[stat.type]
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: 'var(--surface)',
              border: stat.highlight ? '1.5px solid #F59E0B' : '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px 24px',
            }}
            className="card-hover"
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '12px',
            }}>
              {icon}
            </div>
            <div style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: '32px', fontWeight: 700,
              color: 'var(--navy)', lineHeight: 1, marginBottom: '4px',
            }}>
              <AnimatedCounter to={stat.value} duration={1.2} />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</div>
            {stat.linkLabel && stat.linkHref && (
              <Link href={stat.linkHref} style={{
                display: 'inline-block', marginTop: '8px',
                fontSize: '12px', color: stat.linkColor ?? 'var(--blue)',
                textDecoration: 'none', fontWeight: 600,
              }}>
                {stat.linkLabel}
              </Link>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
