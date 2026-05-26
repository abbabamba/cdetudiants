'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { Btn } from '@/components/ui/Btn'

interface DeleteAnnonceButtonProps {
  annonceId: string
  titre?: string
}

export function DeleteAnnonceButton({ annonceId, titre }: DeleteAnnonceButtonProps) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  /* Bloquer le scroll body quand la modale est ouverte */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('annonces').update({ statut: 'supprimee' }).eq('id', annonceId)
    setLoading(false)
    setOpen(false)
    window.location.reload()
  }

  const modal = (
    <AnimatePresence>
      {open && (
        /* ── Backdrop ───────────────────────── */
        <motion.div
          key="delete-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={() => !loading && setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(8,14,32,0.6)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          {/* ── Carte modale ─────────────────── */}
          <motion.div
            key="delete-card"
            initial={{ opacity: 0, scale: 0.88, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderRadius: '24px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            {/* Barre rouge en haut */}
            <div style={{
              height: '4px',
              background: 'linear-gradient(90deg, #DC2626 0%, #F87171 50%, #DC2626 100%)',
            }} />

            {/* Contenu */}
            <div style={{ padding: '36px 36px 32px' }}>

              {/* En-tête : icône + close */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22, delay: 0.06 }}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 6px 20px rgba(220,38,38,0.2)',
                  }}
                >
                  <AlertTriangle size={30} color="#DC2626" strokeWidth={2} />
                </motion.div>

                {/* Bouton fermer */}
                <button
                  onClick={() => !loading && setOpen(false)}
                  disabled={loading}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = 'var(--border)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)' }}
                  aria-label="Fermer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Titre */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--navy)',
                  margin: '0 0 10px',
                  lineHeight: 1.2,
                }}
              >
                Supprimer cette annonce ?
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
                style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.7,
                  margin: '0 0 20px',
                }}
              >
                L&apos;annonce sera masquée immédiatement. Cette action est <strong style={{ color: 'var(--text)', fontWeight: 600 }}>irréversible</strong>.
              </motion.p>

              {/* Encart titre de l'annonce */}
              {titre && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Trash2 size={15} color="#DC2626" style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: '13px',
                    color: '#991B1B',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {titre}
                  </span>
                </motion.div>
              )}

              {/* Boutons */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                style={{ display: 'flex', gap: '10px' }}
              >
                <Btn
                  variant="ghost"
                  full
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  size="md"
                >
                  Annuler
                </Btn>
                <Btn
                  variant="danger"
                  full
                  loading={loading}
                  icon={<Trash2 size={15} />}
                  onClick={handleDelete}
                  size="md"
                >
                  {loading ? 'Suppression…' : 'Supprimer'}
                </Btn>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <Btn variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => setOpen(true)}>
        Supprimer
      </Btn>
      {mounted && createPortal(modal, document.body)}
    </>
  )
}
