import { Building2, CalendarDays, Users, Star } from "lucide-react"
import { createServiceRoleClient } from "@/lib/supabase/server"

async function getMarketplaceStats() {
  const supabase = createServiceRoleClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = supabase as any

  const [venueResult, eventResult, leadResult] = await Promise.all([
    s
      .from("venues")
      .select("id", { count: "exact", head: true })
      .eq("page_status", "published"),
    s
      .from("events")
      .select("id", { count: "exact", head: true }),
    s
      .from("leads")
      .select("id", { count: "exact", head: true }),
  ])

  return {
    venues: venueResult.count || 0,
    events: eventResult.count || 0,
    inquiries: leadResult.count || 0,
  }
}

export async function SocialProof() {
  const stats = await getMarketplaceStats()

  const metrics = [
    {
      icon: Building2,
      value: stats.venues,
      label: "Venues Listed",
      color: "text-blue-600",
    },
    {
      icon: CalendarDays,
      value: stats.events,
      label: "Events Hosted",
      color: "text-purple-600",
    },
    {
      icon: Users,
      value: stats.inquiries,
      label: "Inquiries Sent",
      color: "text-green-600",
    },
    {
      icon: Star,
      value: "4.8",
      label: "Average Rating",
      color: "text-amber-500",
    },
  ]

  return (
    <section className="w-full py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
            Trusted by Venue Managers Across Texas
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.label} className="text-center">
                <Icon className={`h-8 w-8 ${metric.color} mx-auto mb-3`} />
                <div className="text-3xl md:text-4xl font-bold mb-1">
                  {typeof metric.value === "number"
                    ? metric.value.toLocaleString()
                    : metric.value}
                  {typeof metric.value === "number" && "+"}
                </div>
                <div className="text-sm text-gray-500">{metric.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
