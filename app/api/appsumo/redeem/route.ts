import { createClient } from '@/lib/supabase/server'
import { redeemAppSumoCode } from '@/lib/appsumo/redemption'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { code } = await request.json()
        if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 })
        
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        const result = await redeemAppSumoCode(session.user.id, code)
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }
        
        return NextResponse.json(result)
    } catch (error) {
        console.error('AppSumo redemption error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
