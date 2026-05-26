'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { annonceSchema, AnnonceFormData } from '@/lib/validations/annonce'
import { createClient } from '@/lib/supabase/client'
import { uploadAnnoncePhoto } from '@/lib/supabase/storage'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { ImagePlus, X, AlertCircle, Loader2 } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'

const MAX_PHOTOS = 5
const MAX_SIZE_MB = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface PhotoPreview {
  file: File
  previewUrl: string
}

export default function PublierAnnoncePage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'bailleur') { router.replace('/bailleur'); return }
      setAuthChecked(true)
    }
    checkRole()
  }, [router])

  const [telephoneVisible, setTelephoneVisible] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AnnonceFormData>({
    resolver: zodResolver(annonceSchema),
    defaultValues: { categorie: 'logement' },
  })

  const garantieValue = watch('garantie')

  const handlePhotoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPhotoError(null)
      const files = Array.from(e.target.files ?? [])
      const remaining = MAX_PHOTOS - photos.length

      if (files.length > remaining) {
        setPhotoError(`Maximum ${MAX_PHOTOS} photos. Vous pouvez encore en ajouter ${remaining}.`)
        return
      }

      const invalid = files.find(
        (f) => !ACCEPTED_TYPES.includes(f.type) || f.size > MAX_SIZE_MB * 1024 * 1024
      )
      if (invalid) {
        setPhotoError('Formats acceptés : JPG, PNG, WebP. Taille max : 5 Mo par photo.')
        return
      }

      const newPreviews = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      setPhotos((prev) => [...prev, ...newPreviews])
      e.target.value = ''
    },
    [photos.length]
  )

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  async function onSubmit(data: AnnonceFormData) {
    setServerError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setServerError('Non connecté'); return }

    const { data: annonce, error } = await supabase
      .from('annonces')
      .insert({
        bailleur_id: user.id,
        statut: 'active',
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
      .select('id')
      .single()

    if (error || !annonce) {
      setServerError(error?.message ?? "Erreur lors de la création de l'annonce")
      return
    }

    if (photos.length > 0) {
      const uploads = await Promise.all(
        photos.map(({ file }) => uploadAnnoncePhoto(annonce.id, file))
      )
      const photoRows = uploads
        .map((url, ordre) => (url ? { annonce_id: annonce.id, url, ordre } : null))
        .filter(Boolean) as { annonce_id: string; url: string; ordre: number }[]
      if (photoRows.length > 0) {
        await supabase.from('photos_annonces').insert(photoRows)
      }
    }

    router.push('/bailleur?published=1')
  }

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="animate-spin" color="var(--blue)" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
      <BackButton href="/bailleur" />
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--navy)', marginBottom: '32px' }}>Publier une annonce</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Catégorie */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Catégorie</label>
          <select {...register('categorie')} className="form-input">
            <option value="logement">Logement</option>
            <option value="emploi">Emploi</option>
            <option value="stage">Stage</option>
            <option value="alternance">Alternance</option>
            <option value="service">Service</option>
          </select>
          {errors.categorie && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.categorie.message}</p>}
        </div>

        {/* Titre */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Titre de l&apos;annonce</label>
          <input {...register('titre')} placeholder="Studio meublé proche métro, Paris 13e" className="form-input" />
          {errors.titre && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.titre.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Description</label>
          <textarea {...register('description')} rows={5} placeholder="Décrivez le logement en détail..." className="form-input" style={{ resize: 'none' }} />
          {errors.description && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.description.message}</p>}
        </div>

        {/* Ville + Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Ville</label>
            <input {...register('ville')} className="form-input" />
            {errors.ville && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.ville.message}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Type de logement</label>
            <select {...register('type_logement')} className="form-input">
              <option value="">Choisir...</option>
              <option value="studio">Studio</option>
              <option value="colocation">Colocation</option>
              <option value="chambre">Chambre</option>
            </select>
            {errors.type_logement && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.type_logement.message}</p>}
          </div>
        </div>

        {/* Prix + Surface */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Loyer (€/mois)</label>
            <input type="number" step="any" min="0" {...register('prix', { setValueAs: v => v === '' ? undefined : parseFloat(v) })} className="form-input" />
            {errors.prix && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.prix.message}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Surface (m²)</label>
            <input type="number" step="0.5" min="0" {...register('surface', { setValueAs: v => v === '' ? undefined : parseFloat(v) })} className="form-input" />
            {errors.surface && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.surface.message}</p>}
          </div>
        </div>

        {/* Caution + Garantie */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Caution (€)</label>
            <input type="number" step="any" min="0" {...register('caution', { setValueAs: v => v === '' ? undefined : parseFloat(v) })} className="form-input" />
            {errors.caution && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.caution.message}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Type de garantie</label>
            <select {...register('garantie')} className="form-input">
              <option value="">Choisir...</option>
              <option value="visale">Visale</option>
              <option value="garant">Garant</option>
              <option value="autre">Autre</option>
            </select>
            {errors.garantie && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.garantie.message}</p>}
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

        {/* Photos */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
            Photos <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({photos.length}/{MAX_PHOTOS} — JPG, PNG, WebP, max 5 Mo)</span>
          </label>

          {photos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {photos.map((photo, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={photo.previewUrl} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {i === 0 && (
                    <span style={{ position: 'absolute', bottom: '4px', left: '4px', fontSize: '10px', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                      principale
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < MAX_PHOTOS && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', border: '2px dashed var(--border)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <ImagePlus size={18} />
              Ajouter des photos
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handlePhotoChange} />
            </label>
          )}

          {photoError && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#DC2626', marginTop: '8px' }}>
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
          <p style={{ fontSize: '13px', color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '10px 14px' }}>{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Publication en cours..." : "Publier l'annonce"}
        </button>
      </form>
    </div>
  )
}
