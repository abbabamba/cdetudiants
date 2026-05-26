'use client'

import { useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface BoutonFavoriProps {
  annonceId: string
  initialIsFavori: boolean
  size?: 'sm' | 'md'
}

const PARTICLE_ANGLES = [0, 60, 120, 180, 240, 300]

export function BoutonFavori({ annonceId, initialIsFavori, size = 'md' }: BoutonFavoriProps) {
  const [isFavori, setIsFavori] = useState(initialIsFavori)
  const [loading, setLoading] = useState(false)
  const [burst, setBurst] = useState(false)
  const heartControls = useAnimation()

  const dim = size === 'sm' ? 18 : 22
  const btnSize = size === 'sm' ? 32 : 38

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return

    const nextState = !isFavori
    setIsFavori(nextState)

    if (nextState) {
      setBurst(true)
      setTimeout(() => setBurst(false), 500)
      heartControls.start({
        scale: [1, 1.45, 0.88, 1.1, 1],
        transition: { duration: 0.42, times: [0, 0.28, 0.5, 0.72, 1] },
      })
    }

    setLoading(true)
    try {
      const res = await fetch('/api/favoris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annonceId }),
      })
      if (!res.ok) setIsFavori(prev => !prev)
      else {
        const data = await res.json()
        setIsFavori(data.isFavori)
      }
    } catch {
      setIsFavori(prev => !prev)
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {burst && PARTICLE_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: Math.cos(rad) * 20, y: Math.sin(rad) * 20, scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.018 }}
            style={{
              position: 'absolute',
              width: '5px', height: '5px',
              borderRadius: '50%',
              background: i % 2 === 0 ? '#E24B4A' : '#FF8A8A',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          />
        )
      })}

      <motion.button
        onClick={handleToggle}
        disabled={loading}
        aria-label={isFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        style={{
          background: isFavori ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)',
          border: 'none',
          borderRadius: '50%',
          width: `${btnSize}px`,
          height: `${btnSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          flexShrink: 0,
          backdropFilter: 'blur(4px)',
          boxShadow: isFavori
            ? '0 2px 10px rgba(226,75,74,0.3)'
            : '0 1px 4px rgba(0,0,0,0.12)',
        }}
      >
        <motion.svg
          animate={heartControls}
          width={dim}
          height={dim}
          viewBox="0 0 24 24"
          fill={isFavori ? '#E24B4A' : 'none'}
          stroke={isFavori ? '#E24B4A' : '#6B6560'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'fill 0.15s, stroke 0.15s' }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </motion.svg>
      </motion.button>
    </div>
  )
}
