import { useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: ReactNode
    requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: Readonly<ProtectedRouteProps>) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

    useEffect(() => {
        // Skip authorization check if still loading
        if (isLoading) return

        // Check if user is authenticated
        if (!user) {
            // Store the current path to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', pathname)
            router.push('/auth/sign-in')
            setIsAuthorized(false)
            return
        }

        // If there's a required role, check if user has it (not implemented in current schema)
        // This is for future use when you might add role-based access
        if (requiredRole) {
            // Example: if (user.role !== requiredRole) { ... }
            // For now, we'll assume all authenticated users can access all protected routes
        }

        setIsAuthorized(true)
    }, [user, isLoading, router, pathname, requiredRole])

    // While initial loading or during authorization check, show loading
    if (isLoading || isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        )
    }

    // If authorized, render the children
    if (isAuthorized) {
        return <>{children}</>
    }

    // If not authorized, we've already redirected, so just show a minimal loading
    return null
}