'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/forms/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthFooter } from '@/components/auth/auth-footer'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function SignInPage() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { signIn } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect')

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev)
    }, [])

    const onSubmit = useCallback(async (data: LoginFormValues) => {
        setError(null)
        setIsLoading(true)

        try {
            const { success, error } = await signIn(data.email, data.password)

            if (success) {
                // Redirect to the intended page or default to home
                const redirectUrl = redirect ? decodeURIComponent(redirect) : '/'
                router.push(redirectUrl)
            } else {
                setError(error ?? 'Invalid email or password')
                form.setFocus('email')
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error('Login error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [signIn, redirect, router, form])

    return (
        <AuthCard
            title="Sign In"
            description="Enter your credentials to access your account"
            footer={
                <AuthFooter
                    links={[
                        { label: "Don't have an account?", href: "/auth/sign-up" },
                        { label: "Forgot password?", href: "/auth/reset-password" },
                    ]}
                />
            }
        >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <Alert variant="destructive" role="alert" aria-live="assertive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        aria-required="true"
                        aria-invalid={!!form.formState.errors.email}
                        aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                        {...form.register('email')}
                        disabled={isLoading}
                        className={cn(form.formState.errors.email && "border-destructive")}
                    />
                    {form.formState.errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-destructive">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            href="/auth/reset-password"
                            className="text-xs text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            aria-required="true"
                            aria-invalid={!!form.formState.errors.password}
                            aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                            {...form.register('password')}
                            disabled={isLoading}
                            className={cn(form.formState.errors.password && "border-destructive")}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute w-8 h-8 p-0 -translate-y-1/2 right-2 top-1/2"
                            onClick={togglePasswordVisibility}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                    {form.formState.errors.password && (
                        <p id="password-error" className="mt-1 text-sm text-destructive">
                            {form.formState.errors.password.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    aria-busy={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </Button>
            </form>
        </AuthCard>
    )
}