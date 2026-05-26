import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { formatPrix, formatDate } from '@/lib/utils'
import { MapPin, Home, Lock, Phone, ArrowLeft, Square, Shield } from 'lucide-react'
import { BadgeVerifie } from '@/components/etudiant/BadgeVerifie'
import { BoutonFavori } from '@/components/annonces/BoutonFavori'
import { ModalSignalement } from '@/components/annonces/ModalSignalement'
import { BoutonContacter } from '@/components/messagerie/BoutonContacter'
import { GaleriePhotos } from '@/components/annonces/GaleriePhotos'
import Link from 'next/link'
import { MOCK_ETUDIANT, MOCK_PROFIL_ETUDIANT } from '@/lib/preview-mock'

export default async function AnnoncePubliquePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAdmin = user?.app_metadata?.role === 'admin'
  const client  = isAdmin ? createAdminClient() : supabase

  const cookieStore = await cookies()
  const previewRole = cookieStore.get('admin_view_as')?.value
  const isPreviewEtudiant = isAdmin && previewRole === 'etudiant'

  const { data: annonce } = await client
    .from('annonces')
    .select('*, bailleur:profiles(id, nom, prenom, telephone), photos:photos_annonces(url, ordre)')
    .eq('id', id)
    .in('statut', ['active', 'signalee', 'suspendue'])
    .single()

  if (!annonce) notFound()

  if (annonce.statut === 'suspendue' && !isAdmin) {
    return (
      <div className="page-enter" style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: '#FEF3C7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 24px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '22px', color: 'var(--navy)', marginBottom: '10px' }}>
          Annonce suspendue
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Cette annonce n&apos;est plus disponible.
        </p>
        <Link href="/annonces" className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
          Voir d&apos;autres annonces
        </Link>
      </div>
    )
  }

  let etudiantPhotoUrl: string | null = null
  let etudiantPrenom: string | null   = null
  let etudiantNom: string | null      = null
  let etudiantStatut: string | null   = null
  let isEtudiant  = false
  let isFavori    = false
  let dejaSignale = false
  let convExistanteId: string | null = null

  if (user) {
    if (isPreviewEtudiant) {
      isEtudiant     = true
      etudiantPrenom = MOCK_ETUDIANT.prenom
      etudiantNom    = MOCK_ETUDIANT.nom
      etudiantStatut = MOCK_PROFIL_ETUDIANT.statut_verification
      // isFavori, dejaSignale, convExistanteId restent à false/null
    } else {
      const { data: userProfile } = await supabase
        .from('profiles').select('prenom, nom, role').eq('id', user.id).single()

      if (userProfile?.role === 'etudiant') {
        isEtudiant    = true
        etudiantPrenom = userProfile.prenom
        etudiantNom   = userProfile.nom

        const [{ data: etudiantProfil }, { data: favData }, { data: signalemData }, { data: convData }] = await Promise.all([
          supabase.from('profils_etudiants').select('photo_url, statut_verification').eq('user_id', user.id).maybeSingle(),
          supabase.from('favoris').select('id').eq('user_id', user.id).eq('annonce_id', id).maybeSingle(),
          supabase.from('signalements').select('id').eq('etudiant_id', user.id).eq('annonce_id', id).maybeSingle(),
          supabase.from('conversations').select('id').eq('annonce_id', id).eq('etudiant_id', user.id).maybeSingle(),
        ])

        etudiantPhotoUrl = etudiantProfil?.photo_url ?? null
        etudiantStatut   = etudiantProfil?.statut_verification ?? 'non_verifie'
        isFavori         = !!favData
        dejaSignale      = !!signalemData
        convExistanteId  = convData?.id ?? null
      }
    }
  }

  const isVerifie    = etudiantStatut === 'verifie_email' || etudiantStatut === 'verifie_admin'
  const isOwnAnnonce = !!(user && user.id === annonce.bailleur_id)
  const photos: { url: string; ordre: number }[] = (annonce.photos ?? []).sort(
    (a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre
  )
  const surface = annonce.surface != null
    ? (annonce.surface as number).toFixed(1).replace('.0', '')
    : null

  return (
    <div className="page-enter" style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,24px)' }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/annonces" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none',
          fontWeight: 500, transition: 'color 0.15s',
        }}>
          <ArrowLeft size={14} />
          Retour aux annonces
        </Link>
      </div>

      {/* Bannière admin */}
      {isAdmin && annonce.statut === 'signalee' && (
        <div className="anim-slide-right" style={{
          background: 'var(--error-light)', border: '1.5px solid var(--error)',
          borderRadius: '12px', padding: '12px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '14px', fontWeight: 700, color: 'var(--error)',
        }}>
          🚨 Annonce signalée — vue admin
        </div>
      )}

      {/* Bannière avertissement */}
      {annonce.statut === 'signalee' && !isAdmin && (
        <div className="anim-slide-right" style={{
          background: '#FEF3C7', border: '1px solid #F59E0B',
          borderRadius: '12px', padding: '14px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#92400E',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <p style={{ fontWeight: 600, margin: '0 0 2px' }}>Annonce en cours de vérification</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Notre équipe examine cette annonce suite à des signalements.</p>
          </div>
        </div>
      )}

      {/* ── Galerie photos ─────────────────── */}
      {photos.length > 0 ? (
        <div style={{ marginBottom: '36px' }}>
          <GaleriePhotos photos={photos} />
        </div>
      ) : (
        <div style={{
          height: '280px', borderRadius: '16px', marginBottom: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--blue-light) 0%, var(--bg) 100%)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <Home size={48} color="var(--border)" style={{ display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Aucune photo disponible</p>
          </div>
        </div>
      )}

      {/* ── Contenu 2 colonnes ─────────────── */}
      <div className="annonce-detail-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '32px',
        alignItems: 'flex-start',
      }}>

        {/* ── Détails ─────────────────────── */}
        <div>
          {/* Titre + favori */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 700, color: 'var(--navy)', flex: 1, margin: 0, fontFamily: 'var(--font-playfair), serif' }}>
              {annonce.titre}
            </h1>
            {isEtudiant && !isPreviewEtudiant && (
              <BoutonFavori annonceId={id} initialIsFavori={isFavori} size="md" />
            )}
          </div>

          <p style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            <MapPin size={15} /> {annonce.ville}
          </p>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
            {annonce.type_logement && (
              <span style={{
                background: 'var(--blue-light)', color: 'var(--blue)',
                fontSize: '13px', fontWeight: 600, padding: '5px 14px',
                borderRadius: '99px', textTransform: 'capitalize',
              }}>
                {annonce.type_logement}
              </span>
            )}
            {surface && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'var(--bg)', color: 'var(--text)',
                fontSize: '13px', padding: '5px 14px', borderRadius: '99px',
                border: '1px solid var(--border)',
              }}>
                <Square size={12} /> {surface} m²
              </span>
            )}
            {annonce.garantie && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'var(--bg)', color: 'var(--text)',
                fontSize: '13px', padding: '5px 14px', borderRadius: '99px',
                border: '1px solid var(--border)',
                textTransform: 'capitalize',
              }}>
                <Shield size={12} color="var(--green)" />
                {annonce.garantie === 'autre' && annonce.garantie_detail ? annonce.garantie_detail : annonce.garantie}
              </span>
            )}
          </div>

          {/* Description */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '20px 24px', marginBottom: '24px',
          }}>
            <p style={{
              fontSize: '14px', color: 'var(--text)', lineHeight: 1.75,
              whiteSpace: 'pre-line', margin: 0,
            }}>
              {annonce.description}
            </p>
          </div>

          {/* Infos financières */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}>
            <div style={{
              background: 'var(--blue-light)',
              borderRadius: '14px', padding: '16px 18px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '6px' }}>
                Loyer
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--blue)', fontFamily: 'var(--font-playfair), serif', lineHeight: 1 }}>
                {formatPrix(annonce.prix)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--blue)', opacity: 0.7, marginTop: '2px' }}>/ mois</div>
            </div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '16px 18px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '6px' }}>
                Caution
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-playfair), serif', lineHeight: 1 }}>
                {formatPrix(annonce.caution)}
              </div>
            </div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '16px 18px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '6px' }}>
                Publié le
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.3 }}>
                {formatDate(annonce.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Panneau contact ─────────────── */}
        <div className="annonce-contact-panel" style={{ position: 'sticky', top: '80px' }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 24px rgba(26,45,79,0.08), 0 1px 6px rgba(26,45,79,0.04)',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy)', marginBottom: '20px' }}>
              {isOwnAnnonce ? 'Votre annonce' : 'Contacter le bailleur'}
            </h2>

            {isOwnAnnonce ? (
              <div style={{
                background: 'var(--blue-light)', border: '1.5px solid rgba(27,95,173,0.2)',
                borderRadius: '12px', padding: '16px 18px',
                fontSize: '13px', color: 'var(--blue)', fontWeight: 500,
                lineHeight: 1.5,
              }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px' }}>
                  C&apos;est votre annonce
                </p>
                <p style={{ margin: 0, color: 'var(--blue)', opacity: 0.8 }}>
                  Vous ne pouvez pas vous contacter vous-même.
                </p>
              </div>
            ) : user ? (
              <>
                {/* Identité bailleur */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '16px',
                  padding: '12px 14px',
                  background: 'var(--bg)',
                  borderRadius: '12px',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'var(--blue-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: '14px', fontWeight: 700, color: 'var(--blue)',
                  }}>
                    {(annonce.bailleur?.prenom?.[0] ?? '?').toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 1px' }}>Bailleur</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', margin: 0 }}>
                      {annonce.bailleur?.prenom} {annonce.bailleur?.nom}
                    </p>
                  </div>
                </div>

                {/* Téléphone */}
                {annonce.telephone_visible === false ? (
                  <div style={{
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: '10px', padding: '11px 14px',
                    fontSize: '13px', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: '12px',
                  }}>
                    <Lock size={14} /> Le bailleur privilégie la messagerie
                  </div>
                ) : annonce.bailleur?.telephone ? (
                  <a
                    href={`tel:${annonce.bailleur.telephone}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      width: '100%', background: 'var(--blue)', color: '#fff',
                      padding: '11px 16px', borderRadius: '10px',
                      fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                      marginBottom: '12px', transition: 'background 0.2s, transform 0.15s',
                    }}
                    className="shine-on-hover"
                  >
                    <Phone size={15} /> {annonce.bailleur.telephone}
                  </a>
                ) : (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
                    <Phone size={15} /> Téléphone non renseigné
                  </p>
                )}

                {/* Bouton contacter */}
                {isEtudiant && user && annonce.bailleur && (
                  <BoutonContacter
                    annonceId={id}
                    annonceTitre={annonce.titre}
                    currentUserId={user.id}
                    interlocuteur={{
                      id: annonce.bailleur.id,
                      prenom: annonce.bailleur.prenom ?? '',
                      nom: annonce.bailleur.nom ?? '',
                    }}
                    isVerifie={isVerifie}
                    annonce={{
                      id: annonce.id, titre: annonce.titre,
                      ville: annonce.ville, prix: Number(annonce.prix),
                      photo: photos[0]?.url ?? null,
                    }}
                    conversationExistanteId={convExistanteId}
                    currentUserPrenom={etudiantPrenom ?? ''}
                    currentUserNom={etudiantNom ?? ''}
                    currentUserPhoto={etudiantPhotoUrl}
                    isPreview={isPreviewEtudiant}
                  />
                )}

                {/* Signalement (masqué en preview) */}
                {isEtudiant && !isPreviewEtudiant && (
                  <ModalSignalement annonceId={id} initialDejaSignale={dejaSignale} />
                )}

                {/* Apparence étudiant */}
                {isEtudiant && etudiantStatut !== null && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      Vous apparaissez comme
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'var(--blue-light)', overflow: 'hidden', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {etudiantPhotoUrl ? (
                          <img src={etudiantPhotoUrl} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--blue)' }}>
                            {etudiantPrenom?.[0]?.toUpperCase() ?? '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>
                          {etudiantPrenom ?? 'Étudiant'}
                        </p>
                        <BadgeVerifie statut={etudiantStatut} size="sm" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--bg)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <Lock size={22} color="var(--text-muted)" />
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '16px', lineHeight: 1.5 }}>
                  Connectez-vous pour voir les coordonnées du bailleur
                </p>
                <Link href={`/login?redirect=/annonces/${id}`} className="btn-primary shine-on-hover" style={{ padding: '11px 20px' }}>
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
