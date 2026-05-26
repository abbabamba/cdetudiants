'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { annonceSchema, AnnonceFormData } from '@/lib/validations/annonce'
import { createClient } from '@/lib/supabase/client'
import { uploadAnnoncePhoto } from '@/lib/supabase/storage'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, ImagePlus, X, AlertCircle } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import Link from 'next/link'

const MAX_PHOTOS = 5
const MAX_SIZE_MB = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ExistingPhoto {
  id: string
  url: string
  ordre: number
}

interface NewPhoto {
  file: File
  previewUrl: string
}

export default function ModifierAnnoncePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [telephoneVisible, setTelephoneVisible] = useState(true)

  // Photos existantes (depuis la DB)
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([])
  // Nouvelles photos locales (en attente d'upload)
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AnnonceFormData>({ resolver: zodResolver(annonceSchema) })

  const garantieValue = watch('garantie')

  useEffect(() => {
    async function fetchAnnonce() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: annonce }, { data: photos }] = await Promise.all([
        supabase
          .from('annonces')
          .select('*')
          .eq('id', id)
          .eq('bailleur_id', user.id)
          .neq('statut', 'supprimee')
          .single(),
        supabase
          .from('photos_annonces')
          .select('id, url, ordre')
          .eq('annonce_id', id)
          .order('ordre', { ascending: true }),
      ])

      if (!annonce) { setNotFound(true); setLoading(false); return }

      reset({
        categorie: (annonce.categorie ?? 'logement') as AnnonceFormData['categorie'],
        titre: annonce.titre,
        description: annonce.description,
        ville: annonce.ville,
        prix: annonce.prix ?? 0,
        surface: annonce.surface,
        type_logement: annonce.type_logement,
        caution: annonce.caution,
        garantie: annonce.garantie,
        garantie_detail: annonce.garantie_detail ?? '',
      })
      setTelephoneVisible(annonce.telephone_visible ?? true)

      if (photos) setExistingPhotos(photos)
      setLoading(false)
    }
    fetchAnnonce()
  }, [id, router, reset])

  // Suppression immédiate d'une photo existante
  async function handleDeleteExisting(photoId: string) {
    setDeletingId(photoId)
    const supabase = createClient()
    await supabase.from('photos_annonces').delete().eq('id', photoId)
    setExistingPhotos(prev => prev.filter(p => p.id !== photoId))
    setDeletingId(null)
  }

  // Ajout de nouvelles photos locales
  const handlePhotoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPhotoError(null)
      const files = Array.from(e.target.files ?? [])
      const remaining = MAX_PHOTOS - existingPhotos.length - newPhotos.length

      if (files.length > remaining) {
        setPhotoError(`Maximum ${MAX_PHOTOS} photos. Vous pouvez encore en ajouter ${remaining}.`)
        e.target.value = ''
        return
      }

      const invalid = files.find(
        f => !ACCEPTED_TYPES.includes(f.type) || f.size > MAX_SIZE_MB * 1024 * 1024
      )
      if (invalid) {
        setPhotoError('Formats acceptés : JPG, PNG, WebP. Taille max : 5 Mo par photo.')
        e.target.value = ''
        return
      }

      const previews = files.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))
      setNewPhotos(prev => [...prev, ...previews])
      e.target.value = ''
    },
    [existingPhotos.length, newPhotos.length]
  )

  // Retrait d'une nouvelle photo (pas encore uploadée)
  const removeNewPhoto = useCallback((index: number) => {
    setNewPhotos(prev => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  async function onSubmit(data: AnnonceFormData) {
    setServerError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setServerError('Non connecté'); return }

    // 1. Mettre à jour les champs de l'annonce
    const { error } = await supabase
      .from('annonces')
      .update({
        categorie: data.categorie,
        titre: data.titre,
        description: data.description,
        ville: data.ville,
        prix: data.prix,
        surface: data.surface,
        type_logement: data.type_logement,
        caution: data.caution,
        garantie: data.garantie,
        garantie_detail: data.garantie === 'autre' ? data.garantie_detail : null,
        telephone_visible: telephoneVisible,
      })
      .eq('id', id)
      .eq('bailleur_id', user.id)

    if (error) { setServerError(error.message); return }

    // 2. Uploader les nouvelles photos et les insérer
    if (newPhotos.length > 0) {
      const nextOrdre = existingPhotos.length
      const uploads = await Promise.all(
        newPhotos.map(({ file }) => uploadAnnoncePhoto(id, file))
      )
      const rows = uploads
        .map((url, i) => url ? { annonce_id: id, url, ordre: nextOrdre + i } : null)
        .filter(Boolean) as { annonce_id: string; url: string; ordre: number }[]
      if (rows.length > 0) {
        await supabase.from('photos_annonces').insert(rows)
      }
    }

    router.push('/bailleur')
  }

  const totalPhotos = existingPhotos.length + newPhotos.length
  const canAddMore = totalPhotos < MAX_PHOTOS

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="animate-spin" color="var(--blue)" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Annonce introuvable ou accès refusé.</p>
        <Link href="/bailleur" style={{ color: 'var(--blue)', fontSize: '13px', marginTop: '16px', display: 'inline-block' }}>
          ← Mes annonces
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
      <BackButton href="/bailleur" />
      <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-playfair), serif', color: 'var(--navy)', marginBottom: '32px' }}>
        Modifier l&apos;annonce
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Catégorie */}
        <div>
          <label className="form-label">Catégorie</label>
          <select {...register('categorie')} className="form-input">
            <option value="logement">Logement</option>
            <option value="emploi">Emploi</option>
            <option value="stage">Stage</option>
            <option value="alternance">Alternance</option>
            <option value="service">Service</option>
          </select>
          {errors.categorie && <p className="form-error">{errors.categorie.message}</p>}
        </div>

        {/* Titre */}
        <div>
          <label className="form-label">Titre de l&apos;annonce</label>
          <input {...register('titre')} className="form-input" />
          {errors.titre && <p className="form-error">{errors.titre.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="form-label">Description</label>
          <textarea {...register('description')} rows={5} className="form-input" style={{ resize: 'none' }} />
          {errors.description && <p className="form-error">{errors.description.message}</p>}
        </div>

        {/* Ville + Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Ville</label>
            <input {...register('ville')} className="form-input" />
            {errors.ville && <p className="form-error">{errors.ville.message}</p>}
          </div>
          <div>
            <label className="form-label">Type de logement</label>
            <select {...register('type_logement')} className="form-input">
              <option value="studio">Studio</option>
              <option value="colocation">Colocation</option>
              <option value="chambre">Chambre</option>
            </select>
            {errors.type_logement && <p className="form-error">{errors.type_logement.message}</p>}
          </div>
        </div>

        {/* Prix + Surface */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Loyer (€/mois)</label>
            <input type="number" step="any" min="0" {...register('prix', { setValueAs: v => v === '' ? undefined : parseFloat(v) })} className="form-input" />
            {errors.prix && <p className="form-error">{errors.prix.message}</p>}
          </div>
          <div>
            <label className="form-label">Surface (m²)</label>
            <input type="number" step="0.5" min="0" {...register('surface', { setValueAs: v => v === '' ? undefined : parseFloat(v) })} className="form-input" />
            {errors.surface && <p className="form-error">{errors.surface.message}</p>}
          </div>
        </div>

        {/* Caution + Garantie */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Caution (€)</label>
            <input type="number" step="any" min="0" {...register('caution', { setValueAs: v => v === '' ? undefined : parseFloat(v) })} className="form-input" />
            {errors.caution && <p className="form-error">{errors.caution.message}</p>}
          </div>
          <div>
            <label className="form-label">Type de garantie</label>
            <select {...register('garantie')} className="form-input">
              <option value="visale">Visale</option>
              <option value="garant">Garant</option>
              <option value="autre">Autre</option>
            </select>
            {errors.garantie && <p className="form-error">{errors.garantie.message}</p>}
          </div>
        </div>

        {garantieValue === 'autre' && (
          <div>
            <label className="form-label">Précisez le type de garantie *</label>
            <input
              {...register('garantie_detail')}
              placeholder="Ex : Caution solidaire, dépôt..."
              className="form-input"
            />
            {errors.garantie_detail && (
              <p className="form-error">{errors.garantie_detail.message}</p>
            )}
          </div>
        )}

        {/* ── Section photos ─────────────────────── */}
        <div>
          <label className="form-label" style={{ marginBottom: '10px' }}>
            Photos{' '}
            <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
              ({totalPhotos}/{MAX_PHOTOS} — JPG, PNG, WebP, max 5 Mo)
            </span>
          </label>

          {/* Grille photos existantes + nouvelles */}
          {totalPhotos > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}>
              {/* Photos existantes */}
              {existingPhotos.map((photo, i) => (
                <div
                  key={photo.id}
                  style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#EEF4F0' }}
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {i === 0 && existingPhotos.length + newPhotos.length > 0 && (
                    <span style={{
                      position: 'absolute', bottom: '4px', left: '4px',
                      fontSize: '9px', background: 'rgba(0,0,0,0.55)', color: '#fff',
                      padding: '2px 5px', borderRadius: '4px',
                    }}>
                      principale
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteExisting(photo.id)}
                    disabled={deletingId === photo.id}
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      border: 'none', borderRadius: '50%',
                      width: '32px', height: '32px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    aria-label="Supprimer cette photo"
                  >
                    {deletingId === photo.id
                      ? <Loader2 size={11} className="animate-spin" />
                      : <X size={11} />
                    }
                  </button>
                </div>
              ))}

              {/* Nouvelles photos (aperçu local) */}
              {newPhotos.map((photo, i) => (
                <div
                  key={`new-${i}`}
                  style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#EEF4F0' }}
                >
                  <img
                    src={photo.previewUrl}
                    alt={`Nouvelle photo ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Badge "nouveau" */}
                  <span style={{
                    position: 'absolute', bottom: '4px', left: '4px',
                    fontSize: '9px', background: 'var(--blue)', color: '#fff',
                    padding: '2px 5px', borderRadius: '4px',
                  }}>
                    nouveau
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(i)}
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      border: 'none', borderRadius: '50%',
                      width: '32px', height: '32px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    aria-label="Retirer cette photo"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bouton ajouter */}
          {canAddMore && (
            <label style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', width: '100%',
              border: '2px dashed var(--border)', borderRadius: '10px',
              padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)',
              transition: 'border-color 0.15s, color 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLLabelElement).style.borderColor = 'var(--blue)'; (e.currentTarget as HTMLLabelElement).style.color = 'var(--blue)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLLabelElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLLabelElement).style.color = 'var(--text-muted)' }}
            >
              <ImagePlus size={18} />
              Ajouter des photos ({MAX_PHOTOS - totalPhotos} restante{MAX_PHOTOS - totalPhotos > 1 ? 's' : ''})
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
            </label>
          )}

          {photoError && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--error)', marginTop: '8px' }}>
              <AlertCircle size={13} /> {photoError}
            </p>
          )}
        </div>

        {/* Toggle affichage téléphone */}
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px 20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', margin: '0 0 4px' }}>
                Afficher mon numéro de téléphone
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Si désactivé, les étudiants ne pourront vous contacter que via la messagerie du site.
              </p>
            </div>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '48px',
              height: '28px',
              flexShrink: 0,
            }}>
              <input
                type="checkbox"
                checked={telephoneVisible}
                onChange={e => setTelephoneVisible(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute', inset: 0,
                background: telephoneVisible ? 'var(--green)' : 'var(--border)',
                borderRadius: '99px',
                transition: 'background 0.2s',
                cursor: 'pointer',
              }}>
                <span style={{
                  position: 'absolute',
                  top: '3px',
                  left: telephoneVisible ? '23px' : '3px',
                  width: '22px', height: '22px',
                  background: '#fff',
                  borderRadius: '50%',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </span>
            </label>
          </div>
        </div>

        {serverError && (
          <p style={{ fontSize: '13px', color: 'var(--error)', background: 'var(--error-light)', borderRadius: '8px', padding: '10px 14px' }}>
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || deletingId !== null}
          className="btn-primary btn-press"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (isSubmitting || deletingId !== null) ? 0.6 : 1, minHeight: '48px' }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  )
}
