export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { BackButton } from '@/components/ui/BackButton'
import { MOCK_BAILLEUR } from '@/lib/preview-mock'

function InfoItem({ label, value, fullWidth = false }: {
  label: string; value: string; fullWidth?: boolean
}) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', wordBreak: 'break-all' }}>
        {value}
      </div>
    </div>
  )
}

export default async function ProfilBailleurPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const cookieStore = await cookies()
  const previewRole = cookieStore.get('admin_view_as')?.value
  const isPreview = previewRole === 'bailleur'

  let profile: {
    prenom: string; nom: string; ville?: string | null
    telephone?: string | null; phone_verified?: boolean | null
    created_at: string; photo_url?: string | null
  } | null = null
  let nbAnnonces = 0

  if (isPreview) {
    profile = MOCK_BAILLEUR
    nbAnnonces = 3 // valeur fictive représentative
  } else {
    let { data: p } = await supabase
      .from('profiles').select('*, telephone, phone_verified, photo_url').eq('id', user.id).single()

    if (!p) {
      await new Promise(r => setTimeout(r, 1000))
      const retry = await supabase.from('profiles').select('*, telephone, phone_verified, photo_url').eq('id', user.id).single()
      p = retry.data
    }

    profile = p

    if (p) {
      const { count } = await supabase
        .from('annonces').select('*', { count: 'exact', head: true })
        .eq('bailleur_id', user.id).eq('statut', 'active')
      nbAnnonces = count ?? 0
    }
  }

  const displayEmail = isPreview ? MOCK_BAILLEUR.email : user.email!

  if (!isPreview && !profile) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 24px' }}>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 12px', color: '#DC2626' }} />
          <p style={{ fontWeight: 600, color: '#DC2626', marginBottom: '4px' }}>Profil introuvable</p>
          <p style={{ fontSize: '13px', color: '#DC2626' }}>Reconnectez-vous ou contactez le support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter" style={{ maxWidth: '600px', margin: '0 auto', padding: 'clamp(24px,5vw,48px) 24px' }}>

      <BackButton href="/bailleur" />

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

      {/* ── 1. HERO CARD ──────────────────── */}
      <div className="anim-fade-up" style={{
        background: 'linear-gradient(135deg, var(--blue-light) 0%, var(--surface) 60%)',
        border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '16px',
        boxShadow: '0 2px 16px rgba(26,45,79,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>

          {/* Avatar */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: profile?.photo_url ? 'transparent' : 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
            fontSize: '26px', fontWeight: 700, color: '#fff',
            boxShadow: '0 0 0 3px var(--surface), 0 0 0 5px rgba(27,95,173,0.2)',
          }}>
            {profile?.photo_url
              ? <img src={profile.photo_url} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : `${profile?.prenom?.[0] ?? ''}${profile?.nom?.[0] ?? ''}`.toUpperCase()
            }
          </div>

          {/* Identité */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '22px', fontWeight: 700, color: 'var(--navy)', margin: '0 0 6px' }}>
              {profile?.prenom} {profile?.nom}
            </h1>
            <span style={{
              fontSize: '11px', fontWeight: 600, background: 'var(--blue-light)',
              color: 'var(--blue)', padding: '2px 9px', borderRadius: '99px',
            }}>
              Bailleur
            </span>
          </div>

          {/* Bouton modifier (désactivé en preview) */}
          {!isPreview && (
            <Link href="/bailleur/profil/modifier" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '10px', flexShrink: 0, textDecoration: 'none',
              transition: 'background 0.15s',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </Link>
          )}
        </div>

        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <InfoItem label="Email" value={displayEmail} fullWidth />

          {profile?.ville && <InfoItem label="Ville" value={profile.ville} />}
          <InfoItem label="Membre depuis" value={formatDate(profile?.created_at ?? '')} />

          {profile?.phone_verified && profile.telephone ? (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Téléphone</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{profile.telephone}</span>
                <span style={{ background: 'var(--green-light)', color: 'var(--green)', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>✓ Vérifié</span>
              </div>
            </div>
          ) : profile?.telephone ? (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Téléphone</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{profile.telephone}</span>
                {!isPreview && (
                  <Link href="/bailleur/profil/telephone" style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px', textDecoration: 'none' }}>
                    ⚠ Vérifier
                  </Link>
                )}
              </div>
            </div>
          ) : null}

          {nbAnnonces > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Annonces actives</div>
              {isPreview ? (
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)' }}>
                  {nbAnnonces} annonce{nbAnnonces > 1 ? 's' : ''}
                </span>
              ) : (
                <Link href="/bailleur" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)', textDecoration: 'none' }}>
                  {nbAnnonces} annonce{nbAnnonces > 1 ? 's' : ''} →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. COMPLÉTER LE PROFIL ────────── */}
      {!isPreview && (() => {
        const items: Array<{ icon: string; label: string; desc: string; href: string; badge?: string }> = []

        if (!profile?.telephone || !profile.phone_verified) {
          items.push({ icon: '📱', label: 'Vérifier mon téléphone', desc: 'Les étudiants pourront vous appeler directement', href: '/bailleur/profil/telephone', badge: 'Important' })
        }
        if (!profile?.photo_url) {
          items.push({ icon: '📷', label: 'Ajouter une photo', desc: 'Inspirez confiance aux étudiants', href: '/bailleur/profil/modifier' })
        }
        if (!profile?.ville) {
          items.push({ icon: '📍', label: 'Ajouter votre ville', desc: 'Rend votre profil plus crédible', href: '/bailleur/profil/modifier' })
        }

        if (items.length === 0) {
          return (
            <div className="anim-fade-up stagger-2" style={{
              background: 'var(--green-light)', border: '1px solid rgba(45,122,58,0.2)',
              borderRadius: '14px', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <CheckCircle2 size={24} color="var(--green)" />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--green)', margin: 0 }}>Profil complet</p>
                <p style={{ fontSize: '12px', color: 'var(--green)', margin: '2px 0 0', opacity: 0.8 }}>Votre profil est entièrement renseigné.</p>
              </div>
            </div>
          )
        }

        return (
          <div className="anim-fade-up stagger-2 card">
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
              Compléter mon profil
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {items.map((item, idx) => (
                <Link key={item.label} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 0',
                  borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
                  textDecoration: 'none', transition: 'opacity 0.15s',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: 'var(--bg)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                    border: '1px solid var(--border)',
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: 0 }}>
                      {item.label}
                      {item.badge && (
                        <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '99px', marginLeft: '8px' }}>
                          {item.badge}
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{item.desc}</p>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          </div>
        )
      })()}

      {isPreview && (
        <div className="anim-fade-up stagger-2" style={{
          background: 'var(--green-light)', border: '1px solid rgba(45,122,58,0.2)',
          borderRadius: '14px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <CheckCircle2 size={24} color="var(--green)" />
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--green)', margin: 0 }}>Profil complet</p>
            <p style={{ fontSize: '12px', color: 'var(--green)', margin: '2px 0 0', opacity: 0.8 }}>Votre profil est entièrement renseigné.</p>
          </div>
        </div>
      )}
    </div>
  )
}
