import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

const config: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  verifie_email: {
    label: 'Email universitaire vérifié',
    icon: <CheckCircle size={13} />,
    bg: 'var(--green-light)',
    color: 'var(--green)',
  },
  verifie_admin: {
    label: 'Vérifié par l\'équipe',
    icon: <CheckCircle size={13} />,
    bg: 'var(--green-light)',
    color: 'var(--green)',
  },
  en_attente_admin: {
    label: 'Vérification en cours (48h)',
    icon: <Clock size={13} />,
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
  },
  non_verifie: {
    label: 'Non vérifié',
    icon: <AlertCircle size={13} />,
    bg: '#F1EFE8',
    color: '#6B6560',
  },
}

export function StatutBadge({ statut }: { statut: string }) {
  const c = config[statut] ?? config.non_verifie
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: c.bg,
      color: c.color,
      fontSize: '12px',
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: '99px',
    }}>
      {c.icon}
      {c.label}
    </span>
  )
}