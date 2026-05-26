'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'

export function AnnoncesFilters({ total, basePath = '/annonces' }: { total: number; basePath?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || value === 'tous') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('welcome')
    startTransition(() => {
      router.push(basePath + '?' + params.toString())
    })
  }, [router, searchParams, basePath, startTransition])

  const type = searchParams.get('type') ?? 'tous'
  const tri = searchParams.get('tri') ?? 'recent'
  const categorie = searchParams.get('categorie') ?? 'tous'

  const types = [
    { key: 'tous',       label: 'Tous'         },
    { key: 'studio',     label: 'Studios'      },
    { key: 'colocation', label: 'Colocations'  },
    { key: 'chambre',    label: 'Chambres'     },
  ]

  const categories = [
    { key: 'tous',       label: 'Tout'       },
    { key: 'logement',   label: '🏠 Logements'  },
    { key: 'emploi',     label: '💼 Emplois'    },
    { key: 'stage',      label: '🎓 Stages'     },
    { key: 'alternance', label: '🔄 Alternance' },
    { key: 'service',    label: '🛠 Services'   },
    { key: 'don',        label: '🎁 Dons'       },
  ]

  return (
    <div style={{ marginBottom: '28px' }}>

      {/* Barre de progression pendant la navigation */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, var(--blue), #60a5fa)',
              transformOrigin: 'left',
              zIndex: 999,
              borderRadius: '0 2px 2px 0',
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={{ opacity: isPending ? 0.6 : 1 }}
        transition={{ duration: 0.15 }}
        style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 200px', position: 'relative', minWidth: '180px' }}>
          <Search
            size={15}
            style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }}
          />
          <input
            className="form-input"
            style={{ paddingLeft: '36px', borderRadius: '12px', minHeight: '44px' }}
            placeholder="Rechercher une ville..."
            defaultValue={searchParams.get('ville') ?? ''}
            onChange={e => update('ville', e.target.value)}
          />
        </div>

        {/* Pills — avec Framer Motion */}
        <div className="pills-scroll" style={{ flex: '1 1 auto' }}>
          {types.map(t => {
            const isActive = type === t.key
            return (
              <motion.button
                key={t.key}
                onClick={() => update('type', t.key)}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                style={{
                  padding: '9px 18px', borderRadius: '99px', cursor: 'pointer',
                  border: isActive ? '2px solid var(--blue)' : '1.5px solid var(--border)',
                  background: isActive ? 'var(--blue)' : 'var(--surface)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontSize: '13px', fontWeight: isActive ? 600 : 400,
                  transition: 'background 0.18s, color 0.18s, border-color 0.18s, box-shadow 0.18s',
                  whiteSpace: 'nowrap', minWidth: '60px', minHeight: '44px',
                  fontFamily: 'var(--font-inter), sans-serif',
                  boxShadow: isActive ? '0 2px 8px rgba(27,95,173,0.22)' : 'none',
                  position: 'relative',
                }}
              >
                {t.label}
              </motion.button>
            )
          })}
        </div>

        {/* Select tri */}
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: '140px', paddingRight: '32px', cursor: 'pointer', borderRadius: '12px', minHeight: '44px', flex: '0 0 auto' }}
          value={tri}
          onChange={e => update('tri', e.target.value)}
        >
          <option value="recent">Plus récentes</option>
          <option value="prix_asc">Prix croissant</option>
          <option value="prix_desc">Prix décroissant</option>
        </select>

      </motion.div>

      {/* Ligne catégories */}
      <motion.div
        animate={{ opacity: isPending ? 0.6 : 1 }}
        transition={{ duration: 0.15 }}
        style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}
      >
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>Catégorie :</span>
        <div className="pills-scroll" style={{ flex: '1 1 auto' }}>
          {categories.map(c => {
            const isActive = categorie === c.key
            return (
              <motion.button
                key={c.key}
                onClick={() => update('categorie', c.key)}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                style={{
                  padding: '7px 14px', borderRadius: '99px', cursor: 'pointer',
                  border: isActive ? '2px solid var(--blue)' : '1.5px solid var(--border)',
                  background: isActive ? 'var(--blue)' : 'var(--surface)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontSize: '12px', fontWeight: isActive ? 600 : 400,
                  transition: 'background 0.18s, color 0.18s, border-color 0.18s',
                  whiteSpace: 'nowrap', minHeight: '36px',
                  fontFamily: 'var(--font-inter), sans-serif',
                  boxShadow: isActive ? '0 2px 8px rgba(27,95,173,0.22)' : 'none',
                }}
              >
                {c.label}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: isPending ? 0.6 : 1 }}
        transition={{ duration: 0.15 }}
        style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}
      >
        {/* Compteur / spinner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--blue)' }}
              >
                <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
                Chargement…
              </motion.span>
            ) : (
              <motion.span
                key="count"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}
              >
                {total} annonce{total > 1 ? 's' : ''}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
