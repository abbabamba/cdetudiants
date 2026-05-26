'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { CertificatActions } from './CertificatActions'
import { formatDate } from '@/lib/utils'

interface CertificatCardProps {
  userId: string
  profileNom: string | null
  profilePrenom: string | null
  photoUrl: string | null
  email: string | null
  ville: string | null
  createdAt: string
  certUrl: string | null
  isNew: boolean
  index: number
}

export function CertificatCard({
  userId, profileNom, profilePrenom, photoUrl,
  email, ville, createdAt, certUrl, isNew, index,
}: CertificatCardProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  if (isHidden) return null

  const initials = `${(profilePrenom?.[0] ?? '?').toUpperCase()}${(profileNom?.[0] ?? '').toUpperCase()}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={isExiting
        ? { x: -56, opacity: 0, scale: 0.96 }
        : { opacity: 1, y: 0 }
      }
      transition={isExiting
        ? { duration: 0.32, ease: [0.4, 0, 1, 1] }
        : { duration: 0.38, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }
      }
      onAnimationComplete={() => { if (isExiting) setIsHidden(true) }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '22px 24px',
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        position: 'relative',
        boxShadow: '0 1px 4px rgba(26,45,79,0.05)',
      }}
    >
      {/* Badge NOUVEAU */}
      {isNew && (
        <span style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'linear-gradient(135deg,#10B981,#059669)',
          color: '#fff', fontSize: '9px', fontWeight: 700,
          padding: '3px 8px', borderRadius: '99px', letterSpacing: '0.07em',
        }}>
          NOUVEAU
        </span>
      )}

      {/* Avatar */}
      <div style={{
        width: '52px', height: '52px', borderRadius: '12px',
        background: photoUrl ? 'transparent' : 'var(--blue-light)',
        overflow: 'hidden', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', fontWeight: 700, color: 'var(--blue)',
        border: '1px solid var(--border)',
      }}>
        {photoUrl
          ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials
        }
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '17px', color: 'var(--navy)', fontWeight: 600, margin: '0 0 4px',
        }}>
          {profilePrenom} {profileNom}
        </p>
        {email && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 2px' }}>{email}</p>
        )}
        {ville && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 2px' }}>
            📍 {ville}
          </p>
        )}
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Reçu le {formatDate(createdAt)}
        </p>

        {certUrl ? (
          <a
            href={certUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: 'var(--blue)', fontSize: '13px', fontWeight: 500,
              border: '1px solid var(--blue-light)', background: 'var(--blue-light)',
              padding: '7px 14px', borderRadius: '8px', textDecoration: 'none',
            }}
          >
            <FileText size={14} />
            Voir le certificat →
          </a>
        ) : (
          <div style={{
            marginTop: '14px', padding: '10px 14px',
            background: '#FEF3C7', borderRadius: '8px',
            fontSize: '13px', color: '#92400E',
          }}>
            ⚠ Aucun certificat joint — vous pouvez approuver manuellement ou rejeter.
          </div>
        )}
      </div>

      {/* Actions */}
      <CertificatActions
        userId={userId}
        userEmail={email ?? ''}
        prenom={profilePrenom ?? ''}
        onDone={() => setIsExiting(true)}
      />
    </motion.div>
  )
}
