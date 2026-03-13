import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

/** Validate that `next` is a safe relative path — blocks open-redirect to external hosts. */
function getSafeNext(raw: string | null): string {
    if (!raw) return '/dashboard'
    // Must start with '/' but not '//' (protocol-relative) and contain no whitespace
    if (raw.startsWith('/') && !raw.startsWith('//') && !/\s/.test(raw)) {
        return raw
    }
    return '/dashboard'
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Validate 'next' to prevent open-redirect attacks (CWE-601)
    const next = getSafeNext(searchParams.get('next'))

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
