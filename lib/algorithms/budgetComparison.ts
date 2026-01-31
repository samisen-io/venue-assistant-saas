import { BudgetComparison, BudgetComparisonResult } from '@/lib/types/vendor-outreach.types';

/**
 * Default tolerance percentage for budget comparison
 * Vendors quoting more than this percentage over budget will be flagged
 */
export const DEFAULT_BUDGET_TOLERANCE_PERCENT = 10;

/**
 * Check how a quoted cost compares to the allocated budget
 *
 * @param quotedCost - The vendor's quoted cost
 * @param budgetAmount - The allocated budget for the service
 * @returns 'within' | 'over' | 'under' | 'unknown'
 */
export function checkQuoteAgainstBudget(
    quotedCost: number | null | undefined,
    budgetAmount: number | null | undefined
): BudgetComparisonResult {
    // Can't compare if either value is missing
    if (quotedCost === null || quotedCost === undefined) return 'unknown';
    if (budgetAmount === null || budgetAmount === undefined) return 'unknown';
    if (budgetAmount === 0) return 'unknown';

    if (quotedCost <= budgetAmount) {
        return quotedCost < budgetAmount * 0.9 ? 'under' : 'within';
    }
    return 'over';
}

/**
 * Calculate the variance between quoted cost and budget
 *
 * @param quotedCost - The vendor's quoted cost
 * @param budgetAmount - The allocated budget for the service
 * @returns Variance percentage (positive = over budget, negative = under budget)
 */
export function calculateBudgetVariance(
    quotedCost: number | null | undefined,
    budgetAmount: number | null | undefined
): number {
    if (quotedCost === null || quotedCost === undefined) return 0;
    if (budgetAmount === null || budgetAmount === undefined) return 0;
    if (budgetAmount === 0) return 0;

    return ((quotedCost - budgetAmount) / budgetAmount) * 100;
}

/**
 * Calculate the absolute variance amount
 */
export function calculateVarianceAmount(
    quotedCost: number | null | undefined,
    budgetAmount: number | null | undefined
): number {
    if (quotedCost === null || quotedCost === undefined) return 0;
    if (budgetAmount === null || budgetAmount === undefined) return 0;

    return quotedCost - budgetAmount;
}

/**
 * Determine if a quote should be flagged for attention
 *
 * @param quotedCost - The vendor's quoted cost
 * @param budgetAmount - The allocated budget for the service
 * @param tolerancePercent - Percentage over budget before flagging (default 10%)
 * @returns true if the quote exceeds the tolerance threshold
 */
export function shouldFlagForAttention(
    quotedCost: number | null | undefined,
    budgetAmount: number | null | undefined,
    tolerancePercent: number = DEFAULT_BUDGET_TOLERANCE_PERCENT
): boolean {
    const variance = calculateBudgetVariance(quotedCost, budgetAmount);
    return variance > tolerancePercent;
}

/**
 * Get comprehensive budget comparison details
 *
 * @param quotedCost - The vendor's quoted cost
 * @param budgetAmount - The allocated budget for the service
 * @param tolerancePercent - Percentage over budget before flagging (default 10%)
 * @returns Full budget comparison details
 */
export function compareBudget(
    quotedCost: number | null | undefined,
    budgetAmount: number | null | undefined,
    tolerancePercent: number = DEFAULT_BUDGET_TOLERANCE_PERCENT
): BudgetComparison {
    const result = checkQuoteAgainstBudget(quotedCost, budgetAmount);
    const variancePercent = calculateBudgetVariance(quotedCost, budgetAmount);
    const varianceAmount = calculateVarianceAmount(quotedCost, budgetAmount);
    const shouldFlag = shouldFlagForAttention(quotedCost, budgetAmount, tolerancePercent);

    return {
        result,
        quotedCost: quotedCost ?? 0,
        budgetAmount: budgetAmount ?? 0,
        varianceAmount,
        variancePercent,
        shouldFlagAttention: shouldFlag,
    };
}

/**
 * Format variance for display
 *
 * @param variancePercent - The variance percentage
 * @returns Formatted string like "+15%" or "-5%"
 */
export function formatVariancePercent(variancePercent: number): string {
    const sign = variancePercent >= 0 ? '+' : '';
    return `${sign}${variancePercent.toFixed(1)}%`;
}

/**
 * Format variance amount for display
 *
 * @param varianceAmount - The variance amount
 * @param currency - Currency symbol (default '$')
 * @returns Formatted string like "+$500" or "-$200"
 */
export function formatVarianceAmount(varianceAmount: number, currency: string = '$'): string {
    const sign = varianceAmount >= 0 ? '+' : '';
    const absAmount = Math.abs(varianceAmount);
    return `${sign}${currency}${absAmount.toLocaleString()}`;
}

/**
 * Get color class for budget variance display
 *
 * @param variancePercent - The variance percentage
 * @returns Tailwind color class
 */
export function getVarianceColorClass(variancePercent: number): string {
    if (variancePercent <= -10) return 'text-green-600'; // Significantly under budget
    if (variancePercent <= 0) return 'text-green-500';   // Under or at budget
    if (variancePercent <= 10) return 'text-yellow-600'; // Slightly over budget
    if (variancePercent <= 25) return 'text-orange-600'; // Moderately over budget
    return 'text-red-600'; // Significantly over budget
}

/**
 * Get background color class for budget status
 */
export function getVarianceBgClass(variancePercent: number): string {
    if (variancePercent <= 0) return 'bg-green-50';
    if (variancePercent <= 10) return 'bg-yellow-50';
    if (variancePercent <= 25) return 'bg-orange-50';
    return 'bg-red-50';
}

/**
 * Determine the appropriate outreach status based on vendor response and quote
 *
 * @param isAvailable - Whether the vendor indicated they are available
 * @param quotedCost - The vendor's quoted cost
 * @param budgetAmount - The allocated budget for the service
 * @param tolerancePercent - Percentage over budget before flagging
 * @returns The recommended outreach status
 */
export function determineStatusFromResponse(
    isAvailable: boolean,
    quotedCost: number | null | undefined,
    budgetAmount: number | null | undefined,
    tolerancePercent: number = DEFAULT_BUDGET_TOLERANCE_PERCENT
): 'available' | 'not_available' | 'needs_attention' {
    if (!isAvailable) {
        return 'not_available';
    }

    if (shouldFlagForAttention(quotedCost, budgetAmount, tolerancePercent)) {
        return 'needs_attention';
    }

    return 'available';
}

/**
 * Get a human-readable budget status message
 */
export function getBudgetStatusMessage(comparison: BudgetComparison): string {
    if (comparison.result === 'unknown') {
        return 'Budget information not available';
    }

    if (comparison.result === 'under') {
        return `Under budget by ${formatVarianceAmount(Math.abs(comparison.varianceAmount))} (${Math.abs(comparison.variancePercent).toFixed(1)}%)`;
    }

    if (comparison.result === 'within') {
        return 'Within budget';
    }

    // Over budget
    return `Over budget by ${formatVarianceAmount(comparison.varianceAmount)} (${comparison.variancePercent.toFixed(1)}%)`;
}
