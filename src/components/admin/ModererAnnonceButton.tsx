'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pause, Play, Trash2, AlertTriangle } from 'lucide-react'
import { Btn } from '@/components/ui/Btn'

interface ModererAnnonceButtonProps {
  annonceId: string
  statut: string
}

export default function ModererAnnonceButton({ annonceId, statut }: ModererAnnonceButtonProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [currentStatut, setCurrentStatut] = useState(statut)

  if (done) return null

  async function handleAction(action: 'suspendre' | 'activer' | 'supprimer') {
    setLoading(action)
    try {
      const res = await fetch('/api/admin/moderer-annonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annonceId, action }),
      })
      if (res.ok) {
        if (action === 'supprimer') {
          setDone(true)
        } else {
          setCurrentStatut(action === 'suspendre' ? 'suspendue' : 'active')
          setConfirmOpen(false)
        }
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {currentStatut === 'active' && (
          <Btn
            variant="warning"
            size="sm"
            loading={loading === 'suspendre'}
            disabled={!!loading}
            icon={<Pause size={13} />}
            onClick={() => handleAction('suspendre')}
          >
            Suspendre
          </Btn>
        )}
        {currentStatut === 'suspendue' && (
          <Btn
            variant="success"
            size="sm"
            loading={loading === 'activer'}
            disabled={!!loading}
            icon={<Play size={13} />}
            onClick={() => handleAction('activer')}
          >
            Réactiver
          </Btn>
        )}
        <Btn
          variant="danger"
          size="sm"
          icon={<Trash2 size={13} />}
          onClick={() => setConfirmOpen(true)}
        >
          Supprimer
        </Btn>
      </div>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.target === e.currentTarget && setConfirmOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(10,18,40,0.55)',
              backdropFilter: 'blur(5px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px',
            }}
          >
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.86, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--surface)',
                borderRadius: '20px',
                padding: '32px 28px',
                maxWidth: '380px',
                width: '100%',
                boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
                border: '1px solid var(--border)',
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
                style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 4px 16px rgba(220,38,38,0.18)',
                }}
              >
                <AlertTriangle size={24} color="#DC2626" strokeWidth={2.2} />
              </motion.div>

              <h3 style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '19px', color: 'var(--navy)', margin: '0 0 10px',
              }}>
                Supprimer cette annonce ?
              </h3>
              <p style={{
                fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 28px',
              }}>
                L&apos;annonce sera définitivement retirée de la plateforme.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Btn variant="ghost" full onClick={() => setConfirmOpen(false)} disabled={!!loading}>
                  Annuler
                </Btn>
                <Btn
                  variant="danger"
                  full
                  loading={loading === 'supprimer'}
                  icon={<Trash2 size={15} />}
                  onClick={() => handleAction('supprimer')}
                >
                  Supprimer
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
