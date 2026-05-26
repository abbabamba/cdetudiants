'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { createClient } from '@/lib/supabase/client'

type Step = 'saisie' | 'verification' | 'success'

export default function TelephoneBailleurPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('saisie')
  const [telephone, setTelephone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('telephone, phone_verified')
        .eq('id', user.id)
        .single()
      if (!profile) return
      if (profile.phone_verified) { router.replace('/bailleur/profil'); return }
      if (profile.telephone) setTelephone(profile.telephone)
    }
    init()
  }, [router])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  async function handleEnvoyer() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/sms/envoyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telephone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setStep('verification')
      setCountdown(60)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifier() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/sms/verifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telephone, code }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Code incorrect ou expiré'); return }
      setStep('success')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <BackButton href="/bailleur/profil" />

        {step === 'saisie' && (
          <>
            <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-playfair)', color: 'var(--navy)', marginBottom: '8px' }}>
              Vérifier mon téléphone
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Un SMS avec un code à 6 chiffres vous sera envoyé.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Votre numéro de téléphone</label>
              <input
                type="tel"
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="form-input"
                onKeyDown={e => e.key === 'Enter' && telephone && handleEnvoyer()}
              />
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: 'var(--error)', background: 'var(--error-light)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleEnvoyer}
              disabled={loading || !telephone}
              className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (loading || !telephone) ? 0.6 : 1 }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Envoyer le code SMS
            </button>
          </>
        )}

        {step === 'verification' && (
          <>
            <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-playfair)', color: 'var(--navy)', marginBottom: '8px' }}>
              Code de vérification
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Code envoyé au <strong>{telephone}</strong>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Code à 6 chiffres</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                className="form-input"
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 700 }}
                autoFocus
              />
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: 'var(--error)', background: 'var(--error-light)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleVerifier}
              disabled={loading || code.length < 6}
              className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', opacity: (loading || code.length < 6) ? 0.6 : 1 }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Vérifier le code
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px' }}>
              {countdown > 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>Renvoyer dans {countdown}s</span>
              ) : (
                <button
                  onClick={handleEnvoyer}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                >
                  Renvoyer un code
                </button>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                onClick={() => { setStep('saisie'); setCode(''); setError(null) }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', padding: 0 }}
              >
                ← Changer de numéro
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#DCFCE7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-playfair)', color: 'var(--navy)', marginBottom: '8px' }}>
              Numéro vérifié !
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Votre téléphone <strong>{telephone}</strong> est maintenant vérifié.
            </p>
            <Link
              href="/bailleur/profil"
              className="btn-primary"
              style={{ display: 'inline-block', textDecoration: 'none', padding: '10px 24px' }}
            >
              Retour au profil
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
