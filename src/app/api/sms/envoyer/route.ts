import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { telephone } = await request.json()
  if (!telephone) return NextResponse.json({ error: 'Téléphone requis' }, { status: 400 })

  const cleaned = telephone.replace(/\s/g, '').replace(/^0/, '+33')

  const { data: profile } = await supabase
    .from('profiles')
    .select('phone_verification_sent_at')
    .eq('id', user.id)
    .single()

  if (profile?.phone_verification_sent_at) {
    const lastSent = new Date(profile.phone_verification_sent_at)
    const diffMs = Date.now() - lastSent.getTime()
    if (diffMs < 60_000) {
      return NextResponse.json(
        { error: 'Attendez 1 minute avant de renvoyer un SMS' },
        { status: 429 }
      )
    }
  }

  const { error } = await supabase.auth.signInWithOtp({
    phone: cleaned,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const admin = createAdminClient()
  await admin.from('profiles').update({
    telephone: cleaned,
    phone_verification_sent_at: new Date().toISOString(),
  }).eq('id', user.id)

  return NextResponse.json({ success: true, telephone: cleaned })
}
