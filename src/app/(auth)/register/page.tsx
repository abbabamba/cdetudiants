'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight, GraduationCap, Home, Briefcase,
  Gift,
  Clock, ShieldCheck, LayoutDashboard,
  Star,
} from 'lucide-react'

/* ── Feature lists ─────────────────────────── */
const etudiantFeatures = [
  { Icon: Home,      text: 'Logements et colocations vérifiés' },
  { Icon: Briefcase, text: 'Emplois, stages & alternances' },
  { Icon: Gift,      text: '100 % gratuit pour les étudiants' },
]
const bailleurFeatures = [
  { Icon: Clock,          text: 'Publication en 5 min' },
  { Icon: ShieldCheck,    text: 'Étudiants certifiés' },
  { Icon: LayoutDashboard, text: 'Tableau de bord' },
]
const particulierFeatures = [
  { Icon: Briefcase, text: 'Emplois & stages' },
  { Icon: Gift,      text: 'Dons de vêtements et matériel' },
  { Icon: Star,      text: 'Services aux étudiants' },
]

/* ── Variants (propagés aux enfants via context FM) ── */
const cardVariants = {
  rest: { y: 0, boxShadow: '0 2px 12px rgba(26,45,79,0.07)' },
  hover: { y: -10, boxShadow: '0 28px 64px rgba(26,45,79,0.16)' },
}
const borderBlue = {
  rest:  { borderColor: '#E2DDD5' },
  hover: { borderColor: '#1B5FAD' },
}
const borderGreen = {
  rest:  { borderColor: '#E2DDD5' },
  hover: { borderColor: '#2D7A3A' },
}
const borderPurple = {
  rest:  { borderColor: '#E2DDD5' },
  hover: { borderColor: '#7C3AED' },
}
const iconBlue = {
  rest:  { scale: 1, rotate: 0 },
  hover: { scale: 1.13, rotate: -7 },
}
const iconGreen = {
  rest:  { scale: 1, rotate: 0 },
  hover: { scale: 1.13, rotate: 7 },
}
const iconPurple = {
  rest:  { scale: 1, rotate: 0 },
  hover: { scale: 1.13, rotate: -5 },
}
const arrowBlue = {
  rest:  { x: 0, opacity: 0.75 },
  hover: { x: 8, opacity: 1 },
}
const arrowGreen = {
  rest:  { x: 0, opacity: 0.75 },
  hover: { x: 8, opacity: 1 },
}
const arrowPurple = {
  rest:  { x: 0, opacity: 0.75 },
  hover: { x: 8, opacity: 1 },
}
const decoVariants = {
  rest:  { scale: 0.7, opacity: 0 },
  hover: { scale: 1,   opacity: 1 },
}

/* ── Stats de confiance ────────────────────── */
const stats = [
  { value: '500+',    label: 'annonces actives'  },
  { value: '10 000+', label: 'étudiants inscrits' },
  { value: '48h',     label: 'délai de validation' },
]

