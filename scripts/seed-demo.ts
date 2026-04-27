import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDemo() {
    console.log("Seeding demo environment: The Grand Oak Event Space")

    // 1. Create a dummy demo user (if it doesn't exist)
    const DEMO_EMAIL = "demo@grandoakevents.com"
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: "demoPassword123!",
        email_confirm: true,
    })

    let userId = authData.user?.id
    if (authError && authError.message.includes('already been registered')) {
        const { data: users } = await supabase.auth.admin.listUsers()
        const user = users.users.find(u => u.email === DEMO_EMAIL)
        userId = user?.id
    }

    if (!userId) {
        console.error("Failed to get/create demo user", authError)
        return
    }

    // Update profile
    await supabase.from('profiles').upsert({
        id: userId,
        full_name: 'Demo Manager',
        company_name: 'The Grand Oak',
        phone: '555-0199',
    })

    // Set subscription to enterprise for unlimited access in demo
    await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan_tier: 'enterprise',
        status: 'active',
    })

    // 2. Create Venue
    const { data: venue, error: venueError } = await supabase.from('venues').upsert({
        owner_id: userId,
        name: 'The Grand Oak Event Space',
        slug: 'grand-oak-demo',
        address: '123 Oak Lane',
        city: 'Nashville',
        state: 'TN',
        zip: '37201',
        description: 'A beautiful, historic banquet hall blending rustic charm with modern elegance.',
        venue_type: 'Banquet Hall',
        is_default: true,
        page_status: 'published'
    }).select().single()

    if (venueError || !venue) {
        console.error("Failed to create venue", venueError)
        return
    }

    // 3. Create Spaces
    const spacesToInsert = [
        {
            venue_id: venue.id,
            name: 'The Grand Ballroom',
            capacity_seated: 250,
            capacity_standing: 300,
            hourly_rate: 350,
            type: 'Ballroom'
        },
        {
            venue_id: venue.id,
            name: 'The Garden Terrace',
            capacity_seated: 80,
            capacity_standing: 120,
            hourly_rate: 150,
            type: 'Outdoor'
        }
    ]
    
    await supabase.from('spaces').upsert(spacesToInsert)

    // 4. Set public settings / AI settings
    await supabase.from('venue_ai_settings').upsert({
        venue_id: venue.id,
        is_enabled: true,
        auto_respond: true,
        welcome_message: "Hi! Welcome to The Grand Oak. I can help you check our availability, pricing, and answer questions about the venue.",
        system_prompt: "You are an AI assistant for The Grand Oak Event Space in Nashville. Answer politely. If asked about availability, check the dates.",
    })

    console.log("✅ Demo environment seeded successfully!")
    console.log(`Demo URL: /venues/public/grand-oak-demo`)
}

seedDemo().catch(console.error)
