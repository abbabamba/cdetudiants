'use client'

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'

interface MonthStat {
  month: string
  etudiants: number
  bailleurs: number
}

interface AnnonceStat {
  label: string
  value: number
  color: string
}

interface Props {
  inscriptions: MonthStat[]
  annoncesStats: AnnonceStat[]
  totalEtudiants: number
  totalBailleurs: number
}

const BLUE  = '#3B82F6'
const GREEN = '#10B981'
const AMBER = '#F59E0B'
const RED   = '#EF4444'
const NAVY  = '#1E3A5F'

function CustomTooltipInscriptions({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '10px 14px', fontSize: '12px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '6px', margin: '0 0 6px' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0', fontWeight: 600 }}>
          {p.name === 'etudiants' ? 'Étudiants' : 'Bailleurs'} : {p.value}
        </p>
      ))}
    </div>
  )
}

function CustomTooltipAnnonces({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '10px 14px', fontSize: '12px',
    }}>
      <p style={{ color: d.payload.color, margin: 0, fontWeight: 600 }}>{d.payload.label} : {d.value}</p>
    </div>
  )
}

export function DashboardChartsClient({ inscriptions, annoncesStats, totalEtudiants, totalBailleurs }: Props) {
  const total = totalEtudiants + totalBailleurs || 1
  const pieData = [
    { name: 'Étudiants', value: totalEtudiants, color: BLUE },
    { name: 'Bailleurs',  value: totalBailleurs,  color: GREEN },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>

      {/* ── Inscriptions par mois ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '20px 20px 12px',
          gridColumn: 'span 2',
        }}
        className="card-hover"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', margin: 0 }}>
              Inscriptions — 6 derniers mois
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Évolution des inscriptions étudiants et bailleurs
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: BLUE, display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Étudiants</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: GREEN, display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bailleurs</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={inscriptions} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gradEtu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BLUE}  stopOpacity={0.25} />
                <stop offset="95%" stopColor={BLUE}  stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gradBail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GREEN} stopOpacity={0.25} />
                <stop offset="95%" stopColor={GREEN} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false} tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltipInscriptions />} />
            <Area type="monotone" dataKey="etudiants" stroke={BLUE}  strokeWidth={2} fill="url(#gradEtu)"  dot={{ r: 3, fill: BLUE,  strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <Area type="monotone" dataKey="bailleurs"  stroke={GREEN} strokeWidth={2} fill="url(#gradBail)" dot={{ r: 3, fill: GREEN, strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Répartition utilisateurs (Donut) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '20px',
        }}
        className="card-hover"
      >
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', margin: '0 0 4px' }}>
          Répartition utilisateurs
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px' }}>
          {total} utilisateurs au total
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={42} outerRadius={62}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pieData.map((d) => (
              <div key={d.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, display: 'inline-block', flexShrink: 0 }} />
                    {d.name}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: d.color }}>{d.value}</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: '99px', height: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((d.value / total) * 100)}%`, height: '100%', background: d.color, borderRadius: '99px' }} />
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{Math.round((d.value / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Annonces par statut (Bar) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '20px 20px 12px',
        }}
        className="card-hover"
      >
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--navy)', margin: '0 0 4px' }}>
          Annonces par statut
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px' }}>
          Répartition actuelle des annonces
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={annoncesStats} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltipAnnonces />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {annoncesStats.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

    </div>
  )
}
