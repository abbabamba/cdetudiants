import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: passwordSchema,
})

export const registerEtudiantEmailSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  ville: z.string().min(2, 'La ville est requise'),
  email_universitaire: z
    .string()
    .email('Email universitaire invalide')
    .refine(
      (email) => !email.endsWith('@gmail.com') && !email.endsWith('@yahoo.fr'),
      { message: 'Utilisez votre email universitaire (ex: prenom.nom@univ-paris.fr)' }
    ),
  password: passwordSchema,
})

export const registerEtudiantCertificatSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  ville: z.string().min(2, 'La ville est requise'),
  email: z.string().email('Email invalide'),
  password: passwordSchema,
  certificat: z
    .instanceof(File)
    .refine((f) => f.size > 0, 'Le certificat de scolarité est requis')
    .refine(
      (f) => ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      { message: 'Format accepté : PDF, JPEG, PNG ou WebP' }
    )
    .refine((f) => f.size <= 5 * 1024 * 1024, {
      message: 'Le fichier ne doit pas dépasser 5 Mo',
    }),
})

export const registerBailleurSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  ville: z.string().min(2, 'La ville est requise'),
  email: z.string().email('Email invalide'),
  telephone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, 'Numéro de téléphone invalide'),
  password: passwordSchema,
})

export const registerParticulierSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  ville: z.string().min(2, 'La ville est requise'),
  email: z.string().email('Email invalide'),
  password: passwordSchema,
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterEtudiantEmailFormData = z.infer<typeof registerEtudiantEmailSchema>
export type RegisterEtudiantCertificatFormData = z.infer<typeof registerEtudiantCertificatSchema>
export type RegisterBailleurFormData = z.infer<typeof registerBailleurSchema>
export type RegisterParticulierFormData = z.infer<typeof registerParticulierSchema>
