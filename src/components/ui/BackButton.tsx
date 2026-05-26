'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Btn } from '@/components/ui/Btn'

export function BackButton({ href, label = 'Retour' }: { href: string; label?: string }) {
  const router = useRouter()
  function handleBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(href)
    }
  }
  return (
    <Btn
      variant="ghost"
      size="sm"
      onClick={handleBack}
      icon={<ArrowLeft size={14} strokeWidth={2.5} />}
      style={{ marginBottom: '20px', borderRadius: '99px', paddingLeft: '10px', paddingRight: '14px' }}
    >
      {label}
    </Btn>
  )
}
