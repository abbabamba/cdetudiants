'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatBox } from '@/components/messagerie/ChatBox'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'

interface ConversationItem {
  id: string
  created_at: string
  last_message_at: string | null
  annonce: { id: string; titre: string; ville: string; prix: number; photos?: { url: string; ordre: number }[] } | null
  etudiant: { id: string; nom: string; prenom: string } | null
  bailleur: { id: string; nom: string; prenom: string } | null
  messages: {
    id: string
    contenu: string
    created_at: string
    sender_id: string
    lu_par_bailleur: boolean
    lu_par_etudiant: boolean
  }[]
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
}
const itemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export default function MessagesEtudiantPage() {
  const [conversations, setConversations]   = useState<ConversationItem[]>([])
  const [selected, setSelected]             = useState<ConversationItem | null>(null)
  const [currentUserId, setCurrentUserId]   = useState<string | null>(null)
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id)
        const { data: pe } = await supabase.from('profils_etudiants').select('photo_url').eq('user_id', user.id).maybeSingle()
        setCurrentUserPhoto(pe?.photo_url ?? null)
      }
    })
    fetch('/api/conversations')
      .then(r => r.json())
      .then(data => { setConversations(data); setLoading(false) })
  }, [])

  function handleSelect(conv: ConversationItem) {
    setSelected(conv)
    setShowChat(true)
  }

  function getNonLus(conv: ConversationItem): number {
    if (!currentUserId) return 0
    return conv.messages.filter(m => !m.lu_par_etudiant && m.sender_id !== currentUserId).length
  }

  function getDernierMessage(conv: ConversationItem): string {
    if (conv.messages.length === 0) return 'Aucun message'
    const last = conv.messages[conv.messages.length - 1]
    return last.contenu.length > 50 ? last.contenu.slice(0, 50) + '…' : last.contenu
  }

  function formatDateConv(dateStr: string | null): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    return isToday
      ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] }}
      style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}
    >
      <BackButton href="/etudiant" />
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--navy)', marginBottom: '24px', fontFamily: 'var(--font-playfair), serif' }}>
        Mes messages
      </h1>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* Liste conversations */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            width: '300px', flexShrink: 0,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(26,45,79,0.06)',
            display: showChat ? 'none' : 'block',
          }}
          className="md-show"
        >
          {loading ? (
            <div style={{ padding: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '68px', borderRadius: '10px', marginBottom: '8px' }} />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '48px 16px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <MessageCircle size={24} color="var(--border)" />
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Aucune conversation</p>
            </div>
          ) : (
            <motion.div variants={listVariants} initial="hidden" animate="visible">
              {conversations.map(conv => {
                const nonLus   = getNonLus(conv)
                const isActive = selected?.id === conv.id
                const initials = [conv.bailleur?.prenom?.[0], conv.bailleur?.nom?.[0]].filter(Boolean).join('').toUpperCase()

                return (
                  <motion.button
                    key={conv.id}
                    variants={itemVariants}
                    onClick={() => handleSelect(conv)}
                    whileHover={{ backgroundColor: 'var(--blue-light)' }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      width: '100%', padding: '14px 16px',
                      background: isActive ? 'var(--blue-light)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? 'var(--blue)' : 'transparent'}`,
                      border: 'none', borderBottom: '1px solid var(--border)',
                      cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s',
                    }}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: isActive ? 'var(--blue)' : 'var(--blue-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: '13px', fontWeight: 700,
                      color: isActive ? '#fff' : 'var(--blue)',
                      transition: 'background 0.2s, color 0.2s',
                    }}>
                      {initials || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.annonce?.titre ?? 'Annonce'}
                        </p>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                          {formatDateConv(conv.last_message_at)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {getDernierMessage(conv)}
                        </p>
                        {nonLus > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            style={{ background: 'var(--error)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px', marginLeft: '6px', flexShrink: 0 }}
                          >
                            {nonLus}
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Zone chat */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {showChat && selected && currentUserId ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28, ease: 'easeOut' as const }}
              >
                <button
                  onClick={() => setShowChat(false)}
                  className="md-hide"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '12px', padding: '4px 0', fontWeight: 500 }}
                >
                  <ArrowLeft size={14} /> Retour
                </button>
                <ChatBox
                  conversationId={selected.id}
                  currentUserId={currentUserId}
                  currentUserRole="etudiant"
                  currentUserPrenom={selected.etudiant?.prenom ?? ''}
                  currentUserNom={selected.etudiant?.nom ?? ''}
                  currentUserPhoto={currentUserPhoto}
                  interlocuteur={{ prenom: selected.bailleur?.prenom ?? '', nom: selected.bailleur?.nom ?? '', photo: null }}
                  annonceTitre={selected.annonce?.titre ?? ''}
                  annonce={selected.annonce ? {
                    id: selected.annonce.id, titre: selected.annonce.titre,
                    ville: selected.annonce.ville, prix: Number(selected.annonce.prix),
                    photo: selected.annonce.photos?.sort((a, b) => a.ordre - b.ordre)[0]?.url ?? null,
                  } : undefined}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md-show"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '320px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: '0 2px 12px rgba(26,45,79,0.06)' }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <MessageCircle size={28} color="var(--border)" />
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Sélectionnez une conversation</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  )
}
