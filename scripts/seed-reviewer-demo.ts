/**
 * Seed (or repair) the reviewer demo workspace — idempotent.
 *
 * Why this exists: scripts/seed-demo.ts creates a NEW venue every run (its upsert
 * has no conflict key), so re-running it pollutes the database. This script is
 * safe to run repeatedly: it resolves the demo venue by slug, reuses its owner
 * and only updates the password, then fills in anything missing.
 *
 * Usage (against whichever environment .env.local points at):
 *   npx tsx scripts/seed-reviewer-demo.ts
 *   DEMO_EMAIL=you@example.com DEMO_PASSWORD='...' npx tsx scripts/seed-reviewer-demo.ts
 *
 * It prints the credentials to paste into the Vercel env var NEXT_PUBLIC_DEMO_LOGIN
 * (format: "email / password") so the login page can offer them to reviewers.
 */
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in the environment (.env.local).')
  process.exit(1)
}

const EMAIL = process.env.DEMO_EMAIL || 'demo@venuemanager.pro'
const PASSWORD = process.env.DEMO_PASSWORD || `Vm-${randomBytes(6).toString('base64url')}!`
const VENUE_SLUG = 'reviewer-demo-workspace'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

async function main() {
  console.log(`Reviewer demo seed → ${SUPABASE_URL}`)
  console.log(`  email: ${EMAIL}`)

  // 1. Resolve the demo user: reuse the owner of the demo venue when it exists,
  //    otherwise create the account.
  let userId: string | undefined
  const { data: existingVenue } = await supabase
    .from('venues')
    .select('id, owner_id, slug')
    .eq('slug', VENUE_SLUG)
    .maybeSingle()

  if (existingVenue?.owner_id) {
    userId = existingVenue.owner_id
    console.log('  venue exists → reusing its owner (idempotent run)')
  } else {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    })
    if (createErr && !/registered|exists/i.test(createErr.message)) {
      console.error('Failed to create the demo user:', createErr.message)
      process.exit(1)
    }
    userId = created?.user?.id
    if (!userId && /registered|exists/i.test(createErr?.message || '')) {
      // Account exists from an earlier run but its venue is gone: page the user
      // list to find it, instead of creating a duplicate.
      const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
      userId = list?.users?.find((u) => u.email?.toLowerCase() === EMAIL.toLowerCase())?.id
    }
  }

  if (!userId) {
    console.error('Could not resolve or create the demo user — aborting before writing anything.')
    process.exit(1)
  }

  // 2. Make sure the published password is the one we are about to hand out.
  const { error: pwErr } = await supabase.auth.admin.updateUserById(userId, {
    password: PASSWORD,
    email_confirm: true,
  })
  if (pwErr) {
    console.error('Failed to set the demo password:', pwErr.message)
    process.exit(1)
  }

  // 3. Profile, subscription (unlimited for review), venue, spaces, AI settings.
  await supabase.from('profiles').upsert(
    {
      id: userId,
      full_name: 'Demo Manager',
      company_name: 'VenueManager demo workspace',
      phone: '555-0100',
    },
    { onConflict: 'id' }
  )

  await supabase.from('subscriptions').upsert(
    { user_id: userId, plan_tier: 'enterprise', status: 'active' },
    { onConflict: 'user_id' }
  )

  const { data: venue, error: venueErr } = await supabase
    .from('venues')
    .upsert(
      {
        owner_id: userId,
        name: 'Riverside Pavilion (demo)',
        slug: VENUE_SLUG,
        address: '100 Sample Street',
        city: 'Hyderabad',
        state: 'Telangana',
        zip: '500081',
        description:
          'Demonstration workspace for reviewers: two event spaces, vendors, an event in flight and a published public page. Sample data only.',
        venue_type: 'Banquet Hall',
        is_default: true,
        page_status: 'published',
      },
      { onConflict: 'slug' }
    )
    .select()
    .single()

  if (venueErr || !venue) {
    console.error('Failed to upsert the demo venue:', venueErr?.message)
    process.exit(1)
  }

  const { count: spaceCount } = await supabase
    .from('spaces')
    .select('id', { count: 'exact', head: true })
    .eq('venue_id', venue.id)

  if (!spaceCount) {
    await supabase.from('spaces').insert([
      { venue_id: venue.id, name: 'Grand Hall', capacity_seated: 250, capacity_standing: 320, hourly_rate: 350, type: 'Ballroom' },
      { venue_id: venue.id, name: 'Garden Terrace', capacity_seated: 80, capacity_standing: 120, hourly_rate: 150, type: 'Outdoor' },
    ])
  }

  await supabase.from('venue_ai_settings').upsert(
    {
      venue_id: venue.id,
      is_enabled: true,
      auto_respond: true,
      welcome_message:
        'Hi! This is a demo workspace for VenueManager. Ask about availability, spaces or pricing and the assistant will answer from the sample data.',
      system_prompt:
        'You are the AI assistant for Riverside Pavilion (demo). Answer politely and help the visitor with availability, spaces and pricing. Say plainly that this is a demonstration workspace when asked.',
    },
    { onConflict: 'venue_id' }
  )

  // 4. Hand the operator the two values they need.
  console.log('\n✅ Reviewer demo workspace ready')
  console.log(`   login:  https://venuemanager.pro/login`)
  console.log(`   public: https://venuemanager.pro/${VENUE_SLUG}  (marked noindex by the demo rule if the account looks unclaimed)`)
  console.log(`\n   NEXT_PUBLIC_DEMO_LOGIN = "${EMAIL} / ${PASSWORD}"`)
  console.log('   Set that in Vercel (Production) and redeploy to show it on the login page.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
