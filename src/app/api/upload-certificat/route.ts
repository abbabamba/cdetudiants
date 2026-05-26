import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string | null

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Fichier ou userId manquant' },
        { status: 400 }
      )
    }

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format non accepté. PDF, JPG, PNG uniquement.' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 5 Mo)' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
    const fileName = `${userId}/certificat-${Date.now()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const adminClient = createAdminClient()
    const { data: upload, error: uploadError } = await adminClient.storage
      .from('certificats')
      .upload(fileName, buffer, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError || !upload?.path) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: "Erreur lors de l'upload" },
        { status: 500 }
      )
    }

    const { data: signedData, error: signedError } = await adminClient.storage
      .from('certificats')
      .createSignedUrl(upload.path, 60 * 60 * 24 * 365)

    if (signedError || !signedData?.signedUrl) {
      return NextResponse.json(
        { error: 'Erreur génération URL' },
        { status: 500 }
      )
    }

    const { error: dbError } = await adminClient
      .from('profils_etudiants')
      .upsert({
        user_id: userId,
        certificat_url: signedData.signedUrl,
        statut_verification: 'en_attente_admin',
      }, { onConflict: 'user_id', ignoreDuplicates: false })

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json(
        { error: 'Erreur base de données' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: signedData.signedUrl,
    })

  } catch (err) {
    console.error('Upload certificat error:', err)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
