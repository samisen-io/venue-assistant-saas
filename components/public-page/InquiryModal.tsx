"use client"

import { useState } from "react"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InquiryForm } from "./InquiryForm"

interface InquiryModalProps {
  slug: string
}

export function InquiryModal({ slug }: InquiryModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Mail className="mr-2 h-4 w-4" />
          Send an Inquiry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send an Inquiry</DialogTitle>
        </DialogHeader>
        {/* key resets form state when modal reopens after a submission */}
        <InquiryForm key={String(open)} slug={slug} showTitle={false} className="space-y-4" />
      </DialogContent>
    </Dialog>
  )
}
