import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { AnnoncesGrid } from '@/components/annonces/AnnoncesGrid'
import { AnnoncesFilters } from '@/components/annonces/AnnoncesFilters'
import { WelcomeBanner } from '@/components/ui/WelcomeBanner'
import { Home, SlidersHorizontal } from 'lucide-react'

export default async function AnnoncesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; ville?: string; tri?: string; welcome?: string; categorie?: string }>
}) {
  const supabase = await createClient()
  const [params, { data: { user } }] = await Promise.all([
    searchParams,
    supabase.auth.getUser(),
  ])

  let query = supabase
    .from('annonces')
    .select('id, bailleur_id, titre, ville, prix, surface, type_logement, categorie, garantie, garantie_detail, statut, photos:photos_annonces(url, ordre)')
    .eq('statut', 'active')

  if (params.type && params.type !== 'tous') {
    query = query.eq('type_logement', params.type)
  }
  if (params.ville) {
    query = query.ilike('ville', `%${params.ville}%`)
  }
  if (params.categorie && params.categorie !== 'tous') {
    query = query.eq('categorie', params.categorie)
  }

  const orderBy = params.tri?.startsWith('prix') ? 'prix' : 'created_at'
  query = query.order(orderBy, { ascending: params.tri === 'prix_asc' })

  const { data: annonces } = await query
  const count = annonces?.length ?? 0

  return (
    <main
      className="page-enter"
      style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,24px)' }}
    >
      {params.welcome === '1' && <WelcomeBanner />}

      {/* En-tête */}
      <div className="anim-fade-up" style={{ marginBottom: 'clamp(20px,4vw,32px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(24px,5vw,34px)', color: 'var(--navy)', marginBottom: '6px',
            }}>
              Logements disponibles
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{count}</span>{' '}
              annonce{count > 1 ? 's' : ''} vérifiée{count > 1 ? 's' : ''}
              {params.ville ? ` · ${params.ville}` : ''}
            </p>
          </div>

          {/* Badge filtre actif */}
          {(params.type && params.type !== 'tous') || params.ville ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--blue-light)', border: '1px solid rgba(27,95,173,0.15)',
              borderRadius: '99px', padding: '6px 14px',
              fontSize: '13px', color: 'var(--blue)', fontWeight: 500,
            }}>
              <SlidersHorizontal size={13} />
              Filtres actifs
            </div>
          ) : null}
        </div>
      </div>

      {/* Filtres */}
      <Suspense fallback={
        <div className="skeleton" style={{ height: '80px', marginBottom: '24px', borderRadius: '12px' }} />
      }>
        <AnnoncesFilters total={count} basePath="/annonces" />
      </Suspense>

      {/* Grille */}
      {annonces && annonces.length > 0 ? (
        <AnnoncesGrid annonces={annonces} currentUserId={user?.id ?? null} />
      ) : (
        <div className="anim-fade-up" style={{
          textAlign: 'center', padding: '80px 32px',
          background: 'var(--surface)',
          border: '2px dashed var(--border)', borderRadius: '20px',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--bg)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <Home size={32} color="var(--border)" />
          </div>
          <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
            Aucune annonce ne correspond
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Modifiez vos filtres pour voir plus de résultats.
          </p>
        </div>
      )}
    </main>
  )
}
