'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  registerEtudiantEmailSchema,
  registerEtudiantCertificatSchema,
  RegisterEtudiantEmailFormData,
  RegisterEtudiantCertificatFormData,
} from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Mail, FileText, ArrowRight, Eye, EyeOff, Upload, X } from 'lucide-react'
import { AnimatedInput, SubmitButton, ServerError } from '@/components/auth/AuthLayout'

type VerifMode = 'email' | 'certificat'

const steps = [
  { n: 1, label: 'Vérification' },
  { n: 2, label: 'Infos' },
  { n: 3, label: 'Confirmation' },
]

export default function RegisterEtudiantPage() {
  const [mode, setMode] = useState<VerifMode>('email')
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPasswordEmail, setShowPasswordEmail] = useState(false)
  const [showPasswordCert, setShowPasswordCert] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const router = useRouter()
  const prefersReduced = useReducedMotion()

  const emailForm = useForm<RegisterEtudiantEmailFormData>({
    resolver: zodResolver(registerEtudiantEmailSchema),
  })
  const certForm = useForm<RegisterEtudiantCertificatFormData>({
    resolver: zodResolver(registerEtudiantCertificatSchema),
  })

  async function onSubmitEmail(data: RegisterEtudiantEmailFormData) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email_universitaire,
      password: data.password,
      options: {
        data: {
          role: 'etudiant',
          nom: data.nom,
          prenom: data.prenom,
          ville: data.ville,
          statut_verification: 'verifie_email',
        },
      },
    })
    if (error) { setServerError(error.message); return }
    router.push('/register/confirmation?email=' + encodeURIComponent(data.email_universitaire))
  }

  async function onSubmitCertificat(data: RegisterEtudiantCertificatFormData) {
    setServerError(null)
    const supabase = createClient()

    // 1. Créer le compte
    const { data: auth, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'etudiant',
          nom: data.nom,
          prenom: data.prenom,
          ville: data.ville,
          statut_verification: 'en_attente_admin',
        },
      },
    })
    if (error) { setServerError(error.message); return }
    if (!auth.user) {
      setServerError('Erreur lors de la création du compte')
      return
    }

    // 2. Upload via API route serveur (pas besoin de session)
    let certUrl: string | null = null

    const formData = new FormData()
    formData.append('file', data.certificat)
    formData.append('userId', auth.user.id)

    try {
      const res = await fetch('/api/upload-certificat', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      if (res.ok && result.success) {
        certUrl = result.url
      } else {
        console.error('Upload failed:', result.error)
      }
    } catch (err) {
      console.error('Upload request failed:', err)
    }

    // 3. Rediriger
    router.push(
      '/register/confirmation?email=' +
      encodeURIComponent(data.email) +
      (!certUrl ? '&upload=failed' : '')
    )
  }

  function handleFileChange(file: File | null) {
    if (!file) return
    setSelectedFile(file)
    certForm.setValue('certificat', file)
  }

  const isEmailSubmitting = emailForm.formState.isSubmitting
  const isCertSubmitting = certForm.formState.isSubmitting

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '32px 16px 48px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Logo + retour */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '28px',
        }}>
          <Link href="/">
            <img src="/images/logo.jpeg" alt="Coin des Étudiants" style={{ height: '44px', objectFit: 'contain' }} />
          </Link>
          <Link href="/register" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
            ← Retour
          </Link>
        </div>

        {/* Titre */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '26px', color: 'var(--navy)', marginBottom: '6px' }}>
            Créer mon compte étudiant
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Choisissez votre mode de vérification
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px', gap: 0 }}>
          {steps.map((step, i) => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700,
                  background: step.n === 1 ? 'var(--blue)' : 'var(--border)',
                  color: step.n === 1 ? '#fff' : 'var(--text-muted)',
                  border: step.n === 1 ? 'none' : '1.5px solid var(--border)',
                }}>
                  {step.n}
                </div>
                <span style={{
                  fontSize: '10px', color: step.n === 1 ? 'var(--blue)' : 'var(--text-muted)',
                  fontWeight: step.n === 1 ? 600 : 400, whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: '1px', background: 'var(--border)', margin: '0 6px', marginBottom: '16px' }} />
              )}
            </div>
          ))}
        </div>

        <div className="card auth-card-shadow">
          {/* Toggle mode avec indicateur glissant */}
          <div style={{
            position: 'relative',
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg)', border: '1.5px solid var(--border)',
            borderRadius: '12px', padding: '4px',
            marginBottom: '20px',
          }}>
            {/* Indicateur animé */}
            <motion.div
              style={{
                position: 'absolute',
                top: 4, bottom: 4, left: 4,
                width: 'calc(50% - 4px)',
                background: 'var(--surface)',
                borderRadius: '9px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
              animate={{ x: mode === 'email' ? '0%' : '100%' }}
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />

            {([
              { key: 'email' as const, icon: <Mail size={16} />, label: 'Email universitaire' },
              { key: 'certificat' as const, icon: <FileText size={16} />, label: 'Certificat de scolarité' },
            ]).map(({ key, icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setMode(key); setServerError(null) }}
                style={{
                  position: 'relative', zIndex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  padding: '10px 8px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: mode === key ? 600 : 400,
                  fontFamily: 'var(--font-inter), sans-serif',
                  background: 'transparent',
                  color: mode === key ? 'var(--blue)' : 'var(--text-muted)',
                  transition: 'color 0.2s ease',
                  minHeight: '44px',
                }}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Info box contextuelle */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: prefersReduced ? 0 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
              transition={{ duration: prefersReduced ? 0 : 0.25 }}
              style={{
                background: mode === 'email' ? 'var(--blue-light)' : 'var(--warning-light)',
                borderLeft: `3px solid ${mode === 'email' ? 'var(--blue)' : '#D97706'}`,
                borderRadius: '0 8px 8px 0',
                padding: '10px 14px',
                marginBottom: '20px',
                fontSize: '13px',
                color: mode === 'email' ? 'var(--blue)' : 'var(--warning)',
                display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              {mode === 'email'
                ? 'Un lien de confirmation sera envoyé à votre adresse universitaire'
                : 'Votre certificat sera examiné sous 48h par notre équipe'}
            </motion.div>
          </AnimatePresence>

          {/* Formulaires avec transition */}
          <AnimatePresence mode="wait" initial={false}>
            {mode === 'email' ? (
              <motion.form
                key="email-form"
                onSubmit={emailForm.handleSubmit(onSubmitEmail)}
                initial={{ opacity: 0, x: prefersReduced ? 0 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: prefersReduced ? 0 : -20 }}
                transition={{ duration: prefersReduced ? 0 : 0.3, ease: 'easeInOut' }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                {/* Nom + Prénom en grid */}
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <AnimatedInput label="Nom" error={emailForm.formState.errors.nom?.message}>
                    <input
                      {...emailForm.register('nom')}
                      placeholder="Ndiang"
                      className="form-input"
                      style={{ minHeight: '48px' }}
                    />
                  </AnimatedInput>
                  <AnimatedInput label="Prénom" error={emailForm.formState.errors.prenom?.message}>
                    <input
                      {...emailForm.register('prenom')}
                      placeholder="Marie"
                      className="form-input"
                      style={{ minHeight: '48px' }}
                    />
                  </AnimatedInput>
                </div>

                <AnimatedInput label="Ville" error={emailForm.formState.errors.ville?.message}>
                  <input
                    {...emailForm.register('ville')}
                    placeholder="Paris"
                    className="form-input"
                    style={{ minHeight: '48px' }}
                  />
                </AnimatedInput>

                <AnimatedInput label="Email universitaire" error={emailForm.formState.errors.email_universitaire?.message}>
                  <input
                    type="email"
                    {...emailForm.register('email_universitaire')}
                    placeholder="prenom.nom@univ-exemple.fr"
                    className="form-input"
                    style={{ minHeight: '48px' }}
                  />
                </AnimatedInput>

                <AnimatedInput label="Mot de passe" error={emailForm.formState.errors.password?.message}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswordEmail ? 'text' : 'password'}
                      {...emailForm.register('password')}
                      placeholder="8 caractères minimum"
                      className="form-input"
                      style={{ minHeight: '48px', paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordEmail(v => !v)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                        padding: '4px', minHeight: '44px', minWidth: '44px', justifyContent: 'center',
                      }}
                      tabIndex={-1}
                      aria-label={showPasswordEmail ? 'Masquer' : 'Afficher'}
                    >
                      {showPasswordEmail ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </AnimatedInput>

                <ServerError message={serverError} />

                <SubmitButton
                  isSubmitting={isEmailSubmitting}
                  label={<><span>Créer mon compte</span><ArrowRight size={16} /></>}
                  loadingLabel="Création..."
                  color="blue"
                />
              </motion.form>
            ) : (
              <motion.form
                key="cert-form"
                onSubmit={certForm.handleSubmit(onSubmitCertificat)}
                initial={{ opacity: 0, x: prefersReduced ? 0 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: prefersReduced ? 0 : 20 }}
                transition={{ duration: prefersReduced ? 0 : 0.3, ease: 'easeInOut' }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                {/* Nom + Prénom en grid */}
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <AnimatedInput label="Nom" error={certForm.formState.errors.nom?.message}>
                    <input
                      {...certForm.register('nom')}
                      placeholder="michel"
                      className="form-input"
                      style={{ minHeight: '48px' }}
                    />
                  </AnimatedInput>
                  <AnimatedInput label="Prénom" error={certForm.formState.errors.prenom?.message}>
                    <input
                      {...certForm.register('prenom')}
                      placeholder="Marie"
                      className="form-input"
                      style={{ minHeight: '48px' }}
                    />
                  </AnimatedInput>
                </div>

                <AnimatedInput label="Ville" error={certForm.formState.errors.ville?.message}>
                  <input
                    {...certForm.register('ville')}
                    placeholder="Paris"
                    className="form-input"
                    style={{ minHeight: '48px' }}
                  />
                </AnimatedInput>

                <AnimatedInput label="Email" error={certForm.formState.errors.email?.message}>
                  <input
                    type="email"
                    {...certForm.register('email')}
                    placeholder="votre@email.fr"
                    className="form-input"
                    style={{ minHeight: '48px' }}
                  />
                </AnimatedInput>

                <AnimatedInput label="Mot de passe" error={certForm.formState.errors.password?.message}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswordCert ? 'text' : 'password'}
                      {...certForm.register('password')}
                      placeholder="8 caractères minimum"
                      className="form-input"
                      style={{ minHeight: '48px', paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordCert(v => !v)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                        padding: '4px', minHeight: '44px', minWidth: '44px', justifyContent: 'center',
                      }}
                      tabIndex={-1}
                      aria-label={showPasswordCert ? 'Masquer' : 'Afficher'}
                    >
                      {showPasswordCert ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </AnimatedInput>

                {/* Zone upload */}
                <div>
                  <label className="form-label">Certificat de scolarité</label>
                  {selectedFile ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: 'var(--green-light)', border: '1.5px solid var(--green)',
                      borderRadius: '12px', padding: '14px 16px',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{ flex: 1, fontSize: '13px', color: 'var(--green)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setSelectedFile(null); certForm.setValue('certificat', undefined as unknown as File) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', display: 'flex', padding: '2px', minHeight: '44px', minWidth: '44px', alignItems: 'center', justifyContent: 'center' }}
                        aria-label="Supprimer le fichier"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label
                      className={`upload-zone${dragOver ? ' drag-over' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setDragOver(false)
                        const file = e.dataTransfer.files[0]
                        if (file) handleFileChange(file)
                      }}
                      style={{ display: 'block', cursor: 'pointer' }}
                    >
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                      />
                      <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px', display: 'block' }} />
                      <p style={{ fontSize: '14px', color: 'var(--navy)', fontWeight: 500, marginBottom: '4px' }}>
                        Glissez votre fichier ou cliquez pour parcourir
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        PDF, JPG, PNG, WebP — max 5 Mo
                      </p>
                    </label>
                  )}
                  {certForm.formState.errors.certificat && (
                    <p className="form-error">{certForm.formState.errors.certificat.message as string}</p>
                  )}
                </div>

                <ServerError message={serverError} />

                <SubmitButton
                  isSubmitting={isCertSubmitting}
                  label={<><span>Créer mon compte</span><ArrowRight size={16} /></>}
                  loadingLabel="Création..."
                  color="blue"
                />
              </motion.form>
            )}
          </AnimatePresence>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '20px' }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
