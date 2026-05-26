import Link from 'next/link'
import { StatutBadge } from './StatutBadge'
import { ScoreBar } from './ScoreBar'
import { PlusCircle } from 'lucide-react'

interface ProfilEtudiant {
  score_profil: number
  statut_verification: string
  universite?: string | null
  age?: number | null
  email_universitaire?: string | null
  photo_url?: string | null
}

export function ProfilEtudiantCard({ pe }: { pe: ProfilEtudiant }) {
  const incomplet = pe.score_profil < 100

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontFamily: 'var(--font-playfair)', margin: 0 }}>Statut étudiant</h2>
        {incomplet && (
          <Link href="/profil/completer" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--blue)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            padding: '7px 14px',
            borderRadius: '8px',
            textDecoration: 'none',
          }}>
            <PlusCircle size={14} />
            Compléter
          </Link>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <ScoreBar score={pe.score_profil} />
        {incomplet && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Complétez votre profil pour rassurer les bailleurs et augmenter vos chances.
          </p>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <StatutBadge statut={pe.statut_verification} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
        {pe.universite && (
          <div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Université</div>
            <div style={{ fontWeight: 500, color: 'var(--text)' }}>{pe.universite}</div>
          </div>
        )}
        {pe.age && (
          <div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Âge</div>
            <div style={{ fontWeight: 500, color: 'var(--text)' }}>{pe.age} ans</div>
          </div>
        )}
        {pe.email_universitaire && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Email universitaire</div>
            <div style={{ fontWeight: 500, color: 'var(--text)', wordBreak: 'break-all' }}>{pe.email_universitaire}</div>
          </div>
        )}
      </div>
    </div>
  )
}