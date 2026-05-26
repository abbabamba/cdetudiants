import { createAdminClient } from '@/lib/supabase/admin'
import { CheckCircle } from 'lucide-react'
import { CertificatCard } from '@/components/admin/CertificatCard'

type ProfileRef = { nom: string | null; prenom: string | null; ville: string | null; photo_url?: string | null } | null

export default async function CertificatsSection() {
  const adminClient = createAdminClient()

  const { data: enAttente } = await adminClient
    .from('profils_etudiants')
    .select('*, profiles!profils_etudiants_user_id_fkey(nom, prenom, ville, photo_url)')
    .eq('statut_verification', 'en_attente_admin')
    .order('created_at', { ascending: true })

  const demandes = await Promise.all(
    (enAttente ?? []).map(async (pe) => {
      const { data: authData } = await adminClient.auth.admin.getUserById(pe.user_id)
      let certUrl = pe.certificat_url

      if (pe.certificat_url) {
        const match = pe.certificat_url.match(/\/object\/sign\/certificats\/(.+?)\?/)
        if (match?.[1]) {
          const path = decodeURIComponent(match[1])
          const { data: fresh } = await adminClient.storage
            .from('certificats')
            .createSignedUrl(path, 60 * 60)
          if (fresh?.signedUrl) certUrl = fresh.signedUrl
        }
      }

      return { ...pe, certificat_url: certUrl, email: authData.user?.email ?? null }
    })
  )

  const N = demandes.length
  const now = Date.now()

  return (
    <>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '28px', color: 'var(--navy)', fontWeight: 700, margin: '0 0 4px',
          }}>
            Certificats
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Vérification des dossiers étudiants
          </p>
        </div>
        <span style={{
          background: N > 0 ? '#FEF3C7' : 'var(--green-light)',
          color: N > 0 ? '#92400E' : 'var(--green)',
          fontSize: '13px', fontWeight: 600,
          padding: '5px 14px', borderRadius: '99px',
          border: N > 0 ? '1px solid #FDE68A' : '1px solid rgba(45,122,58,0.2)',
        }}>
          {N > 0 ? `${N} en attente` : 'Tout est traité ✓'}
        </span>
      </div>

      {/* Cards */}
      {demandes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {demandes.map((pe, idx) => {
            const profile = pe.profiles as ProfileRef
            const isNew = now - new Date(pe.created_at).getTime() < 24 * 60 * 60 * 1000

            return (
              <CertificatCard
                key={pe.id}
                userId={pe.user_id}
                profileNom={profile?.nom ?? null}
                profilePrenom={profile?.prenom ?? null}
                photoUrl={profile?.photo_url ?? null}
                email={pe.email}
                ville={profile?.ville ?? null}
                createdAt={pe.created_at}
                certUrl={pe.certificat_url}
                isNew={isNew}
                index={idx}
              />
            )
          })}
        </div>
      )}

      {/* État vide */}
      {demandes.length === 0 && (
        <div style={{
          background: 'var(--green-light)',
          border: '1px solid rgba(45,122,58,0.2)',
          borderRadius: '18px',
          padding: '64px 32px',
          textAlign: 'center',
        }}>
          <CheckCircle size={44} color="var(--green)" style={{ display: 'block', margin: '0 auto 18px' }} />
          <h3 style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '22px', color: 'var(--green)', margin: '0 0 8px',
          }}>
            File vide ✓
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            Aucune demande de certificat en attente de traitement.
          </p>
        </div>
      )}
    </>
  )
}
