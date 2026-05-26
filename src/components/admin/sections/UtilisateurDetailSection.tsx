import { createAdminClient } from '@/lib/supabase/admin'
import { formatDate, formatPrix } from '@/lib/utils'
import { StatutBadge } from '@/components/etudiant/StatutBadge'
import { CertificatActions } from '@/components/admin/CertificatActions'
import SupprimerUtilisateurButton from '@/components/admin/SupprimerUtilisateurButton'
import { FileText } from 'lucide-react'

interface Props {
  userId: string
}

export default async function UtilisateurDetailSection({ userId }: Props) {
  const supabase = createAdminClient()

  const [
    { data: profile },
    { data: pe },
    { data: annonces },
    authUserResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('profils_etudiants').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('annonces')
      .select('*, photos:photos_annonces(url, ordre)')
      .eq('bailleur_id', userId)
      .neq('statut', 'supprimee')
      .order('created_at', { ascending: false }),
    supabase.auth.admin.getUserById(userId),
  ])

  const authUser = authUserResult.data.user
  const email = authUser?.email ?? null
  const emailConfirmedAt = authUser?.email_confirmed_at ?? null
  const lastSignIn = authUser?.last_sign_in_at ?? null
  const createdAt = authUser?.created_at ?? null

  if (!profile) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Utilisateur introuvable.
      </div>
    )
  }

  const initials = `${(profile.prenom?.[0] ?? '?').toUpperCase()}${(profile.nom?.[0] ?? '').toUpperCase()}`
  const isEtudiant = profile.role === 'etudiant'
  const isBailleur = profile.role === 'bailleur'

  return (
    <div>
      {/* Breadcrumb */}
      <a
        href="/admin?section=utilisateurs"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginBottom: '24px',
          fontWeight: 500,
        }}
      >
        ← Retour aux utilisateurs
      </a>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {pe?.photo_url ? (
          <img
            src={pe.photo_url}
            alt={`${profile.prenom} ${profile.nom}`}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--blue-light)',
            color: 'var(--blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {initials}
          </div>
        )}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '28px',
            color: 'var(--navy)',
            fontWeight: 700,
            margin: '0 0 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}>
            {profile.prenom} {profile.nom}
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: '99px',
              background: isEtudiant ? 'var(--blue-light)' : 'var(--green-light)',
              color: isEtudiant ? 'var(--blue)' : 'var(--green)',
            }}>
              {isEtudiant ? 'Étudiant' : 'Bailleur'}
            </span>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>{email ?? '—'}</p>
        </div>
      </div>

      {/* Grille 2 colonnes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
      }}>

        {/* Carte 1 — Informations du compte */}
        <Card title="Informations du compte">
          <InfoRow label="Email" value={email ?? '—'} />
          <InfoRow
            label="Email confirmé"
            value={
              emailConfirmedAt
                ? formatDate(emailConfirmedAt)
                : <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px',
                    background: 'var(--error-light)', color: 'var(--error)',
                  }}>Non confirmé</span>
            }
          />
          <InfoRow label="Inscrit le" value={createdAt ? formatDate(createdAt) : '—'} />
          <InfoRow label="Dernière connexion" value={lastSignIn ? formatDate(lastSignIn) : 'Jamais'} />
          <InfoRow label="Ville" value={profile.ville ?? '—'} />
          <InfoRow label="Téléphone" value={profile.telephone ?? '—'} />
          <InfoRow
            label="Téléphone vérifié"
            value={
              profile.phone_verified
                ? <span style={{ color: 'var(--green)', fontWeight: 600 }}>Oui ✓</span>
                : <span style={{ color: 'var(--error)' }}>Non</span>
            }
          />
        </Card>

        {/* Carte 2 — Profil étudiant */}
        {isEtudiant && pe && (
          <Card title="Profil étudiant">
            {/* Score barre */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Score du profil</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                  {pe.score_profil ?? 0}/100
                </span>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: '99px', height: '6px' }}>
                <div style={{
                  background: 'var(--blue)',
                  borderRadius: '99px',
                  height: '6px',
                  width: `${pe.score_profil ?? 0}%`,
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Statut de vérification
              </span>
              <StatutBadge statut={pe.statut_verification} />
            </div>

            <InfoRow label="Université" value={pe.universite ?? '—'} />
            <InfoRow label="Âge" value={pe.age != null ? `${pe.age} ans` : '—'} />
            <InfoRow label="Email universitaire" value={pe.email_universitaire ?? '—'} />
            <InfoRow label="Vérifié le" value={pe.verifie_le ? formatDate(pe.verifie_le) : '—'} />

            {pe.photo_url && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Photo de profil
                </span>
                <img
                  src={pe.photo_url}
                  alt="Photo de profil"
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
            )}

            {pe.certificat_url && (
              <div style={{ marginTop: '14px' }}>
                <a
                  href={pe.certificat_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--blue)',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: '1px solid var(--blue-light)',
                    background: 'var(--blue-light)',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                  }}
                >
                  <FileText size={14} />
                  Voir le certificat →
                </a>
              </div>
            )}

            {pe.statut_verification === 'en_attente_admin' && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Actions de vérification
                </p>
                <CertificatActions
                  userId={userId}
                  userEmail={email ?? ''}
                  prenom={profile.prenom ?? ''}
                />
              </div>
            )}
          </Card>
        )}

        {/* Carte 3 — Annonces bailleur */}
        {isBailleur && annonces && annonces.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <Card title={`Annonces publiées (${annonces.length})`}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {annonces.slice(0, 5).map((a, idx) => {
                  const photo = (a.photos as { url: string; ordre: number }[] | null)
                    ?.sort((x: { ordre: number }, y: { ordre: number }) => x.ordre - y.ordre)[0]
                  const statutColors: Record<string, { color: string; bg: string; label: string }> = {
                    active: { label: 'Active', color: 'var(--green)', bg: 'var(--green-light)' },
                    signalee: { label: 'Signalée', color: 'var(--error)', bg: 'var(--error-light)' },
                    suspendue: { label: 'Suspendue', color: '#92400E', bg: '#FEF3C7' },
                    inactive: { label: 'Inactive', color: 'var(--text-muted)', bg: 'var(--border)' },
                  }
                  const sStyle = statutColors[a.statut] ?? statutColors.inactive

                  return (
                    <div key={a.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: idx < Math.min(annonces.length, 5) - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                      }}>
                        {photo
                          ? <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : '🏠'
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.titre ?? 'Sans titre'}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                          {a.ville} · {a.prix != null ? formatPrix(a.prix) + '/mois' : '—'}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                        borderRadius: '99px', background: sStyle.bg, color: sStyle.color, flexShrink: 0,
                      }}>
                        {sStyle.label}
                      </span>
                      <a
                        href={`/annonces/${a.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: 'var(--blue)', textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}
                      >
                        Voir →
                      </a>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Carte Actions */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Card title="Actions administrateur">
            <div style={{
              background: 'var(--error-light)',
              border: '1px solid var(--error)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--error)', margin: '0 0 2px' }}>
                  Supprimer ce compte
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  L&apos;email sera libéré. Action irréversible.
                </p>
              </div>
              <SupprimerUtilisateurButton
                userId={userId}
                prenom={profile.prenom ?? ''}
                nom={profile.nom ?? ''}
                role={profile.role ?? ''}
                redirectTo="/admin?section=utilisateurs"
              />
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '24px',
    }}>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--navy)', margin: '0 0 16px' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '7px 0',
      borderBottom: '1px solid var(--border)',
      gap: '12px',
    }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '13px', color: 'var(--text)', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
    </div>
  )
}
