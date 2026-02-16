import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarketplaceNav } from "@/components/marketplace/MarketplaceNav"
import { MarketplaceFooter } from "@/components/marketplace/MarketplaceFooter"
import {
  ArrowRight,
  CalendarDays,
  Users,
  Building2,
  DollarSign,
  Star,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Clock,
  UserCheck,
  MapPin,
  Globe,
  Bot,
  BarChart3,
  FileText,
  Zap,
  Phone,
  Mail
} from "lucide-react"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "For Venue Managers | VenueManager",
  description:
    "The all-in-one platform for venue managers. Create stunning public pages, capture leads with AI chat, automate vendor coordination, and grow your venue business.",
}

export default function ForVenuesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketplaceNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <Badge variant="secondary" className="px-4 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Now with AI-Powered Public Pages & Lead Generation
              </Badge>
              <div className="space-y-4 max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Master Your{" "}
                  <span className="text-blue-600">Venue Operations</span>
                </h1>
                <p className="mx-auto max-w-[800px] text-gray-600 text-lg md:text-xl lg:text-2xl">
                  The all-in-one platform for venue managers. Create stunning public pages, capture leads with AI chat,
                  automate vendor coordination, and grow your venue business — all from a single dashboard.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link href="/login">
                    Access Dashboard
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Public Venue Pages - New Feature Highlight */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit">
                  <Zap className="h-3 w-3 mr-1" />
                  New Feature
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Beautiful Public Pages That Generate Leads
                </h2>
                <p className="text-gray-600 text-lg">
                  Create a stunning public-facing venue page with AI-powered chat that qualifies prospects,
                  checks availability, and captures leads automatically — 24/7, even while you sleep.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Globe className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Professional Public Pages</h4>
                      <p className="text-sm text-gray-600">Showcase photos, spaces, amenities, pricing, and testimonials with a beautiful, SEO-optimized page</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">AI Chat That Qualifies Leads</h4>
                      <p className="text-sm text-gray-600">AI assistant answers questions, checks availability, provides pricing, and captures contact info naturally</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BarChart3 className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Lead CRM & Analytics</h4>
                      <p className="text-sm text-gray-600">Track every inquiry, monitor conversion rates, and get instant notifications for high-priority leads</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Automated Proposals</h4>
                      <p className="text-sm text-gray-600">Generate professional PDF proposals with pricing breakdowns and send them with one click</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button asChild size="lg">
                    <Link href="/signup">
                      Create Your Public Page
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-medium">AI Chat Widget Active</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 bg-white/90 text-gray-800 rounded-lg p-3 text-sm">
                          Hi! I can help you plan your event. What type of event are you planning?
                        </div>
                      </div>
                      <div className="flex items-start gap-2 justify-end">
                        <div className="flex-1 bg-blue-500 rounded-lg p-3 text-sm max-w-[80%]">
                          Wedding reception for 150 guests in September
                        </div>
                        <div className="h-8 w-8 rounded-full bg-white/20 flex-shrink-0" />
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 bg-white/90 text-gray-800 rounded-lg p-3 text-sm">
                          Perfect! We have availability in September. Our Grand Ballroom can accommodate 150 guests comfortably. Would you like to see pricing options?
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        <span>Lead qualified & captured</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 border-white/30">High Priority</Badge>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl border-2 border-blue-100">
                  <div className="flex items-center gap-3">
                    <Mail className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-sm font-semibold">New Lead Alert</div>
                      <div className="text-xs text-gray-500">Sarah J. - Wedding 9/15</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Everything You Need to Manage Your Venue
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 text-lg">
                From event planning to vendor performance tracking, we have you covered.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Multi-Venue Management</CardTitle>
                  <CardDescription>Manage multiple venues from one account</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Hotels, banquet halls, conference centers</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Track capacity and venue types</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Manage multiple spaces per venue</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                    <CalendarDays className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Event Management</CardTitle>
                  <CardDescription>Track events from planning to completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Visual calendar with all events</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Status tracking: planning to completed</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Guest count and budget planning</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Vendor Database</CardTitle>
                  <CardDescription>Organize all your trusted vendors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Catering, AV, florals, security & more</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Contact info and pricing details</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Performance metrics at a glance</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                  <CardTitle>Smart Vendor Matching</CardTitle>
                  <CardDescription>Find the perfect vendor for each event</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />AI-powered scoring algorithm</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Reliability, cost fit, experience weighted</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Primary and backup vendor assignments</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle>Budget Tracking</CardTitle>
                  <CardDescription>Real-time variance monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Per-category budget breakdown</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Quoted vs. actual cost tracking</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Visual alerts for budget status</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle>Performance Reviews</CardTitle>
                  <CardDescription>Build your trusted vendor network</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Post-event vendor ratings</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Track on-time delivery & quality</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Automatic reliability score updates</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* AI Features Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Let AI Handle the Heavy Lifting
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 text-lg">
                Save hours every week with our intelligent automation features.
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center">
                      <Sparkles className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Natural Language Event Creation</CardTitle>
                      <CardDescription>Just describe your event in plain English</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border">
                    <p className="text-sm text-gray-500 mb-2">Example input:</p>
                    <p className="italic text-gray-700">
                      &quot;Corporate retreat for 150 people on March 15th, budget around $25,000.&quot;
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />AI extracts event details automatically</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Suggests vendor categories needed</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />Review and edit before saving</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-purple-600 flex items-center justify-center">
                      <MessageSquare className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">AI Vendor Communication Agent</CardTitle>
                      <CardDescription>Automated outreach and follow-ups</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium">1</div>
                      <span className="text-sm">AI drafts professional vendor emails</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium">2</div>
                      <span className="text-sm">Sends personalized outreach to vendors</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium">3</div>
                      <span className="text-sm">Extracts quotes from vendor responses</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium">4</div>
                      <span className="text-sm">Automatic follow-ups for non-responders</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Plus Everything Else You Need
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <UserCheck className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div><h4 className="font-medium">Client Management</h4><p className="text-sm text-gray-500">Track client info & history</p></div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <MapPin className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div><h4 className="font-medium">Spaces Management</h4><p className="text-sm text-gray-500">Manage rooms & areas</p></div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <CalendarDays className="h-8 w-8 text-purple-600 flex-shrink-0" />
                <div><h4 className="font-medium">Visual Calendar</h4><p className="text-sm text-gray-500">Event scheduling & conflicts</p></div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <Clock className="h-8 w-8 text-amber-600 flex-shrink-0" />
                <div><h4 className="font-medium">Communication Logs</h4><p className="text-sm text-gray-500">Track all vendor comms</p></div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <Star className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                <div><h4 className="font-medium">Testimonials</h4><p className="text-sm text-gray-500">Collect & display reviews</p></div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <BarChart3 className="h-8 w-8 text-orange-600 flex-shrink-0" />
                <div><h4 className="font-medium">Analytics & Insights</h4><p className="text-sm text-gray-500">Track performance metrics</p></div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <Zap className="h-8 w-8 text-indigo-600 flex-shrink-0" />
                <div><h4 className="font-medium">Availability Calendar</h4><p className="text-sm text-gray-500">Public booking calendar</p></div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <Mail className="h-8 w-8 text-red-600 flex-shrink-0" />
                <div><h4 className="font-medium">Email Notifications</h4><p className="text-sm text-gray-500">Stay updated on leads</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center text-white">
              <Badge variant="secondary" className="bg-white/20 border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                14-Day Free Trial
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Start Generating Leads for Your Venue Today
              </h2>
              <p className="mx-auto max-w-[700px] text-blue-100 text-lg">
                Join venue managers who are capturing more leads, saving hours every week, and growing their
                business with AI-powered automation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10">
                  <Link href="/pricing">
                    View Pricing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketplaceFooter />
    </div>
  )
}