export default function RegisterChoixPage() {
  const prefersReduced = useReducedMotion()

  /* transitions réutilisables */
  const ease = prefersReduced
    ? { type: 'tween' as const, duration: 0 }
    : { type: 'spring' as const, stiffness: 280, damping: 22 }
  const iconEase = prefersReduced
    ? { type: 'tween' as const, duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 15 }
  const arrowEase = prefersReduced
    ? { type: 'tween' as const, duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 20 }

  const dy = (n: number) => prefersReduced ? 0 : n

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReduced ? 0 : 0.4 }}
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px 48px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '960px' }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: dy(-20) }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.5 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <Link href="/">
            <img
              src="/images/logo.jpeg"
              alt="Coin des Étudiants"
              style={{ height: '48px', objectFit: 'contain' }}
            />
          </Link>
        </motion.div>

        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: dy(18) }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.5, delay: prefersReduced ? 0 : 0.07 }}
          style={{ textAlign: 'center', marginBottom: '44px' }}
        >
          <h1 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 'clamp(26px, 5vw, 34px)',
            color: 'var(--navy)', marginBottom: '10px',
          }}>
            Je suis...
          </h1>
          <p style={{
            fontSize: '15px', color: 'var(--text-muted)',
            maxWidth: '360px', margin: '0 auto', lineHeight: 1.6,
          }}>
            Choisissez votre profil pour commencer votre expérience
          </p>
        </motion.div>

        {/* ── Grille de cartes ── */}
        <div
          className="register-cards"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '36px',
          }}
        >

          {/* ─── Carte Étudiant ─── */}
          <motion.div
            initial={{ opacity: 0, y: dy(36) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.55, delay: prefersReduced ? 0 : 0.13 }}
          >
            <motion.div
              variants={cardVariants}
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: prefersReduced ? 1 : 0.97 }}
              transition={ease}
              style={{ borderRadius: '20px', cursor: 'pointer' }}
            >
              <Link href="/register/etudiant" style={{ textDecoration: 'none', display: 'block' }}>

                <motion.div
                  variants={borderBlue}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'var(--surface)',
                    border: '2px solid #E2DDD5',
                    borderRadius: '20px',
                    padding: '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                  }}
                >
                  {/* Cercle décoratif hover */}
                  <motion.div
                    variants={decoVariants}
                    transition={{ duration: 0.35 }}
                    style={{
                      position: 'absolute', top: -48, right: -48,
                      width: 140, height: 140, borderRadius: '50%',
                      background: 'rgba(27,95,173,0.07)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Icône principale */}
                  <motion.div
                    variants={iconBlue}
                    transition={iconEase}
                    style={{
                      width: '72px', height: '72px',
                      background: 'var(--blue-light)',
                      borderRadius: '18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, zIndex: 1,
                    }}
                  >
                    <GraduationCap size={36} color="var(--blue)" strokeWidth={1.5} />
                  </motion.div>

                  {/* Titre + description */}
                  <div style={{ zIndex: 1 }}>
                    <p style={{
                      fontSize: '22px', fontWeight: 700,
                      color: 'var(--navy)', marginBottom: '8px',
                      fontFamily: 'var(--font-playfair), serif',
                    }}>
                      Étudiant
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      Je cherche un logement, un emploi, un stage ou des services près de mon campus.
                    </p>
                  </div>

                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', zIndex: 1 }}>
                    {etudiantFeatures.map(({ Icon, text }, i) => (
                      <motion.div
                        key={text}
                        variants={{
                          rest:  { x: 0 },
                          hover: { x: prefersReduced ? 0 : 4 },
                        }}
                        transition={{ delay: prefersReduced ? 0 : i * 0.04, ...arrowEase }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                      >
                        <Icon size={15} color="var(--blue)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pied de carte */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: 'auto',
                    zIndex: 1,
                  }}>
                    <span style={{
                      background: 'var(--blue-light)', color: 'var(--blue)',
                      fontSize: '12px', fontWeight: 600,
                      padding: '5px 12px', borderRadius: '99px',
                    }}>
                      Email univ. ou certificat
                    </span>
                    <motion.span
                      variants={arrowBlue}
                      transition={arrowEase}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        color: 'var(--blue)', fontSize: '13px', fontWeight: 700,
                      }}
                    >
                      Commencer <ArrowRight size={15} />
                    </motion.span>
                  </div>
                </motion.div>

              </Link>
            </motion.div>
          </motion.div>

          {/* ─── Carte Bailleur ─── */}
          <motion.div
            initial={{ opacity: 0, y: dy(36) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.55, delay: prefersReduced ? 0 : 0.23 }}
          >
            <motion.div
              variants={cardVariants}
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: prefersReduced ? 1 : 0.97 }}
              transition={ease}
              style={{ borderRadius: '20px', cursor: 'pointer' }}
            >
              <Link href="/register/bailleur" style={{ textDecoration: 'none', display: 'block' }}>

                <motion.div
                  variants={borderGreen}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'var(--surface)',
                    border: '2px solid #E2DDD5',
                    borderRadius: '20px',
                    padding: '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                  }}
                >
                  {/* Cercle décoratif hover */}
                  <motion.div
                    variants={decoVariants}
                    transition={{ duration: 0.35 }}
                    style={{
                      position: 'absolute', top: -48, right: -48,
                      width: 140, height: 140, borderRadius: '50%',
                      background: 'rgba(45,122,58,0.07)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Icône principale */}
                  <motion.div
                    variants={iconGreen}
                    transition={iconEase}
                    style={{
                      width: '72px', height: '72px',
                      background: 'var(--green-light)',
                      borderRadius: '18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, zIndex: 1,
                    }}
                  >
                    <Home size={36} color="var(--green)" strokeWidth={1.5} />
                  </motion.div>

                  {/* Titre + description */}
                  <div style={{ zIndex: 1 }}>
                    <p style={{
                      fontSize: '22px', fontWeight: 700,
                      color: 'var(--navy)', marginBottom: '8px',
                      fontFamily: 'var(--font-playfair), serif',
                    }}>
                      Bailleur
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      Je propose un logement aux étudiants
                    </p>
                  </div>

                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', zIndex: 1 }}>
                    {bailleurFeatures.map(({ Icon, text }, i) => (
                      <motion.div
                        key={text}
                        variants={{
                          rest:  { x: 0 },
                          hover: { x: prefersReduced ? 0 : 4 },
                        }}
                        transition={{ delay: prefersReduced ? 0 : i * 0.04, ...arrowEase }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                      >
                        <Icon size={15} color="var(--green)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pied de carte */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: 'auto',
                    zIndex: 1,
                  }}>
                    <span style={{
                      background: 'var(--green-light)', color: 'var(--green)',
                      fontSize: '12px', fontWeight: 600,
                      padding: '5px 12px', borderRadius: '99px',
                    }}>
                      Gratuit, sans engagement
                    </span>
                    <motion.span
                      variants={arrowGreen}
                      transition={arrowEase}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        color: 'var(--green)', fontSize: '13px', fontWeight: 700,
                      }}
                    >
                      Commencer <ArrowRight size={15} />
                    </motion.span>
                  </div>
                </motion.div>

              </Link>
            </motion.div>
          </motion.div>

          {/* ─── Carte Particulier ─── */}
          <motion.div
            initial={{ opacity: 0, y: dy(36) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.55, delay: prefersReduced ? 0 : 0.33 }}
          >
            <motion.div
              variants={cardVariants}
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: prefersReduced ? 1 : 0.97 }}
              transition={ease}
              style={{ borderRadius: '20px', cursor: 'pointer' }}
            >
              <Link href="/register/particulier" style={{ textDecoration: 'none', display: 'block' }}>

                <motion.div
                  variants={borderPurple}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'var(--surface)',
                    border: '2px solid #E2DDD5',
                    borderRadius: '20px',
                    padding: '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                  }}
                >
                  {/* Cercle décoratif hover */}
                  <motion.div
                    variants={decoVariants}
                    transition={{ duration: 0.35 }}
                    style={{
                      position: 'absolute', top: -48, right: -48,
                      width: 140, height: 140, borderRadius: '50%',
                      background: 'rgba(124,58,237,0.07)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Icône principale */}
                  <motion.div
                    variants={iconPurple}
                    transition={iconEase}
                    style={{
                      width: '72px', height: '72px',
                      background: '#F3F0FF',
                      borderRadius: '18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, zIndex: 1,
                    }}
                  >
                    <Briefcase size={36} color="#7C3AED" strokeWidth={1.5} />
                  </motion.div>

                  {/* Titre + description */}
                  <div style={{ zIndex: 1 }}>
                    <p style={{
                      fontSize: '22px', fontWeight: 700,
                      color: 'var(--navy)', marginBottom: '8px',
                      fontFamily: 'var(--font-playfair), serif',
                    }}>
                      Particulier
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      Proposez des emplois, stages, services ou dons matériels aux étudiants.
                    </p>
                  </div>

                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', zIndex: 1 }}>
                    {particulierFeatures.map(({ Icon, text }, i) => (
                      <motion.div
                        key={text}
                        variants={{
                          rest:  { x: 0 },
                          hover: { x: prefersReduced ? 0 : 4 },
                        }}
                        transition={{ delay: prefersReduced ? 0 : i * 0.04, ...arrowEase }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                      >
                        <Icon size={15} color="#7C3AED" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pied de carte */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: 'auto',
                    zIndex: 1,
                  }}>
                    <span style={{
                      background: '#F3F0FF', color: '#7C3AED',
                      fontSize: '12px', fontWeight: 600,
                      padding: '5px 12px', borderRadius: '99px',
                    }}>
                      Gratuit, sans engagement
                    </span>
                    <motion.span
                      variants={arrowPurple}
                      transition={arrowEase}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        color: '#7C3AED', fontSize: '13px', fontWeight: 700,
                      }}
                    >
                      Commencer <ArrowRight size={15} />
                    </motion.span>
                  </div>
                </motion.div>

              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats de confiance */}
        <motion.div
          initial={{ opacity: 0, y: dy(12) }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.5, delay: prefersReduced ? 0 : 0.36 }}
          style={{
            display: 'flex', justifyContent: 'center',
            gap: '32px', flexWrap: 'wrap',
            padding: '18px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            marginBottom: '28px',
          }}
        >
          {stats.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '20px', fontWeight: 700, color: 'var(--navy)',
                fontFamily: 'var(--font-playfair), serif', lineHeight: 1.2,
              }}>
                {value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Lien connexion */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReduced ? 0 : 0.5, delay: prefersReduced ? 0 : 0.44 }}
          style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}
        >
          Déjà un compte ?{' '}
          <Link href="/login" style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </motion.p>

      </div>
    </motion.div>
  )
}
