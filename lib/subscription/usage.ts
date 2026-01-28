import { createServiceRoleClient } from '@/lib/supabase/server'

function getCurrentMonthDate(): string {
    return new Date().toISOString().slice(0, 7) + '-01'
}

async function upsertUsage(userId: string, field: 'spaces_created' | 'events_created' | 'vendors_created') {
    const supabase = createServiceRoleClient()
    const month = getCurrentMonthDate()

    // Try to increment existing record
    const { data: existing } = await (supabase as any)
        .from('usage_tracking')
        .select('id, ' + field)
        .eq('user_id', userId)
        .eq('month', month)
        .single()

    if (existing) {
        const currentValue = (existing as any)[field] || 0
        await (supabase as any)
            .from('usage_tracking')
            .update({ [field]: currentValue + 1, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
    } else {
        await (supabase as any)
            .from('usage_tracking')
            .insert({
                user_id: userId,
                month,
                [field]: 1,
            })
    }
}

export async function trackSpaceCreation(userId: string): Promise<void> {
    await upsertUsage(userId, 'spaces_created')
}

export async function trackEventCreation(userId: string): Promise<void> {
    await upsertUsage(userId, 'events_created')
}

export async function trackVendorCreation(userId: string): Promise<void> {
    await upsertUsage(userId, 'vendors_created')
}

export async function getCurrentUsage(userId: string) {
    const supabase = createServiceRoleClient()
    const month = getCurrentMonthDate()

    const { data } = await (supabase as any)
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .single()

    return {
        spaces_created: data?.spaces_created || 0,
        events_created: data?.events_created || 0,
        vendors_created: data?.vendors_created || 0,
        month,
    }
}
