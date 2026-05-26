import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isProtected = pathname.startsWith('/etudiant') ||
                      pathname.startsWith('/bailleur') ||
                      pathname.startsWith('/particulier') ||
                      pathname.startsWith('/admin')
  const isAuth = pathname.startsWith('/login') ||
                 pathname.startsWith('/register')

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuth && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirect')
    const url = request.nextUrl.clone()
    url.search = ''
    if (redirectTo) {
      url.pathname = redirectTo
    } else {
      const role = user.user_metadata?.role
      url.pathname = role === 'bailleur' ? '/bailleur'
        : role === 'particulier' ? '/particulier'
        : '/etudiant'
    }
    return NextResponse.redirect(url)
  }

  const role = user?.user_metadata?.role

  if (pathname.startsWith('/etudiant') && role === 'bailleur') {
    const url = request.nextUrl.clone()
    url.pathname = '/bailleur'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/etudiant') && role === 'particulier') {
    const url = request.nextUrl.clone()
    url.pathname = '/particulier'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/bailleur') && role === 'etudiant') {
    const url = request.nextUrl.clone()
    url.pathname = '/etudiant'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/bailleur') && role === 'particulier') {
    const url = request.nextUrl.clone()
    url.pathname = '/particulier'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/particulier') && role === 'etudiant') {
    const url = request.nextUrl.clone()
    url.pathname = '/etudiant'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/particulier') && role === 'bailleur') {
    const url = request.nextUrl.clone()
    url.pathname = '/bailleur'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
