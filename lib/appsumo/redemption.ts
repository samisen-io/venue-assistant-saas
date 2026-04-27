import { createServiceRoleClient } from '@/lib/supabase/server'

export async function redeemAppSumoCode(userId: string, code: string) {
    const supabase = createServiceRoleClient()
    
    // Check if code exists and is unused
    const { data: codeData, error: codeError } = await (supabase as any)
        .from('appsumo_codes')
        .select('*')
        .eq('code', code)
        .single()
        
    if (codeError || !codeData) {
        return { success: false, error: 'Invalid redemption code.' }
    }
    
    if (codeData.is_used) {
        return { success: false, error: 'This code has already been redeemed.' }
    }
    
    // Update code as used
    const { error: updateCodeError } = await (supabase as any)
        .from('appsumo_codes')
        .update({
            is_used: true,
            user_id: userId,
            redeemed_at: new Date().toISOString()
        })
        .eq('id', codeData.id)
        
    if (updateCodeError) {
        return { success: false, error: 'Failed to redeem code. Please try again.' }
    }
    
    // Upgrade user subscription
    const planTier = `appsumo_tier_${codeData.tier}`
    const { error: updateSubError } = await (supabase as any)
        .from('subscriptions')
        .upsert({
            user_id: userId,
            plan_tier: planTier,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: null, // Lifetime
            cancel_at_period_end: false,
            trial_ends_at: null,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        
    if (updateSubError) {
        // Rollback code
        await (supabase as any).from('appsumo_codes').update({ is_used: false, user_id: null, redeemed_at: null }).eq('id', codeData.id)
        return { success: false, error: 'Failed to upgrade subscription.' }
    }
    
    return { success: true, tier: codeData.tier }
}
