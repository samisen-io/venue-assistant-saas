import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNav } from "@/components/landing/LandingNav";
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
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />

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
                  <Button asChild variant="outline" size="lg">
                    <Link href="#public-page-features">
                      See How It Works
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
                  <CardDescription>
                    Manage multiple venues from one account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Hotels, banquet halls, conference centers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Track capacity and venue types
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Manage multiple spaces per venue
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                    <CalendarDays className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Event Management</CardTitle>
                  <CardDescription>
                    Track events from planning to completion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Visual calendar with all events
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Status tracking: planning to completed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Guest count and budget planning
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Vendor Database</CardTitle>
                  <CardDescription>
                    Organize all your trusted vendors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Catering, AV, florals, security & more
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Contact info and pricing details
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Performance metrics at a glance
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                  <CardTitle>Smart Vendor Matching</CardTitle>
                  <CardDescription>
                    Find the perfect vendor for each event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      AI-powered scoring algorithm
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Reliability, cost fit, experience weighted
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Primary and backup vendor assignments
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle>Budget Tracking</CardTitle>
                  <CardDescription>
                    Real-time variance monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Per-category budget breakdown
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Quoted vs. actual cost tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Visual alerts for budget status
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle>Performance Reviews</CardTitle>
                  <CardDescription>
                    Build your trusted vendor network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Post-event vendor ratings
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Track on-time delivery & quality
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Automatic reliability score updates
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-cyan-100 flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-cyan-600" />
                  </div>
                  <CardTitle>Public Venue Pages</CardTitle>
                  <CardDescription>
                    Your venue's beautiful online presence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Photo galleries, pricing, testimonials
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      SEO-optimized for search engines
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Live preview and version history
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle>Lead Management</CardTitle>
                  <CardDescription>
                    Never miss a potential booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Auto-capture from AI chat conversations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Priority scoring & instant notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Full conversation history & insights
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>
                    Track your marketing performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Page views, chat engagement, conversions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Traffic sources and visitor behavior
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Lead-to-booking conversion funnel
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* AI Features Section */}
        <section id="ai-features" className="w-full py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
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
                      &quot;Corporate retreat for 150 people on March 15th, budget around $25,000. Need catering, AV setup, and maybe some team building activities.&quot;
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      AI extracts event details automatically
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Suggests vendor categories needed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Review and edit before saving
                    </li>
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

              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-green-600 flex items-center justify-center">
                      <Bot className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">AI Conversational Booking</CardTitle>
                      <CardDescription>24/7 lead qualification on your public page</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium">1</div>
                      <span className="text-sm">Understands event needs in natural language</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium">2</div>
                      <span className="text-sm">Checks real availability across all spaces</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium">3</div>
                      <span className="text-sm">Provides pricing estimates based on packages</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium">4</div>
                      <span className="text-sm">Captures leads and notifies you instantly</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Public Page Features Deep Dive */}
        <section id="public-page-features" className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Turn Your Venue Page Into a Lead Generation Machine
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 text-lg">
                Everything you need to attract, qualify, and convert prospects online.
              </p>
            </div>
            <div className="space-y-16">
              {/* Feature 1: Page Builder */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                    <Globe className="h-4 w-4" />
                    Public Page Builder
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    Create Your Perfect Venue Showcase
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Build a stunning public page with our intuitive editor. Add photos, describe your spaces,
                    set pricing packages, display testimonials, and customize every detail to match your brand.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Drag-and-drop photo galleries with sections</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Live preview with desktop/tablet/mobile views</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">SEO settings, social sharing, and Google Maps</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Version history with one-click restore</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-8 border-2 border-gray-300">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-400" />
                        <div className="h-3 w-3 rounded-full bg-yellow-400" />
                        <div className="h-3 w-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 text-center text-xs text-gray-400">your-venue.com</div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="h-16 bg-gray-200 rounded" />
                        <div className="h-16 bg-gray-200 rounded" />
                        <div className="h-16 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: AI Chat */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="order-2 lg:order-1 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-8 border-2 border-purple-200">
                  <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold">Chat Assistant</span>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="space-y-2 max-h-64 overflow-hidden">
                      <div className="flex gap-2">
                        <div className="bg-gray-100 rounded-lg p-2 text-xs max-w-[80%]">
                          Hi! What type of event are you planning?
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <div className="bg-blue-500 text-white rounded-lg p-2 text-xs max-w-[80%]">
                          Corporate event for 100 people
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="bg-gray-100 rounded-lg p-2 text-xs max-w-[80%]">
                          Perfect! When are you thinking? I can check our availability.
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="h-8 bg-gray-100 rounded flex items-center px-3 text-xs text-gray-400">
                        Type your message...
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                    <Bot className="h-4 w-4" />
                    AI Chat Assistant
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    Qualify Leads While You Sleep
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Your AI assistant engages prospects 24/7, asking the right questions to understand their needs,
                    checking availability, providing pricing, and capturing qualified leads automatically.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Natural conversation that feels human</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Real-time availability checking across all spaces</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Intelligent pricing suggestions from your packages</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Escalates to you when human touch is needed</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Feature 3: Leads & Proposals */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Leads & Proposals
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    Close More Deals, Faster
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Every conversation becomes a tracked lead with full context. Generate professional proposals
                    with one click, complete with pricing breakdowns and PDF downloads.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Priority scoring highlights your hottest leads</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Full chat transcript with AI insights</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">One-click proposal generation with PDF export</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Track proposal views and lead status</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-xl p-8 border-2 border-green-200">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3 text-white">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Leads Dashboard</span>
                        <Badge variant="secondary" className="bg-white/20">5 New</Badge>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🔥</div>
                          <div>
                            <div className="font-semibold text-sm">Sarah Johnson</div>
                            <div className="text-xs text-gray-500">Wedding - 150 guests</div>
                          </div>
                        </div>
                        <Button size="sm" className="h-7 text-xs">View</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">⚡</div>
                          <div>
                            <div className="font-semibold text-sm">Tech Corp</div>
                            <div className="text-xs text-gray-500">Corporate - 80 guests</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs">View</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🟢</div>
                          <div>
                            <div className="font-semibold text-sm">Marketing Team</div>
                            <div className="text-xs text-gray-500">Meeting - 25 guests</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs">View</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                How It Works
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 text-lg">
                From setup to generating leads — get started in minutes.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Build Your Page</h3>
                <p className="text-sm text-gray-500">
                  Set up your venue, add spaces, upload photos, configure pricing packages, and publish your beautiful public page.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Qualifies Leads</h3>
                <p className="text-sm text-gray-500">
                  AI chat engages visitors 24/7, checking availability, providing pricing, and capturing qualified lead information.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Send Proposals</h3>
                <p className="text-sm text-gray-500">
                  Generate professional proposals with one click, complete with pricing breakdowns and PDF downloads.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <CalendarDays className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Manage Events</h3>
                <p className="text-sm text-gray-500">
                  Plan events, coordinate vendors with AI assistance, track budgets, and review vendor performance.
                </p>
              </div>
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
              <p className="mx-auto max-w-[700px] text-gray-500 text-lg">
                A complete suite of tools to run your venue business.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <UserCheck className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Client Management</h4>
                  <p className="text-sm text-gray-500">Track client info & history</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <MapPin className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Spaces Management</h4>
                  <p className="text-sm text-gray-500">Manage rooms & areas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <CalendarDays className="h-8 w-8 text-purple-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Visual Calendar</h4>
                  <p className="text-sm text-gray-500">Event scheduling & conflicts</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <Clock className="h-8 w-8 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Communication Logs</h4>
                  <p className="text-sm text-gray-500">Track all vendor comms</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <Star className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Testimonials</h4>
                  <p className="text-sm text-gray-500">Collect & display reviews</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <BarChart3 className="h-8 w-8 text-orange-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Analytics & Insights</h4>
                  <p className="text-sm text-gray-500">Track performance metrics</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <Zap className="h-8 w-8 text-indigo-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Availability Calendar</h4>
                  <p className="text-sm text-gray-500">Public booking calendar</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border hover:border-blue-200 transition-colors">
                <Mail className="h-8 w-8 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Stay updated on leads</p>
                </div>
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
                14-Day Free Trial • No Credit Card Required
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Start Generating Leads for Your Venue Today
              </h2>
              <p className="mx-auto max-w-[700px] text-blue-100 text-lg">
                Join venue managers who are capturing more leads, saving hours every week, and growing their
                business with AI-powered automation.
              </p>
              <div className="flex flex-wrap justify-center gap-8 pt-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-300" />
                  <span>Public page in minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-300" />
                  <span>AI chat included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-300" />
                  <span>Full lead CRM</span>
                </div>
              </div>
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

      {/* Footer */}
      <footer className="w-full py-12 bg-gray-900 text-gray-400">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <Building2 className="h-6 w-6" />
                <span className="font-bold">VenueManager</span>
              </div>
              <p className="text-sm">
                The all-in-one platform for modern venue managers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#public-page-features" className="hover:text-white transition-colors">Public Pages</Link></li>
                <li><Link href="#ai-features" className="hover:text-white transition-colors">AI Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
            <p>© {new Date().getFullYear()} VenueManager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
