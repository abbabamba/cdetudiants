export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnnonceCard } from '@/components/annonces/AnnonceCard'
import { AnnoncesFilters } from '@/components/annonces/AnnoncesFilters'
import { BadgeVerifie } from '@/components/etudiant/BadgeVerifie'
import { EtudiantGreeting } from '@/components/etudiant/EtudiantGreeting'
import { Home } from 'lucide-react'
import Link from 'next/link'
import { EtudiantSidebarNav } from '@/components/etudiant/EtudiantSidebarNav'
import { VerificationTimeline } from '@/components/etudiant/VerificationTimeline'
import { MOCK_ETUDIANT, MOCK_PROFIL_ETUDIANT } from '@/lib/preview-mock'

export default async function EtudiantPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; ville?: string; tri?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const previewRole = cookieStore.get('admin_view_as')?.value
  const isPreview = previewRole === 'etudiant'

  const paramsResolved = await searchParams

  let profile: { nom: string; prenom: string; role?: string } | null = null
  let pe: { statut_verification: string } | null = null
  let favorisData: { annonce_id: string }[] = []

  if (isPreview) {
    profile = { nom: MOCK_ETUDIANT.nom, prenom: MOCK_ETUDIANT.prenom, role: 'etudiant' }
    pe = { statut_verification: MOCK_PROFIL_ETUDIANT.statut_verification }
  } else {
    const [{ data: p }, { data: peData }, { data: fav }] = await Promise.all([
      supabase.from('profiles').select('nom, prenom, role').eq('id', user.id).single(),
      supabase.from('profils_etudiants').select('statut_verification').eq('user_id', user.id).single(),
      supabase.from('favoris').select('annonce_id').eq('user_id', user.id),
    ])
    profile = p
    pe = peData
    favorisData = fav ?? []
  }

  let query = supabase
    .from('annonces')
    .select('id, bailleur_id, titre, ville, prix, surface, type_logement, categorie, garantie, garantie_detail, statut, photos:photos_annonces(url, ordre)')
    .eq('statut', 'active')

  if (paramsResolved.type && paramsResolved.type !== 'tous') {
    query = query.eq('type_logement', paramsResolved.type)
  }
  if (paramsResolved.ville) {
    query = query.ilike('ville', `%${paramsResolved.ville}%`)
  }

  const orderBy = paramsResolved.tri?.startsWith('prix') ? 'prix' : 'created_at'
  query = query.order(orderBy, { ascending: paramsResolved.tri === 'prix_asc' })

  const { data: annonces } = await query

  const favorisIds = new Set((favorisData).map(f => f.annonce_id))
  const favorisCount = favorisIds.size
  const statut = pe?.statut_verification ?? 'non_verifie'
  const showStatutLink = statut !== 'verifie_email' && statut !== 'verifie_admin'

  return (
    <div className="etudiant-layout">

      {/* ── Sidebar desktop ──────────────────── */}
      <aside className="etudiant-sidebar hidden md:flex" style={{ flexDirection: 'column', gap: '0' }}>

        {pe && (
          <div className="anim-fade-up" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <BadgeVerifie statut={statut} size="sm" />
            {showStatutLink && (
              <Link href="/etudiant/profil" style={{
                fontSize: '12px', color: 'var(--blue)',
                textDecoration: 'none', fontWeight: 500,
              }}>
                Mon statut →
              </Link>
            )}
          </div>
        )}

        <EtudiantSidebarNav favorisCount={favorisCount} />
      </aside>

      {/* ── Contenu principal ─────────────────── */}
      <main className="etudiant-main">

        {/* Bannière prévisualisation */}
        {isPreview && (
          <div style={{
            background: 'var(--blue)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              👁 Mode prévisualisation — vous voyez l&apos;expérience d&apos;un étudiant type
            </span>
            <a href="/admin" style={{
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              fontSize: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '4px 10px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
            }}>
              ← Admin
            </a>
          </div>
        )}

        {pe && statut !== 'verifie_admin' && (
          <VerificationTimeline statut={statut as 'non_verifie' | 'verifie_email' | 'en_attente_admin' | 'verifie_admin'} />
        )}

        <EtudiantGreeting prenom={profile?.prenom} count={annonces?.length ?? 0} />

        <Suspense fallback={
          <div className="skeleton" style={{ height: '56px', marginBottom: '28px', borderRadius: '12px' }} />
        }>
          <AnnoncesFilters total={annonces?.length ?? 0} basePath="/etudiant" />
        </Suspense>

        {annonces && annonces.length > 0 ? (
          <div className="annonces-grid">
            {annonces.map((a, i) => (
              <div key={a.id} className={`anim-scale-in stagger-${Math.min(i + 1, 6)}`}>
                <AnnonceCard
                  id={a.id}
                  titre={a.titre}
                  ville={a.ville}
                  prix={a.prix}
                  surface={a.surface}
                  type_logement={a.type_logement}
                  garantie={a.garantie}
                  photo={a.photos?.[0]?.url ?? null}
                  showFavori={!isPreview}
                  isFavori={favorisIds.has(a.id)}
                  isOwn={!isPreview && a.bailleur_id === user.id}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="anim-fade-up" style={{
            textAlign: 'center', padding: '72px 32px',
            background: 'var(--surface)',
            border: '2px dashed var(--border)',
            borderRadius: '20px',
          }}>
            <Home size={40} style={{ margin: '0 auto 14px', opacity: 0.2, display: 'block', color: 'var(--navy)' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '6px' }}>
              Aucune annonce disponible
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Modifiez vos filtres ou revenez plus tard.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
