'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

interface Props {
  href: string
  icon: ReactNode
  label: string
}

export function BailleurSidebarLink({ href, icon, label }: Props) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/bailleur' && pathname.startsWith(href + '/'))
    || (href === '/bailleur' && pathname === '/bailleur')

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '10px',
        fontSize: '14px',
        textDecoration: 'none',
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--blue)' : 'var(--text)',
        background: active ? 'var(--blue-light)' : 'transparent',
        borderLeft: active ? '3px solid var(--blue)' : '3px solid transparent',
        minHeight: '44px',
        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
      }}
    >
      {icon}
      {label}
    </Link>
  )
}
