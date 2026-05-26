import Link from 'next/link'
import { MapPin, Home, Pencil } from 'lucide-react'
import { DeleteAnnonceButton } from '@/components/annonces/DeleteAnnonceButton'
import { ToggleStatutButton } from '@/components/annonces/ToggleStatutButton'

interface MesAnnoncesCardProps {
  id: string
  titre: string
  ville: string
  prix: number
  surface: number | null
  statut: string
  photo?: string | null
}

const statutConfig: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: 'Active',    bg: 'var(--green-light)', color: 'var(--green)' },
  suspendue: { label: 'Suspendue', bg: '#FEF3C7',            color: '#92400E'      },
  signalee:  { label: 'Signalée', bg: '#FEE2E2',            color: '#991B1B'      },
}

export function MesAnnoncesCard({
  id, titre, ville, prix, surface, statut, photo,
}: MesAnnoncesCardProps) {
  const sc = statutConfig[statut] ?? statutConfig.suspendue
  const surf = surface != null ? parseFloat(surface.toString()).toFixed(1).replace('.0', '') : null

  return (
    <div className="card-hover" style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'row',
      gap: 0,
    }}>
      {/* Photo */}
      <div style={{
        width: '120px', flexShrink: 0,
        background: '#EEF4F0', position: 'relative',
        minHeight: '100px',
      }}>
        {photo ? (
          <img
            src={photo}
            alt={titre}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}>
            <Home size={28} color="#9DB8A4" />
          </div>
        )}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{
            fontWeight: 600, fontSize: '15px', color: 'var(--navy)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            margin: 0, flex: 1,
          }}>
            {titre}
          </p>
          <span style={{
            fontSize: '11px', fontWeight: 700,
            padding: '3px 10px', borderRadius: '99px',
            background: sc.bg, color: sc.color,
            flexShrink: 0,
          }}>
            {sc.label}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <MapPin size={12} strokeWidth={2} />
            {ville}
          </span>
          {surf && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{surf} m²</span>}
          <span style={{
            fontSize: '16px', fontWeight: 700, color: 'var(--blue)',
            fontFamily: 'var(--font-playfair), serif',
          }}>
            {prix.toLocaleString('fr-FR')} €<span style={{ fontSize: '12px', fontWeight: 400, fontFamily: 'inherit', color: 'var(--text-muted)' }}>/mois</span>
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          <ModifierLink id={id} />
          {(statut === 'active' || statut === 'suspendue') && (
            <ToggleStatutButton annonceId={id} statut={statut as 'active' | 'suspendue'} />
          )}
          <DeleteAnnonceButton annonceId={id} titre={titre} />
        </div>
      </div>
    </div>
  )
}

/* ── Lien Modifier avec shimmer natif CSS ── */
function ModifierLink({ id }: { id: string }) {
  return (
    <Link
      href={`/bailleur/annonces/${id}/modifier`}
      className="btn-modifier"
    >
      <Pencil size={12} />
      Modifier
    </Link>
  )
}
