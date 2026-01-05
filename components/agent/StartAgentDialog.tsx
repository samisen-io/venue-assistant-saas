'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Bot, Loader2 } from 'lucide-react'
import { Vendor } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface StartAgentDialogProps {
  eventId: string
  vendors: Vendor[]
  hasActiveRun: boolean
}

export function StartAgentDialog({ eventId, vendors, hasActiveRun }: StartAgentDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleToggleVendor = (vendorId: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    )
  }

  const handleSelectAll = () => {
    if (selectedVendors.length === vendors.length) {
      setSelectedVendors([])
    } else {
      setSelectedVendors(vendors.map(v => v.id))
    }
  }

  const handleStartAgent = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/agent/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          triggerType: 'manual',
          vendorIds: selectedVendors.length > 0 ? selectedVendors : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to start agent')
      }

      toast({
        title: 'Agent Started',
        description: result.message || 'The AI agent is now contacting vendors.',
      })

      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start the agent',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={hasActiveRun}>
          <Bot className="h-4 w-4 mr-2" />
          {hasActiveRun ? 'Agent Running' : 'Start AI Agent'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start AI Agent</DialogTitle>
          <DialogDescription>
            The AI agent will automatically contact vendors, collect quotes, and manage follow-ups.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Select Vendors</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedVendors.length === vendors.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose which vendors to contact. Leave empty to contact all vendors.
            </p>
          </div>

          {vendors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No vendors available for this venue
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
              {vendors.map(vendor => (
                <div
                  key={vendor.id}
                  className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
                >
                  <Checkbox
                    id={vendor.id}
                    checked={selectedVendors.includes(vendor.id)}
                    onCheckedChange={() => handleToggleVendor(vendor.id)}
                  />
                  <Label
                    htmlFor={vendor.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.contact_email}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-blue-900">What will the agent do?</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Send personalized outreach emails to selected vendors</li>
              <li>Monitor and process vendor responses automatically</li>
              <li>Extract quotes and pricing information using AI</li>
              <li>Send follow-up emails to non-responsive vendors after 24 hours</li>
              <li>Complete after 72 hours or when all vendors respond</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleStartAgent} disabled={isLoading || vendors.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Start Agent
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
