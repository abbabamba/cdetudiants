'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadAvatarPhoto } from '@/lib/supabase/storage'
import { Loader2, User, ImagePlus } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'

interface ProfilData {
  userId: string
  nom: string
  prenom: string
  ville: string | null
  photo_url: string | null
}

export default function ModifierProfilBailleurPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [profil, setProfil] = useState<ProfilData | null>(null)

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [ville, setVille] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, nom, prenom, ville, photo_url')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'bailleur') {
        router.push('/bailleur/profil')
        return
      }

      setProfil({ userId: user.id, nom: profile.nom, prenom: profile.prenom, ville: profile.ville, photo_url: profile.photo_url })
      setNom(profile.nom ?? '')
      setPrenom(profile.prenom ?? '')
      setVille(profile.ville ?? '')
      if (profile.photo_url) setAvatarPreview(profile.photo_url)
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Format accepté : JPG, PNG, WebP')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La photo ne doit pas dépasser 5 Mo')
      return
    }
    setError(null)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profil) return
    setSaving(true)
    setError(null)

    const supabase = createClient()

    let photo_url = profil.photo_url
    if (avatarFile) {
      const url = await uploadAvatarPhoto(profil.userId, avatarFile)
      if (url) photo_url = url
      else {
        setError("Échec de l'upload de la photo. Réessayez.")
        setSaving(false)
        return
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nom: nom.trim() || profil.nom,
        prenom: prenom.trim() || profil.prenom,
        ville: ville.trim() || null,
        photo_url,
      })
      .eq('id', profil.userId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => router.push('/bailleur/profil'), 1500)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="animate-spin" color="var(--blue)" />
      </div>
    )
  }

  if (!profil) return null

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>
      <BackButton href="/bailleur/profil" />

      <h1 style={{
        fontFamily: 'var(--font-playfair), serif',
        fontSize: '24px', fontWeight: 700, color: 'var(--navy)', marginBottom: '6px',
      }}>
        Modifier mon profil
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Ces informations sont visibles par les étudiants qui consultent vos annonces.
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Photo de profil */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
            Photo de profil
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: avatarPreview ? 'transparent' : 'var(--bg)',
              overflow: 'hidden', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
              border: '1px solid var(--border)',
            }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={24} color="var(--text-muted)" />
              }
            </div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              fontSize: '13px', color: 'var(--blue)',
              border: '1px solid var(--blue-light)', borderRadius: '8px',
              padding: '12px 16px', minHeight: '44px',
            }}>
              <ImagePlus size={16} />
              {avatarPreview ? 'Changer la photo' : 'Ajouter une photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </label>
          </div>
        </div>

        {/* Prénom */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
            Prénom
          </label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Votre prénom"
            className="form-input"
          />
        </div>

        {/* Nom */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
            Nom
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Votre nom"
            className="form-input"
          />
        </div>

        {/* Ville */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
            Ville <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optionnel)</span>
          </label>
          <input
            type="text"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Ex : Dakar"
            className="form-input"
          />
        </div>

        {error && (
          <p style={{ fontSize: '13px', color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '10px 14px' }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ fontSize: '13px', color: 'var(--green)', background: 'var(--green-light)', borderRadius: '8px', padding: '10px 14px' }}>
            Profil mis à jour ! Redirection...
          </p>
        )}

        <button
          type="submit"
          disabled={saving || success}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: saving || success ? 0.6 : 1 }}
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}
