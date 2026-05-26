import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { cookies } from "next/headers"
import "./globals.css"
import { NavbarServer } from "@/components/ui/NavbarServer"
import { BottomNav } from "@/components/ui/BottomNav"
import { PWAInstallBanner } from "@/components/ui/PWAInstallBanner"
import { NavbarVisibilityWrapper } from "@/components/ui/NavbarVisibilityWrapper"
import { AdminPreviewBar } from "@/components/admin/AdminPreviewBar"
import { Footer } from "@/components/ui/Footer"
import { createClient } from "@/lib/supabase/server"

const playfair = localFont({
  src: "./fonts/playfair-latin.woff2",
  variable: "--font-playfair",
  weight: "100 900",
  display: "swap",
  preload: true,
})

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
  preload: true,
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1B5FAD",
}

export const metadata: Metadata = {
  title: "Coin des Étudiants — Logement étudiant vérifié",
  description: "Trouvez votre logement étudiant sur une plateforme de confiance.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "CoinEtu",
    statusBarStyle: "default",
  },
  icons: {
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies()
  const previewRole = cookieStore.get('admin_view_as')?.value as 'etudiant' | 'bailleur' | 'particulier' | undefined

  let isAdmin = false
  if (previewRole) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isAdmin = user?.app_metadata?.role === 'admin'
  }

  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {previewRole && isAdmin && <AdminPreviewBar previewRole={previewRole} />}
        <NavbarVisibilityWrapper>
          <NavbarServer />
        </NavbarVisibilityWrapper>
        <div className="has-bottom-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        <Footer />
        <NavbarVisibilityWrapper>
          <BottomNav />
        </NavbarVisibilityWrapper>
        <PWAInstallBanner />
      </body>
    </html>
  )
}
