import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/documents', '/billing', '/settings']
  const authRoutes = ['/auth', '/login', '/signup']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Solo verificar autenticación si es necesario (rutas protegidas o de auth)
  let user = null
  if (isProtectedRoute || isAuthRoute) {
    try {
      // Refrescar la sesión si es posible
      const { data, error } = await supabase.auth.getUser()
      user = data?.user || null
      
      // Si hay error en la autenticación, log pero continúa
      if (error) {
        console.log('Auth error:', error.message)
      }
    } catch (error) {
      // Si falla completamente la verificación de usuario, log pero continúa
      console.log('Failed to check user authentication:', error.message)
    }
  }

  // Si el usuario no está autenticado y trata de acceder a ruta protegida
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si el usuario está autenticado y trata de acceder a rutas de auth
  if (user && isAuthRoute && !request.nextUrl.pathname.includes('callback')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Only run middleware on protected routes to avoid blocking public pages
     * - Match dashboard and other protected routes
     * - Skip all other routes including homepage and calculator
     */
    '/dashboard/:path*',
    '/documents/:path*', 
    '/billing/:path*',
    '/settings/:path*'
  ],
}