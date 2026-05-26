'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import SupprimerUtilisateurButton from './SupprimerUtilisateurButton'
import { formatDate } from '@/lib/utils'

type StatutVerification = 'en_attente_admin' | 'verifie_email' | 'verifie_admin' | 'rejete' | null

interface User {
  id: string
  nom: string | null
  prenom: string | null
  role: string | null
  created_at: string
  profils_etudiants: { statut_verification: StatutVerification; score_profil: number | null }[] | null
}

const STATUT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  en_attente_admin: { label: 'En attente', color: '#92400E', bg: '#FEF3C7' },
  verifie_email:    { label: 'Email vérifié', color: 'var(--blue)', bg: 'var(--blue-light)' },
  verifie_admin:    { label: 'Vérifié ✓', color: 'var(--green)', bg: 'var(--green-light)' },
  rejete:           { label: 'Rejeté', color: 'var(--error)', bg: 'var(--error-light)' },
}

interface Props {
  users: User[]
  initialSearch: string
  roleFilter: string
}

export function UtilisateursTableClient({ users, initialSearch, roleFilter }: Props) {
  const [search, setSearch] = useState(initialSearch)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filtered = search
    ? users.filter(u => {
        const name = `${u.prenom ?? ''} ${u.nom ?? ''}`.toLowerCase()
        return name.includes(search.toLowerCase())
      })
    : users

  const pills = [
    { value: 'tous', label: 'Tous' },
    { value: 'etudiant', label: 'Étudiants' },
    { value: 'bailleur', label: 'Bailleurs' },
    { value: 'particulier', label: 'Particuliers' },
  ]

  return (
    <div>
      {/* Filters + search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {pills.map(p => (
            <a
              key={p.value}
              href={`/admin?section=utilisateurs&role=${p.value}`}
              style={{
                display: 'inline-block', padding: '6px 14px', borderRadius: '99px',
                fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                border: '1px solid', minHeight: '36px', lineHeight: '22px',
                transition: 'background 0.15s',
                ...(roleFilter === p.value
                  ? { background: 'var(--navy)', color: '#fff', borderColor: 'var(--navy)' }
                  : { background: 'var(--surface)', color: 'var(--text)', borderColor: 'var(--border)' }),
              }}
            >
              {p.label}
            </a>
          ))}
        </div>

        <div style={{
          flex: 1, minWidth: '200px',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '8px 12px',
        }}>
          <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', fontSize: '13px', color: 'var(--text)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', padding: '2px',
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '56px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
                {['Utilisateur', 'Rôle', 'Statut', 'Score', 'Inscription', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', fontSize: '11px', fontWeight: 600,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.05em', textAlign: 'left',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const pe = u.profils_etudiants?.[0]
                const statut = pe?.statut_verification ?? null
                const statutStyle = statut ? STATUT_LABELS[statut] : null
                const initials = `${(u.prenom?.[0] ?? '?').toUpperCase()}${(u.nom?.[0] ?? '').toUpperCase()}`
                const isHovered = hoveredId === u.id

                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.035, 0.35), duration: 0.28 }}
                    onMouseEnter={() => setHoveredId(u.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      background: isHovered ? 'rgba(26,45,79,0.025)' : 'transparent',
                      transition: 'background 0.12s',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: u.role === 'etudiant' ? 'var(--blue-light)' : u.role === 'particulier' ? '#F3F0FF' : 'var(--green-light)',
                          color: u.role === 'etudiant' ? 'var(--blue)' : u.role === 'particulier' ? '#7C3AED' : 'var(--green)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 700, flexShrink: 0,
                        }}>
                          {initials}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                          {u.prenom} {u.nom}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px',
                        background: u.role === 'etudiant' ? 'var(--blue-light)' : u.role === 'particulier' ? '#F3F0FF' : 'var(--green-light)',
                        color: u.role === 'etudiant' ? 'var(--blue)' : u.role === 'particulier' ? '#7C3AED' : 'var(--green)',
                      }}>
                        {u.role === 'etudiant' ? 'Étudiant' : u.role === 'particulier' ? 'Particulier' : 'Bailleur'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {u.role === 'etudiant' && statutStyle ? (
                        <span style={{
                          fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px',
                          background: statutStyle.bg, color: statutStyle.color,
                        }}>
                          {statutStyle.label}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {u.role === 'etudiant' && pe?.score_profil != null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '44px', height: '4px', background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', background: 'var(--blue)', borderRadius: 99,
                              width: `${pe.score_profil}%`,
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>
                            {pe.score_profil}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(u.created_at)}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                          href={`/admin?section=utilisateur&id=${u.id}`}
                          style={{ fontSize: '12px', color: 'var(--blue)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
                        >
                          Voir →
                        </a>
                        <SupprimerUtilisateurButton
                          userId={u.id}
                          prenom={u.prenom ?? ''}
                          nom={u.nom ?? ''}
                          role={u.role ?? ''}
                        />
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
