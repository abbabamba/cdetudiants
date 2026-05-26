'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormData } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, Suspense } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { AuthLeftPanel, AnimatedInput, SubmitButton, ServerError } from '@/components/auth/AuthLayout'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const prefersReduced = useReducedMotion()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError('Email ou mot de passe incorrect.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = user
      ? await supabase.from('profiles').select('role').eq('id', user.id).single()
      : { data: null }

    if (redirectTo) {
      const safeRedirect = redirectTo.startsWith('/')
        ? redirectTo
        : (profile?.role === 'bailleur' ? '/bailleur' : '/etudiant')
      router.push(safeRedirect)
      router.refresh()
      return
    }

    router.push(profile?.role === 'bailleur' ? '/bailleur' : '/etudiant')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      <AuthLeftPanel
        color="blue"
        title="Trouvez, publiez, échangez en toute confiance"
        bullets={[
          'Logements et colocations vérifiés',
          'Emplois, stages et alternances',
          'Services et dons — 100 % gratuit',
        ]}
        quote="J'ai trouvé mon studio et décroché un stage grâce à la plateforme !"
        quoteAuthor="Amara, étudiante en Master à Paris"
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
              Bon retour 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>
              Pas encore de compte ?{' '}
              <Link href="/register" style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>
                S&apos;inscrire
              </Link>
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
            >
              <AnimatedInput label="Email" error={errors.email?.message} delay={0.1}>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="vous@exemple.fr"
                  className="form-input"
                  style={{ minHeight: '48px' }}
                  autoComplete="email"
                />
              </AnimatedInput>

              <AnimatedInput label="Mot de passe" error={errors.password?.message} delay={0.15}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className="form-input"
                    style={{ minHeight: '48px', paddingRight: '44px' }}
                    autoComplete="current-password"
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
                label={<><span>Se connecter</span><ArrowRight size={16} /></>}
                loadingLabel="Connexion..."
                color="blue"
              />
            </form>

            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <Link href="/login/forgot" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                Mot de passe oublié ?
              </Link>
            </p>
          </motion.div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              ← Retour à l&apos;accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
