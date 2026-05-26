'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home, Heart, User, MessageCircle, Search, Gift } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  favorisCount: number
}

const NAV = [
  { href: '/etudiant',          label: 'Annonces',    icon: Home         },
  { href: '/etudiant/favoris',  label: 'Mes favoris', icon: Heart,   key: 'favoris'  },
  { href: '/etudiant/dons',     label: 'Dons',        icon: Gift         },
  { href: '/etudiant/profil',   label: 'Mon profil',  icon: User         },
  { href: '/etudiant/messages', label: 'Messages',    icon: MessageCircle, key: 'messages' },
  { href: '/annonces',          label: 'Explorer',    icon: Search       },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' as const } },
}

export function EtudiantSidebarNav({ favorisCount }: Props) {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      fetch('/api/conversations')
        .then(r => r.json())
        .then((convs: { messages: { lu_par_etudiant: boolean; sender_id: string }[] }[]) => {
          const total = convs.reduce((sum, conv) =>
            sum + conv.messages.filter(m => !m.lu_par_etudiant && m.sender_id !== user.id).length, 0)
          setUnread(total)
        })
        .catch(() => {})
    })
  }, [])

  function getCount(key?: string) {
    if (key === 'favoris') return favorisCount
    if (key === 'messages') return unread
    return 0
  }

  return (
    <motion.nav
      variants={container}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
    >
      {NAV.map(nav => {
        const isActive = pathname === nav.href
        const count = getCount((nav as { key?: string }).key)
        const showBadge = count > 0

        return (
          <motion.div key={nav.href} variants={item}>
            <Link
              href={nav.href}
              className={`sidebar-link${isActive ? ' active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <nav.icon size={17} />
                {nav.label}
              </span>
              {showBadge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.5 }}
                  style={{
                    background: (nav as { key?: string }).key === 'messages' ? 'var(--error)' : 'var(--blue)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '99px',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}
                >
                  {count}
                </motion.span>
              )}
            </Link>
          </motion.div>
        )
      })}
    </motion.nav>
  )
}
