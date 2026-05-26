import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailCertificatRejete } from '@/lib/email'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const adminClient = createAdminClient()
  const { data: fullUser } = await adminClient.auth.admin.getUserById(user.id)
  const isAdmin = fullUser.user?.app_metadata?.role === 'admin'
  if (!isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { userId } = await request.json()

  const { error } = await adminClient
    .from('profils_etudiants')
    .update({ statut_verification: 'rejete' })
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: authUser } = await adminClient.auth.admin.getUserById(userId)
  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom')
    .eq('id', userId)
    .single()

  if (authUser.user?.email && profile?.prenom) {
    try {
      await sendEmail({
        to: authUser.user.email,
        subject: 'Vérification de votre certificat — Coin des Étudiants',
        html: emailCertificatRejete(profile.prenom),
      })
    } catch (err) {
      console.error('[Email] échec notification rejet:', err)
    }
  }

  return NextResponse.json({ success: true })
}
