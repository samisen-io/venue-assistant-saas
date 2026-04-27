import { createServiceRoleClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id
        
        // Use service role client to delete the user
        const serviceClient = createServiceRoleClient()
        
        // Supabase admin deleteUser will cascade delete their data 
        // if the database has ON DELETE CASCADE on the foreign keys to auth.users.
        const { error } = await serviceClient.auth.admin.deleteUser(userId)
        
        if (error) {
            console.error('Error deleting user:', error)
            return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Account deletion error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
