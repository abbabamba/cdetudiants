export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MesAnnoncesCard } from '@/components/bailleur/MesAnnoncesCard'
import { BailleurSidebarLink } from '@/components/bailleur/BailleurSidebarLink'
import { BailleurGreeting } from '@/components/bailleur/BailleurGreeting'
import { User, PlusCircle, Home, MessageCircle, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { MOCK_BAILLEUR } from '@/lib/preview-mock'

export default async function BailleurPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const previewRole = cookieStore.get('admin_view_as')?.value
  const isPreview = previewRole === 'bailleur'

  const { published } = await searchParams

  let profile: { nom: string; prenom: string; role?: string } | null = null
  let annonces: unknown[] = []

  if (isPreview) {
    profile = { nom: MOCK_BAILLEUR.nom, prenom: MOCK_BAILLEUR.prenom, role: 'bailleur' }
    // Annonces fictives : tableau vide (on verra l'état "vide" du bailleur)
  } else {
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from('profiles').select('nom, prenom, role').eq('id', user.id).single(),
      supabase
        .from('annonces')
        .select('*, photos:photos_annonces(url, ordre)')
        .eq('bailleur_id', user.id)
        .neq('statut', 'supprimee')
        .order('created_at', { ascending: false }),
    ])
    profile = p
    annonces = a ?? []
  }

  const typedAnnonces = annonces as Array<{
    id: string; titre: string; ville: string; prix: number; surface?: number | null
    statut: string; photos?: Array<{ url: string; ordre: number }> | null
  }>

  const nbActives    = typedAnnonces.filter(a => a.statut === 'active').length
  const nbSuspendues = typedAnnonces.filter(a => a.statut === 'suspendue').length

  return (
    <div className="etudiant-layout">

      {/* ── Sidebar desktop ──────────────── */}
      <aside className="etudiant-sidebar hidden md:flex" style={{ flexDirection: 'column', gap: 0 }}>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '14px',
          marginBottom: '20px',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            Mes annonces
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
              flex: 1, background: 'var(--bg)',
              border: '1px solid var(--border)', borderRadius: '10px',
              padding: '8px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--blue)', fontFamily: 'var(--font-playfair), serif', lineHeight: 1 }}>
                {nbActives}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>actives</div>
            </div>
            <div style={{
              flex: 1, background: 'var(--bg)',
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
          <BailleurSidebarLink href="/bailleur" icon={<Home size={17} />} label="Mes annonces" />
          <BailleurSidebarLink href="/bailleur/publier" icon={<PlusCircle size={17} />} label="Publier" />
          <BailleurSidebarLink href="/bailleur/messages" icon={<MessageCircle size={17} />} label="Messages" />
          <BailleurSidebarLink href="/bailleur/profil" icon={<User size={17} />} label="Mon profil" />
        </nav>
      </aside>

      {/* ── Contenu principal ─────────────── */}
      <main className="etudiant-main">

        {/* Bannière prévisualisation */}
        {isPreview && (
          <div style={{
            background: 'var(--green)',
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
              👁 Mode prévisualisation — vous voyez l&apos;expérience d&apos;un bailleur type
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
            background: 'var(--green-light)',
            border: '1px solid rgba(45, 122, 58, 0.25)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: 'var(--green)',
            fontWeight: 500,
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--green)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            Votre annonce a été publiée avec succès !
          </div>
        )}

        <BailleurGreeting prenom={profile?.prenom} count={typedAnnonces.length} />

        {/* Header + bouton publier */}
        <div className="anim-fade-up" style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: 'var(--text-muted)',
            }}>
              <BarChart2 size={14} />
              {nbActives > 0
                ? <span><strong style={{ color: 'var(--green)' }}>{nbActives}</strong> active{nbActives > 1 ? 's' : ''}</span>
                : 'Aucune annonce active'
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
                background: 'var(--blue)', color: '#fff',
                fontWeight: 600, fontSize: '13px',
                padding: '9px 18px', borderRadius: '10px',
                opacity: 0.45, cursor: 'not-allowed',
                boxShadow: '0 2px 8px rgba(27,95,173,0.2)',
              }}
            >
              <PlusCircle size={15} />
              Publier une annonce
            </span>
          ) : (
            <Link href="/bailleur/publier" style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'var(--blue)', color: '#fff',
              fontWeight: 600, fontSize: '13px',
              padding: '9px 18px', borderRadius: '10px',
              textDecoration: 'none',
              transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
              boxShadow: '0 2px 8px rgba(27,95,173,0.2)',
            }}
              className="shine-on-hover"
            >
              <PlusCircle size={15} />
              Publier une annonce
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
              background: 'var(--blue-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Home size={32} color="var(--blue)" />
            </div>
            <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px', fontFamily: 'var(--font-playfair), serif' }}>
              Publiez votre première annonce
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '280px', margin: '0 auto 28px' }}>
              Trouvez des étudiants sérieux pour votre logement en quelques minutes.
            </p>
            {isPreview ? (
              <span
                title="Indisponible en mode prévisualisation"
                className="btn-primary"
                style={{ width: 'auto', padding: '11px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: 0.45, cursor: 'not-allowed' }}
              >
                <PlusCircle size={16} />
                Publier une annonce
              </span>
            ) : (
              <Link href="/bailleur/publier" className="btn-primary shine-on-hover" style={{ width: 'auto', padding: '11px 28px' }}>
                <PlusCircle size={16} />
                Publier une annonce
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
