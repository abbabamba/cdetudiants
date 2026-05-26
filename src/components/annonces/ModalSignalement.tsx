'use client'

import { useState } from 'react'
import { Flag, X } from 'lucide-react'

const MOTIFS = [
  'Annonce frauduleuse',
  'Photos trompeuses ou inexactes',
  'Prix abusif',
  'Logement inexistant ou indisponible',
  'Bailleur irrespectueux',
  "Doublon d'annonce",
  'Autre',
]

interface Props {
  annonceId: string
  initialDejaSignale: boolean
}

export function ModalSignalement({ annonceId, initialDejaSignale }: Props) {
  const [open, setOpen] = useState(false)
  const [motif, setMotif] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dejaSignale, setDejaSignale] = useState(initialDejaSignale)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    if (!motif) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/signalements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ annonce_id: annonceId, motif, message }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Une erreur est survenue')
      return
    }

    setDejaSignale(true)
    setSuccess(true)
    setTimeout(() => setOpen(false), 1800)
  }

  if (dejaSignale && !open) {
    return (
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <span style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Flag size={13} />
          Annonce déjà signalée
        </span>
      </div>
    )
  }

  return (
    <>
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            padding: '4px 0',
            minHeight: '44px',
          }}
        >
          <Flag size={13} />
          Signaler cette annonce
        </button>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '460px',
              padding: '28px 24px 24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '18px', color: 'var(--navy)', margin: '0 0 2px' }}>
                  Signaler l&apos;annonce
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Votre signalement sera examiné par notre équipe
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'var(--bg)',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  padding: '8px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '44px',
                  minWidth: '44px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {success ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'var(--green)',
                fontSize: '15px',
                fontWeight: 600,
              }}>
                ✓ Signalement envoyé, merci.
              </div>
            ) : (
              <>
                {/* Motifs */}
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
                  Motif <span style={{ color: 'var(--error)' }}>*</span>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                  {MOTIFS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMotif(m)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: motif === m ? '1.5px solid var(--blue)' : '1.5px solid var(--border)',
                        background: motif === m ? 'var(--blue-light)' : 'var(--bg)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: motif === m ? 'var(--blue)' : 'var(--text)',
                        fontWeight: motif === m ? 600 : 400,
                        textAlign: 'left',
                        minHeight: '44px',
                        transition: 'all 0.12s',
                      }}
                    >
                      <span style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: motif === m ? '5px solid var(--blue)' : '2px solid var(--border)',
                        flexShrink: 0,
                        transition: 'all 0.12s',
                      }} />
                      {m}
                    </button>
                  ))}
                </div>

                {/* Commentaire */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '6px' }}>
                    Commentaire <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optionnel)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) setMessage(e.target.value)
                    }}
                    placeholder="Décrivez le problème en quelques mots…"
                    rows={3}
                    className="form-input"
                    style={{ resize: 'vertical', fontSize: '13px' }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {message.length}/500
                  </div>
                </div>

                {error && (
                  <p style={{ fontSize: '13px', color: 'var(--error)', marginBottom: '12px' }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!motif || loading}
                  className="btn-primary btn-press"
                  style={{
                    width: '100%',
                    opacity: !motif || loading ? 0.5 : 1,
                    cursor: !motif || loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Envoi…' : 'Envoyer le signalement'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
