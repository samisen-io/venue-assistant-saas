import {
    VendorOutreachStatus,
    VendorOutreachStatusInfo,
    VendorOutreachAction,
} from '@/lib/types/vendor-outreach.types';

/**
 * Status metadata for display and logic
 */
export const OUTREACH_STATUS_INFO: Record<VendorOutreachStatus, VendorOutreachStatusInfo> = {
    pending: {
        label: 'Pending',
        description: 'Vendor has not been contacted yet',
        color: 'gray',
        icon: 'Clock',
        isTerminal: false,
    },
    contacted: {
        label: 'Contacted',
        description: 'Initial outreach email has been sent',
        color: 'blue',
        icon: 'Send',
        isTerminal: false,
    },
    available: {
        label: 'Available',
        description: 'Vendor is available and quote is within budget',
        color: 'green',
        icon: 'CheckCircle',
        isTerminal: false,
    },
    not_available: {
        label: 'Not Available',
        description: 'Vendor declined or is unavailable for this event',
        color: 'gray',
        icon: 'XCircle',
        isTerminal: true,
    },
    needs_attention: {
        label: 'Needs Attention',
        description: 'Vendor is available but quoted over budget',
        color: 'yellow',
        icon: 'AlertTriangle',
        isTerminal: false,
    },
    confirmed: {
        label: 'Confirmed',
        description: 'Vendor has been confirmed for the event',
        color: 'green',
        icon: 'CheckCircle2',
        isTerminal: true,
    },
    rejected: {
        label: 'Rejected',
        description: 'Vendor was rejected by the venue manager',
        color: 'red',
        icon: 'X',
        isTerminal: true,
    },
};

/**
 * Get human-readable label for a status
 */
export function getStatusLabel(status: VendorOutreachStatus | null): string {
    if (!status) return 'Unknown';
    return OUTREACH_STATUS_INFO[status]?.label ?? 'Unknown';
}

/**
 * Get description for a status
 */
export function getStatusDescription(status: VendorOutreachStatus | null): string {
    if (!status) return '';
    return OUTREACH_STATUS_INFO[status]?.description ?? '';
}

/**
 * Get color coding for status badges
 */
export function getStatusColor(status: VendorOutreachStatus | null): string {
    if (!status) return 'gray';
    return OUTREACH_STATUS_INFO[status]?.color ?? 'gray';
}

/**
 * Get Tailwind CSS classes for status badge
 */
export function getStatusBadgeClasses(status: VendorOutreachStatus | null): string {
    const colorMap: Record<string, string> = {
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        red: 'bg-red-100 text-red-700 border-red-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    const color = getStatusColor(status);
    return colorMap[color] ?? colorMap.gray;
}

/**
 * Get Lucide icon name for a status
 */
export function getStatusIcon(status: VendorOutreachStatus | null): string {
    if (!status) return 'HelpCircle';
    return OUTREACH_STATUS_INFO[status]?.icon ?? 'HelpCircle';
}

/**
 * Check if a status is terminal (no further transitions expected)
 */
export function isTerminalStatus(status: VendorOutreachStatus | null): boolean {
    if (!status) return false;
    return OUTREACH_STATUS_INFO[status]?.isTerminal ?? false;
}

/**
 * Valid status transitions
 */
const VALID_TRANSITIONS: Record<VendorOutreachStatus, VendorOutreachStatus[]> = {
    pending: ['contacted'],
    contacted: ['available', 'not_available', 'needs_attention', 'rejected'],
    available: ['confirmed', 'rejected', 'contacted'], // contacted allows re-contact
    not_available: ['contacted'], // Allow re-contact
    needs_attention: ['confirmed', 'rejected', 'contacted'], // contacted allows re-contact
    confirmed: [], // Terminal - no transitions allowed
    rejected: ['contacted'], // Allow re-contact
};

/**
 * Check if a transition from one status to another is valid
 */
export function canTransitionTo(
    from: VendorOutreachStatus | null,
    to: VendorOutreachStatus
): boolean {
    // If no current status, only pending or contacted is allowed
    if (!from) {
        return to === 'pending' || to === 'contacted';
    }
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get list of valid statuses that can be transitioned to
 */
export function getValidTransitions(status: VendorOutreachStatus | null): VendorOutreachStatus[] {
    if (!status) return ['pending', 'contacted'];
    return VALID_TRANSITIONS[status] ?? [];
}

/**
 * Get available actions based on current status
 */
export function getAvailableActions(status: VendorOutreachStatus | null): VendorOutreachAction[] {
    const actions: VendorOutreachAction[] = ['view_thread'];

    switch (status) {
        case null:
        case 'pending':
            actions.push('contact');
            break;
        case 'contacted':
            actions.push('mark_available', 'mark_not_available', 'reject');
            break;
        case 'available':
            actions.push('confirm', 'reject', 'update_quote');
            break;
        case 'not_available':
            actions.push('re_contact');
            break;
        case 'needs_attention':
            actions.push('confirm', 'reject', 'update_quote');
            break;
        case 'confirmed':
            // Terminal state - limited actions
            break;
        case 'rejected':
            actions.push('re_contact');
            break;
    }

    return actions;
}

/**
 * Get action label for display
 */
export function getActionLabel(action: VendorOutreachAction): string {
    const labels: Record<VendorOutreachAction, string> = {
        contact: 'Contact Vendor',
        mark_available: 'Mark as Available',
        mark_not_available: 'Mark as Not Available',
        confirm: 'Confirm Vendor',
        reject: 'Reject Vendor',
        re_contact: 'Re-contact Vendor',
        view_thread: 'View Communications',
        update_quote: 'Update Quote',
    };
    return labels[action] ?? action;
}

/**
 * Get action icon for display
 */
export function getActionIcon(action: VendorOutreachAction): string {
    const icons: Record<VendorOutreachAction, string> = {
        contact: 'Mail',
        mark_available: 'CheckCircle',
        mark_not_available: 'XCircle',
        confirm: 'CheckCircle2',
        reject: 'X',
        re_contact: 'RefreshCw',
        view_thread: 'MessageSquare',
        update_quote: 'DollarSign',
    };
    return icons[action] ?? 'MoreHorizontal';
}

/**
 * Check if action requires confirmation dialog
 */
export function actionRequiresConfirmation(action: VendorOutreachAction): boolean {
    return ['confirm', 'reject', 'mark_not_available'].includes(action);
}

/**
 * Get statuses that indicate vendor can be worked with
 */
export function getWorkableStatuses(): VendorOutreachStatus[] {
    return ['available', 'needs_attention'];
}

/**
 * Get statuses that indicate awaiting response
 */
export function getAwaitingResponseStatuses(): VendorOutreachStatus[] {
    return ['contacted'];
}

/**
 * Sort vendors by outreach priority (most actionable first)
 */
export function sortByOutreachPriority(
    a: { outreach_status: VendorOutreachStatus | null },
    b: { outreach_status: VendorOutreachStatus | null }
): number {
    const priority: Record<VendorOutreachStatus, number> = {
        needs_attention: 1, // Highest priority - needs decision
        available: 2,       // Ready for confirmation
        contacted: 3,       // Awaiting response
        pending: 4,         // Not yet contacted
        confirmed: 5,       // Already handled
        rejected: 6,        // Already handled
        not_available: 7,   // Already handled
    };

    const aPriority = a.outreach_status ? priority[a.outreach_status] : 4;
    const bPriority = b.outreach_status ? priority[b.outreach_status] : 4;

    return aPriority - bPriority;
}
