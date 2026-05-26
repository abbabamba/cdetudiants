import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
})

const FROM = `"${process.env.NODEMAILER_NAME ?? 'Coin des Étudiants'}" <${process.env.NODEMAILER_USER}>`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    console.log('[Email] envoi en cours...')
    const info = await transporter.sendMail({ from: FROM, to, subject, html })
    console.log(`[Email] ✓ message transmis | id: ${info.messageId}`)
    return { success: true }
  } catch (error) {
    console.error('[Email] ✗ erreur lors de l\'envoi:', error)
    return { success: false, error }
  }
}

/* ═══════════════════════════════════════
   TEMPLATES
═══════════════════════════════════════ */

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;
    border-radius:16px;overflow:hidden;border:1px solid #E2DDD5;">

    <!-- Header -->
    <div style="background:#1B5FAD;padding:28px 40px;text-align:center;">
      <h1 style="color:#fff;font-size:20px;margin:0;font-weight:600;
        letter-spacing:-0.3px;">
        Coin des Étudiants
      </h1>
      <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:4px 0 0;">
        Plateforme de logement étudiant
      </p>
    </div>

    <!-- Content -->
    <div style="padding:36px 40px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid #E2DDD5;
      text-align:center;">
      <p style="color:#9B9590;font-size:12px;margin:0;">
        © 2026 Coin des Étudiants ·
        <a href="${APP_URL}" style="color:#1B5FAD;text-decoration:none;">
          coindesetudiants.fr
        </a>
      </p>
    </div>
  </div>
