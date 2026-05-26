import { createClient } from './client'

/**
 * Upload une photo d'annonce dans le bucket 'photos-annonces'.
 * Chemin : annonces/{annonceId}/{timestamp}-{nom_fichier}
 * Retourne l'URL publique ou null en cas d'erreur.
 */
export async function uploadAnnoncePhoto(
  annonceId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient()
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `annonces/${annonceId}/${timestamp}-${safeName}`

  const { data, error } = await supabase.storage
    .from('photos-annonces')
    .upload(path, file)

  if (error || !data) return null

  return supabase.storage.from('photos-annonces').getPublicUrl(data.path).data.publicUrl
}

/**
 * Upload l'avatar d'un étudiant dans le bucket 'photos-annonces'.
 * Chemin : profiles/{userId}/avatar.{ext}
 * Retourne l'URL publique ou null en cas d'erreur.
 */
export async function uploadAvatarPhoto(
  userId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `profiles/${userId}/avatar.${ext}`

  const { data, error } = await supabase.storage
    .from('photos-annonces')
    .upload(path, file, { upsert: true })

  if (error || !data) return null

  return supabase.storage.from('photos-annonces').getPublicUrl(data.path).data.publicUrl
}
