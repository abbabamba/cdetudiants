import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const CATEGORIES_BAILLEUR = ['logement', 'studio', 'colocation', 'chambre'] as const
const CATEGORIES_PARTICULIER = ['emploi', 'stage', 'alternance', 'service', 'don'] as const
const CATEGORIES_ETUDIANT = ['don'] as const

type Categorie = string

function categoriesAutorisees(role: string): readonly Categorie[] {
  if (role === 'bailleur') return CATEGORIES_BAILLEUR
  if (role === 'particulier') return CATEGORIES_PARTICULIER
  if (role === 'etudiant') return CATEGORIES_ETUDIANT
  return []
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 403 })
  }

  const autorisees = categoriesAutorisees(profile.role)
  if (!body.categorie || !(autorisees as Categorie[]).includes(body.categorie)) {
    return NextResponse.json(
      { error: 'Catégorie non autorisée pour votre rôle' },
      { status: 403 }
    )
  }

  const { data: annonce, error } = await supabase
    .from('annonces')
    .insert({
      bailleur_id: user.id,
      statut: 'active',
      categorie: body.categorie,
      titre: body.titre,
      description: body.description,
      ville: body.ville,
      prix: body.prix ?? 0,
      surface: body.surface ?? null,
      type_logement: body.type_logement ?? null,
      caution: body.caution ?? null,
      garantie: body.garantie ?? null,
      garantie_detail: body.garantie_detail ?? null,
      telephone_visible: body.telephone_visible ?? false,
    })
    .select('id')
    .single()

  if (error || !annonce) {
    return NextResponse.json({ error: error?.message ?? 'Erreur création annonce' }, { status: 500 })
  }

  return NextResponse.json({ id: annonce.id }, { status: 201 })
}
