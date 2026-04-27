"use client"

import { Mail, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SupportWidget() {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 mt-6">
            <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h3 className="font-semibold leading-none tracking-tight">Need Help?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
                We typically respond within 24 hours. Contact our support team for any issues or questions.
            </p>
            <Button variant="outline" className="w-full justify-start" asChild>
                <a href="mailto:support@venue-assistant.com">
                    <Mail className="mr-2 h-4 w-4" />
                    support@venue-assistant.com
                </a>
            </Button>
        </div>
    )
}
