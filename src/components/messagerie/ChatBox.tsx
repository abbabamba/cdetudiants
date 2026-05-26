'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'

interface Message {
  id: string
  contenu: string
  sender_id: string
  created_at: string
  lu_par_bailleur: boolean
  lu_par_etudiant: boolean
}

interface AnnonceRef {
  id: string
  titre: string
  ville: string
  prix: number
  photo?: string | null
}

interface ChatBoxProps {
  conversationId: string
  currentUserId: string
  currentUserRole: 'etudiant' | 'bailleur'
  currentUserPrenom?: string
  currentUserNom?: string
  currentUserPhoto?: string | null
  interlocuteur: {
    prenom: string
    nom: string
    photo?: string | null
  }
  annonceTitre: string
  annonce?: AnnonceRef
}

function formatHeure(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  const hh = date.getHours().toString().padStart(2, '0')
  const mm = date.getMinutes().toString().padStart(2, '0')
  if (isToday) return `${hh}:${mm}`
  const dd = date.getDate().toString().padStart(2, '0')
  const mo = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${dd}/${mo} ${hh}:${mm}`
}

function Avatar({
  prenom, nom, photo, size = 28,
}: {
  prenom: string
  nom: string
  photo?: string | null
  size?: number
}) {
  const initiales = [prenom?.[0], nom?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?'
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'var(--blue-light)',
      color: 'var(--blue)',
      flexShrink: 0,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: Math.floor(size * 0.38),
      fontWeight: 700,
    }}>
      {photo ? (
        <img src={photo} alt={prenom}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : initiales}
    </div>
  )
}

export function ChatBox({
  conversationId,
  currentUserId,
  currentUserRole,
  currentUserPrenom: _currentUserPrenom,
  currentUserNom: _currentUserNom,
  currentUserPhoto: _currentUserPhoto,
  interlocuteur,
  annonceTitre,
  annonce,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [contenu, setContenu] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    async function init() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (!mounted) return
      setMessages(data ?? [])
      setLoading(false)

      const champLu = currentUserRole === 'etudiant' ? 'lu_par_etudiant' : 'lu_par_bailleur'
      await supabase
        .from('messages')
        .update({ [champLu]: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
    }

    init()

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 50)
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId, currentUserRole])

  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior })
    }
  }, [loading])

  async function handleSend() {
    if (!contenu.trim() || sending) return
    setSending(true)
    const supabase = createClient()
    const msgContenu = contenu.trim()
    setContenu('')

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      contenu: msgContenu,
    })

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    setSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const initiales = [interlocuteur.prenom[0], interlocuteur.nom[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '500px',
      maxHeight: '70vh',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      background: 'var(--surface)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--blue-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue)' }}>{initiales}</span>
          </div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', margin: 0 }}>
            {interlocuteur.prenom} {interlocuteur.nom}
          </p>
        </div>

        {annonce ? (
          <a
            href={`/annonces/${annonce.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px 10px',
              textDecoration: 'none',
              width: '100%',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--blue)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: '#EEF4F0',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              {annonce.photo ? (
                <img
                  src={annonce.photo}
                  alt={annonce.titre}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}>
                  🏠
                </div>
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--navy)',
                margin: '0 0 1px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {annonce.titre}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                {annonce.ville} ·{' '}
                <span style={{ color: 'var(--blue)', fontWeight: 600 }}>
                  {annonce.prix.toLocaleString('fr-FR')} €/mois
                </span>
              </p>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--blue)', flexShrink: 0, marginLeft: 'auto' }}>
              →
            </span>
          </a>
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{annonceTitre}</p>
        )}
      </div>

      {/* Zone messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{
                height: '40px',
                borderRadius: '12px',
                marginBottom: '12px',
                width: i === 2 ? '60%' : '75%',
                marginLeft: i === 2 ? 'auto' : undefined,
              }} />
            ))}
          </>
        ) : messages.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '40px' }}>
            Démarrez la conversation
          </p>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.sender_id === currentUserId
            const sameSenderAsPrev = idx > 0 &&
              messages[idx - 1].sender_id === msg.sender_id
            const nextIsSameSender = idx < messages.length - 1 &&
              messages[idx + 1].sender_id === msg.sender_id

            if (isMine) {
              return (
                <div key={msg.id} style={{
                  marginTop: sameSenderAsPrev ? '3px' : idx === 0 ? '0' : '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                    background: 'var(--blue)',
                    color: '#fff',
                    borderRadius: '16px 16px 4px 16px',
                  }}>
                    {msg.contenu}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginTop: '3px',
                  }}>
                    {formatHeure(msg.created_at)}
                  </span>
                </div>
              )
            }

            return (
              <div key={msg.id} style={{
                marginTop: sameSenderAsPrev ? '3px' : idx === 0 ? '0' : '12px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
              }}>
                <div style={{ width: 28, flexShrink: 0 }}>
                  {!nextIsSameSender ? (
                    <Avatar
                      prenom={interlocuteur.prenom}
                      nom={interlocuteur.nom}
                      photo={interlocuteur.photo}
                      size={28}
                    />
                  ) : (
                    <div style={{ width: 28 }} />
                  )}
                </div>
                <div style={{ maxWidth: '75%' }}>
                  {!sameSenderAsPrev && (
                    <p style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      margin: '0 0 3px 2px',
                      fontWeight: 500,
                    }}>
                      {interlocuteur.prenom}
                    </p>
                  )}
                  <div style={{
                    padding: '10px 14px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px 16px 16px 4px',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                    color: 'var(--text)',
                  }}>
                    {msg.contenu}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginTop: '3px',
                    display: 'block',
                  }}>
                    {formatHeure(msg.created_at)}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Zone saisie */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '12px 16px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
      }}>
        <textarea
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message... (Entrée pour envoyer)"
          rows={1}
          maxLength={1000}
          style={{
            flex: 1,
            resize: 'none',
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '14px',
            fontFamily: 'var(--font-inter), sans-serif',
            outline: 'none',
            minHeight: '44px',
            maxHeight: '120px',
            overflowY: 'auto',
            background: 'var(--surface)',
            color: 'var(--text)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--blue)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
        />
        <button
          onClick={handleSend}
          disabled={!contenu.trim() || sending}
          aria-label="Envoyer le message"
          style={{
            background: 'var(--blue)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: !contenu.trim() || sending ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            opacity: !contenu.trim() || sending ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
