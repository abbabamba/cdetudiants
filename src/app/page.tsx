import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HeroSection } from '@/components/home/HeroSection'
import { StatsSection } from '@/components/home/StatsSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { HowItWorks } from '@/components/home/HowItWorks'
import { AnnoncesHomeSection } from '@/components/home/AnnoncesSection'
import { ScrollProgressBar } from '@/components/ui/animations'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'bailleur') redirect('/bailleur')
    if (profile?.role === 'etudiant') redirect('/etudiant')
  }

  const { data: annonces } = await supabase
    .from('annonces')
    .select('*, photos:photos_annonces(url, ordre)')
    .eq('statut', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <main>
      <ScrollProgressBar />
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <HowItWorks />
      <AnnoncesHomeSection annonces={annonces ?? []} />
    </main>
  )
}
