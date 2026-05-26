import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Gift, PlusCircle } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'

const TYPE_FILTERS = [
  { key: 'tous',        label: 'Tous'         },
  { key: 'vetements',   label: '👗 Vêtements' },
  { key: 'livres',      label: '📚 Livres'    },
  { key: 'mobilier',    label: '🪑 Mobilier'  },
  { key: 'electronique', label: '💻 Électronique' },
  { key: 'divers',      label: '🎒 Divers'    },
]

export default async function DonsPage({
  searchParams,
}: {
  searchParams: Promise<{ type_don?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const typeDon = params.type_don ?? 'tous'

  let query = supabase
    .from('annonces')
    .select('*, photos:photos_annonces(url, ordre)')
    .eq('categorie', 'don')
    .eq('statut', 'active')
    .order('created_at', { ascending: false })

  if (typeDon !== 'tous') {
    query = query.ilike('titre', `%${typeDon}%`)
  }

  const { data: dons } = await query

  return (
    <main
      className="page-enter"
      style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,24px)' }}
    >
      <BackButton href="/etudiant" />

      {/* En-tête */}
      <div className="anim-fade-up" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: '#F3F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Gift size={22} color="#7C3AED" />
              </div>
              <h1 style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 'clamp(22px,4vw,30px)', color: 'var(--navy)',
              }}>
                Dons disponibles
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              Vêtements, livres, mobilier offerts par la communauté ·{' '}
              <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{dons?.length ?? 0}</span> don{(dons?.length ?? 0) > 1 ? 's' : ''} disponible{(dons?.length ?? 0) > 1 ? 's' : ''}
            </p>
          </div>

          <Link href="/etudiant/dons/publier" style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: '#7C3AED', color: '#fff',
            fontWeight: 600, fontSize: '13px',
            padding: '9px 16px', borderRadius: '10px',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
          }}>
            <PlusCircle size={15} />
            Proposer un don
          </Link>
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="anim-fade-up" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {TYPE_FILTERS.map(f => {
          const isActive = typeDon === f.key
          return (
            <Link
              key={f.key}
              href={`/etudiant/dons${f.key !== 'tous' ? `?type_don=${f.key}` : ''}`}
              style={{
                display: 'inline-block',
                padding: '8px 16px', borderRadius: '99px',
                fontSize: '13px', fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
                border: isActive ? '2px solid #7C3AED' : '1.5px solid var(--border)',
                background: isActive ? '#7C3AED' : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {/* Grille dons */}
      {dons && dons.length > 0 ? (
        <div className="annonces-grid">
          {dons.map((don, i) => (
            <Link
              key={don.id}
              href={`/annonces/${don.id}`}
              className={`anim-scale-in stagger-${Math.min(i + 1, 6)}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                className="annonce-card-hover"
              >
                {/* Photo */}
                <div style={{
                  height: '160px', background: '#F3F0FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {don.photos?.[0]?.url ? (
                    <img
                      src={don.photos[0].url}
                      alt={don.titre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Gift size={40} color="#C4B5FD" />
                  )}
                  {/* Badge GRATUIT */}
                  <span style={{
                    position: 'absolute', top: '10px', left: '10px',
                    background: '#16A34A', color: '#fff',
                    fontSize: '11px', fontWeight: 700,
                    padding: '3px 10px', borderRadius: '99px',
                    letterSpacing: '0.05em',
                  }}>
                    GRATUIT
                  </span>
                </div>

                {/* Contenu */}
                <div style={{ padding: '14px 16px' }}>
                  <p style={{
                    fontSize: '14px', fontWeight: 600, color: 'var(--navy)',
                    marginBottom: '6px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {don.titre}
                  </p>
                  {don.ville && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <MapPin size={12} />
                      {don.ville}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="anim-fade-up" style={{
          textAlign: 'center', padding: '80px 32px',
          background: 'var(--surface)',
          border: '2px dashed var(--border)', borderRadius: '20px',
        }}>
          <Gift size={40} style={{ margin: '0 auto 14px', opacity: 0.2, display: 'block', color: 'var(--navy)' }} />
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
            Aucun don disponible pour le moment
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Soyez le premier à proposer un don !
          </p>
          <Link href="/etudiant/dons/publier" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#7C3AED', color: '#fff',
            padding: '10px 20px', borderRadius: '10px',
            fontWeight: 600, fontSize: '14px', textDecoration: 'none',
          }}>
            <PlusCircle size={15} />
            Proposer un don
          </Link>
        </div>
      )}
    </main>
  )
}
