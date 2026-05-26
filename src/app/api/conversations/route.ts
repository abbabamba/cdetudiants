import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailNouveauMessage } from '@/lib/email'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: pe } = await supabase
    .from('profils_etudiants')
    .select('statut_verification')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!pe || !['verifie_email', 'verifie_admin'].includes(pe.statut_verification ?? '')) {
    return NextResponse.json(
      { error: 'Compte étudiant vérifié requis' },
      { status: 403 }
    )
  }

  const { annonceId } = await request.json()

  const { data: annonce } = await supabase
    .from('annonces')
    .select('bailleur_id, titre')
    .eq('id', annonceId)
    .single()

  if (!annonce) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })

  let { data: conversation } = await supabase
    .from('conversations')
    .select()
    .eq('annonce_id', annonceId)
    .eq('etudiant_id', user.id)
    .maybeSingle()

  if (!conversation) {
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        annonce_id: annonceId,
        etudiant_id: user.id,
        bailleur_id: annonce.bailleur_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert conversation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    conversation = newConv

    // Notifier le bailleur lors de la création d'une nouvelle conversation
    const { data: bailleurProfile } = await supabase
      .from('profiles')
      .select('prenom, nom')
      .eq('id', annonce.bailleur_id)
      .single()

    const { data: etudiantProfile } = await supabase
      .from('profiles')
      .select('prenom, nom')
      .eq('id', user.id)
      .single()

    const adminClient = createAdminClient()
    const { data: bailleurAuth } = await adminClient.auth.admin.getUserById(annonce.bailleur_id)

    if (bailleurAuth.user?.email && bailleurProfile && etudiantProfile) {
      try {
        await sendEmail({
          to: bailleurAuth.user.email,
          subject: `Nouveau message de ${etudiantProfile.prenom}`,
          html: emailNouveauMessage(
            bailleurProfile.prenom ?? '',
            etudiantProfile.prenom ?? '',
            'Un étudiant souhaite vous contacter au sujet de votre annonce.',
            annonce.titre ?? '',
            'bailleur',
          ),
        })
      } catch (err) {
        console.error('[Email] échec notification conversation:', err)
      }
    }
  }

  return NextResponse.json({ conversation })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 200 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('conversations')
    .select(`
      id, created_at, last_message_at,
      annonce:annonces(id, titre, ville, prix, photos:photos_annonces(url, ordre)),
      etudiant:profiles!conversations_etudiant_id_fkey(id, nom, prenom),
      bailleur:profiles!conversations_bailleur_id_fkey(id, nom, prenom),
      messages(id, contenu, created_at, sender_id, lu_par_bailleur, lu_par_etudiant)
    `)
    .order('last_message_at', { ascending: false })

  if (profile?.role === 'etudiant') {
    query = query.eq('etudiant_id', user.id)
  } else {
    query = query.eq('bailleur_id', user.id)
  }

  const { data } = await query
  return NextResponse.json(data ?? [])
}
