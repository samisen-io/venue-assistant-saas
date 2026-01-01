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
    // Parse budget breakdown from event
    // Assume event.budget_breakdown is { "catering": 5000, ... }
    const budgetMap = event.budget_breakdown as Record<string, number> || {};

    // Group assignments by category
    const categories = new Set([
        ...Object.keys(budgetMap),
        ...assignments.map(a => a.category)
    ]);

    const breakdown: BudgetBreakdown[] = [];

    categories.forEach(category => {
        const budgeted = budgetMap[category] || 0;

        // Sum costs for this category
        const categoryAssignments = assignments.filter(a => a.category === category);

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
            category,
            budgeted,
            quoted,
            actual,
            variance
        });
    });

    return breakdown;
}
