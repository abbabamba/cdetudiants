'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { annonceSchema, AnnonceFormData } from '@/lib/validations/annonce'
import { createClient } from '@/lib/supabase/client'
import { uploadAnnoncePhoto } from '@/lib/supabase/storage'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { ImagePlus, X, AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { BackButton } from '@/components/ui/BackButton'

const MAX_PHOTOS = 5
const MAX_SIZE_MB = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface PhotoPreview {
  file: File
  previewUrl: string
}

const categoriesParticulier = [
  { value: 'emploi',     label: '💼 Offre d\'emploi', desc: 'CDI, CDD, temps partiel' },
  { value: 'stage',      label: '🎓 Stage',           desc: 'Stage de 2 à 6 mois' },
  { value: 'alternance', label: '🔄 Alternance',      desc: 'Contrat d\'apprentissage' },
  { value: 'service',    label: '🛠 Service',          desc: 'Cours, transport, aide...' },
  { value: 'don',        label: '🎁 Don matériel',    desc: 'Vêtements, livres, meubles...' },
] as const

type CategorieParticulier = typeof categoriesParticulier[number]['value']

export default function PublierParticulierPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [selectedCategorie, setSelectedCategorie] = useState<CategorieParticulier>('emploi')

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
      if (profile?.role !== 'particulier') { router.replace('/particulier'); return }
      setAuthChecked(true)
    }
    checkRole()
  }, [router])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AnnonceFormData>({
    resolver: zodResolver(annonceSchema),
    defaultValues: { categorie: 'emploi', prix: 0 },
  })

  function handleSelectCategorie(val: CategorieParticulier) {
    setSelectedCategorie(val)
    setValue('categorie', val)
    if (val === 'don') {
      setValue('prix', 0)
    }
  }

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

    const champsLogement = ['logement', 'studio', 'colocation', 'chambre'].includes(selectedCategorie)

    const { data: annonce, error } = await supabase
      .from('annonces')
      .insert({
        bailleur_id: user.id,
        statut: 'active',
        categorie: selectedCategorie,
        titre: data.titre,
        description: data.description,
        ville: data.ville,
        prix: selectedCategorie === 'don' ? 0 : (data.prix ?? 0),
        surface: champsLogement ? data.surface : null,
        type_logement: champsLogement ? data.type_logement : null,
        caution: champsLogement ? data.caution : null,
        garantie: champsLogement ? data.garantie : null,
        garantie_detail: champsLogement ? data.garantie_detail : null,
        telephone_visible: false,
      })
      .select('id')
      .single()

    if (error || !annonce) {
      setServerError(error?.message ?? "Erreur lors de la création de l'offre")
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

    router.push('/particulier?published=1')
  }

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="animate-spin" color="#7C3AED" />
      </div>
    )
  }

  const isDon = selectedCategorie === 'don'

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
      <BackButton href="/particulier" />
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>
        {isDon ? 'Article(s) à donner' : 'Publier une offre'}
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Visible par des milliers d&apos;étudiants vérifiés.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Sélection catégorie — grille de cards */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
            Catégorie <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
            {categoriesParticulier.map(cat => {
              const isSelected = selectedCategorie === cat.value
              return (
                <motion.button
                  key={cat.value}
                  type="button"
                  onClick={() => handleSelectCategorie(cat.value)}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  style={{
                    padding: '12px 10px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #7C3AED' : '1.5px solid var(--border)',
                    background: isSelected ? '#F3F0FF' : 'var(--surface)',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    boxShadow: isSelected ? '0 2px 8px rgba(124,58,237,0.18)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#7C3AED' : 'var(--text)', marginBottom: '2px' }}>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {cat.desc}
                  </div>
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
            placeholder={isDon
              ? 'Ex: Lot de vêtements homme taille M — Lyon'
              : 'Ex: Recherche stagiaire développeur web — Paris'}
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
            rows={5}
            placeholder={isDon
              ? 'Ex: lot de vêtements taille M, livres de droit L2, bureau IKEA...'
              : 'Décrivez votre offre en détail...'}
            className="form-input"
            style={{ resize: 'none' }}
          />
          {errors.description && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.description.message}</p>}
        </div>

        {/* Ville + Prix */}
        <div style={{ display: 'grid', gridTemplateColumns: isDon ? '1fr' : '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>Ville</label>
            <input {...register('ville')} placeholder="Lyon" className="form-input" />
            {errors.ville && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.ville.message}</p>}
          </div>
          {!isDon && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
                Rémunération (€) <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— 0 = non précisé</span>
              </label>
              <input type="number" step="1" min="0" {...register('prix', { setValueAs: v => v === '' ? undefined : parseFloat(v) })} className="form-input" />
              {errors.prix && <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>{errors.prix.message}</p>}
            </div>
          )}
        </div>

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
          {isSubmitting ? 'Publication en cours...' : "Publier l'offre"}
        </button>
      </form>
    </div>
  )
}
