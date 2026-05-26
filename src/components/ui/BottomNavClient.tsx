'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, User, Heart, MessageCircle, PlusCircle } from 'lucide-react'

export function BottomNavClient({ role, nonLus = 0 }: { role: string; nonLus?: number }) {
  const pathname = usePathname()

  const tabs =
    role === 'bailleur'
      ? [
          { href: '/annonces',          icon: Search,        label: 'Annonces'     },
          { href: '/bailleur',          icon: Home,          label: 'Mes annonces' },
          { href: '/bailleur/messages', icon: MessageCircle, label: 'Messages',    badge: nonLus },
          { href: '/bailleur/profil',   icon: User,          label: 'Profil'       },
        ]
      : role === 'particulier'
      ? [
          { href: '/annonces',             icon: Search,      label: 'Annonces'   },
          { href: '/particulier',          icon: Home,        label: 'Mon espace' },
          { href: '/particulier/publier',  icon: PlusCircle,  label: 'Publier'    },
          { href: '/particulier/profil',   icon: User,        label: 'Profil'     },
        ]
      : [
          { href: '/annonces',          icon: Search,        label: 'Annonces'  },
          { href: '/etudiant',          icon: Home,          label: 'Dashboard' },
          { href: '/etudiant/favoris',  icon: Heart,         label: 'Favoris'   },
          { href: '/etudiant/messages', icon: MessageCircle, label: 'Messages',  badge: nonLus },
          { href: '/etudiant/profil',   icon: User,          label: 'Profil'    },
        ]

  return (
    <nav
      className="bottom-nav bottom-nav-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ href, icon: Icon, label, badge }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '3px', textDecoration: 'none',
              color: active ? 'var(--blue)' : 'var(--text-muted)',
              background: 'none', padding: '8px 4px',
              transition: 'color 0.15s',
              position: 'relative',
            }}
            onTouchStart={(e) => {
              const el = e.currentTarget
              el.style.opacity = '0.7'
              setTimeout(() => { el.style.opacity = '1' }, 100)
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              {badge && badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  background: 'var(--error)',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {badge > 9 ? '9' : badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: '10px', fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
            {active && (
              <span style={{
                position: 'absolute', bottom: '4px',
                width: '4px', height: '4px', borderRadius: '50%',
                background: 'var(--blue)',
              }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
