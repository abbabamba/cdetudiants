import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnnonceCard } from '@/components/annonces/AnnonceCard'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'

interface AnnonceFavori {
  id: string
  titre: string
  ville: string
  prix: number
  surface?: number | null
  type_logement?: string | null
  categorie?: string | null
  garantie?: string | null
  statut: string
  photos: { url: string; ordre: number }[]
}

export default async function FavorisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: favoris } = await supabase
    .from('favoris')
    .select(`
      annonce_id,
      annonces!inner(
        id, titre, ville, prix, surface,
        type_logement, garantie, statut,
        photos:photos_annonces(url, ordre)
      )
    `)
    .eq('user_id', user.id)
    .eq('annonces.statut', 'active')
    .order('created_at', { ascending: false })

  const annonces = (favoris ?? [])
    .map(f => f.annonces as unknown as AnnonceFavori)
    .filter(Boolean)

  return (
    <div className="page-enter" style={{
      flex: 1,
      background: 'var(--bg)',
      padding: 'clamp(20px,4vw,40px) clamp(16px,4vw,32px)',
    }}>

      <BackButton href="/etudiant" />

      {/* En-tête */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '28px',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: 'var(--error-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Heart size={20} color="var(--error)" fill="var(--error)" />
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 'clamp(20px,5vw,26px)',
            color: 'var(--navy)', margin: 0,
          }}>
            Mes favoris
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            {annonces.length > 0
              ? `${annonces.length} annonce${annonces.length > 1 ? 's' : ''} sauvegardée${annonces.length > 1 ? 's' : ''}`
              : 'Aucun favori pour l\'instant'
            }
          </p>
        </div>
      </div>

      {annonces.length > 0 ? (
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
                showFavori={true}
                isFavori={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="anim-fade-up" style={{
          textAlign: 'center',
          padding: '72px 32px',
          background: 'var(--surface)',
          border: '2px dashed var(--border)',
          borderRadius: '20px',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--error-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Heart size={30} color="var(--error)" />
          </div>
          <h3 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '18px', color: 'var(--navy)', marginBottom: '8px',
          }}>
            Aucun favori pour l&apos;instant
          </h3>
          <p style={{
            fontSize: '14px', color: 'var(--text-muted)',
            marginBottom: '24px', maxWidth: '260px', margin: '0 auto 24px',
          }}>
            Cliquez sur le ❤ sur une annonce pour la retrouver ici.
          </p>
          <Link href="/etudiant" className="btn-primary shine-on-hover" style={{ width: 'auto', padding: '10px 24px' }}>
            Parcourir les annonces
          </Link>
        </div>
      )}
    </div>
  )
}
