'use client'

import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { Linkedin, Instagram } from 'lucide-react'

const HIDDEN_PREFIXES = ['/admin', '/etudiant', '/bailleur', '/particulier']

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.36 6.36 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.24 8.24 0 004.83 1.56V6.79a4.85 4.85 0 01-1.06-.1z" />
    </svg>
  )
}

const navLinks = [
  { label: 'Annonces', href: '/annonces' },
  { label: "S'inscrire", href: '/register' },
  { label: 'Se connecter', href: '/login' },
]

const legalLinks = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'CGU', href: '/cgu' },
  { label: 'Confidentialité', href: '/confidentialite' },
]

const socials = [
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    Icon: Linkedin as React.ComponentType<{ size?: number }>,
    hoverColor: '#0A66C2',
    hoverBg: 'rgba(10,102,194,0.15)',
    hoverBorder: 'rgba(10,102,194,0.35)',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    Icon: Instagram as React.ComponentType<{ size?: number }>,
    hoverColor: '#E1306C',
    hoverBg: 'rgba(225,48,108,0.15)',
    hoverBorder: 'rgba(225,48,108,0.35)',
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com',
    Icon: TikTokIcon as React.ComponentType<{ size?: number }>,
    hoverColor: '#fff',
    hoverBg: 'rgba(238,29,82,0.2)',
    hoverBorder: 'rgba(238,29,82,0.4)',
  },
]

export function Footer() {
  const pathname = usePathname()
  const prefersReduced = useReducedMotion()

  if (HIDDEN_PREFIXES.some(p => pathname.startsWith(p))) return null

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #0C1A2E 0%, #090F1E 100%)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(48px,7vw,72px) clamp(16px,4vw,48px) 0',
      }}>

        {/* Grille principale */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 2fr) 1fr 1fr',
          gap: 'clamp(32px,5vw,80px)',
          paddingBottom: 'clamp(40px,5vw,56px)',
        }}
          className="footer-grid"
        >

          {/* Colonne marque */}
          <motion.div
            initial={{ opacity: 0, y: prefersReduced ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReduced ? 0 : 0.55 }}
          >
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1B5FAD 0%, #2563EB 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                flexShrink: 0,
              }}>
                🎓
              </div>
              <span style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '17px', fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.01em',
              }}>
                Coin des Étudiants
              </span>
            </Link>

            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.42)',
              lineHeight: 1.8,
              marginBottom: '32px',
              maxWidth: '260px',
            }}>
              La plateforme de confiance pour les étudiants — logement, emploi, services et dons vérifiés.
            </p>

            {/* Réseaux sociaux */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {socials.map(({ label, href, Icon, hoverColor, hoverBg, hoverBorder }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={prefersReduced ? {} : { scale: 1.1, y: -3 }}
                  whileTap={prefersReduced ? {} : { scale: 0.92 }}
                  style={{
                    width: '42px', height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.5)',
                    textDecoration: 'none',
                    transition: 'background 0.18s, border-color 0.18s, color 0.18s',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = hoverBg
                    el.style.borderColor = hoverBorder
                    el.style.color = hoverColor
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = 'rgba(255,255,255,0.05)'
                    el.style.borderColor = 'rgba(255,255,255,0.09)'
                    el.style.color = 'rgba(255,255,255,0.5)'
                  }}
                >
                  <Icon size={17} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Colonne Plateforme */}
          <motion.div
            initial={{ opacity: 0, y: prefersReduced ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: prefersReduced ? 0 : 0.1, duration: prefersReduced ? 0 : 0.55 }}
          >
            <p style={{
              fontSize: '11px', fontWeight: 700,
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: '18px',
            }}>
              Plateforme
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                      display: 'inline-block',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Colonne Légal */}
          <motion.div
            initial={{ opacity: 0, y: prefersReduced ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: prefersReduced ? 0 : 0.2, duration: prefersReduced ? 0 : 0.55 }}
          >
            <p style={{
              fontSize: '11px', fontWeight: 700,
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: '18px',
            }}>
              Légal
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {legalLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.45)',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                      display: 'inline-block',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Barre du bas */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.22)', margin: 0 }}>
            © {new Date().getFullYear()} Coin des Étudiants. Tous droits réservés.
          </p>
          <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.16)', margin: 0 }}>
            Fait avec ♥ pour les étudiants
          </p>
        </div>
      </div>
    </footer>
  )
}
