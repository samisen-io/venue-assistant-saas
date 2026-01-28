import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUsage } from '@/lib/subscription/usage'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const usage = await getCurrentUsage(user.id)
        return NextResponse.json(usage)
    } catch (error) {
        console.error('Error fetching usage:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
