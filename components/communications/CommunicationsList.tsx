"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils/format"
import { ArrowDown, ArrowUp, Mail, Clock } from "lucide-react"

interface Communication {
  id: string
  vendor_id: string
  direction: 'inbound' | 'outbound'
  subject: string | null
  body: string
  from_email: string
  to_email: string
  sent_at: string | null
  read_at: string | null
  status: string | null
  vendor: {
    id: string
    name: string
    category: string
    contact_email: string
  }
}

interface Quote {
  id: string
  vendor_id: string
  total_cost: number
  status: string
  created_at: string
}

interface CommunicationsListProps {
  eventId: string
}

export function CommunicationsList({ eventId }: CommunicationsListProps) {
  const [communications, setCommunications] = useState<Communication[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCommunications()
    fetchQuotes()
  }, [eventId])

  const fetchCommunications = async () => {
    try {
      const res = await fetch(`/api/communications?eventId=${eventId}`)
      if (!res.ok) throw new Error("Failed to fetch communications")
      const data = await res.json()
      setCommunications(data)
    } catch (err) {
      setError("Failed to load communications")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchQuotes = async () => {
    try {
      const res = await fetch(`/api/quotes?eventId=${eventId}`)
      if (!res.ok) throw new Error("Failed to fetch quotes")
      const data = await res.json()
      setQuotes(data)
    } catch (err) {
      console.error("Failed to load quotes:", err)
    }
  }

  const handleApproveQuote = async (quoteId: string) => {
    if (!confirm("Approve this quote and assign vendor to event?")) return

    try {
      const res = await fetch(`/api/quotes/${quoteId}/approve`, {
        method: "POST",
      })

      if (!res.ok) throw new Error("Failed to approve quote")

      alert("Quote approved successfully!")
      fetchQuotes()
    } catch (err: any) {
      alert(`Error approving quote: ${err.message}`)
    }
  }

  const handleRejectQuote = async (quoteId: string) => {
    const reason = prompt("Reason for rejection (optional):")
    if (reason === null) return

    try {
      const res = await fetch(`/api/quotes/${quoteId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })

      if (!res.ok) throw new Error("Failed to reject quote")

      alert("Quote rejected")
      fetchQuotes()
    } catch (err: any) {
      alert(`Error rejecting quote: ${err.message}`)
    }
  }

  const getVendorQuotes = (vendorId: string) => {
    return quotes.filter(q => q.vendor_id === vendorId)
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'bounced': return 'bg-red-100 text-red-800'
      case 'replied': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Group communications by vendor
  const vendorGroups = communications.reduce((acc, comm) => {
    const vendorId = comm.vendor_id
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor: comm.vendor,
        communications: [],
      }
    }
    acc[vendorId].communications.push(comm)
    return acc
  }, {} as Record<string, { vendor: any; communications: Communication[] }>)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Clock className="h-5 w-5 animate-spin mr-2" />
            Loading communications...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (Object.keys(vendorGroups).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Communications Yet</CardTitle>
          <CardDescription>
            Click "Contact Vendors with AI" to start reaching out to vendors for quotes.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(vendorGroups).map(([vendorId, { vendor, communications: vendorComms }]) => {
        const vendorQuotes = getVendorQuotes(vendorId)
        const sortedComms = [...vendorComms].sort(
          (a, b) => new Date(b.sent_at || b.created_at).getTime() - new Date(a.sent_at || a.created_at).getTime()
        )

        return (
          <Card key={vendorId}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{vendor.name}</CardTitle>
                  <CardDescription>
                    {vendor.category} • {vendor.contact_email}
                  </CardDescription>
                </div>
                <Badge variant="outline">{vendorComms.length} messages</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Communications Thread */}
              <div className="space-y-3">
                {sortedComms.map((comm, idx) => (
                  <div key={comm.id}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${comm.direction === 'outbound' ? 'text-blue-600' : 'text-green-600'}`}>
                        {comm.direction === 'outbound' ? (
                          <ArrowUp className="h-5 w-5" />
                        ) : (
                          <ArrowDown className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comm.direction === 'outbound' ? 'You' : vendor.name}
                          </span>
                          <Badge variant="outline" className={getStatusColor(comm.status)}>
                            {comm.status || 'sent'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {comm.sent_at ? formatDate(comm.sent_at) : 'Sending...'}
                          </span>
                        </div>
                        {comm.subject && (
                          <p className="text-sm font-medium">{comm.subject}</p>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2">{comm.body}</p>
                      </div>
                    </div>
                    {idx < sortedComms.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>

              {/* Quotes Section */}
              {vendorQuotes.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Quotes Received</h4>
                    {vendorQuotes.map((quote) => (
                      <div key={quote.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-lg">
                              ${quote.total_cost.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Received {formatDate(quote.created_at)}
                            </p>
                          </div>
                          <Badge className={getQuoteStatusColor(quote.status)}>
                            {quote.status}
                          </Badge>
                        </div>
                        {quote.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveQuote(quote.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve & Assign
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectQuote(quote.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
