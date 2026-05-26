export const MOCK_ETUDIANT = {
  id: 'preview-mock-etudiant',
  prenom: 'Marie',
  nom: 'Diallo',
  ville: 'Paris',
  email: 'marie.diallo@univ-paris.fr',
  telephone: '+33 6 12 34 56 78',
  phone_verified: true,
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
}

export const MOCK_PROFIL_ETUDIANT = {
  user_id: 'preview-mock-etudiant',
  statut_verification: 'verifie_email',
  universite: 'Université Paris Dauphine',
  age: 21,
  score_profil: 4,
  photo_url: null,
  certificat_url: null,
}

export const MOCK_BAILLEUR = {
  id: 'preview-mock-bailleur',
  prenom: 'Jean-Marc',
  nom: 'Dupont',
  ville: 'Lyon',
  email: 'jm.dupont@gmail.com',
  telephone: '+33 6 98 76 54 32',
  phone_verified: true,
  created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
}

export const MOCK_PARTICULIER = {
  id: 'preview-mock-particulier',
  prenom: 'Karim',
  nom: 'Benali',
  ville: 'Bordeaux',
  email: 'k.benali@pme-exemple.fr',
  telephone: '+33 6 55 44 33 22',
  phone_verified: true,
  created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
}

export const MOCK_PROFIL_PARTICULIER = {
  user_id: 'preview-mock-particulier',
  type_activite: 'entreprise',
  description: 'PME spécialisée en développement web, nous recrutons régulièrement des stagiaires et alternants.',
  site_web: 'https://pme-exemple.fr',
}
