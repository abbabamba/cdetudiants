'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MessageCircle, X } from 'lucide-react'
import { Btn } from '@/components/ui/Btn'
import { ChatBox } from './ChatBox'

interface BoutonContacterProps {
  annonceId: string
  annonceTitre: string
  currentUserId: string
  interlocuteur: { id: string; prenom: string; nom: string }
  isVerifie: boolean
  annonce?: {
    id: string
    titre: string
    ville: string
    prix: number
    photo?: string | null
  }
  conversationExistanteId?: string | null
  currentUserPrenom?: string
  currentUserNom?: string
  currentUserPhoto?: string | null
  isPreview?: boolean
}

export function BoutonContacter({
  annonceId,
  annonceTitre,
  currentUserId,
  interlocuteur,
  isVerifie,
  annonce,
  conversationExistanteId,
  currentUserPrenom = '',
  currentUserNom = '',
  currentUserPhoto,
  isPreview = false,
}: BoutonContacterProps) {
  const [open, setOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(
    conversationExistanteId ?? null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dejaConversation = !!conversationExistanteId

  async function handleOuvrir() {
    if (!isVerifie) return
    setError(null)
    if (conversationExistanteId) {
      setConversationId(conversationExistanteId)
      setOpen(true)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annonceId }),
      })
      const data = await res.json()
      if (!res.ok || !data.conversation) {
        setError('Impossible d\'ouvrir la conversation. Réessayez.')
        return
      }
      setConversationId(data.conversation.id)
      setOpen(true)
    } catch {
      setError('Impossible d\'ouvrir la conversation. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (isPreview) {
    return (
      <div
        title="Indisponible en mode prévisualisation"
        style={{
          width: '100%',
          background: 'rgba(27,95,173,0.1)',
          color: 'rgba(27,95,173,0.5)',
          borderRadius: '12px',
          padding: '14px 20px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '12px',
          border: '1px dashed rgba(27,95,173,0.3)',
        }}
      >
        <MessageCircle size={16} />
        Contacter le bailleur
        <span style={{ fontSize: '11px', fontWeight: 400, opacity: 0.75 }}>(prévisualisation)</span>
      </div>
    )
  }

  if (!isVerifie) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A20 100%)',
        borderRadius: '12px',
        padding: '14px 16px',
        fontSize: '13px',
        color: '#92400E',
        marginTop: '12px',
        border: '1px solid #FED7AA',
        lineHeight: 1.55,
      }}>
        Vérifiez votre statut étudiant pour contacter le bailleur.{' '}
        <Link href="/etudiant/profil/completer" style={{ color: 'var(--blue)', fontWeight: 600 }}>
          Compléter mon profil →
        </Link>
      </div>
    )
  }

  return (
    <>
      <Btn
        variant={dejaConversation ? 'primary' : 'success'}
        size="lg"
        full
        loading={loading}
        icon={<MessageCircle size={17} />}
        onClick={handleOuvrir}
        style={{ marginTop: '12px' }}
      >
        {loading ? 'Ouverture…' : dejaConversation ? 'Voir la conversation' : 'Contacter le bailleur'}
      </Btn>

      {error && (
        <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '8px', textAlign: 'center' }}>
          {error}
        </p>
      )}

      {open && conversationId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(10,18,40,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              width: '100%', maxWidth: '560px',
              background: 'var(--surface)',
              borderRadius: '20px 20px 0 0',
              overflow: 'hidden',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)' }}>
                {annonceTitre}
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)',
                  minWidth: '44px', minHeight: '44px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none' }}
              >
                <X size={20} />
              </button>
            </div>
            <ChatBox
              conversationId={conversationId}
              currentUserId={currentUserId}
              currentUserRole="etudiant"
              currentUserPrenom={currentUserPrenom}
              currentUserNom={currentUserNom}
              currentUserPhoto={currentUserPhoto}
              interlocuteur={{ prenom: interlocuteur.prenom, nom: interlocuteur.nom, photo: null }}
              annonceTitre={annonceTitre}
              annonce={annonce}
            />
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
