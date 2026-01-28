import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { clientCommunicationSchema } from '@/lib/utils/validation'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ clientId: string }> }
) {
    try {
        const supabase = await createClient()
        const { clientId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: communications, error } = await (supabase as any)
            .from('client_communications')
            .select(`
        *,
        events (
          id,
          event_name,
          event_date,
          event_time
        )
      `)
            .eq('client_id', clientId)
            .order('sent_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(communications)
    } catch (error) {
        console.error('Error fetching client communications:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ clientId: string }> }
) {
    try {
        const supabase = await createClient()
        const { clientId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const json = await request.json()
        const body = clientCommunicationSchema.parse(json)

        const { data: communication, error } = await (supabase as any)
            .from('client_communications')
            .insert({
                client_id: clientId,
                event_id: body.event_id || null,
                message_type: body.message_type,
                subject: body.subject?.trim() || null,
                body: body.body,
                sent_by: user.id,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(communication)
    } catch (error) {
        console.error('Error creating client communication:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
