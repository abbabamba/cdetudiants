import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const adminClient = createAdminClient()
  const { data: fullUser } = await adminClient.auth.admin.getUserById(user.id)
  const isAdmin = fullUser.user?.app_metadata?.role === 'admin'
  if (!isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { data: enAttente } = await adminClient
    .from('profils_etudiants')
    .select('*, profiles(nom, prenom, ville)')
    .eq('statut_verification', 'en_attente_admin')
    .order('created_at', { ascending: true })

  if (!enAttente || enAttente.length === 0) {
    return NextResponse.json([])
  }

  const results = await Promise.all(
    enAttente.map(async (pe) => {
      const { data } = await adminClient.auth.admin.getUserById(pe.user_id)
      return { ...pe, email: data.user?.email ?? null }
    })
  )

  return NextResponse.json(results)
}
