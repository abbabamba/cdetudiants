interface BadgeVerifieProps {
  statut: string
  size?: 'sm' | 'md'
}

export function BadgeVerifie({ statut, size = 'md' }: BadgeVerifieProps) {
  if (statut === 'verifie_email' || statut === 'verifie_admin') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '4px' : '5px',
        background: 'var(--green-light)',
        color: 'var(--green)',
        fontSize: size === 'sm' ? '11px' : '13px',
        fontWeight: 700,
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: '99px',
      }}>
        <svg width={size === 'sm' ? 11 : 13} height={size === 'sm' ? 11 : 13}
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Étudiant vérifié
      </span>
    )
  }

  if (statut === 'en_attente_admin') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '4px' : '5px',
        background: '#FEF3C7',
        color: '#92400E',
        fontSize: size === 'sm' ? '11px' : '13px',
        fontWeight: 600,
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: '99px',
      }}>
        <span style={{
          width: size === 'sm' ? '6px' : '7px',
          height: size === 'sm' ? '6px' : '7px',
          borderRadius: '50%',
          background: '#D97706',
          animation: 'pulse-dot 1.4s ease-in-out infinite',
          flexShrink: 0,
        }} />
        Vérification en cours
      </span>
    )
  }

  return null
}
