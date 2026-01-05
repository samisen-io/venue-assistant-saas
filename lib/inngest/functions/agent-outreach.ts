import { inngest } from '../client'
import { getAgentOrchestrator } from '@/lib/agent/orchestrator'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Agent Outreach Function
 * 
 * This function is triggered when an agent run is started.
 * It handles contacting multiple vendors in the background reliably.
 */
export const startVendorOutreach = inngest.createFunction(
    {
        id: 'start-vendor-outreach',
        name: 'Start Vendor Outreach',
        concurrency: 5, // Process up to 5 events concurrently
    },
    { event: 'agent/outreach.started' },
    async ({ event, step }) => {
        const { agentRunId, eventId, vendorIds } = event.data
        const orchestrator = getAgentOrchestrator()

        // Step 1: Fetch event and target vendors
        const { eventData, targetVendors } = (await step.run('fetch-data', async () => {
            const supabase = createAdminClient()

            // Fetch event data
            const { data: eventResult, error: eventError } = await supabase
                .from('events')
                .select(`
          *,
          venue:venues(*)
        `)
                .eq('id', eventId)
                .single()

            if (eventError || !eventResult) {
                throw new Error(`Event not found: ${eventId}`)
            }

            // Fetch vendors for the venue
            const { data: allVendors, error: vendorsError } = await supabase
                .from('vendors')
                .select(`
          *,
          vendor_services (
            event_service_id,
            event_services (id, name, slug)
          )
        `)
                .eq('venue_id', (eventResult as any).venue.id)

            if (vendorsError) {
                throw new Error(`Failed to fetch vendors: ${vendorsError.message}`)
            }

            // Filter vendors
            let filteredVendors = allVendors || []
            if (vendorIds && vendorIds.length > 0) {
                filteredVendors = filteredVendors.filter((v: any) => vendorIds.includes(v.id))
            }

            // Wrap for orchestrator
            const wrappedVendors = filteredVendors.map((v: any) => ({ vendor: v }))

            return {
                eventData: eventResult,
                targetVendors: wrappedVendors
            }
        })) as any

        if (targetVendors.length === 0) {
            return { message: 'No vendors to contact' }
        }

        // Step 2: Contact each vendor
        const results = []
        const supabase = createAdminClient()

        for (const mv of targetVendors) {
            const result = await step.run(`contact-vendor-${mv.vendor.id}`, async () => {
                try {
                    return await orchestrator.contactSingleVendor(
                        agentRunId,
                        eventData,
                        mv.vendor,
                        supabase
                    )
                } catch (error: any) {
                    return { success: false, error: error.message }
                }
            })

            results.push({ vendorId: mv.vendor.id, ...result })

            // Add delay between vendors
            await step.sleep(`delay-${mv.vendor.id}`, '1s')
        }

        return {
            message: `Completed outreach for ${targetVendors.length} vendors`,
            results
        }
    }
)
