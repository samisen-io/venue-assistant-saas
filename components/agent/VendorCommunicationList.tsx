'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VendorCommunication, Vendor } from '@/lib/types'
import { format } from 'date-fns'
import { Mail, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'

interface VendorCommunicationListProps {
  communications: (VendorCommunication & { vendor?: Vendor })[]
}

export function VendorCommunicationList({ communications }: VendorCommunicationListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Communications</CardTitle>
        <CardDescription>
          All email communications with vendors for this event
        </CardDescription>
      </CardHeader>
      <CardContent>
        {communications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No communications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {communications.map(comm => (
              <div
                key={comm.id}
                className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {comm.direction === 'outbound' ? (
                      <ArrowUpRight className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    )}
                    <div>
                      <h4 className="font-medium">{comm.vendor?.name || 'Unknown Vendor'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {comm.direction === 'outbound' ? 'To' : 'From'}: {comm.direction === 'outbound' ? comm.to_email : comm.from_email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={comm.direction === 'outbound' ? 'default' : 'secondary'}>
                      {comm.direction}
                    </Badge>
                    {comm.status && (
                      <Badge variant="outline" className="ml-2">
                        {comm.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">{comm.subject}</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {comm.body}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(
                        new Date(comm.sent_at || comm.received_at || comm.created_at!),
                        'MMM d, yyyy h:mm a'
                      )}
                    </span>
                    {comm.read_at && (
                      <span>Read: {format(new Date(comm.read_at), 'MMM d, h:mm a')}</span>
                    )}
                  </div>
                  {comm.requires_followup && (
                    <Badge variant="outline" className="text-xs">
                      Needs Follow-up
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
