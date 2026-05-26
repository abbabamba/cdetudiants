'use client'

import { StaggerContainer, StaggerItem, FadeUp, HoverCard } from '@/components/ui/animations'
import { AnnonceCard } from '@/components/annonces/AnnonceCard'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Home } from 'lucide-react'

interface Annonce {
  id: string
  titre: string
  ville: string
  prix: number
  surface?: number | null
  type_logement?: string | null
  categorie?: string | null
  garantie?: string | null
  garantie_detail?: string | null
  photos?: { url: string; ordre: number }[] | null
}

interface Props {
  annonces: Annonce[]
}

export function AnnoncesHomeSection({ annonces }: Props) {
  const prefersReduced = useReducedMotion()

  return (
    <section style={{
      background: 'var(--bg)',
      padding: 'clamp(40px,6vw,64px) clamp(16px,4vw,24px)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <FadeUp>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px', flexWrap: 'wrap', gap: '8px',
          }}>
            <div>
              <p style={{
                fontSize: '12px', fontWeight: 700, color: 'var(--blue)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                marginBottom: '6px',
              }}>
                Disponible maintenant
              </p>
              <h2 style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 'clamp(22px,4vw,28px)',
                color: 'var(--navy)', margin: 0,
              }}>
                Dernières annonces
              </h2>
            </div>
            <motion.div whileHover={prefersReduced ? {} : { x: 4 }}>
              <Link href="/annonces" style={{
                fontSize: '14px', color: 'var(--blue)',
                textDecoration: 'none', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                Tout voir
                <svg width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </motion.div>
          </div>
        </FadeUp>

        {annonces.length > 0 ? (
          <StaggerContainer staggerDelay={0.08}>
            <div className="annonces-grid">
              {annonces.map((a) => (
                <StaggerItem key={a.id}>
                  <HoverCard style={{ height: '100%' }}>
                    <AnnonceCard
                      id={a.id} titre={a.titre} ville={a.ville}
                      prix={a.prix} surface={a.surface}
                      type_logement={a.type_logement}
                      garantie={a.garantie}
                      garantie_detail={a.garantie_detail}
                      photo={a.photos?.[0]?.url ?? null}
                    />
                  </HoverCard>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Home size={40} style={{ margin: '0 auto 12px', opacity: 0.25, display: 'block' }} />
            <p style={{ fontSize: '15px' }}>Aucune annonce disponible pour l&apos;instant.</p>
          </div>
        )}

      </div>
    </section>
  )
}
