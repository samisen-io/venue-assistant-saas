"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface OnboardingChecklistProps {
    venueExists: boolean
    spacesCount: number
    photosCount: number
}

export function OnboardingChecklist({ venueExists, spacesCount, photosCount }: OnboardingChecklistProps) {
    const [dismissed, setDismissed] = useState(false)
    const [previewClicked, setPreviewClicked] = useState(false)

    useEffect(() => {
        const isDismissed = localStorage.getItem("onboarding_dismissed") === "true"
        const isPreviewed = localStorage.getItem("onboarding_previewed") === "true"
        setDismissed(isDismissed)
        setPreviewClicked(isPreviewed)
    }, [])

    const handlePreviewClick = () => {
        localStorage.setItem("onboarding_previewed", "true")
        setPreviewClicked(true)
    }

    const dismissChecklist = () => {
        localStorage.setItem("onboarding_dismissed", "true")
        setDismissed(true)
    }

    const steps = [
        { title: "Name your venue", completed: venueExists, link: "/settings/venue" },
        { title: "Add your first space", completed: spacesCount > 0, link: "/spaces/new" },
        { title: "Upload 3 photos", completed: photosCount >= 3, link: "/settings/venue/photos" },
        { title: "Preview public page", completed: previewClicked, link: "/venues/preview", onClick: handlePreviewClick },
    ]

    const completedCount = steps.filter(s => s.completed).length
    const progress = (completedCount / steps.length) * 100

    if (dismissed || completedCount === steps.length) return null

    return (
        <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Get Started</CardTitle>
                        <CardDescription>
                            Complete these steps to make your venue page live and start accepting bookings.
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={dismissChecklist}>
                        Dismiss
                    </Button>
                </div>
                <div className="mt-4 flex items-center gap-4">
                    <Progress value={progress} className="h-2 flex-1" />
                    <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                        {completedCount} / {steps.length}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {steps.map((step, idx) => (
                        <li key={idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                {step.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                )}
                                <span className={step.completed ? "line-through text-muted-foreground" : "font-medium"}>
                                    {step.title}
                                </span>
                            </div>
                            {!step.completed && step.link && (
                                <Button variant="link" size="sm" asChild onClick={step.onClick}>
                                    <Link href={step.link}>Do it now →</Link>
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
