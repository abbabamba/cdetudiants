'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { X, PlusCircle, LogOut, User, List, LayoutDashboard, Shield, Heart, MessageCircle, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavbarClientProps {
  user: { id: string; email: string } | null
  profile: { nom: string; prenom: string; role: string } | null
  photoUrl?: string | null
  scoreInfo: { statut_verification: string; phone_verified: boolean; telephone: string | null } | null
  isAdmin?: boolean
  nonLus?: number
}

function masquerTelephone(tel: string): string {
  const clean = tel.replace(/\s/g, '')
  if (clean.length >= 10) {
    return clean.slice(0, 2) + ' •• •• •• ' + clean.slice(-2)
  }
  return tel
}

function Avatar({
  prenom,
  nom,
  photoUrl,
  size = 'sm',
}: {
  prenom?: string | null
  nom?: string | null
  photoUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const initials = [prenom?.[0], nom?.[0]].filter(Boolean).join('').toUpperCase() || '?'
  const dim = size === 'lg' ? 44 : size === 'md' ? 36 : 32
  const fontSize = size === 'lg' ? '15px' : size === 'md' ? '13px' : '12px'
  return (
    <div style={{
      width: dim, height: dim, borderRadius: '50%',
      background: photoUrl ? 'transparent' : 'var(--blue)',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, flexShrink: 0, overflow: 'hidden',
      boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px var(--blue-light)',
    }}>
      {photoUrl
        ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials
      }
    </div>
  )
}

const roleLabel: Record<string, string> = {
  etudiant:    'Étudiant',
  bailleur:    'Bailleur',
  particulier: 'Particulier',
}

const roleColors: Record<string, { bg: string; color: string }> = {
  etudiant:    { bg: 'var(--blue-light)',  color: 'var(--blue)'  },
  bailleur:    { bg: '#F3E8FF',            color: '#7C3AED'      },
  particulier: { bg: '#FEF3C7',            color: '#92400E'      },
}

export function NavbarClient({ user, profile, photoUrl, scoreInfo, isAdmin, nonLus = 0 }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDropdownOpen(false)
    setMobileOpen(false)
    window.location.href = '/'
  }

  const role         = profile?.role ?? ''
  const isBailleur   = role === 'bailleur'
  const isEtudiant   = role === 'etudiant'
  const isParticulier = role === 'particulier'
  const canPublish   = isBailleur || isParticulier
  const statut       = scoreInfo?.statut_verification ?? null
  const publishHref  = isBailleur ? '/bailleur/publier' : '/particulier/publier'
  const dashboardHref = isEtudiant ? '/etudiant' : isBailleur ? '/bailleur' : isParticulier ? '/particulier' : '/'
  const profilHref    = isEtudiant ? '/etudiant/profil' : isBailleur ? '/bailleur/profil' : isParticulier ? '/particulier' : '/'
  const messagesHref  = isEtudiant ? '/etudiant/messages' : '/bailleur/messages'

  const rc = roleColors[role] ?? { bg: 'var(--bg)', color: 'var(--text-muted)' }

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 clamp(16px,3vw,24px)',
          height: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>

          {/* ── Logo ──────────────────────────────── */}
          <Link href={user ? dashboardHref : '/'} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            textDecoration: 'none', flexShrink: 0,
          }}>
            <img
              src="/images/logo.jpeg"
              alt="Coin des Étudiants"
              style={{ height: '34px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }}
            />
            <span
              className="hidden sm:inline"
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '15px', fontWeight: 600,
                color: 'var(--navy)', letterSpacing: '-0.01em',
              }}
            >
              Coin des Étudiants
            </span>
          </Link>

          {/* ── Desktop nav ───────────────────────── */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>

            {/* Non connecté */}
            {!user && (
              <>
                <Link href="/annonces" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none', padding: '0 8px' }}>
                  Annonces
                </Link>
                <Link href="/register" style={{
                  fontSize: '14px', border: '1px solid var(--blue)',
                  color: 'var(--blue)', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none',
                }}>
                  S&apos;inscrire
                </Link>
                <Link href="/login" style={{
                  fontSize: '14px', background: 'var(--blue)',
                  color: '#fff', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none',
                }}>
                  Connexion
                </Link>
              </>
            )}

            {/* Connecté : bouton Publier (bailleur / particulier) */}
            {user && canPublish && (
              <Link href={publishHref} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '14px', fontWeight: 500,
                background: 'var(--blue)', color: '#fff',
                padding: '6px 14px', borderRadius: '8px', textDecoration: 'none',
              }}>
                <PlusCircle size={15} />
                Publier
              </Link>
            )}

            {/* Connecté : avatar + dropdown */}
            {user && (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '4px 10px 4px 4px', borderRadius: '99px',
                    border: dropdownOpen ? '1.5px solid var(--blue-light)' : '1.5px solid var(--border)',
                    background: dropdownOpen ? 'var(--blue-light)' : 'var(--surface)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <Avatar prenom={profile?.prenom} nom={profile?.nom} photoUrl={photoUrl} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.prenom ?? 'Mon compte'}
                  </span>
                  {role && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700,
                      padding: '2px 7px', borderRadius: '99px',
                      background: rc.bg, color: rc.color,
                    }}>
                      {roleLabel[role]}
                    </span>
                  )}
                  <ChevronDown size={13} color="var(--text-muted)" style={{ transition: 'transform 0.15s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {dropdownOpen && (
                  <AccountDropdown
                    profile={profile}
                    photoUrl={photoUrl}
                    role={role}
                    statut={statut}
                    scoreInfo={scoreInfo}
                    isAdmin={isAdmin}
                    isEtudiant={isEtudiant}
                    isBailleur={isBailleur}
                    canPublish={canPublish}
                    publishHref={publishHref}
                    dashboardHref={dashboardHref}
                    profilHref={profilHref}
                    messagesHref={messagesHref}
                    nonLus={nonLus}
                    rc={rc}
                    onClose={() => setDropdownOpen(false)}
                    onSignOut={handleSignOut}
                  />
                )}
              </div>
            )}
          </div>

          {/* ── Mobile : avatar (connecté) ou hamburger (non connecté) ── */}
          <div className="flex md:hidden" style={{ alignItems: 'center', gap: '8px' }}>
            {user ? (
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Mon compte"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Avatar prenom={profile?.prenom} nom={profile?.nom} photoUrl={photoUrl} size="md" />
                {nonLus > 0 && (
                  <span style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'var(--error)', color: '#fff',
                    fontSize: '9px', fontWeight: 700,
                    width: '14px', height: '14px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {nonLus > 9 ? '9' : nonLus}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Menu"
                style={{
                  padding: '8px', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: '44px', minHeight: '44px',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* ── Mobile drawer ──────────────────────── */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} className="md:hidden">
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div style={{
            position: 'absolute', top: 0, right: 0,
            height: '100%', width: '288px',
            background: '#fff',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column',
          }}>

            {/* Header drawer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              {user && profile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--navy)' }}>
                    Mon compte
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', background: rc.bg, color: rc.color }}>
                    {roleLabel[role] ?? role}
                  </span>
                </div>
              ) : (
                <Link href="/" onClick={() => setMobileOpen(false)} style={{ fontWeight: 700, color: 'var(--blue)', textDecoration: 'none' }}>
                  Coin des Étudiants
                </Link>
              )}
              <button
                style={{ padding: '6px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu drawer */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>

              {/* Non connecté : navigation */}
              {!user && (
                <>
                  <MobileLink href="/annonces"  onClose={() => setMobileOpen(false)}>Annonces</MobileLink>
                  <MobileLink href="/register"  onClose={() => setMobileOpen(false)}>S&apos;inscrire</MobileLink>
                  <MobileLink href="/login"     onClose={() => setMobileOpen(false)} highlight>Connexion</MobileLink>
                </>
              )}

              {/* Connecté : infos de compte seulement — la bottom nav gère la navigation */}
              {user && (
                <>
                  {/* Badge statut étudiant */}
                  {isEtudiant && statut === 'en_attente_admin' && (
                    <Link
                      href="/etudiant/profil"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: '10px',
                        background: '#FEF3C7', border: '1px solid #FDE68A',
                        textDecoration: 'none', marginBottom: '8px',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>Vérification en cours</span>
                      <span style={{ fontSize: '12px', color: '#92400E' }}>→</span>
                    </Link>
                  )}
                  {isEtudiant && statut && !['verifie_email','verifie_admin','en_attente_admin'].includes(statut) && (
                    <Link
                      href="/etudiant/profil/completer"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: '10px',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        textDecoration: 'none', marginBottom: '8px',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Compléter mon profil →</span>
                    </Link>
                  )}

                  {/* Publier (bailleur / particulier) */}
                  {canPublish && (
                    <Link
                      href={publishHref}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px 16px', borderRadius: '12px',
                        background: 'var(--blue)', color: '#fff',
                        textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                        marginBottom: '8px',
                      }}
                    >
                      <PlusCircle size={16} />
                      Publier une annonce
                    </Link>
                  )}

                  {/* Mon profil */}
                  <MobileLink href={profilHref} onClose={() => setMobileOpen(false)}>
                    Mon profil
                  </MobileLink>

                  {/* Téléphone */}
                  {scoreInfo && (
                    scoreInfo.phone_verified ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 16px', fontSize: '13px', color: 'var(--text-muted)',
                      }}>
                        <span>📱</span>
                        <span>{scoreInfo.telephone ? masquerTelephone(scoreInfo.telephone) : '—'}</span>
                        <span style={{
                          background: 'var(--green-light)', color: 'var(--green)',
                          fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '99px', marginLeft: 'auto',
                        }}>Vérifié</span>
                      </div>
                    ) : (
                      <Link
                        href={isEtudiant ? '/etudiant/profil/telephone' : '/bailleur/profil/telephone'}
                        onClick={() => setMobileOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '13px', color: '#D97706', textDecoration: 'none' }}
                      >
                        <span>📱</span>
                        Vérifier mon téléphone →
                      </Link>
                    )
                  )}

                  {/* Admin */}
                  {isAdmin && (
                    <Link
                      href="/admin?section=certificats"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 16px', borderRadius: '12px',
                        fontSize: '14px', color: 'var(--navy)', fontWeight: 600,
                        textDecoration: 'none', background: 'var(--blue-light)',
                        marginTop: '8px',
                      }}
                    >
                      <Shield size={15} color="var(--navy)" />
                      Espace admin
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Déconnexion */}
            {user && (
              <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleSignOut}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    fontSize: '14px', color: '#EF4444',
                    background: '#FEF2F2', border: 'none', cursor: 'pointer', fontWeight: 500,
                  }}
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/* ── Account dropdown (desktop) ─────────────────────────────── */
function AccountDropdown({
  profile, photoUrl, role, statut, scoreInfo, isAdmin,
  isEtudiant, isBailleur, canPublish, publishHref,
  dashboardHref, profilHref, messagesHref,
  nonLus, rc,
  onClose, onSignOut,
}: {
  profile: { nom: string; prenom: string; role: string } | null
  photoUrl?: string | null
  role: string
  statut: string | null
  scoreInfo: { statut_verification: string; phone_verified: boolean; telephone: string | null } | null
  isAdmin?: boolean
  isEtudiant: boolean
  isBailleur: boolean
  canPublish: boolean
  publishHref: string
  dashboardHref: string
  profilHref: string
  messagesHref: string
  nonLus: number
  rc: { bg: string; color: string }
  onClose: () => void
  onSignOut: () => void
}) {
  return (
    <div style={{
      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
      width: '264px',
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(26,45,79,0.13)',
      overflow: 'hidden', zIndex: 50,
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <Avatar prenom={profile?.prenom} nom={profile?.nom} photoUrl={photoUrl} size="lg" />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 4px' }}>
            {profile?.prenom} {profile?.nom}
          </p>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', background: rc.bg, color: rc.color }}>
            {roleLabel[role] ?? role}
          </span>
        </div>
      </div>

      {/* Badges statut */}
      {isEtudiant && statut === 'en_attente_admin' && (
        <Link href="/etudiant/profil" onClick={onClose} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          margin: '8px 8px 0', padding: '8px 12px', borderRadius: '8px',
          background: '#FEF3C7', border: '1px solid #FDE68A', textDecoration: 'none',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>Vérification en cours</span>
          <span style={{ fontSize: '12px', color: '#92400E' }}>→</span>
        </Link>
      )}
      {isEtudiant && statut && !['verifie_email','verifie_admin','en_attente_admin'].includes(statut) && (
        <Link href="/etudiant/profil/completer" onClick={onClose} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          margin: '8px 8px 0', padding: '8px 12px', borderRadius: '8px',
          background: 'var(--bg)', border: '1px solid var(--border)', textDecoration: 'none',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Compléter mon profil</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>→</span>
        </Link>
      )}

      <div style={{ padding: '6px 0' }}>
        <DropItem href={dashboardHref} icon={<LayoutDashboard size={15} color="var(--text-muted)" />} onClick={onClose}>
          Mon dashboard
        </DropItem>

        {isEtudiant && (
          <DropItem href="/etudiant/favoris" icon={<Heart size={15} color="var(--error)" />} onClick={onClose}>
            Mes favoris
          </DropItem>
        )}

        <DropItem href={messagesHref} icon={<MessageCircle size={15} color="var(--text-muted)" />} onClick={onClose} badge={nonLus}>
          Messages
        </DropItem>

        <DropItem href={profilHref} icon={<User size={15} color="var(--text-muted)" />} onClick={onClose}>
          Mon profil
        </DropItem>

        {/* Téléphone */}
        {scoreInfo && (
          scoreInfo.phone_verified ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '7px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '14px' }}>📱</span>
              <span>{scoreInfo.telephone ? masquerTelephone(scoreInfo.telephone) : '—'}</span>
              <span style={{ background: 'var(--green-light)', color: 'var(--green)', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '99px', marginLeft: 'auto' }}>Vérifié</span>
            </div>
          ) : (
            <Link
              href={isEtudiant ? '/etudiant/profil/telephone' : '/bailleur/profil/telephone'}
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '7px 16px', fontSize: '13px', color: '#D97706', textDecoration: 'none' }}
            >
              <span style={{ fontSize: '14px' }}>📱</span>
              Vérifier mon téléphone →
            </Link>
          )
        )}

        {/* Bailleur extras */}
        {isBailleur && (
          <>
            <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
            <DropItem href="/bailleur" icon={<List size={15} color="var(--text-muted)" />} onClick={onClose}>Mes annonces</DropItem>
          </>
        )}

        {/* Publier */}
        {canPublish && (
          <DropItem href={publishHref} icon={<PlusCircle size={15} color="var(--blue)" />} onClick={onClose} blue>
            Publier une annonce
          </DropItem>
        )}

        {/* Admin */}
        {isAdmin && (
          <>
            <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
            <DropItem href="/admin?section=certificats" icon={<Shield size={15} color="var(--navy)" />} onClick={onClose} bold>
              Espace admin
            </DropItem>
          </>
        )}
      </div>

      {/* Déconnexion */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '4px 0' }}>
        <button
          onClick={onSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '100%', padding: '10px 16px',
            fontSize: '14px', color: '#EF4444',
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          }}
        >
          <LogOut size={15} />
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

function DropItem({
  href, icon, onClick, children, badge, blue, bold,
}: {
  href: string
  icon: React.ReactNode
  onClick: () => void
  children: React.ReactNode
  badge?: number
  blue?: boolean
  bold?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 16px', fontSize: '14px', textDecoration: 'none',
        color: blue ? 'var(--blue)' : bold ? 'var(--navy)' : 'var(--text)',
        fontWeight: bold || blue ? 600 : 400,
      }}
    >
      {icon}
      <span style={{ flex: 1 }}>{children}</span>
      {badge && badge > 0 ? (
        <span style={{
          background: 'var(--error)', color: '#fff',
          fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '99px',
        }}>
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </Link>
  )
}

function MobileLink({
  href, onClose, children, highlight,
}: {
  href: string
  onClose: () => void
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '11px 16px', borderRadius: '12px',
        fontSize: '14px', textDecoration: 'none', marginBottom: '2px',
        ...(highlight
          ? { background: 'var(--blue)', color: '#fff', fontWeight: 500 }
          : { color: 'var(--text)' }),
      }}
    >
      {children}
    </Link>
  )
}