</body>
</html>`
}

function btnPrimary(href: string, text: string): string {
  return `<a href="${href}"
    style="display:inline-block;background:#1B5FAD;color:#fff;
    font-size:15px;font-weight:600;padding:13px 28px;
    border-radius:10px;text-decoration:none;margin:20px 0;">
    ${text}
  </a>`
}

function infoBox(text: string, color = '#E8F0FA', textColor = '#1B5FAD'): string {
  return `<div style="background:${color};border-radius:10px;
    padding:16px 20px;margin:16px 0;font-size:14px;color:${textColor};">
    ${text}
  </div>`
}

// ─── 1. Bienvenue étudiant (après confirmation email) ───────────────────────
export function emailBienvenueEtudiant(prenom: string): string {
  return baseTemplate(`
    <h2 style="color:#1A2D4F;font-size:22px;margin:0 0 8px;">
      Bienvenue ${prenom} ! 🎉
    </h2>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Votre compte étudiant est activé. Vous pouvez maintenant
      parcourir les annonces et contacter les bailleurs.
    </p>
    ${infoBox(`
      <strong>Prochaine étape :</strong> Complétez votre profil
      pour augmenter votre visibilité auprès des bailleurs.
    `)}
    ${btnPrimary(`${APP_URL}/etudiant`, 'Accéder à mon espace')}
    <p style="color:#9B9590;font-size:13px;margin:16px 0 0;">
      Si vous n'avez pas créé ce compte, ignorez cet email.
    </p>
  `)
}

// ─── 2. Bienvenue bailleur ───────────────────────────────────────────────────
export function emailBienvenueIBailleur(prenom: string): string {
  return baseTemplate(`
    <h2 style="color:#1A2D4F;font-size:22px;margin:0 0 8px;">
      Bienvenue ${prenom} !
    </h2>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Votre compte bailleur est activé. Vous pouvez maintenant
      publier vos annonces et les rendre visibles à des milliers
      d'étudiants vérifiés.
    </p>
    ${infoBox(`
      <strong>Conseil :</strong> Ajoutez votre numéro de téléphone
      dans votre profil pour que les étudiants puissent vous contacter.
    `)}
    ${btnPrimary(`${APP_URL}/bailleur/publier`, 'Publier ma première annonce')}
  `)
}

// ─── 3. Certificat reçu — notification admin ────────────────────────────────
export function emailNouveauCertificat(
  prenomEtudiant: string,
  nomEtudiant: string,
): string {
  return baseTemplate(`
    <h2 style="color:#1A2D4F;font-size:20px;margin:0 0 12px;">
      ⚠️ Nouveau certificat à vérifier
    </h2>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 16px;">
      <strong style="color:#1A2D4F;">
        ${prenomEtudiant} ${nomEtudiant}
      </strong>
      vient de soumettre un certificat de scolarité
      en attente de validation.
    </p>
    ${btnPrimary(`${APP_URL}/admin?section=certificats`, 'Examiner le certificat')}
  `)
}

// ─── 4. Certificat approuvé — notification étudiant ─────────────────────────
export function emailCertificatApprouve(prenom: string): string {
  return baseTemplate(`
    <h2 style="color:#2D7A3A;font-size:22px;margin:0 0 8px;">
      Votre compte est validé ✓
    </h2>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Bonjour ${prenom},
    </p>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Notre équipe a examiné votre certificat de scolarité
      et votre compte étudiant est maintenant
      <strong style="color:#2D7A3A;">pleinement validé</strong>.
    </p>
    ${infoBox(
      'Vous avez désormais accès à toutes les annonces et pouvez contacter les bailleurs directement.',
      '#E6F4E8',
      '#2D7A3A'
    )}
    ${btnPrimary(`${APP_URL}/etudiant`, 'Accéder à mon espace')}
  `)
}

// ─── 5. Certificat rejeté — notification étudiant ───────────────────────────
export function emailCertificatRejete(prenom: string): string {
  return baseTemplate(`
    <h2 style="color:#1A2D4F;font-size:22px;margin:0 0 8px;">
      Vérification de votre certificat
    </h2>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 8px;">
      Bonjour ${prenom},
    </p>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Nous n'avons pas pu valider votre certificat de scolarité.
      Le document est peut-être illisible, expiré ou incomplet.
    </p>
    ${infoBox(
      'Vous pouvez soumettre un nouveau document depuis votre profil.',
      '#FEE2E2',
      '#991B1B'
    )}
    ${btnPrimary(`${APP_URL}/etudiant/profil/completer`, 'Soumettre un nouveau document')}
  `)
}

// ─── 6. Nouveau message reçu ─────────────────────────────────────────────────
export function emailNouveauMessage(
  prenomDestinataire: string,
  prenomExpediteur: string,
  extraitMessage: string,
  annonceTitre: string,
  role: 'etudiant' | 'bailleur',
): string {
  const lien = role === 'etudiant'
    ? `${APP_URL}/etudiant/messages`
    : `${APP_URL}/bailleur/messages`

  return baseTemplate(`
    <h2 style="color:#1A2D4F;font-size:20px;margin:0 0 8px;">
      Nouveau message de ${prenomExpediteur}
    </h2>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 4px;">
      Bonjour ${prenomDestinataire},
    </p>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Vous avez reçu un message concernant
      <strong style="color:#1A2D4F;">${annonceTitre}</strong>.
    </p>
    <div style="background:#F7F6F2;border-left:3px solid #1B5FAD;
      border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 20px;
      font-size:14px;color:#1A2D4F;font-style:italic;">
      "${extraitMessage.length > 150
        ? extraitMessage.substring(0, 150) + '...'
        : extraitMessage}"
    </div>
    ${btnPrimary(lien, 'Répondre au message')}
    <p style="color:#9B9590;font-size:12px;margin:16px 0 0;">
      Pour ne plus recevoir ces notifications,
      gérez vos préférences dans votre profil.
    </p>
  `)
}

// ─── 7. Annonce modérée — notification bailleur ─────────────────────────────
export function emailAnnonceModeree(
  prenom: string,
  titreAnnonce: string,
  action: 'suspendue' | 'supprimee',
): string {
  const isSupprimee = action === 'supprimee'
  const titre = isSupprimee
    ? 'Votre annonce a été supprimée'
    : 'Votre annonce a été suspendue'
  const accentColor = isSupprimee ? '#991B1B' : '#D97706'
  const bgColor = isSupprimee ? '#FEE2E2' : '#FEF3C7'

  return baseTemplate(`
    <h2 style="color:${accentColor};font-size:20px;margin:0 0 12px;">
      ${titre}
    </h2>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 4px;">
      Bonjour ${prenom},
    </p>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Suite à des signalements, votre annonce
      <strong style="color:#1A2D4F;">"${titreAnnonce}"</strong>
      a été ${isSupprimee ? 'supprimée définitivement' : 'temporairement suspendue'}
      par notre équipe de modération.
    </p>
    ${infoBox(
      isSupprimee
        ? 'Si vous pensez qu\'il s\'agit d\'une erreur, contactez-nous à l\'adresse de support.'
        : 'Vous pouvez nous contacter pour contester cette décision ou modifier votre annonce.',
      bgColor,
      accentColor
    )}
    ${isSupprimee ? '' : btnPrimary(`${APP_URL}/bailleur`, 'Gérer mes annonces')}
  `)
}

// ─── 9. Bienvenue particulier ────────────────────────────────────────────────
export function emailBienvenueParticulier(prenom: string): string {
  return baseTemplate(`
    <h2 style="color:#1A2D4F;font-size:22px;margin:0 0 8px;">
      Bienvenue ${prenom} !
    </h2>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Votre compte est activé. Vous pouvez maintenant
      publier vos offres d'emploi, stages et dons matériels,
      visibles par des milliers d'étudiants vérifiés.
    </p>
    ${infoBox(`
      <strong>Conseil :</strong> Complétez votre profil et publiez
      votre première offre pour être visible dès aujourd'hui.
    `, '#EDE9FE', '#7C3AED')}
    ${btnPrimary(`${APP_URL}/particulier/publier`, 'Publier ma première offre')}
    <p style="color:#9B9590;font-size:13px;margin:16px 0 0;">
      Si vous n'avez pas créé ce compte, ignorez cet email.
    </p>
  `)
}

// ─── 8. Annonce signalée — notification admin ────────────────────────────────
export function emailAnnonceSignalee(
  titreAnnonce: string,
  motif: string,
  nbSignalements: number,
): string {
  return baseTemplate(`
    <h2 style="color:#991B1B;font-size:20px;margin:0 0 12px;">
      🚨 Annonce signalée (${nbSignalements} fois)
    </h2>
    <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 16px;">
      L'annonce <strong style="color:#1A2D4F;">"${titreAnnonce}"</strong>
      vient d'être signalée.
    </p>
    ${infoBox(
      `<strong>Motif :</strong> ${motif}`,
      '#FEE2E2',
      '#991B1B'
    )}
    ${btnPrimary(`${APP_URL}/admin?section=annonces&statut=signalee`, 'Examiner l\'annonce')}
  `)
}
