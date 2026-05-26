'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { FadeUp } from '@/components/ui/animations'
import { Home, Briefcase, Wrench, Gift } from 'lucide-react'

const categories = [
  {
    label: 'Logement',
    cat: 'logement',
    image: '/images/Logement.jpg',
    desc: 'Studios, colocations et chambres vérifiés partout en France.',
    Icon: Home,
    color: '#1B5FAD',
    accentLight: '#93C5FD',
    bg: 'var(--blue-light)',
    gradient: 'linear-gradient(to top, rgba(10,28,60,0.96) 0%, rgba(10,28,60,0.52) 48%, transparent 100%)',
    hoverGradient: 'linear-gradient(to top, rgba(10,28,60,0.99) 0%, rgba(10,28,60,0.78) 58%, rgba(10,28,60,0.12) 100%)',
  },
  {
    label: 'Emploi & Stage',
    cat: 'emploi',
    image: '/images/Emploi-Stage.jpg',
    desc: 'Stages, alternances et premiers emplois pour étudiants.',
    Icon: Briefcase,
    color: '#059669',
    accentLight: '#6EE7B7',
    bg: 'var(--green-light)',
    gradient: 'linear-gradient(to top, rgba(2,42,26,0.96) 0%, rgba(2,42,26,0.52) 48%, transparent 100%)',
    hoverGradient: 'linear-gradient(to top, rgba(2,42,26,0.99) 0%, rgba(2,42,26,0.76) 58%, rgba(2,42,26,0.1) 100%)',
  },
  {
    label: 'Services',
    cat: 'service',
    image: '/images/Services.png',
    desc: 'Cours particuliers, aide au déménagement, petits services.',
    Icon: Wrench,
    color: '#D97706',
    accentLight: '#FCD34D',
    bg: '#FEF3C7',
    gradient: 'linear-gradient(to top, rgba(78,38,0,0.96) 0%, rgba(78,38,0,0.52) 48%, transparent 100%)',
    hoverGradient: 'linear-gradient(to top, rgba(78,38,0,0.99) 0%, rgba(78,38,0,0.76) 58%, rgba(78,38,0,0.1) 100%)',
  },
  {
    label: 'Dons',
    cat: 'don',
    image: '/images/dons.png',
    desc: 'Récupérez affaires, livres et équipements donnés par des étudiants.',
    Icon: Gift,
    color: '#7C3AED',
    accentLight: '#C4B5FD',
    bg: '#F3F0FF',
    gradient: 'linear-gradient(to top, rgba(38,10,76,0.96) 0%, rgba(38,10,76,0.52) 48%, transparent 100%)',
    hoverGradient: 'linear-gradient(to top, rgba(38,10,76,0.99) 0%, rgba(38,10,76,0.76) 58%, rgba(38,10,76,0.1) 100%)',
  },
]

/* ── Variants (définis une seule fois, conditionnés sur prefersReduced au runtime) ── */
function makeVariants(prefersReduced: boolean) {
  return {
    card: {
      rest: { y: 0 },
      hover: { y: prefersReduced ? 0 : -10 },
    },
    image: {
      rest: { scale: 1 },
      hover: { scale: prefersReduced ? 1 : 1.09 },
    },
    overlay: {
      rest: { opacity: 0 },
      hover: { opacity: 1 },
    },
    badge: {
      rest: { scale: 1 },
      hover: { scale: prefersReduced ? 1 : 1.06 },
    },
    title: {
      rest: { y: 0 },
      hover: { y: prefersReduced ? 0 : -8 },
    },
    desc: {
      rest: { y: 22, opacity: 0 },
      hover: { y: 0, opacity: 1 },
    },
    accent: {
      rest: { scaleX: 0.4, opacity: 0.4 },
      hover: { scaleX: 1, opacity: 1 },
    },
    border: {
      rest: { opacity: 0 },
      hover: { opacity: 1 },
    },
  }
}

