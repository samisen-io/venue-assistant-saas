import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import {
  agentMonitor,
  processVendorReply,
  sendFollowUp,
} from '@/lib/inngest/functions/agent-monitor'
import { startVendorOutreach } from '@/lib/inngest/functions/agent-outreach'

/**
 * Inngest API Route
 *
 * This route serves the Inngest functions and allows them to be triggered
 * by the Inngest platform.
 *
 * Documentation: https://www.inngest.com/docs/apps/cloud
 */

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    agentMonitor,
    processVendorReply,
    sendFollowUp,
    startVendorOutreach,
  ],
})
