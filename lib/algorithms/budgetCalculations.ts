import { Event, EventVendor, BudgetBreakdown } from '../types'

export function calculateBudgetVariance(budgeted: number, actual: number): number {
    return budgeted - actual
}

export function calculateVariancePercentage(budgeted: number, actual: number): number {
    if (budgeted === 0) return 0;
    return ((actual - budgeted) / budgeted) * 100;
}

export function getBudgetStatus(variancePercentage: number): "UNDER_BUDGET" | "ON_TRACK" | "OVER_BUDGET" {
    if (variancePercentage > 10) return "OVER_BUDGET";
    if (variancePercentage < -5) return "UNDER_BUDGET"; // Saved more than 5%
    return "ON_TRACK";
}

export function calculateCategoryBreakdown(
    event: Event,
    assignments: EventVendor[]
): BudgetBreakdown[] {
    const requirements = (event as any).event_service_requirements || [];
    const budgetMap = new Map(
        requirements.map((req: any) => [req.event_service_id, req.budget_amount || 0])
    );
    const nameMap = new Map(
        requirements.map((req: any) => [req.event_service_id, req.event_services?.name || 'Service'])
    );

    // Group assignments by service
    const serviceIds = new Set([
        ...Array.from(budgetMap.keys()),
        ...assignments.map(a => a.event_service_id)
    ]);

    const breakdown: BudgetBreakdown[] = [];

    serviceIds.forEach(serviceId => {
        const budgeted = budgetMap.get(serviceId) || 0;

        // Sum costs for this service
        const categoryAssignments = assignments.filter(a => a.event_service_id === serviceId);

        let quoted = 0;
        let actual = 0;

        categoryAssignments.forEach(a => {
            // Only count primary assignments
            if (a.assignment_type === 'primary') {
                quoted += a.quoted_cost || 0;
                actual += a.actual_cost || 0;
            }
        });

        // Use actual if available (event done), otherwise quoted
        const spent = actual > 0 ? actual : quoted;
        const variance = budgeted - spent; // Positive = Under budget (Good), Negative = Over budget

        breakdown.push({
            event_service_id: serviceId,
            event_service_name: nameMap.get(serviceId) || 'Service',
            budgeted,
            quoted,
            actual,
            variance
        });
    });

    return breakdown;
}
