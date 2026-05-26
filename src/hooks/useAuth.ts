'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Profile, ProfilEtudiant } from '@/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  profilEtudiant: ProfilEtudiant | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    profilEtudiant: null,
    loading: true,
  })

  useEffect(() => {
    const supabase = createClient()

    async function fetchProfile(userId: string) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      let profilEtudiant = null
      if (profile?.role === 'etudiant') {
        const { data } = await supabase
          .from('profils_etudiants')
          .select('*')
          .eq('user_id', userId)
          .single()
        profilEtudiant = data
      }

      return { profile, profilEtudiant }
    }

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { profile, profilEtudiant } = await fetchProfile(user.id)
        setState({ user, profile, profilEtudiant, loading: false })
      } else {
        setState({ user: null, profile: null, profilEtudiant: null, loading: false })
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { profile, profilEtudiant } = await fetchProfile(session.user.id)
        setState({ user: session.user, profile, profilEtudiant, loading: false })
      } else {
        setState({ user: null, profile: null, profilEtudiant: null, loading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}
