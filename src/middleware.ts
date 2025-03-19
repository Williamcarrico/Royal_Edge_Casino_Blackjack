import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define paths that don't require authentication
const publicPaths = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/reset-password',
    '/auth/update-password',
    '/',
    '/about',
    '/faq',
    '/terms',
    '/privacy',
]

// Define paths that require authentication
const protectedPaths = [
    '/game',
    '/profile',
    '/settings',
    '/transactions',
]

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => req.cookies.get(name)?.value,
                set: (name, value, options) => {
                    res.cookies.set({ name, value, ...options })
                    return res
                },
                remove: (name, options) => {
                    res.cookies.set({ name, value: '', ...options })
                    return res
                }
            }
        }
    )

    // Check if we have a session
    const { data: { session } } = await supabase.auth.getSession()
    const path = req.nextUrl.pathname

    // Handle protected routes
    const isProtectedPath = protectedPaths.some(protectedPath =>
        path === protectedPath || path.startsWith(`${protectedPath}/`)
    )

    // Handle public routes with the redirect flag
    const isPublicPath = publicPaths.some(publicPath =>
        path === publicPath || path.startsWith(`${publicPath}/`)
    )

    // Redirect authenticated users away from auth pages
    if (session && isPublicPath && path.startsWith('/auth')) {
        const redirectUrl = new URL('/', req.url)
        return NextResponse.redirect(redirectUrl)
    }

    // Redirect unauthenticated users away from protected pages
    if (!session && isProtectedPath) {
        const redirectUrl = new URL('/auth/sign-in', req.url)
        // Store the original URL to redirect back after login
        redirectUrl.searchParams.set('redirect', encodeURIComponent(req.url))
        return NextResponse.redirect(redirectUrl)
    }

    return res
}

// Specify on which paths the middleware should run
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         * - assets (asset files)
         */
        '/((?!_next/static|_next/image|favicon.ico|public|assets).*)',
    ],
}