"use client";

import { useState } from "react";
import {
    MoreHorizontal,
    Mail,
    CheckCircle,
    CheckCircle2,
    XCircle,
    X,
    RefreshCw,
    MessageSquare,
    DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VendorOutreachStatus, VendorOutreachAction } from "@/lib/types/vendor-outreach.types";
import {
    getAvailableActions,
    getActionLabel,
    actionRequiresConfirmation
} from "@/lib/utils/vendorOutreachStatus";

interface VendorActionMenuProps {
    status: VendorOutreachStatus | null;
    vendorName: string;
    vendorHasEmail: boolean;
    onContact: () => Promise<void>;
    onMarkAvailable: (quotedAmount?: number) => Promise<void>;
    onMarkNotAvailable: () => Promise<void>;
    onConfirm: () => Promise<void>;
    onReject: (reason?: string) => Promise<void>;
    onViewThread: () => void;
    onUpdateQuote?: (amount: number) => Promise<void>;
    isLoading?: boolean;
}

const actionIcons: Record<VendorOutreachAction, React.ComponentType<{ className?: string }>> = {
    contact: Mail,
    mark_available: CheckCircle,
    mark_not_available: XCircle,
    confirm: CheckCircle2,
    reject: X,
    re_contact: RefreshCw,
    view_thread: MessageSquare,
    update_quote: DollarSign
};

export function VendorActionMenu({
    status,
    vendorName,
    vendorHasEmail,
    onContact,
    onMarkAvailable,
    onMarkNotAvailable,
    onConfirm,
    onReject,
    onViewThread,
    onUpdateQuote,
    isLoading = false
}: VendorActionMenuProps) {
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        action: VendorOutreachAction | null;
        title: string;
        description: string;
    }>({ open: false, action: null, title: "", description: "" });

    const [rejectReason, setRejectReason] = useState("");
    const [quotedAmount, setQuotedAmount] = useState<string>("");

    const availableActions = getAvailableActions(status);

    const handleAction = async (action: VendorOutreachAction) => {
        if (actionRequiresConfirmation(action)) {
            let title = "";
            let description = "";

            switch (action) {
                case "confirm":
                    title = `Confirm ${vendorName}?`;
                    description = "This will send a confirmation email to the vendor and mark them as confirmed for this event.";
                    break;
                case "reject":
                    title = `Reject ${vendorName}?`;
                    description = "The vendor will be marked as rejected. You can optionally provide a reason.";
                    break;
                case "mark_not_available":
                    title = `Mark ${vendorName} as Not Available?`;
                    description = "This will mark the vendor as unavailable for this event.";
                    break;
            }

            setConfirmDialog({ open: true, action, title, description });
            return;
        }

        // Actions that don't require confirmation
        await executeAction(action);
    };

    const executeAction = async (action: VendorOutreachAction) => {
        switch (action) {
            case "contact":
            case "re_contact":
                await onContact();
                break;
            case "mark_available":
                const amount = quotedAmount ? parseFloat(quotedAmount) : undefined;
                await onMarkAvailable(amount);
                setQuotedAmount("");
                break;
            case "mark_not_available":
                await onMarkNotAvailable();
                break;
            case "confirm":
                await onConfirm();
                break;
            case "reject":
                await onReject(rejectReason || undefined);
                setRejectReason("");
                break;
            case "view_thread":
                onViewThread();
                break;
            case "update_quote":
                if (onUpdateQuote && quotedAmount) {
                    await onUpdateQuote(parseFloat(quotedAmount));
                    setQuotedAmount("");
                }
                break;
        }
        setConfirmDialog({ open: false, action: null, title: "", description: "" });
    };

    const renderActionItem = (action: VendorOutreachAction) => {
        const Icon = actionIcons[action];
        const label = getActionLabel(action);
        const disabled = (action === "contact" || action === "re_contact") && !vendorHasEmail;

        return (
            <DropdownMenuItem
                key={action}
                onClick={() => handleAction(action)}
                disabled={disabled || isLoading}
                className="gap-2"
            >
                <Icon className="h-4 w-4" />
                {label}
                {disabled && <span className="text-xs text-muted-foreground ml-auto">(no email)</span>}
            </DropdownMenuItem>
        );
    };

    // Group actions by type
    const primaryActions = availableActions.filter(a =>
        ["contact", "re_contact", "confirm"].includes(a)
    );
    const responseActions = availableActions.filter(a =>
        ["mark_available", "mark_not_available"].includes(a)
    );
    const secondaryActions = availableActions.filter(a =>
        ["reject", "update_quote"].includes(a)
    );
    const viewActions = availableActions.filter(a => a === "view_thread");

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    {primaryActions.map(renderActionItem)}

                    {responseActions.length > 0 && primaryActions.length > 0 && (
                        <DropdownMenuSeparator />
                    )}
                    {responseActions.map(renderActionItem)}

                    {secondaryActions.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            {secondaryActions.map(renderActionItem)}
                        </>
                    )}

                    {viewActions.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            {viewActions.map(renderActionItem)}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Confirmation Dialog */}
            <AlertDialog
                open={confirmDialog.open}
                onOpenChange={(open: boolean) => {
                    if (!open) {
                        setConfirmDialog({ open: false, action: null, title: "", description: "" });
                        setRejectReason("");
                        setQuotedAmount("");
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Show reason input for reject action */}
                    {confirmDialog.action === "reject" && (
                        <div className="py-4">
                            <Label htmlFor="reject-reason">Reason (optional)</Label>
                            <Textarea
                                id="reject-reason"
                                placeholder="Enter reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="mt-2"
                            />
                        </div>
                    )}

                    {/* Show quote input for mark_available action */}
                    {confirmDialog.action === "mark_available" && (
                        <div className="py-4">
                            <Label htmlFor="quoted-amount">Quoted Amount (optional)</Label>
                            <Input
                                id="quoted-amount"
                                type="number"
                                placeholder="Enter quoted amount..."
                                value={quotedAmount}
                                onChange={(e) => setQuotedAmount(e.target.value)}
                                className="mt-2"
                            />
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => confirmDialog.action && executeAction(confirmDialog.action)}
                            className={
                                confirmDialog.action === "reject"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : confirmDialog.action === "confirm"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : ""
                            }
                        >
                            {confirmDialog.action === "confirm" ? "Confirm Vendor" :
                             confirmDialog.action === "reject" ? "Reject Vendor" :
                             "Continue"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
