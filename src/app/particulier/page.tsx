export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MesAnnoncesCard } from '@/components/bailleur/MesAnnoncesCard'
import { BailleurSidebarLink } from '@/components/bailleur/BailleurSidebarLink'
import { User, PlusCircle, Briefcase, MessageCircle, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { MOCK_PARTICULIER } from '@/lib/preview-mock'

const CATEGORIES_PARTICULIER = ['emploi', 'stage', 'alternance', 'service', 'don']

export default async function ParticulierPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const previewRole = cookieStore.get('admin_view_as')?.value
  const isPreview = previewRole === 'particulier'

  const { published } = await searchParams

  let profile: { nom: string; prenom: string; role?: string } | null = null
  let annonces: unknown[] = []

  if (isPreview) {
    profile = { nom: MOCK_PARTICULIER.nom, prenom: MOCK_PARTICULIER.prenom, role: 'particulier' }
  } else {
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from('profiles').select('nom, prenom, role').eq('id', user.id).single(),
      supabase
        .from('annonces')
        .select('*, photos:photos_annonces(url, ordre)')
        .eq('bailleur_id', user.id)
        .in('categorie', CATEGORIES_PARTICULIER)
        .neq('statut', 'supprimee')
        .order('created_at', { ascending: false }),
    ])
    profile = p
    annonces = a ?? []

    if (p?.role !== 'particulier') redirect('/login')
  }

  const typedAnnonces = annonces as Array<{
    id: string; titre: string; ville: string; prix: number; surface?: number | null
    statut: string; photos?: Array<{ url: string; ordre: number }> | null
  }>

  const initials = (
    (profile?.prenom?.[0] ?? '') + (profile?.nom?.[0] ?? '')
  ).toUpperCase()

  const nbActives    = typedAnnonces.filter(a => a.statut === 'active').length
  const nbSuspendues = typedAnnonces.filter(a => a.statut === 'suspendue').length

  return (
    <div className="etudiant-layout">

      {/* ── Sidebar desktop ──────────────── */}
      <aside className="etudiant-sidebar hidden md:flex" style={{ flexDirection: 'column', gap: 0 }}>

        <div style={{
          background: 'linear-gradient(135deg, #F3F0FF 0%, var(--surface) 100%)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: '#7C3AED',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              fontSize: '17px', fontWeight: 700, color: '#fff',
              boxShadow: '0 0 0 3px var(--surface), 0 0 0 5px #7C3AED',
            }}>
              {initials || <User size={20} color="#fff" />}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontWeight: 700, fontSize: '14px', color: 'var(--navy)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: '3px',
              }}>
                {profile?.prenom} {profile?.nom}
              </p>
              <span style={{
                fontSize: '11px', fontWeight: 600,
                background: '#F3F0FF', color: '#7C3AED',
                padding: '2px 8px', borderRadius: '99px',
              }}>
                Particulier
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
              flex: 1, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '10px',
              padding: '8px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#7C3AED', fontFamily: 'var(--font-playfair), serif', lineHeight: 1 }}>
                {nbActives}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>actives</div>
            </div>
            <div style={{
              flex: 1, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '10px',
              padding: '8px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-playfair), serif', lineHeight: 1 }}>
                {typedAnnonces.length}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>total</div>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <BailleurSidebarLink href="/particulier" icon={<Briefcase size={17} />} label="Mes offres" />
          <BailleurSidebarLink href="/particulier/publier" icon={<PlusCircle size={17} />} label="Publier" />
          <BailleurSidebarLink href="/particulier/messages" icon={<MessageCircle size={17} />} label="Messages" />
          <BailleurSidebarLink href="/particulier/profil" icon={<User size={17} />} label="Mon profil" />
        </nav>
      </aside>

      {/* ── Contenu principal ─────────────── */}
      <main className="etudiant-main">

        {/* Bannière prévisualisation */}
        {isPreview && (
          <div style={{
            background: '#7C3AED',
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
              👁 Mode prévisualisation — vous voyez l&apos;expérience d&apos;un particulier type
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

        {/* Bannière succès publication */}
        {!isPreview && published === '1' && (
          <div className="anim-slide-right" style={{
            background: '#F3F0FF',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: '#7C3AED',
            fontWeight: 500,
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#7C3AED', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            Votre offre a été publiée avec succès !
          </div>
        )}

        {/* En-tête */}
        <div className="anim-fade-up" style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(22px,4vw,28px)', color: 'var(--navy)',
              marginBottom: '4px',
            }}>
              Mon espace particulier
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <BarChart2 size={14} />
              {nbActives > 0
                ? <span><strong style={{ color: '#7C3AED' }}>{nbActives}</strong> active{nbActives > 1 ? 's' : ''}</span>
                : 'Aucune offre active'
              }
              {nbSuspendues > 0 && (
                <span style={{ marginLeft: '8px' }}>
                  · <strong style={{ color: '#92400E' }}>{nbSuspendues}</strong> suspendue{nbSuspendues > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {isPreview ? (
            <span
              title="Indisponible en mode prévisualisation"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: '#7C3AED', color: '#fff',
                fontWeight: 600, fontSize: '13px',
                padding: '9px 18px', borderRadius: '10px',
                opacity: 0.45, cursor: 'not-allowed',
                boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
              }}
            >
              <PlusCircle size={15} />
              Publier une offre
            </span>
          ) : (
            <Link href="/particulier/publier" style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: '#7C3AED', color: '#fff',
              fontWeight: 600, fontSize: '13px',
              padding: '9px 18px', borderRadius: '10px',
              textDecoration: 'none',
              transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
              boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
            }}
              className="shine-on-hover"
            >
              <PlusCircle size={15} />
              Publier une offre
            </Link>
          )}
        </div>

        {/* Liste annonces */}
        {typedAnnonces.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {typedAnnonces.map((a, i) => (
              <div key={a.id} className={`anim-fade-up stagger-${Math.min(i + 1, 6)}`}>
                <MesAnnoncesCard
                  id={a.id}
                  titre={a.titre}
                  ville={a.ville}
                  prix={a.prix}
                  surface={a.surface}
                  statut={a.statut}
                  photo={a.photos?.[0]?.url ?? null}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="anim-fade-up" style={{
            textAlign: 'center',
            padding: '72px 40px',
            background: 'var(--surface)',
            borderRadius: '20px',
            border: '2px dashed var(--border)',
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#F3F0FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Briefcase size={32} color="#7C3AED" />
            </div>
            <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px', fontFamily: 'var(--font-playfair), serif' }}>
              Publiez votre première offre
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '280px', margin: '0 auto 28px' }}>
              Emplois, stages, services ou dons pour les étudiants.
            </p>
            {isPreview ? (
              <span
                title="Indisponible en mode prévisualisation"
                className="btn-primary"
                style={{ width: 'auto', padding: '11px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#7C3AED', opacity: 0.45, cursor: 'not-allowed' }}
              >
                <PlusCircle size={16} />
                Publier une offre
              </span>
            ) : (
              <Link href="/particulier/publier" className="btn-primary shine-on-hover" style={{ width: 'auto', padding: '11px 28px', background: '#7C3AED' }}>
                <PlusCircle size={16} />
                Publier une offre
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
