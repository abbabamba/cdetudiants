import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailAnnonceModeree } from '@/lib/email'

type Action = 'suspendre' | 'activer' | 'supprimer'

const ACTION_STATUT: Record<Action, string> = {
  suspendre: 'suspendue',
  activer: 'active',
  supprimer: 'supprimee',
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const adminClient = createAdminClient()
  const { data: fullUser } = await adminClient.auth.admin.getUserById(user.id)
  const isAdmin = fullUser.user?.app_metadata?.role === 'admin'
  if (!isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { annonceId, action } = await request.json() as { annonceId: string; action: Action }

  if (!annonceId || !action || !(action in ACTION_STATUT)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const { error } = await adminClient
    .from('annonces')
    .update({ statut: ACTION_STATUT[action] })
    .eq('id', annonceId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notifier le bailleur si l'annonce est suspendue ou supprimée
  if (action === 'suspendre' || action === 'supprimer') {
    const { data: annonce } = await adminClient
      .from('annonces')
      .select('titre, bailleur_id')
      .eq('id', annonceId)
      .single()

    if (annonce) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('prenom')
        .eq('id', annonce.bailleur_id)
        .single()

      const { data: bailleurAuth } = await adminClient.auth.admin.getUserById(annonce.bailleur_id)

      if (bailleurAuth.user?.email && profile?.prenom) {
        const statutEmail = ACTION_STATUT[action] as 'suspendue' | 'supprimee'
        try {
          await sendEmail({
            to: bailleurAuth.user.email,
            subject: action === 'supprimer'
              ? `Votre annonce "${annonce.titre}" a été supprimée`
              : `Votre annonce "${annonce.titre}" a été suspendue`,
            html: emailAnnonceModeree(profile.prenom, annonce.titre, statutEmail),
          })
        } catch (err) {
          console.error('[Email] échec notification modération:', err)
        }
      }
    }
  }

  return NextResponse.json({ success: true })
}
