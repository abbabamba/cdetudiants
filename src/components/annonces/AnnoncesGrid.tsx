'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { AnnonceCard } from './AnnonceCard'
import { HoverCard } from '@/components/ui/animations'

interface Annonce {
  id: string
  bailleur_id?: string | null
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

export function AnnoncesGrid({
  annonces,
  favorisIds = [],
  currentUserId,
}: {
  annonces: Annonce[]
  favorisIds?: string[]
  currentUserId?: string | null
}) {
  const prefersReduced = useReducedMotion()

  return (
    <AnimatePresence mode="popLayout">
      <div className="annonces-grid">
        {annonces.map((a, i) => (
          <motion.div
            key={a.id}
            layout
            initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.92, y: prefersReduced ? 0 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: prefersReduced ? 1 : 0.92 }}
            transition={{
              delay: prefersReduced ? 0 : Math.min(i, 8) * 0.06,
              duration: prefersReduced ? 0 : 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <HoverCard style={{ height: '100%' }}>
              <AnnonceCard
                id={a.id} titre={a.titre} ville={a.ville}
                prix={a.prix} surface={a.surface}
                type_logement={a.type_logement}
                categorie={a.categorie}
                garantie={a.garantie}
                garantie_detail={a.garantie_detail}
                photo={a.photos?.[0]?.url ?? null}
                showFavori={favorisIds !== undefined}
                isFavori={favorisIds.includes(a.id)}
                isOwn={!!(currentUserId && a.bailleur_id === currentUserId)}
              />
            </HoverCard>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  )
}
