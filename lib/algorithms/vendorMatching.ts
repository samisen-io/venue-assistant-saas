import { Vendor, Event, VendorMatchResult } from '../types'

export function calculateMatchScore(
    vendor: Vendor,
    event: Event,
    requiredServiceIds: string[] = [],
    vendorServiceIds: string[] = []
): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Reliability factor (30% weight)
    const reliability = vendor.reliability_score || 0;
    if (reliability >= 90) reasons.push("Top-rated reliability");

    // Cost fit (25% weight)
    let costFit = 0;
    if (vendor.cost_per_unit && event.budget_total) {
        const estimatedCost = vendor.cost_per_unit * event.guest_count;
        const budgetPerVendor = event.budget_total / 5;

        if (estimatedCost <= budgetPerVendor) {
            costFit = 100;
            reasons.push("Fits within estimated budget");
        } else {
            const ratio = budgetPerVendor / estimatedCost;
            costFit = Math.min(100, ratio * 100);
            if (costFit < 50) reasons.push("Higher cost than average");
        }
    } else {
        costFit = 50;
    }

    // Experience factor (20% weight)
    const experience = Math.min(100, (vendor.total_events || 0) * 5);
    if (vendor.total_events && vendor.total_events > 10) reasons.push("Extensive experience");

    // On-time history (10% weight)
    const onTime = vendor.on_time_percentage || 50;
    if (onTime >= 95) reasons.push("Excellent punctuality");

    // Service overlap (15% weight)
    let serviceOverlapScore = 0;
    if (requiredServiceIds.length > 0) {
        const overlap = requiredServiceIds.filter(id => vendorServiceIds.includes(id));
        serviceOverlapScore = Math.round((overlap.length / requiredServiceIds.length) * 100);
        if (overlap.length === requiredServiceIds.length) {
            reasons.push("Covers all required services");
        } else if (overlap.length > 0) {
            reasons.push(`Matches ${overlap.length} of ${requiredServiceIds.length} services`);
        }
    }

    score = Math.round(
        (reliability * 0.3) +
        (costFit * 0.25) +
        (experience * 0.2) +
        (onTime * 0.1) +
        (serviceOverlapScore * 0.15)
    );

    return { score, reasons };
}

export function rankVendorsByMatch(
    event: Event,
    vendors: Vendor[],
    requiredServiceIds: string[] = [],
    vendorServicesById: Record<string, string[]> = {}
): VendorMatchResult[] {
    return vendors
        .map(vendor => {
            const vendorServiceIds = vendorServicesById[vendor.id] || [];
            const { score, reasons } = calculateMatchScore(vendor, event, requiredServiceIds, vendorServiceIds);
            return {
                vendor,
                score,
                estimated_cost: (vendor.cost_per_unit || 0) * event.guest_count,
                reasons
            };
        })
        .sort((a, b) => b.score - a.score);
}

export function calculateReliabilityScore(
    currentReliability: number,
    totalEvents: number,
    onTimePercentage: number,
    avgQualityRating: number
): number {
    const consistencyBonus = Math.min(100, (totalEvents / 20) * 100);

    return Math.round(
        (onTimePercentage * 0.4) +
        ((avgQualityRating / 5) * 100 * 0.4) +
        (consistencyBonus * 0.2)
    );
}
