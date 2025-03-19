import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AuthFooterProps {
    links: ReadonlyArray<{ label: string; href: string }>;
    className?: string;
}

export function AuthFooter({ links, className }: Readonly<AuthFooterProps>) {
    return (
        <div className={cn("mt-4 text-sm text-center text-slate-600 dark:text-slate-400", className)}>
            {links.map((link, index) => (
                <span key={link.href} className="inline-block">
                    {index > 0 && <span className="mx-2 text-slate-400 dark:text-slate-600">•</span>}
                    <Link
                        href={link.href}
                        className="transition-colors rounded-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        tabIndex={0}
                    >
                        {link.label}
                    </Link>
                </span>
            ))}
        </div>
    )
}