export type UserRole = 'etudiant' | 'bailleur'

export type StatutVerification =
  | 'non_verifie'
  | 'en_attente_admin'
  | 'verifie_email'
  | 'verifie_admin'

export type StatutAnnonce = 'active' | 'signalee' | 'suspendue' | 'supprimee'

export type TypeLogement = 'studio' | 'colocation' | 'chambre'

export type TypeGarantie = 'visale' | 'garant' | 'autre'

export type CategorieAnnonce =
  | 'logement'
  | 'emploi'
  | 'stage'
  | 'alternance'
  | 'service'

export interface Profile {
  id: string
  role: UserRole
  nom: string
  prenom: string
  ville: string | null
  telephone: string | null
  phone_verified: boolean
  created_at: string
  updated_at: string
}

export interface ProfilEtudiant {
  id: string
  user_id: string
  universite: string | null
  age: number | null
  photo_url: string | null
  email_universitaire: string | null
  certificat_url: string | null
  statut_verification: StatutVerification
  score_profil: number
  verifie_par_admin_id: string | null
  verifie_le: string | null
  created_at: string
  updated_at: string
}

export interface Annonce {
  id: string
  bailleur_id: string
  titre: string
  description: string
  ville: string
  prix: number
  surface: number
  type_logement: TypeLogement
  caution: number
  garantie: TypeGarantie
  categorie: CategorieAnnonce
  statut: StatutAnnonce
  nb_signalements: number
  created_at: string
  updated_at: string
  // Relations optionnelles
  bailleur?: Profile
  photos?: PhotoAnnonce[]
}

export interface PhotoAnnonce {
  id: string
  annonce_id: string
  url: string
  ordre: number
  created_at: string
}

export interface Signalement {
  id: string
  annonce_id: string
  etudiant_id: string
  motif: string | null
  created_at: string
}
