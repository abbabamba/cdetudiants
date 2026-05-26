'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pause, Play } from 'lucide-react'
import { Btn } from '@/components/ui/Btn'

export function ToggleStatutButton({
  annonceId,
  statut,
}: {
  annonceId: string
  statut: 'active' | 'suspendue'
}) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const supabase = createClient()
    const newStatut = statut === 'active' ? 'suspendue' : 'active'
    await supabase.from('annonces').update({ statut: newStatut }).eq('id', annonceId)
    setLoading(false)
    window.location.reload()
  }

  if (statut === 'active') {
    return (
      <Btn
        variant="warning"
        size="sm"
        loading={loading}
        icon={<Pause size={13} />}
        onClick={handleToggle}
      >
        Suspendre
      </Btn>
    )
  }

  return (
    <Btn
      variant="success"
      size="sm"
      loading={loading}
      icon={<Play size={13} />}
      onClick={handleToggle}
    >
      Réactiver
    </Btn>
  )
}
