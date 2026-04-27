import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canCreateVenue } from '@/lib/subscription/limits'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return new NextResponse('Unauthorized', { status: 401 })

        const check = await canCreateVenue(user.id)
        if (!check.allowed) {
            return NextResponse.json({ error: check.reason, reason: check.reason, code: 'LIMIT_REACHED' }, { status: 403 })
        }
        return NextResponse.json({ allowed: true })
    } catch (error) {
        console.error('Error checking venue limit:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
