"use client";

import { ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

interface UpgradePromptProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message?: string;
    resource?: string;
}

export function UpgradePrompt({ open, onOpenChange, message, resource }: UpgradePromptProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto mb-4 bg-blue-50 p-3 rounded-full">
                        <ArrowUpCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <DialogTitle className="text-center">
                        Upgrade Your Plan
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {message || `You've reached your ${resource || "resource"} limit on your current plan.`}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-4">
                    <Button asChild>
                        <Link href="/pricing">View Plans</Link>
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Maybe Later
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
