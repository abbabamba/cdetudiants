import { z } from 'zod'

export const CATEGORIES_BAILLEUR = ['logement', 'studio', 'colocation', 'chambre'] as const
export const CATEGORIES_PARTICULIER = ['emploi', 'stage', 'alternance', 'service', 'don'] as const
export const CATEGORIES_ETUDIANT = ['don'] as const
export const TOUTES_CATEGORIES = [...CATEGORIES_BAILLEUR, ...CATEGORIES_PARTICULIER] as const

/* ── Convertit n'importe quelle valeur d'input en number | undefined ── */
function toNum(v: unknown): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined
  if (typeof v === 'number') return isNaN(v) ? undefined : v
  const n = parseFloat(String(v))
  return isNaN(n) ? undefined : n
}

export const annonceSchema = z.object({
  categorie: z.enum(['logement', 'studio', 'colocation', 'chambre', 'emploi', 'stage', 'alternance', 'service', 'don']),

  titre: z
    .string()
    .min(10, 'Le titre doit contenir au moins 10 caractères')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères'),

  description: z
    .string()
    .min(50, 'La description doit contenir au moins 50 caractères')
    .max(2000, 'La description ne doit pas dépasser 2000 caractères'),

  ville: z.string().min(2, 'La ville est requise'),

  prix: z.preprocess(
    toNum,
    z.number()
      .nonnegative('Le prix ne peut pas être négatif')
      .max(99999, 'Prix trop élevé')
      .optional()
  ),

  surface: z.preprocess(
    toNum,
    z.number()
      .positive('La surface doit être positive')
      .multipleOf(0.5, 'La surface doit être un multiple de 0,5 m²')
      .max(9999.5, 'Surface trop grande')
      .optional()
      .nullable()
  ),

  type_logement: z.enum(['studio', 'colocation', 'chambre']).optional().nullable(),

  caution: z.preprocess(
    toNum,
    z.number()
      .nonnegative('La caution ne peut pas être négative')
      .max(99999, 'Caution trop élevée')
      .optional()
      .nullable()
  ),

  garantie: z.enum(['visale', 'garant', 'autre']).optional().nullable(),

  garantie_detail: z.string().max(200).optional().nullable(),

}).refine(data => {
  if (data.garantie === 'autre' && !data.garantie_detail?.trim()) {
    return false
  }
  return true
}, {
  message: 'Précisez le type de garantie',
  path: ['garantie_detail'],
})

export type AnnonceFormData = z.infer<typeof annonceSchema>
