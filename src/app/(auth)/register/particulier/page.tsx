'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerParticulierSchema, RegisterParticulierFormData } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { AuthLeftPanel, AnimatedInput, SubmitButton, ServerError } from '@/components/auth/AuthLayout'

export default function RegisterParticulierPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const prefersReduced = useReducedMotion()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterParticulierFormData>({ resolver: zodResolver(registerParticulierSchema) })

  async function onSubmit(data: RegisterParticulierFormData) {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'particulier',
          nom: data.nom,
          prenom: data.prenom,
          ville: data.ville,
        },
      },
    })

    if (error) { setServerError(error.message); return }

    router.push('/register/confirmation?email=' + encodeURIComponent(data.email))
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      <AuthLeftPanel
        color="purple"
        title="Connectez-vous aux étudiants"
        bullets={[
          "Publication d'offres gratuite",
          'Dons de vêtements et matériel',
          "Visibilité auprès de milliers d'étudiants",
          'Messagerie intégrée sécurisée',
        ]}
        quote="J'ai trouvé un stagiaire sérieux en 48h grâce à la plateforme."
        quoteAuthor="Karim, gérant d'une PME à Lyon"
      />

      {/* Colonne droite — formulaire */}
      <div style={{
        flex: 1,
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          {/* Logo visible mobile uniquement */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }} className="md:hidden">
            <Link href="/">
              <img src="/images/logo.jpeg" alt="Coin des Étudiants" style={{ height: '44px', objectFit: 'contain' }} />
            </Link>
          </div>

          {/* Lien retour */}
          <div style={{ marginBottom: '16px' }}>
            <Link href="/register" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', minHeight: '44px' }}>
              ← Retour
            </Link>
          </div>

          <motion.div
            className="card auth-card-shadow"
            initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.96, y: prefersReduced ? 0 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: '26px', color: 'var(--navy)', marginBottom: '6px',
            }}>
              Créer mon compte particulier
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Proposez emplois, stages et dons aux étudiants.
            </p>

            {/* Info box */}
            <div style={{
              background: '#F3F0FF',
              borderLeft: '3px solid #7C3AED',
              borderRadius: '0 8px 8px 0',
              padding: '10px 14px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#7C3AED',
              display: 'flex', gap: '8px', alignItems: 'flex-start',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Gratuit, sans engagement. Publiez vos offres et dons en quelques minutes.
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Nom + Prénom */}
              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <AnimatedInput label="Nom" error={errors.nom?.message} delay={0.05}>
                  <input
                    {...register('nom')}
                    placeholder="Dupont"
                    className="form-input"
                    style={{ minHeight: '48px' }}
                  />
                </AnimatedInput>
                <AnimatedInput label="Prénom" error={errors.prenom?.message} delay={0.05}>
                  <input
                    {...register('prenom')}
                    placeholder="Jean"
                    className="form-input"
                    style={{ minHeight: '48px' }}
                  />
                </AnimatedInput>
              </div>

              <AnimatedInput label="Ville" error={errors.ville?.message} delay={0.1}>
                <input
                  {...register('ville')}
                  placeholder="Paris"
                  className="form-input"
                  style={{ minHeight: '48px' }}
                />
              </AnimatedInput>

              <AnimatedInput label="Email" error={errors.email?.message} delay={0.15}>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="vous@exemple.fr"
                  className="form-input"
                  style={{ minHeight: '48px' }}
                  autoComplete="email"
                />
              </AnimatedInput>

              <AnimatedInput label="Mot de passe" error={errors.password?.message} delay={0.18}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="8 caractères minimum"
                    className="form-input"
                    style={{ minHeight: '48px', paddingRight: '44px' }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                      padding: '4px', minHeight: '44px', minWidth: '44px', justifyContent: 'center',
                    }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </AnimatedInput>

              <ServerError message={serverError} />

              <SubmitButton
                isSubmitting={isSubmitting}
                label={<><span>Créer mon compte</span><ArrowRight size={16} /></>}
                loadingLabel="Création..."
                color="purple"
              />
            </form>

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '20px' }}>
              Déjà un compte ?{' '}
              <Link href="/login" style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>
                Se connecter
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
