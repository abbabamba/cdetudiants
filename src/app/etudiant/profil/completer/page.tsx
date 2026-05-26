'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadAvatarPhoto } from '@/lib/supabase/storage'
import { Loader2, User, ImagePlus } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { BadgeVerifie } from '@/components/etudiant/BadgeVerifie'
import Link from 'next/link'

interface ProfilData {
  userId: string
  ville: string | null
  prenom: string | null
  photo_url: string | null
  statut_verification: string
  certificat_url: string | null
}

export default function CompleterProfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [profil, setProfil] = useState<ProfilData | null>(null)

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
        .select('role, ville, prenom')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'etudiant') {
        router.push('/etudiant/profil')
        return
      }

      const { data: pe } = await supabase
        .from('profils_etudiants')
        .select('photo_url, statut_verification, certificat_url')
        .eq('user_id', user.id)
        .single()

      if (!pe) { router.push('/etudiant/profil'); return }

      setProfil({
        userId: user.id,
        ville: profile.ville,
        prenom: profile.prenom,
        photo_url: pe.photo_url,
        statut_verification: pe.statut_verification,
        certificat_url: pe.certificat_url,
      })

      setPrenom(profile.prenom ?? '')
      setVille(profile.ville ?? '')
      if (pe.photo_url) setAvatarPreview(pe.photo_url)
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
    }

    const { error: peError } = await supabase
      .from('profils_etudiants')
      .update({ photo_url })
      .eq('user_id', profil.userId)

    if (peError) {
      setError(peError.message)
      setSaving(false)
      return
    }

    if (ville.trim()) {
      await supabase
        .from('profiles')
        .update({ ville: ville.trim() })
        .eq('id', profil.userId)
    }

    if (prenom.trim() && prenom.trim() !== profil.prenom) {
      await supabase
        .from('profiles')
        .update({ prenom: prenom.trim() })
        .eq('id', profil.userId)
    }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => router.push('/etudiant/profil'), 1500)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="animate-spin" color="var(--blue)" />
      </div>
    )
  }

  if (!profil) return null

  const showCertificatUpload =
    profil.statut_verification === 'en_attente_admin' && !profil.certificat_url

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>
      <BackButton href="/etudiant/profil" />
      <div style={{ marginBottom: '24px' }}>
        <Link href="/etudiant/profil" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Mon profil
        </Link>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-playfair), serif',
        fontSize: '24px', fontWeight: 700, color: 'var(--navy)', marginBottom: '6px',
      }}>
        Mon profil
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Ces informations sont optionnelles et vous appartiennent. Seul votre badge vérifié
        est visible par les bailleurs.
      </p>

      {/* Statut de vérification */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '12px' }}>
          Statut de vérification
        </p>
        <BadgeVerifie statut={profil.statut_verification} size="md" />
        {profil.statut_verification === 'en_attente_admin' && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Votre certificat est en cours d&apos;examen par notre équipe.
          </p>
        )}
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
            Informations optionnelles
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Visibles uniquement par vous dans votre profil.
          </p>
        </div>

        {/* Avatar */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>
            Photo de profil
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={24} color="var(--text-muted)" />
              }
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--blue)', border: '1px solid var(--blue-light)', borderRadius: '8px', padding: '12px 16px', minHeight: '44px' }}>
              <ImagePlus size={16} />
              {avatarPreview ? 'Changer la photo' : 'Ajouter une photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </label>
          </div>
        </div>

        {/* Prénom affiché */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
            Prénom affiché <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optionnel)</span>
          </label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Votre prénom"
            className="form-input"
          />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Visible par le bailleur si vous le souhaitez
          </p>
        </div>

        {/* Ville */}
        {!profil.ville && (
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px' }}>
              Ville <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Ex : Lyon"
              className="form-input"
            />
          </div>
        )}

        {showCertificatUpload && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '14px 16px', fontSize: '13px', color: '#92400E' }}>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>Certificat de scolarité</p>
            <p style={{ color: '#78350F' }}>Rendez-vous sur la page d&apos;inscription pour soumettre votre certificat.</p>
          </div>
        )}

        {error && (
          <p style={{ fontSize: '13px', color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '10px 14px' }}>{error}</p>
        )}
        {success && (
          <p style={{ fontSize: '13px', color: 'var(--green)', background: 'var(--green-light)', borderRadius: '8px', padding: '10px 14px' }}>Profil mis à jour ! Redirection...</p>
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
