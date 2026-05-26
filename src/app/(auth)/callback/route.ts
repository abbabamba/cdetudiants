import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import {
  sendEmail,
  emailBienvenueEtudiant,
  emailBienvenueIBailleur,
  emailBienvenueParticulier,
  emailNouveauCertificat,
} from '@/lib/email'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_callback`)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=no_session`)
    }

    // Filet de sécurité : upsert profiles si le trigger PostgreSQL a du lag
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      const meta = user.user_metadata ?? {}
      await supabase.from('profiles').upsert({
        id: user.id,
        role: meta.role ?? 'etudiant',
        nom: meta.nom ?? '',
        prenom: meta.prenom ?? '',
        ville: meta.ville ?? null,
        telephone: meta.telephone ?? null,
      })
    }

    const role = user.user_metadata?.role

    // Profil particulier
    if (role === 'particulier') {
      await supabase
        .from('profils_particuliers')
        .upsert({ user_id: user.id }, { onConflict: 'user_id' })
    }

    // Profil étudiant : mettre à jour le statut sans écraser certificat_url
    if (role === 'etudiant') {
      const rawStatut = user.user_metadata?.statut_verification
      const statut = rawStatut === 'en_attente_admin'
        ? 'en_attente_admin'
        : 'verifie_email'

      const { data: existingPe } = await supabase
        .from('profils_etudiants')
        .select('id, certificat_url')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingPe) {
        await supabase
          .from('profils_etudiants')
          .update({
            statut_verification: statut,
            email_universitaire: user.email,
          })
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('profils_etudiants')
          .insert({
            user_id: user.id,
            email_universitaire: user.email,
            statut_verification: statut,
          })
      }
    }

    // Emails uniquement à la première confirmation
    const isFirstConfirmation = !!(
      user.email_confirmed_at &&
      Date.now() - new Date(user.email_confirmed_at).getTime() < 60_000
    )

    if (isFirstConfirmation) {
      const prenom = user.user_metadata?.prenom ?? ''
      const nom = user.user_metadata?.nom ?? ''
      const emailTo = user.email ?? ''

      if (role === 'etudiant' && emailTo) {
        await sendEmail({
          to: emailTo,
          subject: 'Bienvenue sur Coin des Étudiants ! 🎉',
          html: emailBienvenueEtudiant(prenom),
        })

        const rawStatut = user.user_metadata?.statut_verification
        if (rawStatut === 'en_attente_admin' && process.env.ADMIN_EMAIL) {
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `[Admin] Nouveau certificat — ${prenom} ${nom}`,
            html: emailNouveauCertificat(prenom, nom),
          })
        }
      } else if (role === 'bailleur' && emailTo) {
        await sendEmail({
          to: emailTo,
          subject: 'Bienvenue sur Coin des Étudiants !',
          html: emailBienvenueIBailleur(prenom),
        })
      } else if (role === 'particulier' && emailTo) {
        await sendEmail({
          to: emailTo,
          subject: 'Bienvenue sur Coin des Étudiants !',
          html: emailBienvenueParticulier(prenom),
        })
      }
    }

    // Redirection basée sur le rôle
    if (role === 'bailleur') {
      return NextResponse.redirect(`${origin}/bailleur`)
    }
    if (role === 'particulier') {
      return NextResponse.redirect(`${origin}/particulier`)
    }
    return NextResponse.redirect(`${origin}/annonces?welcome=1`)
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
