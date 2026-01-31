"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils/format"
import { ArrowDown, ArrowUp, Mail, Clock, Eye } from "lucide-react"

interface Communication {
  id: string
  vendor_id: string
  direction: 'inbound' | 'outbound'
  subject: string | null
  body: string
  from_email: string
  to_email: string
  sent_at: string | null
  created_at: string
  read_at: string | null
  status: string | null
  vendor: {
    id: string
    name: string
    contact_email: string
    vendor_services?: Array<{
      event_service_id: string
      event_services?: { name: string } | null
    }>
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
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Communication['vendor'] | null>(null)

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
                    {((vendor.vendor_services || [])[0]?.event_services?.name || "Service")} - {vendor.contact_email}
                  </CardDescription>
                </div>
                <Badge variant="outline">{vendorComms.length} messages</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Communications Thread */}
              <div className="space-y-1">
                {sortedComms.map((comm) => (
                  <div
                    key={comm.id}
                    className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded cursor-pointer hover:bg-muted/50 transition-colors group"
                    onClick={() => {
                      setSelectedCommunication(comm)
                      setSelectedVendor(vendor)
                    }}
                  >
                    <div className={comm.direction === 'outbound' ? 'text-blue-600' : 'text-green-600'}>
                      {comm.direction === 'outbound' ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground w-16 shrink-0">
                      {comm.sent_at ? formatDate(comm.sent_at) : 'Sending...'}
                    </span>
                    <span className="text-sm truncate flex-1">
                      {comm.subject || comm.body.slice(0, 60)}
                    </span>
                    <Badge variant="outline" className={`${getStatusColor(comm.status)} text-xs shrink-0`}>
                      {comm.status || 'sent'}
                    </Badge>
                    <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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

      {/* Communication Detail Modal */}
      <Dialog
        open={!!selectedCommunication}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCommunication(null)
            setSelectedVendor(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedCommunication && selectedVendor && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className={selectedCommunication.direction === 'outbound' ? 'text-blue-600' : 'text-green-600'}>
                    {selectedCommunication.direction === 'outbound' ? (
                      <ArrowUp className="h-5 w-5" />
                    ) : (
                      <ArrowDown className="h-5 w-5" />
                    )}
                  </div>
                  <DialogTitle>
                    {selectedCommunication.direction === 'outbound' ? 'Sent Message' : 'Received Message'}
                  </DialogTitle>
                  <Badge variant="outline" className={getStatusColor(selectedCommunication.status)}>
                    {selectedCommunication.status || 'sent'}
                  </Badge>
                </div>
                <DialogDescription>
                  Communication with {selectedVendor.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Email Details */}
                <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                  <span className="font-medium text-muted-foreground">From:</span>
                  <span>{selectedCommunication.from_email}</span>

                  <span className="font-medium text-muted-foreground">To:</span>
                  <span>{selectedCommunication.to_email}</span>

                  <span className="font-medium text-muted-foreground">Date:</span>
                  <span>
                    {selectedCommunication.sent_at
                      ? formatDate(selectedCommunication.sent_at)
                      : 'Sending...'}
                  </span>

                  {selectedCommunication.read_at && (
                    <>
                      <span className="font-medium text-muted-foreground">Read:</span>
                      <span>{formatDate(selectedCommunication.read_at)}</span>
                    </>
                  )}
                </div>

                <Separator />

                {/* Subject */}
                {selectedCommunication.subject && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Subject</h4>
                    <p className="font-medium">{selectedCommunication.subject}</p>
                  </div>
                )}

                {/* Full Message Body */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Message</h4>
                  <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm">
                    {selectedCommunication.body}
                  </div>
                </div>

                {/* Vendor Info */}
                <Separator />
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{selectedVendor.name}</p>
                    <p className="text-muted-foreground">
                      {(selectedVendor.vendor_services || [])[0]?.event_services?.name || 'Vendor'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
