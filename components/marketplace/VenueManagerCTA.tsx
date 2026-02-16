import Link from "next/link"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function VenueManagerCTA() {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 text-center text-white">
          <Badge variant="secondary" className="bg-white/20 border-white/30 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            For Venue Managers
          </Badge>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl max-w-3xl">
            Are You a Venue Manager? Get Discovered by Event Planners
          </h2>
          <p className="mx-auto max-w-[700px] text-blue-100 text-lg">
            List your venue on our marketplace and let our AI-powered platform
            help you capture more leads, automate responses, and grow your business.
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-300" />
              <span>Beautiful public page</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-300" />
              <span>AI chat for lead qualification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-300" />
              <span>Marketplace visibility</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-lg px-8"
            >
              <Link href="/for-venues">
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10"
            >
              <Link href="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
