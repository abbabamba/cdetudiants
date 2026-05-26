import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateRelative } from '@/lib/utils'
import Link from 'next/link'
import { DashboardStatsClient } from './DashboardStatsClient'
import { DashboardProgressClient } from './DashboardProgressClient'
import { DashboardChartsClient } from './DashboardChartsClient'
import type { StatData } from './DashboardStatsClient'

function buildMonthlyStats(
  profiles: { created_at: string; role: string }[],
  months: { key: string; label: string }[]
) {
  const map: Record<string, { etudiants: number; bailleurs: number }> = {}
  for (const m of months) map[m.key] = { etudiants: 0, bailleurs: 0 }

  for (const p of profiles) {
    const key = p.created_at.slice(0, 7) // YYYY-MM
    if (map[key]) {
      if (p.role === 'etudiant') map[key].etudiants++
      else if (p.role === 'bailleur') map[key].bailleurs++
    }
  }

  return months.map((m) => ({ month: m.label, ...map[m.key] }))
}

export default async function DashboardSection() {
  const supabase = createAdminClient()

  // Build last 6 months range
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    }
  })
  const startDate = months[0].key + '-01'

  const [
    ,
    { count: totalEtudiants },
    { count: totalBailleurs },
    { count: enAttente },
    { count: verifieEmail },
    { count: verifieAdmin },
    { count: annoncesActives },
    { count: annoncesSignalees },
    { count: annoncesBrouillon },
    { count: annoncesInactives },
    { data: derniersInscrits },
    { data: profilesMois },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'etudiant'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'bailleur'),
    supabase.from('profils_etudiants').select('*', { count: 'exact', head: true }).eq('statut_verification', 'en_attente_admin'),
    supabase.from('profils_etudiants').select('*', { count: 'exact', head: true }).eq('statut_verification', 'verifie_email'),
    supabase.from('profils_etudiants').select('*', { count: 'exact', head: true }).eq('statut_verification', 'verifie_admin'),
    supabase.from('annonces').select('*', { count: 'exact', head: true }).eq('statut', 'active'),
    supabase.from('annonces').select('*', { count: 'exact', head: true }).eq('statut', 'signalee'),
    supabase.from('annonces').select('*', { count: 'exact', head: true }).eq('statut', 'brouillon'),
    supabase.from('annonces').select('*', { count: 'exact', head: true }).eq('statut', 'inactive'),
    supabase.from('profiles').select('id, nom, prenom, role, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('created_at, role').gte('created_at', startDate),
  ])

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const pctVerifieEmail = totalEtudiants ? Math.round(((verifieEmail ?? 0) / totalEtudiants) * 100) : 0
  const pctVerifieAdmin = totalEtudiants ? Math.round(((verifieAdmin ?? 0) / totalEtudiants) * 100) : 0
  const pctEnAttente    = totalEtudiants ? Math.round(((enAttente ?? 0) / totalEtudiants) * 100) : 0

  const stats: StatData[] = [
    { type: 'students',  value: totalEtudiants ?? 0,  label: 'Étudiants inscrits' },
    { type: 'landlords', value: totalBailleurs ?? 0,  label: 'Bailleurs inscrits' },
    {
      type: 'listings', value: annoncesActives ?? 0, label: 'Annonces actives',
      linkLabel: (annoncesActives ?? 0) > 0 ? 'Gérer →' : undefined,
      linkHref: '/admin?section=annonces', linkColor: 'var(--blue)',
    },
    {
      type: 'pending', value: enAttente ?? 0, label: 'Certificats en attente',
      highlight: (enAttente ?? 0) > 0,
      linkLabel: (enAttente ?? 0) > 0 ? 'Voir →' : undefined,
      linkHref: '/admin?section=certificats', linkColor: '#F59E0B',
    },
    {
      type: 'flagged', value: annoncesSignalees ?? 0, label: 'Annonces signalées',
      highlight: (annoncesSignalees ?? 0) > 0,
      linkLabel: (annoncesSignalees ?? 0) > 0 ? 'Traiter →' : undefined,
      linkHref: '/admin?section=annonces&statut=signalee', linkColor: 'var(--error)',
    },
  ]

  const progressBars = [
    { label: 'Email vérifié',    pct: pctVerifieEmail, color: 'var(--blue)',  value: verifieEmail ?? 0 },
    { label: 'Vérifié par admin', pct: pctVerifieAdmin, color: 'var(--green)', value: verifieAdmin ?? 0 },
    { label: 'En attente',        pct: pctEnAttente,    color: '#F59E0B',      value: enAttente ?? 0    },
  ]

  const inscriptions = buildMonthlyStats(profilesMois ?? [], months)

  const annoncesStats = [
    { label: 'Actives',    value: annoncesActives  ?? 0, color: '#10B981' },
    { label: 'Brouillon',  value: annoncesBrouillon ?? 0, color: '#94A3B8' },
    { label: 'Signalées',  value: annoncesSignalees ?? 0, color: '#EF4444' },
    { label: 'Inactives',  value: annoncesInactives ?? 0, color: '#F59E0B' },
  ]

  return (
    <div className="page-enter">
      {/* En-tête */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '28px', color: 'var(--navy)', fontWeight: 700, margin: '0 0 4px',
        }}>
          Vue d&apos;ensemble
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, textTransform: 'capitalize' }}>
          {today}
        </p>
      </div>

      {/* Stats animées */}
      <DashboardStatsClient stats={stats} />

      {/* Graphiques */}
      <DashboardChartsClient
        inscriptions={inscriptions}
        annoncesStats={annoncesStats}
        totalEtudiants={totalEtudiants ?? 0}
        totalBailleurs={totalBailleurs ?? 0}
      />

      {/* Vérifications étudiants */}
      <DashboardProgressClient bars={progressBars} />

      {/* Dernières inscriptions */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '24px',
        boxShadow: '0 1px 4px rgba(26,45,79,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--navy)', margin: 0 }}>
            Inscriptions récentes
          </h2>
          <Link href="/admin?section=utilisateurs" style={{ fontSize: '13px', color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>
            Voir tous →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {(derniersInscrits ?? []).map((p, i) => {
            const isNew = Date.now() - new Date(p.created_at).getTime() < 24 * 60 * 60 * 1000
            return (
              <div key={p.id} className={`anim-fade-up stagger-${Math.min(i + 1, 5)}`} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0',
                borderBottom: i < (derniersInscrits?.length ?? 0) - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: p.role === 'etudiant' ? 'var(--blue-light)' : 'var(--green-light)',
                  color: p.role === 'etudiant' ? 'var(--blue)' : 'var(--green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, flexShrink: 0,
                }}>
                  {(p.prenom?.[0] ?? '?').toUpperCase()}{(p.nom?.[0] ?? '').toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
                    {p.prenom} {p.nom}
                  </span>
                </div>
                {isNew && (
                  <span style={{
                    fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px',
                    background: 'linear-gradient(135deg,#10B981,#059669)',
                    color: '#fff', letterSpacing: '0.05em', flexShrink: 0,
                  }}>
                    NOUVEAU
                  </span>
                )}
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '99px',
                  background: p.role === 'etudiant' ? 'var(--blue-light)' : 'var(--green-light)',
                  color: p.role === 'etudiant' ? 'var(--blue)' : 'var(--green)', flexShrink: 0,
                }}>
                  {p.role === 'etudiant' ? 'Étudiant' : 'Bailleur'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0, minWidth: '60px', textAlign: 'right' }}>
                  {formatDateRelative(p.created_at)}
                </span>
                <Link
                  href={`/admin?section=utilisateur&id=${p.id}`}
                  style={{ fontSize: '12px', color: 'var(--blue)', textDecoration: 'none', fontWeight: 600, flexShrink: 0 }}
                >
                  Voir →
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
