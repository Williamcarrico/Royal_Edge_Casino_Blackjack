// lib/cookies.ts
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { redirect } from 'next/navigation';

type CookiePreference = {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
};

/**
 * Server-side cookie utility functions for NextJS 15
 */

// Get cookie consent preferences from server-side
export async function getServerCookieConsent(): Promise<CookiePreference | null> {
    const cookieStore = await cookies();
    const consent = cookieStore.get('cookie_consent');

    if (!consent?.value) {
        return null;
    }

    try {
        return JSON.parse(consent.value) as CookiePreference;
    } catch (error) {
        console.error('Error parsing cookie consent:', error);
        return null;
    }
}

// Check if user has given consent for a specific cookie type
export async function hasConsent(cookieType: keyof CookiePreference): Promise<boolean> {
    const consent = await getServerCookieConsent();

    // If no consent stored, only allow necessary cookies
    if (!consent) {
        return cookieType === 'necessary';
    }

    return consent[cookieType] === true;
}

// Redirect to cookie consent page if no consent is given
export function requireCookieConsent(cookieStore: ReadonlyRequestCookies, returnPath: string = '/'): void {
    const consent = cookieStore.get('cookie_consent');

    if (!consent?.value) {
        // Encode the return path
        const returnTo = encodeURIComponent(returnPath);
        redirect(`/cookies?returnTo=${returnTo}`);
    }
}

// Get a cookie value on the server side
export async function getServerCookie(name: string): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
}