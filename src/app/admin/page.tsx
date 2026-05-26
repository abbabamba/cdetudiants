import DashboardSection from '@/components/admin/sections/DashboardSection'
import CertificatsSection from '@/components/admin/sections/CertificatsSection'
import UtilisateursSection from '@/components/admin/sections/UtilisateursSection'
import UtilisateurDetailSection from '@/components/admin/sections/UtilisateurDetailSection'
import AnnoncesSection from '@/components/admin/sections/AnnoncesSection'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; role?: string; q?: string; statut?: string; id?: string }>
}) {
  const { section, role, q, statut, id } = await searchParams

  if (section === 'certificats') return <CertificatsSection />
  if (section === 'utilisateurs') return <UtilisateursSection roleFilter={role ?? 'tous'} search={q ?? ''} />
  if (section === 'utilisateur' && id) return <UtilisateurDetailSection userId={id} />
  if (section === 'annonces') return <AnnoncesSection statutFilter={statut ?? 'toutes'} />

  return <DashboardSection />
}
