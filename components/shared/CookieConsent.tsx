"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent")
        if (!consent) {
            setShowConsent(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem("cookie_consent", "true")
        setShowConsent(false)
    }

    if (!showConsent) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4 shadow-lg md:flex md:items-center md:justify-between">
            <div className="mb-4 md:mb-0 md:mr-4">
                <p className="text-sm text-muted-foreground">
                    We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies.
                </p>
                <Link href="/privacy" className="text-sm font-medium underline text-primary hover:text-primary/80">
                    Read our Privacy Policy
                </Link>
            </div>
            <div className="flex gap-2 shrink-0">
                <Button onClick={handleAccept} className="w-full md:w-auto">
                    Accept
                </Button>
            </div>
        </div>
    )
}
