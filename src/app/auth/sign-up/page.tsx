'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthFooter } from '@/components/auth/auth-footer'
import { z } from 'zod'
import { AuthForm, FormState } from '@/components/auth/auth-form'

// Helper function to check if user is at least 21 years old
const isAtLeast21 = (dateString: string): boolean => {
    if (!dateString) return false;

    const birthDate = new Date(dateString);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Adjust age if birth month is after current month, or same month but birth day is after current day
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= 21;
};

// Form validation schema
const signupSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .regex(/^\w+$/, 'Username can only contain letters, numbers, and underscores'),
    display_name: z.string().optional(),
    avatar_url: z.string().optional().nullable().transform(val => val === '' ? null : val).refine(
        val => val === null || (typeof val === 'string' && /^https?:\/\/.*/.test(val)),
        { message: 'Please enter a valid URL' }
    ),
    bio: z.string().optional().nullable().transform(val => val === '' ? null : val).refine(
        val => val === null || (typeof val === 'string' && val.length <= 500),
        { message: 'Bio must be less than 500 characters' }
    ),
    date_of_birth: z.string().refine(val => !!val, 'Date of birth is required'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must include uppercase, lowercase and number'
        ),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
}).refine(data => isAtLeast21(data.date_of_birth), {
    message: "You must be at least 21 years old to create an account",
    path: ["date_of_birth"],
});

export default function SignUpPage() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { signUp } = useAuth()
    const router = useRouter()

    const handleSubmit = async (formData: FormState) => {
        setError(null)
        setIsLoading(true)

        try {
            // Add confirmPassword for validation
            const dataToValidate = {
                ...formData,
                confirmPassword: formData.password, // We're not collecting this separately in the form component
            };

            // Validate form data
            signupSchema.parse(dataToValidate)

            // Check age again as an extra precaution
            if (!formData.date_of_birth || !isAtLeast21(formData.date_of_birth)) {
                setError('You must be at least 21 years old to create an account');
                setIsLoading(false);
                return;
            }

            // Attempt to sign up
            const { success, error } = await signUp(
                formData.email,
                formData.password,
                formData.username ?? '',
                formData.display_name,
                formData.date_of_birth
            )

            if (success) {
                router.push('/game')
            } else {
                setError(error ?? 'Failed to create account')
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.errors[0].message)
            } else {
                setError('An unexpected error occurred')
                console.error('Signup error:', err)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthCard
            title="Create an Account"
            description="Sign up to start playing and track your progress"
            footer={
                <AuthFooter
                    links={[
                        { label: "Already have an account?", href: "/auth/sign-in" },
                    ]}
                />
            }
            className="md:max-h-[90vh] overflow-y-auto"
        >
            <AuthForm
                type="sign-up"
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
            />
        </AuthCard>
    )
}