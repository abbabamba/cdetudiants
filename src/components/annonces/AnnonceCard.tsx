import Link from 'next/link'
import { MapPin, Home } from 'lucide-react'
import { BoutonFavori } from './BoutonFavori'

interface AnnonceCardProps {
  id: string
  titre: string
  ville: string
  prix: number
  surface?: number | null
  type_logement?: string | null
  categorie?: string | null
  garantie?: string | null
  garantie_detail?: string | null
  photo?: string | null
  isFavori?: boolean
  showFavori?: boolean
  isOwn?: boolean
}

const badgeConfig: Record<string, { bg: string; color: string; label: string }> = {
  logement:   { bg: 'var(--blue-light)',  color: 'var(--blue)',   label: 'Logement'   },
  studio:     { bg: 'var(--blue-light)',  color: 'var(--blue)',   label: 'Studio'     },
  colocation: { bg: 'var(--blue-light)',  color: 'var(--blue)',   label: 'Colocation' },
  chambre:    { bg: 'var(--blue-light)',  color: 'var(--blue)',   label: 'Chambre'    },
  emploi:     { bg: '#FEF3C7',           color: '#92400E',       label: 'Emploi'     },
  stage:      { bg: '#FEF3C7',           color: '#92400E',       label: 'Stage'      },
  alternance: { bg: '#FEF3C7',           color: '#92400E',       label: 'Alternance' },
  service:    { bg: '#F3F0FF',           color: '#7C3AED',       label: 'Service'    },
  don:        { bg: 'var(--green-light)', color: 'var(--green)', label: 'Don'        },
}

export function AnnonceCard({
  id, titre, ville, prix, surface, type_logement, categorie, garantie, garantie_detail, photo,
  isFavori = false,
  showFavori = false,
  isOwn = false,
}: AnnonceCardProps) {
  const badgeKey = type_logement ?? categorie ?? ''
  const badge = badgeConfig[badgeKey] ?? { bg: 'var(--bg)', color: 'var(--text-muted)', label: badgeKey }
  const surf = surface != null ? parseFloat(surface.toString()).toFixed(1).replace('.0', '') : null

  return (
    <Link href={`/annonces/${id}`} style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
      <div className="annonce-card card-hover btn-press" style={{ width: '100%' }}>

        {/* Photo */}
        <div className="annonce-photo" style={{ position: 'relative' }}>
          {photo ? (
            <img
              src={photo}
              alt={titre}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Home size={36} color="#9DB8A4" />
            </div>
          )}

          {/* Badge type */}
          <span style={{
            position: 'absolute', top: '10px', left: '10px',
            background: badge.bg, color: badge.color,
            fontSize: '11px', fontWeight: 700,
            padding: '4px 10px', borderRadius: '99px',
            textTransform: 'capitalize',
            backdropFilter: 'blur(4px)',
          }}>
            {badge.label}
          </span>

          {/* Badge "Mon annonce" */}
          {isOwn && (
            <span style={{
              position: 'absolute', top: '10px', right: showFavori ? '42px' : '10px',
              background: 'rgba(26,45,79,0.82)', color: '#fff',
              fontSize: '10px', fontWeight: 700,
              padding: '3px 8px', borderRadius: '99px',
              backdropFilter: 'blur(4px)',
              letterSpacing: '0.04em',
            }}>
              MON ANNONCE
            </span>
          )}

          {/* Bouton favori */}
          {showFavori && (
            <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2 }}>
              <BoutonFavori
                annonceId={id}
                initialIsFavori={isFavori}
                size="sm"
              />
            </div>
          )}

          {/* Overlay gradient */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '40px',
            background: 'linear-gradient(transparent, rgba(26,45,79,0.15))',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Infos */}
        <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{
            fontWeight: 600, fontSize: '14px', color: 'var(--navy)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            margin: 0,
          }}>
            {titre}
          </p>

          <p style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', color: 'var(--text-muted)',
            margin: '0 0 8px',
          }}>
            <MapPin size={12} strokeWidth={2} />
            {ville}
          </p>

          <div style={{
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'space-between', marginTop: 'auto',
          }}>
            <div style={{ lineHeight: 1 }}>
              {categorie === 'don' ? (
                <span style={{ color: 'var(--green)', fontWeight: 800, fontSize: '18px' }}>
                  GRATUIT
                </span>
              ) : (
                <>
                  <span style={{
                    fontSize: '20px', fontWeight: 700,
                    color: 'var(--blue)',
                    fontFamily: 'var(--font-playfair), serif',
                  }}>
                    {prix.toLocaleString('fr-FR')} €
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '2px' }}>
                    /mois
                  </span>
                </>
              )}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
              {surf && <>{surf} m²<br /></>}
              {garantie && (
                <span style={{ textTransform: 'capitalize' }}>
                  {garantie === 'autre' && garantie_detail ? garantie_detail : garantie}
                </span>
              )}
            </span>
          </div>
        </div>

      </div>
    </Link>
  )
}
