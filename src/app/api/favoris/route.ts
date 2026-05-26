import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { annonceId } = await request.json()
  if (!annonceId) {
    return NextResponse.json({ error: 'annonceId requis' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('favoris')
    .select('id')
    .eq('user_id', user.id)
    .eq('annonce_id', annonceId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('favoris')
      .delete()
      .eq('id', existing.id)
    return NextResponse.json({ action: 'removed', isFavori: false })
  } else {
    await supabase
      .from('favoris')
      .insert({ user_id: user.id, annonce_id: annonceId })
    return NextResponse.json({ action: 'added', isFavori: true })
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json([], { status: 200 })
  }

  const { data } = await supabase
    .from('favoris')
    .select('annonce_id')
    .eq('user_id', user.id)

  return NextResponse.json(
    (data ?? []).map(f => f.annonce_id)
  )
}
