import { useState, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/forms/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert/alert'
import { Loader2 } from 'lucide-react'

export interface FormState {
    email: string
    password: string
    username?: string
    display_name?: string
    avatar_url?: string
    bio?: string
    date_of_birth?: string
}

interface AuthFormProps {
    onSubmit: (data: FormState) => Promise<void>
    isLoading: boolean
    error: string | null
    type: 'sign-in' | 'sign-up' | 'reset-password'
}

export function AuthForm({ onSubmit, isLoading, error, type }: Readonly<AuthFormProps>) {
    const [formState, setFormState] = useState<FormState>({
        email: '',
        password: '',
        username: '',
        display_name: '',
        avatar_url: '',
        bio: '',
        date_of_birth: ''
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await onSubmit(formState)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormState(prev => ({ ...prev, [name]: value }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                />
            </div>

            {(type === 'sign-in' || type === 'sign-up') && (
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formState.password}
                        onChange={handleChange}
                        required
                        autoComplete={type === 'sign-in' ? 'current-password' : 'new-password'}
                        minLength={8}
                    />
                </div>
            )}

            {type === 'sign-up' && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="coolplayer123"
                            value={formState.username}
                            onChange={handleChange}
                            required
                            minLength={3}
                            maxLength={20}
                        />
                        <p className="text-xs text-muted-foreground">
                            Choose a unique username (3-20 characters)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                            id="date_of_birth"
                            name="date_of_birth"
                            type="date"
                            value={formState.date_of_birth}
                            onChange={handleChange}
                            required
                            aria-describedby="dob-requirements"
                        />
                        <p id="dob-requirements" className="text-xs text-muted-foreground">
                            You must be at least 21 years old to play
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name (Optional)</Label>
                        <Input
                            id="display_name"
                            name="display_name"
                            type="text"
                            placeholder="John Doe"
                            value={formState.display_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
                        <Input
                            id="avatar_url"
                            name="avatar_url"
                            type="url"
                            placeholder="https://example.com/avatar.jpg"
                            value={formState.avatar_url}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio (Optional)</Label>
                        <textarea
                            id="bio"
                            name="bio"
                            placeholder="Tell us about yourself..."
                            value={formState.bio}
                            onChange={handleChange}
                            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                            Maximum 500 characters
                        </p>
                    </div>
                </>
            )}

            <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {type === 'sign-in' && 'Signing in...'}
                        {type === 'sign-up' && 'Creating account...'}
                        {type === 'reset-password' && 'Sending email...'}
                    </>
                ) : (
                    <>
                        {type === 'sign-in' && 'Sign in'}
                        {type === 'sign-up' && 'Create account'}
                        {type === 'reset-password' && 'Reset password'}
                    </>
                )}
            </Button>
        </form>
    )
}