import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { NavbarClient } from './NavbarClient'

export async function NavbarServer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let scoreInfo = null
  let nonLus = 0

  let photoUrl: string | null = null

  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('nom, prenom, role, telephone, phone_verified, photo_url')
      .eq('id', user.id)
      .single()
    profile = p
    photoUrl = p?.photo_url ?? null

    if (p?.role === 'etudiant') {
      const { data: pe } = await supabase
        .from('profils_etudiants')
        .select('statut_verification, photo_url')
        .eq('user_id', user.id)
        .single()
      if (pe?.photo_url) photoUrl = pe.photo_url
      scoreInfo = pe ? {
        statut_verification: pe.statut_verification,
        phone_verified: p.phone_verified ?? false,
        telephone: p.telephone ?? null,
      } : null

      const { data: convIds } = await supabase
        .from('conversations')
        .select('id')
        .eq('etudiant_id', user.id)

      if (convIds && convIds.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('lu_par_etudiant', false)
          .neq('sender_id', user.id)
          .in('conversation_id', convIds.map((c) => c.id))
        nonLus = count ?? 0
      }
    } else if (p?.role === 'bailleur') {
      scoreInfo = {
        statut_verification: '',
        phone_verified: p.phone_verified ?? false,
        telephone: p.telephone ?? null,
      }

      const { data: convIds } = await supabase
        .from('conversations')
        .select('id')
        .eq('bailleur_id', user.id)

      if (convIds && convIds.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('lu_par_bailleur', false)
          .neq('sender_id', user.id)
          .in('conversation_id', convIds.map((c) => c.id))
        nonLus = count ?? 0
      }
    }
  }

  const isAdmin = user?.app_metadata?.role === 'admin'

  // In preview mode, show the navbar as the previewed role
  const cookieStore = await cookies()
  const previewRole = cookieStore.get('admin_view_as')?.value as 'etudiant' | 'bailleur' | 'particulier' | undefined

  let effectiveProfile = profile
  let effectiveIsAdmin = isAdmin
  if (previewRole && isAdmin) {
    effectiveProfile = profile
      ? { ...profile, role: previewRole }
      : { nom: '', prenom: 'Admin', role: previewRole, telephone: null, phone_verified: false, photo_url: null }
    effectiveIsAdmin = false
  }

  return (
    <NavbarClient
      user={user ? { id: user.id, email: user.email ?? '' } : null}
      profile={effectiveProfile}
      photoUrl={photoUrl}
      scoreInfo={scoreInfo}
      isAdmin={effectiveIsAdmin}
      nonLus={nonLus}
    />
  )
}
