import { CookieConsent } from "@/components/shared/CookieConsent"

export default function PublicVenueLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
      <CookieConsent />
    </div>
  )
}
