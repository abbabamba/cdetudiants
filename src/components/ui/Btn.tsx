'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ReactNode, MouseEventHandler, CSSProperties, useState } from 'react'

export type BtnVariant = 'primary' | 'outline' | 'danger' | 'warning' | 'success' | 'ghost'
export type BtnSize = 'sm' | 'md' | 'lg'

const V_CFG: Record<BtnVariant, { base: CSSProperties; shadow: string; shimmer: string }> = {
  primary: {
    base: { background: 'linear-gradient(135deg, #1B5FAD 0%, #1e73d4 100%)', color: '#fff', border: 'none' },
    shadow: '0 8px 28px rgba(27,95,173,0.38)',
    shimmer: 'rgba(255,255,255,0.28)',
  },
  outline: {
    base: { background: 'transparent', color: 'var(--blue)', border: '1.5px solid var(--blue)' },
    shadow: '0 4px 14px rgba(27,95,173,0.15)',
    shimmer: 'rgba(27,95,173,0.09)',
  },
  danger: {
    base: { background: 'linear-gradient(135deg, #DC2626 0%, #b91c1c 100%)', color: '#fff', border: 'none' },
    shadow: '0 8px 28px rgba(220,38,38,0.36)',
    shimmer: 'rgba(255,255,255,0.24)',
  },
  warning: {
    base: { background: 'linear-gradient(135deg, #fff7ed 0%, #fef3e2 100%)', color: '#92400E', border: '1.5px solid #FED7AA' },
    shadow: '0 4px 14px rgba(217,119,6,0.22)',
    shimmer: 'rgba(217,119,6,0.12)',
  },
  success: {
    base: { background: 'linear-gradient(135deg, #2D7A3A 0%, #1a6028 100%)', color: '#fff', border: 'none' },
    shadow: '0 8px 28px rgba(45,122,58,0.36)',
    shimmer: 'rgba(255,255,255,0.24)',
  },
  ghost: {
    base: { background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' },
    shadow: '0 2px 10px rgba(0,0,0,0.09)',
    shimmer: 'rgba(0,0,0,0.04)',
  },
}

const S_CFG: Record<BtnSize, CSSProperties> = {
  sm: { fontSize: '12px', padding: '5px 12px', minHeight: '32px', borderRadius: '8px' },
  md: { fontSize: '14px', padding: '10px 20px', minHeight: '40px', borderRadius: '10px' },
  lg: { fontSize: '15px', padding: '13px 28px', minHeight: '48px', borderRadius: '12px' },
}

const GAP: Record<BtnSize, string> = { sm: '5px', md: '7px', lg: '8px' }
const ICON_SIZE: Record<BtnSize, number> = { sm: 13, md: 15, lg: 17 }

function makeVariants(off: boolean) {
  return {
    rest:  { scale: 1,    y: 0 },
    hover: off ? { scale: 1, y: 0 } : { scale: 1.025, y: -2, transition: { type: 'spring' as const, stiffness: 380, damping: 24 } },
    press: off ? { scale: 1, y: 0 } : { scale: 0.965, y:  0, transition: { type: 'spring' as const, stiffness: 500, damping: 30 } },
  }
}

function makeShimmer(off: boolean) {
  return {
    rest:  { x: '-110%' },
    hover: off ? { x: '-110%' } : { x: '110%', transition: { duration: 0.55, ease: 'easeInOut' as const } },
    press: { x: '-110%' },
  }
}

export interface BtnProps {
  children: ReactNode
  variant?: BtnVariant
  size?: BtnSize
  loading?: boolean
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset'
  icon?: ReactNode
  full?: boolean
  style?: CSSProperties
  className?: string
  title?: string
}

export function Btn({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon,
  full = false,
  style: extra,
  className,
  title,
}: BtnProps) {
  const prefersReduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const cfg = V_CFG[variant]
  const sz  = S_CFG[size]
  const off = disabled || loading || !!prefersReduced
  const V   = makeVariants(off)
  const SV  = makeShimmer(off)

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      title={title}
      initial="rest"
      whileHover="hover"
      whileTap="press"
      variants={V}
      onHoverStart={() => !(disabled || loading) && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-inter), sans-serif',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.52 : 1,
        width: full ? '100%' : undefined,
        willChange: 'transform',
        WebkitTapHighlightColor: 'transparent',
        transition: 'box-shadow 0.22s ease, opacity 0.15s',
        boxShadow: hovered && !(disabled || loading) ? cfg.shadow : 'none',
        ...cfg.base,
        ...sz,
        ...extra,
      }}
    >
      {!prefersReduced && (
        <motion.span
          variants={SV}
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, transparent 0%, ${cfg.shimmer} 50%, transparent 100%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: GAP[size] }}>
        {loading ? <Loader2 size={ICON_SIZE[size]} className="animate-spin" /> : icon}
        {children}
      </span>
    </motion.button>
  )
}
