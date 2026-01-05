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

        console.log(`🤖 Inngest: Starting outreach for Agent Run ${agentRunId}`)

        // Step 1: Fetch event and target vendors
        const { eventData, targetVendors } = (await step.run('fetch-data', async () => {
            console.log('📋 Inngest: Fetching event and vendor data...')
            const supabase = createAdminClient()

            // Fetch event data
            const { data: eventResult, error: eventError } = await supabase
                .from('events')
                .select('*, venue:venues(*)')
                .eq('id', eventId)
                .single()

            if (eventError || !eventResult) {
                throw new Error(`Event not found: ${eventId}`)
            }

            // Fetch vendors for the venue
            const { data: allVendors, error: vendorsError } = await supabase
                .from('vendors')
                .select('*, vendor_services (event_service_id, event_services (id, name, slug))')
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

        console.log(`🎯 Inngest: Targeted ${targetVendors.length} vendors`)

        if (targetVendors.length === 0) {
            return { message: 'No vendors to contact' }
        }

        // Step 2: Contact each vendor
        const results = []
        let contactedCount = 0
        const supabase = createAdminClient()

        for (const mv of targetVendors) {
            const vendor = mv.vendor
            console.log(`📤 Inngest: Contacting ${vendor.name}...`)

            const result = await step.run(`contact-vendor-${vendor.id}`, async () => {
                return await orchestrator.contactSingleVendor(
                    agentRunId,
                    eventData,
                    vendor,
                    supabase
                )
            })

            if (result.success) {
                contactedCount++
                // Update running count in DB for UI progress bar
                await step.run(`update-progress-${vendor.id}`, async () => {
                    await (supabase as any)
                        .from('agent_runs')
                        .update({
                            vendors_contacted: contactedCount,
                            last_activity_at: new Date().toISOString()
                        })
                        .eq('id', agentRunId)
                })
            }

            results.push({ vendorId: vendor.id, ...result })

            // Add delay between vendors to avoid rate limits
            await step.sleep(`delay-${vendor.id}`, '1s')
        }

        return {
            message: `Completed outreach for ${targetVendors.length} vendors. Successfully contacted ${contactedCount}.`,
            results
        }
    }
)
