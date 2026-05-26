/*
  SQL à exécuter une fois dans Supabase (SQL Editor) :

  CREATE OR REPLACE FUNCTION increment_signalements(annonce_id uuid)
  RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
  BEGIN
    UPDATE annonces
    SET nb_signalements = COALESCE(nb_signalements, 0) + 1,
        statut = CASE WHEN COALESCE(nb_signalements, 0) + 1 >= 3 THEN 'signalee' ELSE statut END
    WHERE id = annonce_id;
  END;
  $$;
*/

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail, emailAnnonceSignalee } from '@/lib/email'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { data: profileCheck } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (!profileCheck || profileCheck.role !== 'etudiant') {
  return NextResponse.json({ error: 'Réservé aux étudiants' }, { status: 403 })
}


  const body = await request.json()
  const { annonce_id, motif, message } = body as {
    annonce_id: string
    motif: string
    message?: string
  }

  if (!annonce_id || !motif) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const { error: insertError } = await supabase.from('signalements').insert({
    annonce_id,
    etudiant_id: user.id,
    motif,
    message: message?.trim() || null,
  })

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'Vous avez déjà signalé cette annonce' }, { status: 409 })
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  await supabase.rpc('increment_signalements', { annonce_id })

  const { data: annonceData } = await supabase
    .from('annonces')
    .select('titre, nb_signalements')
    .eq('id', annonce_id)
    .single()

  if (annonceData && process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `[Admin] Annonce signalée — ${annonceData.titre}`,
      html: emailAnnonceSignalee(
        annonceData.titre ?? 'Sans titre',
        motif,
        annonceData.nb_signalements ?? 1,
      ),
    })
  }

  return NextResponse.json({ ok: true })
}

export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ dejaSignale: false })
  }

  const { searchParams } = new URL(request.url)
  const annonce_id = searchParams.get('annonce_id')
  if (!annonce_id) {
    return NextResponse.json({ dejaSignale: false })
  }

  const { data } = await supabase
    .from('signalements')
    .select('id')
    .eq('etudiant_id', user.id)
    .eq('annonce_id', annonce_id)
    .maybeSingle()

  return NextResponse.json({ dejaSignale: !!data })
}
