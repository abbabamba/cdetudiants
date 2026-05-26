'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
      && !(window as unknown as { MSStream?: unknown }).MSStream
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)'
    ).matches

    if (ios && !isStandalone) {
      setIsIOS(true)
      setTimeout(() => setShowBanner(true), 3000)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowBanner(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowBanner(false)
        setDeferredPrompt(null)
      }
    }
  }

  function handleDismiss() {
    setShowBanner(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-banner-dismissed', '1')
  }

  return (
    <AnimatePresence>
      {showBanner && !isDismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          style={{
            position: 'fixed',
            bottom: 'calc(60px + env(safe-area-inset-bottom) + 12px)',
            left: '12px', right: '12px',
            zIndex: 200,
            background: 'var(--navy)',
            borderRadius: '20px',
            padding: '16px 20px',
            boxShadow: '0 8px 40px rgba(26,45,79,0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <img
            src="/icons/icon-72x72.png"
            alt="Coin des Étudiants"
            style={{
              width: '48px', height: '48px',
              borderRadius: '12px', flexShrink: 0,
            }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '14px', fontWeight: 700,
              color: '#fff', margin: '0 0 2px',
            }}>
              Installer l&apos;application
            </p>
            <p style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.65)',
              margin: 0,
            }}>
              {isIOS
                ? 'Appuyez sur ⬆ puis "Sur l\'écran d\'accueil"'
                : 'Accès rapide depuis votre écran d\'accueil'
              }
            </p>
          </div>

          {!isIOS && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleInstall}
              style={{
                background: 'var(--blue)',
                color: '#fff', border: 'none',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', flexShrink: 0,
                minHeight: '44px',
              }}
            >
              Installer
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDismiss}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none', borderRadius: '8px',
              width: '32px', height: '32px',
              cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}
            aria-label="Fermer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
