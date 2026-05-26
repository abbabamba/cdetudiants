import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, emailNouveauMessage } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { conversationId, contenu } = await request.json()
  if (!conversationId || !contenu?.trim()) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const { data: conv } = await supabase
    .from('conversations')
    .select(`
      etudiant_id, bailleur_id,
      annonce:annonces(titre),
      etudiant:profiles!conversations_etudiant_id_fkey(prenom, nom),
      bailleur:profiles!conversations_bailleur_id_fkey(prenom, nom)
    `)
    .eq('id', conversationId)
    .single()

  if (!conv) return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 })

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    contenu: contenu.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  // Envoyer email au destinataire (pas à l'expéditeur)
  const isEtudiant = user.id === conv.etudiant_id
  const destinataireId = isEtudiant ? conv.bailleur_id : conv.etudiant_id
  const destinataireRole = isEtudiant ? 'bailleur' : 'etudiant'

  const destinataireProfile = isEtudiant ? conv.bailleur : conv.etudiant
  const expediteurProfile = isEtudiant ? conv.etudiant : conv.bailleur

  const adminClient = createAdminClient()
  const { data: destAuth } = await adminClient.auth.admin.getUserById(destinataireId)

  if (destAuth.user?.email) {
    // Anti-spam : 1 email max par jour par conversation par expéditeur
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('sender_id', user.id)
      .gte('created_at', new Date().toISOString().split('T')[0])

    if ((count ?? 0) <= 1) {
      sendEmail({
        to: destAuth.user.email,
        subject: `Nouveau message de ${(expediteurProfile as { prenom?: string })?.prenom}`,
        html: emailNouveauMessage(
          (destinataireProfile as { prenom?: string })?.prenom ?? '',
          (expediteurProfile as { prenom?: string })?.prenom ?? '',
          contenu.trim(),
          (conv.annonce as { titre?: string })?.titre ?? '',
          destinataireRole,
        ),
      })
    }
  }

  return NextResponse.json({ success: true })
}
