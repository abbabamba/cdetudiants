export function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--green)' : score >= 40 ? '#D97706' : '#DC2626'
  const label = score >= 70 ? 'Bon profil' : score >= 40 ? 'Profil correct' : 'Profil incomplet'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Score de profil</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color }}>{score}/100 — {label}</span>
      </div>
      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: color,
          borderRadius: '99px',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}