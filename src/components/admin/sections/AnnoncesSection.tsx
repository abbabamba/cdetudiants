import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate, formatPrix } from '@/lib/utils'
import Link from 'next/link'
import ModererAnnonceButton from '@/components/admin/ModererAnnonceButton'

interface Signalement {
  motif: string
  message: string | null
  created_at: string
  etudiant: { prenom: string | null; nom: string | null } | null
}

interface Annonce {
  id: string
  titre: string | null
  ville: string | null
  prix: number | null
  statut: string
  created_at: string
  nb_signalements: number | null
  photos: { url: string; ordre: number }[] | null
  bailleur: { nom: string | null; prenom: string | null } | null
  signalements?: Signalement[]
}

const STATUT_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'var(--green)', bg: 'var(--green-light)' },
  signalee: { label: 'Signalée', color: 'var(--error)', bg: 'var(--error-light)' },
  suspendue: { label: 'Suspendue', color: '#92400E', bg: '#FEF3C7' },
  inactive: { label: 'Inactive', color: 'var(--text-muted)', bg: 'var(--border)' },
}

interface Props {
  statutFilter: string
}

export default async function AnnoncesSection({ statutFilter }: Props) {
  const supabase = createAdminClient()

  let query = supabase
    .from('annonces')
.select('id, titre, ville, prix, statut, created_at, nb_signalements, photos:photos_annonces(url, ordre), bailleur:profiles!annonces_bailleur_id_fkey(nom, prenom), signalements(motif, message, created_at, etudiant:profiles!signalements_etudiant_id_fkey(prenom, nom))')
    .neq('statut', 'supprimee')
    .order('created_at', { ascending: false })

  if (statutFilter !== 'toutes') {
    query = query.eq('statut', statutFilter)
  }

  const [
    { data: annonces },
    { count: nbActive },
    { count: nbSignalee },
    { count: nbSuspendue },
  ] = await Promise.all([
    query,
    supabase.from('annonces').select('*', { count: 'exact', head: true }).eq('statut', 'active'),
    supabase.from('annonces').select('*', { count: 'exact', head: true }).eq('statut', 'signalee'),
    supabase.from('annonces').select('*', { count: 'exact', head: true }).eq('statut', 'suspendue'),
  ])

  const pills = [
    { value: 'toutes', label: 'Toutes' },
    { value: 'active', label: 'Actives' },
    { value: 'signalee', label: 'Signalées' },
    { value: 'suspendue', label: 'Suspendues' },
  ]

  const list = (annonces ?? []) as unknown as Annonce[]

  return (
    <div>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '28px',
          color: 'var(--navy)',
          fontWeight: 700,
          margin: 0,
        }}>
          Annonces
        </h1>
        <div style={{ display: 'flex', gap: '12px', fontSize: '13px', fontWeight: 500 }}>
          <span style={{ color: 'var(--green)' }}>{nbActive ?? 0} active{(nbActive ?? 0) > 1 ? 's' : ''}</span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span style={{ color: 'var(--error)' }}>{nbSignalee ?? 0} signalée{(nbSignalee ?? 0) > 1 ? 's' : ''}</span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span style={{ color: '#92400E' }}>{nbSuspendue ?? 0} suspendue{(nbSuspendue ?? 0) > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Filtres pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {pills.map(p => (
          <Link
            key={p.value}
            href={`/admin?section=annonces&statut=${p.value}`}
            style={{
              display: 'inline-block',
              padding: '7px 16px',
              borderRadius: '99px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              border: '1px solid',
              minHeight: '44px',
              lineHeight: '28px',
              ...(statutFilter === p.value
                ? { background: 'var(--blue)', color: '#fff', borderColor: 'var(--blue)' }
                : { background: 'var(--surface)', color: 'var(--text)', borderColor: 'var(--border)' }),
            }}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Liste annonces */}
      {list.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '48px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '14px',
        }}>
          Aucune annonce dans cette catégorie.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map(a => {
            const photo = a.photos?.sort((x, y) => x.ordre - y.ordre)[0]
            const statutStyle = STATUT_STYLE[a.statut] ?? STATUT_STYLE.inactive

            return (
              <div key={a.id} style={{
                background: 'var(--surface)',
                border: a.statut === 'signalee'
                  ? '1.5px solid var(--error)'
                  : '1px solid var(--border)',
                borderRadius: '14px',
                overflow: 'hidden',
              }}>
                {/* Contenu principal */}
                <div style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Photo */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'var(--border)',
                  }}>
                    {photo ? (
                      <img
                        src={photo.url}
                        alt={a.titre ?? ''}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        color: 'var(--text-muted)',
                      }}>
                        🏠
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--navy)' }}>
                        {a.titre ?? 'Sans titre'}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: statutStyle.bg,
                        color: statutStyle.color,
                      }}>
                        {statutStyle.label}
                      </span>
                      {(a.signalements?.length ?? 0) > 0 && (
                        <span className="animate-pulse" style={{
                          fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                          background: a.statut === 'signalee' ? 'var(--error-light)' : '#FEF3C7',
                          color: a.statut === 'signalee' ? 'var(--error)' : '#92400E',
                        }}>
                          {a.statut === 'signalee' ? '🚨' : '⚠'} {a.signalements?.length} signalement{(a.signalements?.length ?? 0) > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      {a.ville} · {a.prix != null ? formatPrix(a.prix) + '/mois' : '—'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Par {a.bailleur?.prenom} {a.bailleur?.nom} · {formatDate(a.created_at)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <Link
                      href={`/annonces/${a.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '12px',
                        color: 'var(--blue)',
                        textDecoration: 'none',
                        fontWeight: 500,
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      Voir l&apos;annonce →
                    </Link>
                    <ModererAnnonceButton annonceId={a.id} statut={a.statut} />
                  </div>
                </div>

                {/* Signalements collapsibles */}
                {(a.signalements?.length ?? 0) > 0 && (
                  <details style={{ borderTop: '1px solid var(--error-light)' }}>
                    <summary style={{
                      background: 'var(--error-light)', padding: '10px 16px',
                      cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                      color: 'var(--error)', listStyle: 'none', display: 'flex',
                      alignItems: 'center', gap: '6px',
                    }}>
                      🚨 {a.nb_signalements ?? a.signalements?.length} signalement{(a.nb_signalements ?? a.signalements?.length ?? 0) > 1 ? 's' : ''} — cliquer pour voir
                    </summary>
                    <div style={{ background: 'var(--error-light)', padding: '0 16px 12px' }}>
                      {(a.signalements ?? []).map((s, idx) => (
                        <div key={idx} style={{
                          background: '#fff', borderRadius: '8px', padding: '8px 12px',
                          marginBottom: idx < (a.signalements?.length ?? 0) - 1 ? '6px' : 0,
                          fontSize: '12px',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--error)' }}>{s.motif}</span>
                            <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                              {s.etudiant?.prenom} {s.etudiant?.nom} · {formatDate(s.created_at)}
                            </span>
                          </div>
                          {s.message && (
                            <p style={{ color: 'var(--text)', margin: '4px 0 0', fontStyle: 'italic' }}>
                              &ldquo;{s.message}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
