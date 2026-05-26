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
import { motion } from 'framer-motion'

const MAX_PHOTOS = 3
const MAX_SIZE_MB = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const TYPE_ARTICLES = [
  { value: 'vetements',    label: '👗 Vêtements' },
  { value: 'livres',       label: '📚 Livres' },
  { value: 'mobilier',     label: '🪑 Mobilier' },
  { value: 'electronique', label: '💻 Électronique' },
  { value: 'divers',       label: '🎒 Divers' },
] as const

type TypeArticle = typeof TYPE_ARTICLES[number]['value']

interface PhotoPreview {
  file: File
  previewUrl: string
}

export default function PublierDonEtudiantPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [typeArticle, setTypeArticle] = useState<TypeArticle>('divers')

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
      if (profile?.role !== 'etudiant') { router.replace('/etudiant'); return }
      setAuthChecked(true)
    }
    checkRole()
  }, [router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AnnonceFormData>({
    resolver: zodResolver(annonceSchema),
    defaultValues: { categorie: 'don', prix: 0 },
  })

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
        categorie: 'don',
        titre: data.titre,
        description: data.description,
        ville: data.ville,
        prix: 0,
        surface: null,
        type_logement: null,
        caution: null,
        garantie: null,
        garantie_detail: null,
        telephone_visible: false,
      })
      .select('id')
      .single()

    if (error || !annonce) {
      setServerError(error?.message ?? "Erreur lors de la création du don")
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

    router.push('/etudiant/dons')
  }

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="animate-spin" color="#7C3AED" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>
      <BackButton href="/etudiant/dons" />
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>
        Que souhaitez-vous donner ?
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Aidez d&apos;autres étudiants en offrant ce dont vous n&apos;avez plus besoin.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Type d'article — pills */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
            Type d&apos;article
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {TYPE_ARTICLES.map(t => {
              const isActive = typeArticle === t.value
              return (
                <motion.button
                  key={t.value}
                  type="button"
                  onClick={() => setTypeArticle(t.value)}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  style={{
                    padding: '8px 14px', borderRadius: '99px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: isActive ? 600 : 400,
                    border: isActive ? '2px solid #7C3AED' : '1.5px solid var(--border)',
                    background: isActive ? '#F3F0FF' : 'var(--surface)',
                    color: isActive ? '#7C3AED' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Titre */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
            Titre <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input
            {...register('titre')}
            placeholder="Ex: Lot de vêtements homme taille M — Lyon"
            className="form-input"
          />
          {errors.titre && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.titre.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
            Description <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Ex: lot de vêtements taille M, livres de droit L2, bureau IKEA..."
            className="form-input"
            style={{ resize: 'none' }}
          />
          {errors.description && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.description.message}</p>}
        </div>

        {/* Ville */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Ville</label>
          <input {...register('ville')} placeholder="Lyon" className="form-input" />
          {errors.ville && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.ville.message}</p>}
        </div>

        {/* Photos */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
            Photos <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({photos.length}/{MAX_PHOTOS} max)</span>
          </label>

          {photos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {photos.map((photo, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={photo.previewUrl} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '2px dashed var(--border)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
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

        {serverError && (
          <p style={{ fontSize: '13px', color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '10px 14px' }}>{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: isSubmitting ? 0.6 : 1,
            background: '#7C3AED',
          }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Publication en cours...' : 'Proposer ce don'}
        </button>
      </form>
    </div>
  )
}
