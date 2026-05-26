import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const adminClient = createAdminClient()
  const { data: fullUser } = await adminClient.auth.admin.getUserById(user.id)
  const isAdmin = fullUser.user?.app_metadata?.role === 'admin'
  if (!isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { userId } = await request.json()
  if (!userId) {
    return NextResponse.json({ error: 'userId manquant' }, { status: 400 })
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
