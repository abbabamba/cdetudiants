import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { BottomNavClient } from './BottomNavClient'

export async function BottomNav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  let nonLus = 0
  const isAdmin = user.app_metadata?.role === 'admin'
  const cookieStore = await cookies()
  const previewRole = cookieStore.get('admin_view_as')?.value as 'etudiant' | 'bailleur' | 'particulier' | undefined
  const role = (previewRole && isAdmin) ? previewRole : (profile?.role ?? 'etudiant')

  if (role === 'particulier') {
    return <BottomNavClient role={role} nonLus={0} />
  }

  if (role === 'etudiant') {
    const { data: convIds } = await supabase
      .from('conversations').select('id').eq('etudiant_id', user.id)
    if (convIds && convIds.length > 0) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('lu_par_etudiant', false)
        .neq('sender_id', user.id)
        .in('conversation_id', convIds.map((c) => c.id))
      nonLus = count ?? 0
    }
  } else if (role === 'bailleur') {
    const { data: convIds } = await supabase
      .from('conversations').select('id').eq('bailleur_id', user.id)
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

  return <BottomNavClient role={role} nonLus={nonLus} />
}
