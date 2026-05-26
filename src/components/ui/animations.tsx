'use client'

import {
  motion,
  useInView,
  useMotionValue,
  animate,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/* ── Fade up au scroll ─────────────────── */
export function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: prefersReduced ? 0 : 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: prefersReduced ? 0 : 0.6,
        delay: prefersReduced ? 0 : delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Compteur animé ───────────────────── */
export function AnimatedCounter({
  to,
  suffix = '',
  duration = 2,
}: {
  to: number
  suffix?: string
  duration?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const [display, setDisplay] = useState('0')
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!inView) return
    if (prefersReduced) {
      setDisplay(to.toString())
      return
    }
    const controls = animate(count, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v).toString()),
    })
    return controls.stop
  }, [inView, to, duration, count, prefersReduced])

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  )
}

/* ── Texte rotatif ───────────────────── */
export function RotatingText({
  phrases,
  interval = 3000,
}: {
  phrases: string[]
  interval?: number
}) {
  const [i, setI] = useState(0)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const t = setInterval(() => {
      setI(prev => (prev + 1) % phrases.length)
    }, interval)
    return () => clearInterval(t)
  }, [phrases.length, interval, prefersReduced])

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={i}
        initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: prefersReduced ? 0 : -12 }}
        transition={{ duration: prefersReduced ? 0 : 0.4, ease: 'easeInOut' }}
        style={{ display: 'inline-block' }}
      >
        {phrases[i]}
      </motion.span>
    </AnimatePresence>
  )
}

/* ── Stagger container ────────────────── */
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
}: {
  children: React.ReactNode
  staggerDelay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: prefersReduced ? 0 : staggerDelay },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: prefersReduced ? 0 : 24 },
        visible: {
          opacity: 1, y: 0,
          transition: {
            duration: prefersReduced ? 0 : 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

/* ── Hover card ───────────────────────── */
export function HoverCard({
  children,
  className = '',
  style = {},
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      className={`fm-hover-card${className ? ` ${className}` : ''}`}
      style={style}
      whileHover={prefersReduced ? {} : {
        y: -6,
        boxShadow: '0 20px 48px rgba(26,45,79,0.14)',
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: prefersReduced ? 1 : 0.98 }}
    >
      {children}
    </motion.div>
  )
}

/* ── Scroll progress bar ──────────────── */
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const p = scrollTop / (scrollHeight - clientHeight)
      setProgress(Math.min(p * 100, 100))
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '3px', zIndex: 100,
      background: 'var(--border)',
      pointerEvents: 'none',
    }}>
      <motion.div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, var(--blue), #60A5FA)',
          width: `${progress}%`,
        }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}