export function CategoriesSection() {
  const prefersReduced = useReducedMotion()
  const V = makeVariants(!!prefersReduced)

  const springFast = { type: 'spring' as const, stiffness: 340, damping: 28 }
  const springMed  = { type: 'spring' as const, stiffness: 260, damping: 26 }

  return (
    <section style={{
      background: 'var(--bg)',
      padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,24px)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Header ──────────────────────────────── */}
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,56px)' }}>
            <motion.p
              initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReduced ? 0 : 0.4 }}
              style={{
                fontSize: '12px', fontWeight: 700,
                color: 'var(--blue)', letterSpacing: '0.12em',
                textTransform: 'uppercase', marginBottom: '14px',
              }}
            >
              Ce que vous trouverez
            </motion.p>

            {/* Titre avec underline multicolore animée */}
            <div style={{ position: 'relative', display: 'inline-block', paddingBottom: '14px' }}>
              <motion.h2
                initial={{ opacity: 0, y: prefersReduced ? 0 : 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: prefersReduced ? 0 : 0.12, duration: prefersReduced ? 0 : 0.55 }}
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: 'clamp(26px,4vw,42px)',
                  background: 'linear-gradient(135deg, var(--navy) 25%, #1B5FAD 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                Tout pour la vie étudiante
              </motion.h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: prefersReduced ? 0 : 0.45, duration: prefersReduced ? 0 : 0.75, ease: 'easeOut' }}
                style={{
                  position: 'absolute', bottom: 0,
                  left: '8%', right: '8%',
                  height: '3px',
                  background: 'linear-gradient(90deg, #1B5FAD 0%, #059669 33%, #D97706 66%, #7C3AED 100%)',
                  transformOrigin: 'left',
                  borderRadius: '2px',
                }}
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: prefersReduced ? 0 : 0.3, duration: prefersReduced ? 0 : 0.45 }}
              style={{
                fontSize: '15px', color: 'var(--text-muted)',
                maxWidth: '460px', margin: '18px auto 0', lineHeight: 1.75,
              }}
            >
              Logement, emploi, services, dons — tout vérifié, tout gratuit pour les étudiants.
            </motion.p>
          </div>
        </FadeUp>

        {/* ── Grille de cartes ───────────────────── */}
        <div className="categories-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '20px',
        }}>
          {categories.map((cat, index) => {
            const Icon = cat.Icon
            return (
              <FadeUp key={cat.cat} delay={index * 0.09}>
                <motion.div
                  initial="rest"
                  whileHover="hover"
                  variants={V.card}
                  transition={springFast}
                  style={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    willChange: 'transform',
                  }}
                >
                  <Link
                    href={`/annonces?categorie=${cat.cat}`}
                    style={{
                      display: 'block',
                      position: 'relative',
                      height: 'clamp(260px, 26vw, 340px)',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      borderRadius: '24px',
                    }}
                  >
                    {/* Image — zoom au hover */}
                    <motion.div
                      variants={V.image}
                      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                      style={{ position: 'absolute', inset: 0 }}
                    >
                      <Image
                        src={cat.image}
                        alt={cat.label}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, 50vw"
                        priority={index < 2}
                      />
                    </motion.div>

                    {/* Overlay de base (toujours visible) */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: cat.gradient,
                      zIndex: 1,
                      pointerEvents: 'none',
                    }} />

                    {/* Overlay hover (s'assombrit) */}
                    <motion.div
                      variants={V.overlay}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: 'absolute', inset: 0,
                        background: cat.hoverGradient,
                        zIndex: 2,
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Badge catégorie — haut gauche */}
                    <motion.div
                      variants={V.badge}
                      transition={springMed}
                      style={{
                        position: 'absolute', top: '16px', left: '16px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(255,255,255,0.14)',
                        backdropFilter: 'blur(14px)',
                        border: '1px solid rgba(255,255,255,0.22)',
                        borderRadius: '99px',
                        padding: '6px 12px 6px 7px',
                        zIndex: 4,
                      }}
                    >
                      <span style={{
                        width: '24px', height: '24px',
                        borderRadius: '50%',
                        background: `${cat.color}28`,
                        border: `1px solid ${cat.accentLight}45`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: cat.accentLight,
                        flexShrink: 0,
                      }}>
                        <Icon size={12} />
                      </span>
                      <span style={{
                        fontSize: '12px', fontWeight: 700,
                        color: '#fff', letterSpacing: '0.01em',
                      }}>
                        {cat.label}
                      </span>
                    </motion.div>

                    {/* Texte bas */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '28px 24px 24px',
                      zIndex: 3,
                    }}>

                      {/* Titre de catégorie */}
                      <motion.h3
                        variants={V.title}
                        transition={springMed}
                        style={{
                          fontFamily: 'var(--font-playfair), serif',
                          fontSize: 'clamp(22px, 2.8vw, 30px)',
                          fontWeight: 700,
                          color: '#fff',
                          margin: '0 0 6px',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.15,
                        }}
                      >
                        {cat.label}
                      </motion.h3>

                      {/* Description — slide up au hover */}
                      <motion.p
                        variants={V.desc}
                        transition={{ duration: 0.28, delay: 0.04, ease: 'easeOut' }}
                        style={{
                          fontSize: '13.5px',
                          color: 'rgba(255,255,255,0.75)',
                          lineHeight: 1.62,
                          margin: '0 0 14px',
                        }}
                      >
                        {cat.desc}
                      </motion.p>

                      {/* Trait coloré animé */}
                      <motion.div
                        variants={V.accent}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          transformOrigin: 'left',
                        }}
                      >
                        <div style={{
                          width: '32px', height: '3px',
                          borderRadius: '2px',
                          background: cat.accentLight,
                        }} />
                        <div style={{
                          width: '16px', height: '3px',
                          borderRadius: '2px',
                          background: `${cat.accentLight}55`,
                        }} />
                      </motion.div>
                    </div>

                    {/* Bordure lumineuse au hover */}
                    <motion.div
                      variants={V.border}
                      transition={{ duration: 0.22 }}
                      style={{
                        position: 'absolute', inset: 0,
                        borderRadius: '24px',
                        border: `2px solid ${cat.accentLight}45`,
                        boxShadow: `0 0 0 1px ${cat.color}20 inset`,
                        zIndex: 5,
                        pointerEvents: 'none',
                      }}
                    />
                  </Link>
                </motion.div>
              </FadeUp>
            )
          })}
        </div>
      </div>
    </section>
  )
}
