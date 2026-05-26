'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

type State = 'idle' | 'confirming-approve' | 'confirming-reject' | 'loading-approve' | 'loading-reject'

interface CertificatActionsProps {
  userId: string
  userEmail: string
  prenom: string
  onDone?: () => void
}

export function CertificatActions({ userId, prenom, onDone }: CertificatActionsProps) {
  const [state, setState] = useState<State>('idle')
  const [countdown, setCountdown] = useState(3)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (state !== 'confirming-approve' && state !== 'confirming-reject') return
    setCountdown(3)
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { setState('idle'); return 3 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [state])

  async function execute(action: 'approuver' | 'rejeter') {
    setState(action === 'approuver' ? 'loading-approve' : 'loading-reject')
    setError(null)
    try {
      const res = await fetch(action === 'approuver' ? '/api/admin/approuver' : '/api/admin/rejeter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        onDone ? onDone() : setTimeout(() => window.location.reload(), 800)
      } else {
        setError(action === 'approuver' ? "Erreur lors de l'approbation" : 'Erreur lors du rejet')
        setState('idle')
      }
    } catch {
      setError('Erreur réseau')
      setState('idle')
    }
  }

  const pct = (countdown / 3) * 100

  return (
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', minWidth: '152px' }}>
      {error && (
        <span style={{ fontSize: '11px', color: 'var(--error)', background: 'var(--error-light)', padding: '4px 10px', borderRadius: '8px' }}>
          {error}
        </span>
      )}

      {/* ── Approuver ── */}
      {state === 'loading-reject' ? null : state === 'loading-approve' ? (
        <button disabled style={btnStyle('green', true)}>
          <Loader2 size={14} className="animate-spin" /> Validation…
        </button>
      ) : state === 'confirming-approve' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '152px' }}>
          <button onClick={() => execute('approuver')} style={btnStyle('green')}>
            <CheckCircle size={14} /> Confirmer ? ({countdown}s)
          </button>
          <div style={{ height: '3px', background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--green)', width: `${pct}%`, transition: 'width 1s linear', borderRadius: 99 }} />
          </div>
          <button onClick={() => setState('idle')} style={cancelStyle}>Annuler</button>
        </div>
      ) : (
        <button
          onClick={() => setState('confirming-approve')}
          disabled={state === 'confirming-reject'}
          style={{ ...btnStyle('green'), opacity: state === 'confirming-reject' ? 0.35 : 1 }}
        >
          <CheckCircle size={14} /> {prenom ? `Approuver` : 'Approuver'}
        </button>
      )}

      {/* ── Rejeter ── */}
      {state === 'loading-approve' ? null : state === 'loading-reject' ? (
        <button disabled style={btnStyle('red', true)}>
          <Loader2 size={14} className="animate-spin" /> Rejet…
        </button>
      ) : state === 'confirming-reject' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '152px' }}>
          <button onClick={() => execute('rejeter')} style={btnStyle('red')}>
            <XCircle size={14} /> Confirmer ? ({countdown}s)
          </button>
          <div style={{ height: '3px', background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--error)', width: `${pct}%`, transition: 'width 1s linear', borderRadius: 99 }} />
          </div>
          <button onClick={() => setState('idle')} style={cancelStyle}>Annuler</button>
        </div>
      ) : (
        <button
          onClick={() => setState('confirming-reject')}
          disabled={state === 'confirming-approve'}
          style={{
            ...btnOutlineStyle,
            opacity: state === 'confirming-approve' ? 0.35 : 1,
          }}
        >
          <XCircle size={14} /> Rejeter
        </button>
      )}
    </div>
  )
}

const base: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  width: '152px', minHeight: '44px', borderRadius: '10px',
  fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none',
  transition: 'opacity 0.15s',
}

function btnStyle(color: 'green' | 'red', disabled = false): React.CSSProperties {
  return {
    ...base,
    background: color === 'green' ? 'var(--green)' : 'var(--error)',
    color: '#fff',
    opacity: disabled ? 0.65 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}

const btnOutlineStyle: React.CSSProperties = {
  ...base,
  background: 'transparent',
  border: '1.5px solid var(--error)',
  color: 'var(--error)',
}

const cancelStyle: React.CSSProperties = {
  background: 'none', border: 'none', fontSize: '11px', color: 'var(--text-muted)',
  cursor: 'pointer', textAlign: 'center', padding: '2px', width: '100%',
}
