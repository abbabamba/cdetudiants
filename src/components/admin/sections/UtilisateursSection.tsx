import { createAdminClient } from '@/lib/supabase/admin'
import { UtilisateursTableClient } from '@/components/admin/UtilisateursTableClient'

type StatutVerification = 'en_attente_admin' | 'verifie_email' | 'verifie_admin' | 'rejete' | null

interface Profile {
  id: string
  nom: string | null
  prenom: string | null
  role: string | null
  created_at: string
  profils_etudiants: { statut_verification: StatutVerification; score_profil: number | null }[] | null
}

interface Props {
  roleFilter: string
  search: string
}

export default async function UtilisateursSection({ roleFilter, search }: Props) {
  const supabase = createAdminClient()

  let query = supabase
    .from('profiles')
    .select('id, nom, prenom, role, created_at, profils_etudiants!profils_etudiants_user_id_fkey(statut_verification, score_profil)')
    .order('created_at', { ascending: false })

  if (roleFilter === 'etudiant') query = query.eq('role', 'etudiant')
  if (roleFilter === 'bailleur') query = query.eq('role', 'bailleur')
  if (roleFilter === 'particulier') query = query.eq('role', 'particulier')

  const [
    { data: allUsers },
    { data: { users: authUsers } },
  ] = await Promise.all([query, supabase.auth.admin.listUsers()])

  const adminIds = new Set(
    (authUsers ?? []).filter(u => u.app_metadata?.role === 'admin').map(u => u.id)
  )
  const users = (allUsers as Profile[] | null ?? []).filter(u => !adminIds.has(u.id))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '28px', color: 'var(--navy)', fontWeight: 700, margin: 0,
        }}>
          Utilisateurs
        </h1>
        <span style={{
          background: 'var(--blue-light)', color: 'var(--blue)',
          fontSize: '13px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px',
        }}>
          {users.length}
        </span>
      </div>

      <UtilisateursTableClient users={users} initialSearch={search} roleFilter={roleFilter} />
    </div>
  )
}
