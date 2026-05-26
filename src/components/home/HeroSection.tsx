'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { RotatingText } from '@/components/ui/animations'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export function HeroSection() {
  const router = useRouter()
  const [ville, setVille] = useState('')
  const prefersReduced = useReducedMotion()
  const isMobile = useMediaQuery('(max-width: 639px)')

  const d = (n: number) => prefersReduced ? 0 : n

  const phrases = [
    'Logements vérifiés, contactez en sécurité.',
    "Offres de stage et d'alternance.",
    'Services et dons entre étudiants.',
    'Gratuit pour tous les étudiants.',
  ]

  const pills = [
    { label: 'Logement', cat: 'logement', dot: '#93C5FD' },
    { label: 'Emploi & Stage', cat: 'emploi', dot: '#6EE7B7' },
    { label: 'Services', cat: 'service', dot: '#C4B5FD' },
    { label: 'Dons', cat: 'don', dot: '#FCA5A5' },
  ]

  return (
    <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Pattern géométrique SVG en fond */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }} />

      {/* Cercles décoratifs flottants */}
      <motion.div
        animate={prefersReduced ? {} : { y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '10%', right: '5%',
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={prefersReduced ? {} : { y: [0, 15, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '15%', left: '3%',
          width: 120, height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }}
      />

      <div className="hero-inner" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-text">

          {/* Badge animé */}
          <motion.div
            initial={{ opacity: 0, y: d(-16) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d(0.5) }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '99px',
              padding: '6px 16px',
              fontSize: '12px', color: '#fff',
              fontWeight: 600, marginBottom: '24px',
            }}
          >
            <motion.span
              animate={prefersReduced ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#4ADE80', display: 'inline-block',
              }}
            />
            Plateforme étudiante vérifiée
          </motion.div>

          {/* Titre avec animation par mot */}
          <motion.h1 className="hero-title" style={{ marginBottom: '16px' }}>
            {['Trouvez,', 'publiez,', 'échangez'].map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: d(40) }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: d(0.1 + i * 0.1),
                  duration: d(0.6),
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{ display: 'inline-block', marginRight: '0.25em' }}
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.em
              initial={{ opacity: 0, y: d(40) }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: d(0.4), duration: d(0.6), ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ fontStyle: 'italic', color: '#93C5FD', display: 'inline-block' }}
            >
              en toute confiance
            </motion.em>
          </motion.h1>

          {/* Texte rotatif */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: d(0.5) }}
            className="hero-subtitle"
            style={{ minHeight: '2em' }}
          >
            <RotatingText phrases={phrases} interval={3200} />
          </motion.p>

          {/* Barre de recherche */}
          <motion.div
            initial={{ opacity: 0, y: d(20) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d(0.6), duration: d(0.5) }}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '16px',
              padding: isMobile ? '12px' : '6px 6px 6px 20px',
              gap: '8px',
              alignItems: isMobile ? 'stretch' : 'center',
              maxWidth: isMobile ? '100%' : '480px',
              marginBottom: '16px',
            }}
          >
            {!isMobile && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.6)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            )}
            <input
              value={ville}
              onChange={e => setVille(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && ville.trim()) {
                  router.push(`/annonces?ville=${encodeURIComponent(ville.trim())}`)
                }
              }}
              placeholder="Paris, Lyon, Bordeaux..."
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: '#fff', fontSize: '15px', outline: 'none',
                minHeight: isMobile ? '44px' : 'auto',
                padding: isMobile ? '0 8px' : '0',
              }}
            />
            <motion.button
              whileHover={prefersReduced ? {} : { scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
              onClick={() => {
                if (ville.trim()) {
                  router.push(`/annonces?ville=${encodeURIComponent(ville.trim())}`)
                } else {
                  router.push('/annonces')
                }
              }}
              style={{
                background: '#fff', color: 'var(--blue)',
                border: 'none', borderRadius: '12px',
                padding: '11px 20px', fontWeight: 700,
                fontSize: '14px', cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              Rechercher
            </motion.button>
          </motion.div>

          {/* Pills catégories */}
          <motion.div
            initial={{ opacity: 0, y: d(12) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d(0.65) }}
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '28px',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
          >
            {pills.map(({ label, cat, dot }) => (
              <Link
                key={cat}
                href={`/annonces?categorie=${cat}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '99px',
                  padding: '5px 12px 5px 8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{
                  width: '7px', height: '7px',
                  borderRadius: '50%',
                  background: dot,
                  flexShrink: 0,
                }} />
                {label}
              </Link>
            ))}
          </motion.div>

          {/* Boutons CTA */}
          <motion.div
            initial={{ opacity: 0, y: d(16) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d(0.75) }}
            className="hero-btns"
            style={{ justifyContent: isMobile ? 'center' : 'flex-start' }}
          >
            <motion.div
              whileHover={prefersReduced ? {} : { scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
              style={isMobile ? { width: '100%', maxWidth: '320px' } : {}}
            >
              <Link href="/annonces" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', color: 'var(--blue)', fontWeight: 700,
                padding: '13px 28px', borderRadius: '10px',
                textDecoration: 'none', fontSize: '15px',
                minHeight: '48px', minWidth: '160px',
                width: isMobile ? '100%' : 'auto',
              }}>
                Voir les annonces
              </Link>
            </motion.div>
            <motion.div
              whileHover={prefersReduced ? {} : { scale: 1.03 }}
              whileTap={prefersReduced ? {} : { scale: 0.97 }}
              style={isMobile ? { width: '100%', maxWidth: '320px' } : {}}
            >
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                border: '2px solid rgba(255,255,255,0.5)',
                color: '#fff', fontWeight: 600,
                padding: '12px 24px', borderRadius: '10px',
                textDecoration: 'none', fontSize: '14px',
                width: isMobile ? '100%' : 'auto',
              }}>
                Créer mon compte
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Illustration desktop — image réelle */}
        <div className="hero-illustration">
          <motion.div
            initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.9, y: prefersReduced ? 0 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: d(0.35), duration: d(0.8), ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              animate={prefersReduced ? {} : { y: [0, -14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <Image
                src="/images/Hero-illustration.png"
                alt="Plateforme étudiante — logement, emploi, services et dons"
                width={460}
                height={500}
                priority
                style={{
                  objectFit: 'contain',
                  maxWidth: '100%',
                  borderRadius: '28px',
                  filter: 'drop-shadow(0 24px 64px rgba(0,0,0,0.25))',
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
