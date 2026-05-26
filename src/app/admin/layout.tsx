import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.app_metadata?.role !== 'admin') redirect('/')

  const { count } = await supabase
    .from('profils_etudiants')
    .select('*', { count: 'exact', head: true })
    .eq('statut_verification', 'en_attente_admin')

  return (
    <AdminShell pendingCount={count ?? 0} adminEmail={user.email ?? ''}>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </AdminShell>
  )
}
