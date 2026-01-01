import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateReliabilityScore } from '@/lib/algorithms/vendorMatching'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ vendorId: string }> }
) {
    try {
        const supabase = await createClient()
        const { vendorId } = await params

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const json = await request.json()
        const { event_id, on_time, quality_rating, cost_accurate, would_use_again, notes } = json

        // 1. Insert the review
        const { data: review, error: reviewError } = await supabase
            .from('vendor_reviews')
            .insert({
                vendor_id: vendorId,
                event_id: event_id,
                on_time,
                quality_rating,
                cost_accurate,
                would_use_again,
                notes
            } as any)
            .select()
            .single()

        if (reviewError) throw reviewError

        // 2. Fetch current vendor stats to update
        const { data: vendor, error: vendorError } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', vendorId)
            .single()

        if (vendorError) throw vendorError

        // 3. Calculate new metrics
        const totalEvents = (vendor.total_events || 0) + 1;
        const onTimeCount = (vendor.on_time_count || 0) + (on_time ? 1 : 0);
        const onTimePercentage = Math.round((onTimeCount / totalEvents) * 100);

        // Simple moving average for quality rating
        const oldAvg = vendor.avg_quality_rating || 0;
        const avgQualityRating = Number(((oldAvg * (totalEvents - 1) + quality_rating) / totalEvents).toFixed(2));

        const reliabilityScore = calculateReliabilityScore(
            0, // current value not needed in my formula as it recalculates from totals
            totalEvents,
            onTimePercentage,
            avgQualityRating
        );

        // 4. Update vendor
        const { error: updateError } = await supabase
            .from('vendors')
            .update({
                total_events: totalEvents,
                on_time_count: onTimeCount,
                on_time_percentage: onTimePercentage,
                avg_quality_rating: avgQualityRating,
                reliability_score: reliabilityScore
            } as any)
            .eq('id', vendorId)

        if (updateError) throw updateError

        return NextResponse.json(review)
    } catch (error) {
        console.error('Error submitting review:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ vendorId: string }> }
) {
    try {
        const supabase = await createClient()
        const { vendorId } = await params

        const { data: reviews, error } = await supabase
            .from('vendor_reviews')
            .select('*')
            .eq('vendor_id', vendorId)
            .order('reviewed_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(reviews)
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
