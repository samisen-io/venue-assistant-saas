import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  LayoutDashboard,
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
  MapPin
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link className="flex items-center justify-center" href="#">
            <Building2 className="h-7 w-7 mr-2 text-blue-600" />
            <span className="text-xl font-bold">VenueManager</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors" href="#ai-features">
              AI Features
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors" href="#how-it-works">
              How It Works
            </Link>
            <div className="hidden sm:flex items-center gap-2 ml-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up Free</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <Badge variant="secondary" className="px-4 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Now with AI-Powered Vendor Communication
              </Badge>
              <div className="space-y-4 max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Master Your{" "}
                  <span className="text-blue-600">Venue Operations</span>
                </h1>
                <p className="mx-auto max-w-[800px] text-gray-600 text-lg md:text-xl lg:text-2xl">
                  The all-in-one platform for venue managers. Streamline vendor coordination, track budgets in real-time,
                  and let AI handle vendor outreach — all from a single dashboard.
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
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                How It Works
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 text-lg">
                Get started in minutes and streamline your venue operations.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Create Your Venue</h3>
                <p className="text-sm text-gray-500">
                  Set up your venue profile with capacity, type, and contact details.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Add Your Vendors</h3>
                <p className="text-sm text-gray-500">
                  Build your vendor database with categories, pricing, and contact info.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Plan Your Events</h3>
                <p className="text-sm text-gray-500">
                  Create events, set budgets, and let AI match the best vendors.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">4</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Track & Review</h3>
                <p className="text-sm text-gray-500">
                  Monitor budgets, complete events, and rate vendor performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Plus More Features
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 border">
                <UserCheck className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-medium">Client Management</h4>
                  <p className="text-sm text-gray-500">Track client info & history</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 border">
                <MapPin className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="font-medium">Spaces Management</h4>
                  <p className="text-sm text-gray-500">Manage rooms & areas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 border">
                <CalendarDays className="h-8 w-8 text-purple-600" />
                <div>
                  <h4 className="font-medium">Calendar View</h4>
                  <p className="text-sm text-gray-500">Visual event scheduling</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 border">
                <Clock className="h-8 w-8 text-amber-600" />
                <div>
                  <h4 className="font-medium">Communication Logs</h4>
                  <p className="text-sm text-gray-500">Track all vendor comms</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-blue-600">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center text-white">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Venue Management?
              </h2>
              <p className="mx-auto max-w-[600px] text-blue-100 text-lg">
                Join venue managers who are saving hours every week with VenueManager.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10">
                  <Link href="/login">
                    Sign In
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
                <li><Link href="#ai-features" className="hover:text-white transition-colors">AI Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
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
