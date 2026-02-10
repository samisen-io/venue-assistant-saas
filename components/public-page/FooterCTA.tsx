import { Button } from "@/components/ui/button"

interface FooterCTAProps {
  phone?: string | null
  email?: string | null
  hidePhone?: boolean
  hideEmail?: boolean
}

export function FooterCTA({ phone, email, hidePhone, hideEmail }: FooterCTAProps) {
  return (
    <section className="rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 p-8 text-white">
      <h2 className="text-2xl font-semibold">Ready to plan your event?</h2>
      <p className="mt-2 text-white/90">Check availability and get a custom quote in minutes.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild size="lg" className="min-h-11 bg-white text-emerald-800 hover:bg-white/90">
          <a href="#ai-chat">Start Planning</a>
        </Button>
        {!hidePhone && phone ? (
          <Button asChild variant="secondary" size="lg" className="min-h-11">
            <a href={`tel:${phone}`}>Call Us</a>
          </Button>
        ) : null}
        {!hideEmail && email ? (
          <Button asChild variant="secondary" size="lg" className="min-h-11">
            <a href={`mailto:${email}`}>Email Us</a>
          </Button>
        ) : null}
      </div>
    </section>
  )
}
