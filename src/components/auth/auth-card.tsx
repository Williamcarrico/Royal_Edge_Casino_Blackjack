import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AuthCardProps {
    children: ReactNode
    title: string
    description: string
    footer?: ReactNode
    className?: string
    marginTop?: string
}

export function AuthCard({ children, title, description, footer, className, marginTop }: Readonly<AuthCardProps>) {
    return (
        <Card className={cn("w-full shadow-xl backdrop-blur-sm bg-white/95 dark:bg-slate-900/95", marginTop && `mt-${marginTop}`, className)}>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
                <CardDescription className="mt-1">{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
            {footer && <CardFooter className="flex flex-col space-y-2">{footer}</CardFooter>}
        </Card>
    )
}