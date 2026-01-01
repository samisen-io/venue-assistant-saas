import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) throw error

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Error fetching profile:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const json = await request.json()
        const { full_name, company_name, phone } = json

        const { data: profile, error } = await supabase
            .from('profiles')
            .update({
                full_name,
                company_name,
                phone,
                updated_at: new Date().toISOString()
            } as any)
            .eq('id', user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(profile)
    } catch (error) {
        console.error('Error updating profile:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
