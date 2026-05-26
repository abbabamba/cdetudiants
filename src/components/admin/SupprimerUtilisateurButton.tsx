'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Trash2, ExternalLink, AlertTriangle } from 'lucide-react'
import { Btn } from '@/components/ui/Btn'

interface SupprimerUtilisateurButtonProps {
  userId: string
  prenom: string
  nom: string
  role: string
  redirectTo?: string
}

export default function SupprimerUtilisateurButton({
  userId, prenom, nom, role, redirectTo,
}: SupprimerUtilisateurButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const profilePath = role === 'etudiant' ? '/etudiant' : '/bailleur'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  async function handleSupprimer() {
    if (confirmText !== 'SUPPRIMER') return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/supprimer-utilisateur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        setModalOpen(false)
        window.location.href = redirectTo ?? '/admin?section=utilisateurs'
      } else {
        const data = await res.json()
        setError(data.error ?? 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Bouton ··· avec dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDropdownOpen(prev => !prev)}
          style={{
            background: dropdownOpen ? 'var(--bg)' : 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '6px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--text-muted)',
            minHeight: '44px',
            transition: 'background 0.15s',
          }}
          aria-label="Actions"
        >
          <MoreHorizontal size={16} />
        </motion.button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
                minWidth: '190px',
                zIndex: 10,
                overflow: 'hidden',
              }}
            >
              <a
                href={profilePath}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', fontSize: '13px',
                  color: 'var(--text)', textDecoration: 'none', minHeight: '44px',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                onClick={() => setDropdownOpen(false)}
              >
                <ExternalLink size={14} />
                Voir le profil
              </a>
              <div style={{ height: '1px', background: 'var(--border)' }} />
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  setModalOpen(true)
                  setConfirmText('')
                  setError(null)
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', fontSize: '13px',
                  color: '#DC2626', background: 'transparent', border: 'none',
                  cursor: 'pointer', width: '100%', textAlign: 'left', minHeight: '44px',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <Trash2 size={14} />
                Supprimer le compte
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modale confirmation */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(10,18,40,0.6)',
              backdropFilter: 'blur(6px)',
              zIndex: 100,
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
                padding: '32px',
                maxWidth: '440px',
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

              <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 8px', fontFamily: 'var(--font-playfair), serif' }}>
                Supprimer {prenom} {nom} ?
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>
                Cette action est irréversible. L&apos;email sera libéré et pourra être réutilisé.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                  Tapez <strong>SUPPRIMER</strong> pour confirmer
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="SUPPRIMER"
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: `1.5px solid ${confirmText === 'SUPPRIMER' ? '#DC2626' : 'var(--border)'}`,
                    borderRadius: '8px', fontSize: '14px', outline: 'none',
                    fontFamily: 'monospace', background: 'var(--bg)', color: 'var(--text)',
                    transition: 'border-color 0.2s',
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: '13px', color: 'var(--error)', marginBottom: '12px' }}>{error}</p>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <Btn variant="ghost" full onClick={() => setModalOpen(false)} disabled={loading}>
                  Annuler
                </Btn>
                <Btn
                  variant="danger"
                  full
                  loading={loading}
                  disabled={confirmText !== 'SUPPRIMER'}
                  icon={<Trash2 size={15} />}
                  onClick={handleSupprimer}
                >
                  {loading ? 'Suppression…' : 'Supprimer définitivement'}
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
