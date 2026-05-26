'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? 'votre adresse email'
  const uploadFailed = searchParams.get('upload') === 'failed'

  return (
    <div
      className="page-enter"
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/">
            <img src="/images/logo.jpeg" alt="Coin des Étudiants" style={{ height: '48px', objectFit: 'contain' }} />
          </Link>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>

          {/* Icône enveloppe animée */}
          <div
            className="anim-scale-in"
            style={{
              width: '96px', height: '96px', borderRadius: '50%',
              background: 'var(--green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>

          <h1
            className="anim-fade-up"
            style={{ fontSize: '24px', marginBottom: '12px', animationDelay: '0.1s' }}
          >
            Vérifiez votre boîte mail
          </h1>

          <p
            className="anim-fade-up"
            style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.7, animationDelay: '0.15s' }}
          >
            Un lien de confirmation a été envoyé à
          </p>

          <div
            className="anim-fade-up"
            style={{
              fontSize: '14px', fontWeight: 600, color: 'var(--navy)',
              background: 'var(--blue-light)', padding: '10px 20px',
              borderRadius: '8px', marginBottom: '20px',
              wordBreak: 'break-all', textAlign: 'center',
              animationDelay: '0.2s',
            }}
          >
            {email}
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: uploadFailed ? '12px' : '28px', fontStyle: 'italic' }}>
            Cliquez sur le lien dans l&apos;email pour activer votre compte.<br />
            Pensez à vérifier vos spams.
          </p>

          {uploadFailed && (
            <div style={{
              background: '#FEF3C7',
              borderLeft: '3px solid #D97706',
              borderRadius: '0 8px 8px 0',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#92400E',
              marginBottom: '28px',
              textAlign: 'left',
            }}>
              Votre certificat n&apos;a pas pu être uploadé.
              Vous pourrez le soumettre depuis votre profil
              après confirmation de votre email.
            </div>
          )}

          <Link
            href="/login"
            className="btn-outline btn-press"
            style={{ display: 'block', textDecoration: 'none', marginBottom: '14px', minHeight: '48px' }}
          >
            Déjà confirmé ? Se connecter
          </Link>

          <Link href="/" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}
