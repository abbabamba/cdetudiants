import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { telephone, code } = await request.json()
  if (!telephone || !code) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const cleaned = telephone.replace(/\s/g, '').replace(/^0/, '+33')

  const { error } = await supabase.auth.verifyOtp({
    phone: cleaned,
    token: code,
    type: 'sms',
  })

  if (error) {
    return NextResponse.json(
      { error: 'Code incorrect ou expiré' },
      { status: 400 }
    )
  }

  // verifyOtp modifie les cookies de session (l'utilisateur devient le user
  // téléphone OTP). On utilise le client admin pour bypasser le RLS et écrire
  // sur le profil de l'utilisateur email original.
  const admin = createAdminClient()
  const { error: updateError } = await admin
    .from('profiles')
    .update({ telephone: cleaned, phone_verified: true })
    .eq('id', user.id)

  if (updateError) {
    console.error('[sms/verifier] profiles update failed:', updateError.message)
    return NextResponse.json({ error: 'Mise à jour du profil échouée' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
