import { Search, SlidersHorizontal, MessageSquare, CalendarCheck } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Search",
    description:
      "Browse hundreds of venues by location, event type, guest count, and more.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: SlidersHorizontal,
    title: "Compare",
    description:
      "View photos, spaces, amenities, and pricing to find your perfect match.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Contact",
    description:
      "Send an inquiry directly to the venue or chat with their AI assistant.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: CalendarCheck,
    title: "Book",
    description:
      "Receive a proposal, confirm your date, and start planning your event.",
    color: "bg-amber-100 text-amber-600",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
            How It Works
          </h2>
          <p className="mx-auto max-w-[600px] text-gray-500 text-lg">
            Finding and booking your venue is simple. No account needed.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="text-center relative">
                {/* Connector line (hidden on mobile, first 3 items on desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
                )}
                <div
                  className={`mx-auto h-16 w-16 rounded-full ${step.color} flex items-center justify-center mb-4 relative z-10`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <div className="text-xs font-bold text-gray-400 mb-1">
                  STEP {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 max-w-[220px] mx-auto">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
