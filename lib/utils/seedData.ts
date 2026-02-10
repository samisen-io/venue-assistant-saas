import { SupabaseClient } from '@supabase/supabase-js';

export interface SeedDataResult {
  success: boolean;
  message: string;
    counts?: {
      venues: number;
      spaces: number;
      vendors: number;
      events: number;
      assignments: number;
      reviews: number;
      clients?: number;
      client_communications?: number;
    };
}

export async function clearAllData(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  // Delete in correct order due to foreign key constraints
  // Reviews first (references events and vendors)
  await supabase.from('vendor_reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Event vendors (references events and vendors)
  await supabase.from('event_vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Event service requirements
  await supabase.from('event_service_requirements').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Vendor services
  await supabase.from('vendor_services').delete().neq('vendor_id', '00000000-0000-0000-0000-000000000000');

  // Event services
  await supabase.from('event_services').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Client communications
  await supabase.from('client_communications').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Events (references spaces and venues)
  await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Vendors (references venues)
  await supabase.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Clients (references venues)
  await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Spaces (references venues)
  await supabase.from('spaces').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Venues (references user)
  await supabase.from('venues').delete().eq('owner_id', userId);
}

export async function seedDemoData(
  supabase: SupabaseClient,
  userId: string
): Promise<SeedDataResult> {
  try {
    // Clear existing data first
    await clearAllData(supabase, userId);

    const demoEmailSuffix = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'owner';

    // 1. Create ONE Venue (the property the user manages)
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .insert({
        owner_id: userId,
        name: 'Grand Hotel & Conference Center',
        address: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94102',
        phone: '(415) 555-0100',
        email: `events+${demoEmailSuffix}@example.com`,
        venue_type: 'hotel',
        description: 'Premier event venue in downtown San Francisco',
      })
      .select()
      .single();

    if (venueError || !venue) {
      console.error('Venue error details:', venueError);
      throw new Error(venueError?.message || 'Failed to create venue');
    }

    // 2. Create Multiple Spaces within the venue (7 spaces)
    const { data: spaces, error: spacesError } = await supabase
      .from('spaces')
      .insert([
        {
          venue_id: venue.id,
          name: 'Grand Ballroom',
          capacity: 500,
          space_type: 'ballroom',
          floor_level: '2nd Floor',
          square_footage: 5000,
          hourly_rate: 1500,
          notes: 'Our largest space with chandelier and stage',
        },
        {
          venue_id: venue.id,
          name: 'Crystal Ballroom',
          capacity: 400,
          space_type: 'ballroom',
          floor_level: '2nd Floor',
          square_footage: 4200,
          hourly_rate: 1300,
          notes: 'Elegant ballroom with crystal fixtures',
        },
        {
          venue_id: venue.id,
          name: 'Executive Boardroom',
          capacity: 20,
          space_type: 'conference_room',
          floor_level: '3rd Floor',
          square_footage: 500,
          hourly_rate: 300,
          notes: 'Professional meeting space with AV equipment',
        },
        {
          venue_id: venue.id,
          name: 'Skyline Conference Room',
          capacity: 50,
          space_type: 'conference_room',
          floor_level: '5th Floor',
          square_footage: 800,
          hourly_rate: 450,
          notes: 'Modern conference room with panoramic views',
        },
        {
          venue_id: venue.id,
          name: 'Garden Terrace',
          capacity: 150,
          space_type: 'outdoor_garden',
          floor_level: 'Ground Floor',
          square_footage: 2000,
          hourly_rate: 800,
          notes: 'Beautiful outdoor space with fountain',
        },
        {
          venue_id: venue.id,
          name: 'Rooftop Lounge',
          capacity: 100,
          space_type: 'rooftop',
          floor_level: 'Rooftop',
          square_footage: 1500,
          hourly_rate: 1000,
          notes: 'Stunning city views, perfect for cocktail events',
        },
        {
          venue_id: venue.id,
          name: 'Heritage Banquet Hall',
          capacity: 250,
          space_type: 'banquet_hall',
          floor_level: '1st Floor',
          square_footage: 3000,
          hourly_rate: 950,
          notes: 'Traditional banquet hall with classic decor',
        },
      ])
      .select();

    if (spacesError || !spaces || spaces.length === 0) {
      console.error('Spaces error details:', spacesError);
      throw new Error(spacesError?.message || 'Failed to create spaces');
    }

    const spaceByName = new Map(spaces.map((space) => [space.name, space]));
    const grandBallroom = spaceByName.get('Grand Ballroom');
    const crystalBallroom = spaceByName.get('Crystal Ballroom');
    const executiveBoardroom = spaceByName.get('Executive Boardroom');
    const skylineConference = spaceByName.get('Skyline Conference Room');
    const gardenTerrace = spaceByName.get('Garden Terrace');
    const rooftopLounge = spaceByName.get('Rooftop Lounge');
    const heritageBanquet = spaceByName.get('Heritage Banquet Hall');
    if (
      !grandBallroom ||
      !crystalBallroom ||
      !executiveBoardroom ||
      !skylineConference ||
      !gardenTerrace ||
      !rooftopLounge ||
      !heritageBanquet
    ) {
      throw new Error('Failed to map seeded spaces');
    }

    // 3. Create Event Services (catalog for the venue)
    const { data: eventServices, error: eventServicesError } = await supabase
      .from('event_services')
      .insert([
        { venue_id: venue.id, name: 'Catering', slug: 'catering' },
        { venue_id: venue.id, name: 'AV Equipment', slug: 'av' },
        { venue_id: venue.id, name: 'Florals & Decor', slug: 'florals' },
        { venue_id: venue.id, name: 'Photography', slug: 'photography' },
        { venue_id: venue.id, name: 'Entertainment', slug: 'entertainment' },
        { venue_id: venue.id, name: 'Parking', slug: 'parking' },
        { venue_id: venue.id, name: 'Security', slug: 'security' },
        { venue_id: venue.id, name: 'Other Services', slug: 'other' },
      ])
      .select();

    if (eventServicesError || !eventServices || eventServices.length === 0) {
      console.error('Event services error details:', eventServicesError);
      throw new Error(eventServicesError?.message || 'Failed to create event services');
    }

    const serviceIdBySlug = new Map(eventServices.map((service) => [service.slug, service.id]));

    // 4. Create Vendors (4-5 vendors per service, attached to venue)
    const vendorSeedData = [
      // Catering vendors (5 total)
      { venue_id: venue.id, name: 'Gourmet Catering Co.', category: 'catering', contact_name: 'Sarah Johnson', contact_email: 'sarah@gourmetcatering.com', contact_phone: '(415) 555-1001', cost_per_unit: 45, website: 'https://gourmetcatering.example.com', reliability_score: 92, total_events: 15, on_time_count: 14, on_time_percentage: 93.3, avg_quality_rating: 4.7 },
      { venue_id: venue.id, name: 'Budget Bites Catering', category: 'catering', contact_name: 'Mike Chen', contact_email: 'mike@budgetbites.com', contact_phone: '(415) 555-1002', cost_per_unit: 25, reliability_score: 75, total_events: 20, on_time_count: 16, on_time_percentage: 80, avg_quality_rating: 3.8 },
      { venue_id: venue.id, name: 'Premium Feast Services', category: 'catering', contact_name: 'Emily Rodriguez', contact_email: 'emily@premiumfeast.com', contact_phone: '(415) 555-2001', cost_per_unit: 65, reliability_score: 95, total_events: 12, on_time_count: 12, on_time_percentage: 100, avg_quality_rating: 4.9 },
      { venue_id: venue.id, name: 'Savory Delights Catering', category: 'catering', contact_name: 'Maria Garcia', contact_email: 'maria@savorydelights.com', contact_phone: '(415) 555-1007', cost_per_unit: 55, reliability_score: 88, total_events: 18, on_time_count: 16, on_time_percentage: 88.9, avg_quality_rating: 4.5 },
      { venue_id: venue.id, name: 'Artisan Table Catering', category: 'catering', contact_name: 'Sophie White', contact_email: 'sophie@artisantable.com', contact_phone: '(415) 555-1013', cost_per_unit: 70, reliability_score: 93, total_events: 11, on_time_count: 11, on_time_percentage: 100, avg_quality_rating: 4.9 },

      // AV vendors (4 total)
      { venue_id: venue.id, name: 'TechSound Audio Visual', category: 'av', contact_name: 'David Park', contact_email: 'david@techsound.com', contact_phone: '(415) 555-1003', cost_per_unit: 1500, reliability_score: 88, total_events: 25, on_time_count: 23, on_time_percentage: 92, avg_quality_rating: 4.5 },
      { venue_id: venue.id, name: 'ProAV Solutions', category: 'av', contact_name: 'Lisa Anderson', contact_email: 'lisa@proavsolutions.com', contact_phone: '(415) 555-2002', cost_per_unit: 2000, reliability_score: 91, total_events: 18, on_time_count: 17, on_time_percentage: 94.4, avg_quality_rating: 4.6 },
      { venue_id: venue.id, name: 'Crystal Clear AV', category: 'av', contact_name: 'Michael Johnson', contact_email: 'michael@crystalclearav.com', contact_phone: '(415) 555-1016', cost_per_unit: 1800, reliability_score: 89, total_events: 20, on_time_count: 18, on_time_percentage: 90, avg_quality_rating: 4.5 },
      { venue_id: venue.id, name: 'Elite Audio Visual', category: 'av', contact_name: 'Jennifer Lopez', contact_email: 'jennifer@eliteav.com', contact_phone: '(415) 555-1017', cost_per_unit: 2200, reliability_score: 94, total_events: 15, on_time_count: 15, on_time_percentage: 100, avg_quality_rating: 4.8 },

      // Florals vendors (4 total)
      { venue_id: venue.id, name: 'Bloom & Blossom', category: 'florals', contact_name: 'Rachel Green', contact_email: 'rachel@bloomblossom.com', contact_phone: '(415) 555-1004', cost_per_unit: 800, reliability_score: 90, total_events: 30, on_time_count: 28, on_time_percentage: 93.3, avg_quality_rating: 4.8 },
      { venue_id: venue.id, name: 'Elegant Petals', category: 'florals', contact_name: 'Jennifer Wu', contact_email: 'jennifer@elegantpetals.com', contact_phone: '(415) 555-3001', cost_per_unit: 600, reliability_score: 85, total_events: 22, on_time_count: 19, on_time_percentage: 86.4, avg_quality_rating: 4.3 },
      { venue_id: venue.id, name: 'Petal Perfection', category: 'florals', contact_name: 'Emma Wilson', contact_email: 'emma@petalperfection.com', contact_phone: '(415) 555-1023', cost_per_unit: 850, reliability_score: 92, total_events: 24, on_time_count: 23, on_time_percentage: 95.8, avg_quality_rating: 4.7 },
      { venue_id: venue.id, name: 'Luxe Blooms', category: 'florals', contact_name: 'Isabella Garcia', contact_email: 'isabella@luxeblooms.com', contact_phone: '(415) 555-1025', cost_per_unit: 950, reliability_score: 94, total_events: 20, on_time_count: 19, on_time_percentage: 95, avg_quality_rating: 4.8 },

      // Parking vendors (4 total)
      { venue_id: venue.id, name: 'VIP Valet Services', category: 'parking', contact_name: 'Tom Martinez', contact_email: 'tom@vipvalet.com', contact_phone: '(415) 555-1005', cost_per_unit: 15, reliability_score: 87, total_events: 35, on_time_count: 32, on_time_percentage: 91.4, avg_quality_rating: 4.4 },
      { venue_id: venue.id, name: 'Premier Parking Solutions', category: 'parking', contact_name: 'Brian Jackson', contact_email: 'brian@premierparking.com', contact_phone: '(415) 555-1028', cost_per_unit: 18, reliability_score: 90, total_events: 30, on_time_count: 28, on_time_percentage: 93.3, avg_quality_rating: 4.5 },
      { venue_id: venue.id, name: 'Executive Valet Co.', category: 'parking', contact_name: 'Marcus Lewis', contact_email: 'marcus@executivevalet.com', contact_phone: '(415) 555-1029', cost_per_unit: 20, reliability_score: 92, total_events: 28, on_time_count: 27, on_time_percentage: 96.4, avg_quality_rating: 4.6 },
      { venue_id: venue.id, name: 'City Parking Services', category: 'parking', contact_name: 'Daniel Moore', contact_email: 'daniel@cityparking.com', contact_phone: '(415) 555-1030', cost_per_unit: 12, reliability_score: 84, total_events: 40, on_time_count: 34, on_time_percentage: 85, avg_quality_rating: 4.2 },

      // Security vendors (4 total)
      { venue_id: venue.id, name: 'SafeGuard Security', category: 'security', contact_name: 'James Wilson', contact_email: 'james@safeguard.com', contact_phone: '(415) 555-2003', cost_per_unit: 50, reliability_score: 93, total_events: 28, on_time_count: 27, on_time_percentage: 96.4, avg_quality_rating: 4.7 },
      { venue_id: venue.id, name: 'Elite Protection Services', category: 'security', contact_name: 'Ryan Cooper', contact_email: 'ryan@eliteprotection.com', contact_phone: '(415) 555-1031', cost_per_unit: 60, reliability_score: 95, total_events: 24, on_time_count: 24, on_time_percentage: 100, avg_quality_rating: 4.8 },
      { venue_id: venue.id, name: 'Guardian Event Security', category: 'security', contact_name: 'Alex Turner', contact_email: 'alex@guardianevents.com', contact_phone: '(415) 555-1032', cost_per_unit: 55, reliability_score: 91, total_events: 26, on_time_count: 25, on_time_percentage: 96.2, avg_quality_rating: 4.6 },
      { venue_id: venue.id, name: 'Sentinel Security Group', category: 'security', contact_name: 'Jordan Phillips', contact_email: 'jordan@sentinelgroup.com', contact_phone: '(415) 555-1033', cost_per_unit: 45, reliability_score: 88, total_events: 32, on_time_count: 29, on_time_percentage: 90.6, avg_quality_rating: 4.5 },

      // Entertainment vendors (5 total)
      { venue_id: venue.id, name: 'DJ Masters Entertainment', category: 'entertainment', contact_name: 'Chris Taylor', contact_email: 'chris@djmasters.com', contact_phone: '(415) 555-1006', cost_per_unit: 1200, reliability_score: 89, total_events: 40, on_time_count: 37, on_time_percentage: 92.5, avg_quality_rating: 4.6 },
      { venue_id: venue.id, name: 'Live Band Productions', category: 'entertainment', contact_name: 'Amanda Brooks', contact_email: 'amanda@livebandpro.com', contact_phone: '(415) 555-3002', cost_per_unit: 2500, reliability_score: 94, total_events: 16, on_time_count: 16, on_time_percentage: 100, avg_quality_rating: 4.9 },
      { venue_id: venue.id, name: 'Groove City DJs', category: 'entertainment', contact_name: 'Tyler Scott', contact_email: 'tyler@groovecity.com', contact_phone: '(415) 555-1034', cost_per_unit: 1100, reliability_score: 87, total_events: 38, on_time_count: 34, on_time_percentage: 89.5, avg_quality_rating: 4.4 },
      { venue_id: venue.id, name: 'Acoustic Harmony Band', category: 'entertainment', contact_name: 'Sarah Mitchell', contact_email: 'sarah@acousticharmony.com', contact_phone: '(415) 555-1035', cost_per_unit: 2200, reliability_score: 92, total_events: 18, on_time_count: 17, on_time_percentage: 94.4, avg_quality_rating: 4.7 },
      { venue_id: venue.id, name: 'Symphony Strings Quartet', category: 'entertainment', contact_name: 'Victoria Clark', contact_email: 'victoria@symphonystrings.com', contact_phone: '(415) 555-1037', cost_per_unit: 1800, reliability_score: 96, total_events: 22, on_time_count: 22, on_time_percentage: 100, avg_quality_rating: 4.9 },
    ];

    const vendorData = vendorSeedData.map(({ category, ...vendor }) => vendor);

    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .insert(vendorData)
      .select();

    if (vendorsError || !vendors || vendors.length === 0) {
      throw new Error('Failed to create vendors');
    }

    const vendorServices = vendorSeedData
      .map((vendorSeed) => {
        const vendor = vendors.find((v) => v.name === vendorSeed.name);
        const serviceId = serviceIdBySlug.get(vendorSeed.category);
        if (!vendor || !serviceId) return null;
        return {
          vendor_id: vendor.id,
          event_service_id: serviceId,
        };
      })
      .filter((item): item is { vendor_id: string; event_service_id: string } => Boolean(item));

    const { error: vendorServicesError } = await supabase
      .from('vendor_services')
      .insert(vendorServices);

    if (vendorServicesError) {
      console.error('Vendor services error:', vendorServicesError);
      throw new Error(vendorServicesError?.message || 'Failed to create vendor services');
    }

    // 5. Create Events (24 events - 4x increase, distributed across spaces)
    const today = new Date();
    const futureDate1 = new Date(today); futureDate1.setDate(today.getDate() + 15);
    const futureDate2 = new Date(today); futureDate2.setDate(today.getDate() + 30);
    const futureDate3 = new Date(today); futureDate3.setDate(today.getDate() + 45);
    const futureDate4 = new Date(today); futureDate4.setDate(today.getDate() + 60);
    const futureDate5 = new Date(today); futureDate5.setDate(today.getDate() + 75);
    const futureDate6 = new Date(today); futureDate6.setDate(today.getDate() + 90);
    const pastDate1 = new Date(today); pastDate1.setDate(today.getDate() - 15);
    const pastDate2 = new Date(today); pastDate2.setDate(today.getDate() - 30);
    const pastDate3 = new Date(today); pastDate3.setDate(today.getDate() - 45);
    const pastDate4 = new Date(today); pastDate4.setDate(today.getDate() - 60);

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .insert([
        // Future Events (12 events)
        { space_id: grandBallroom.id, venue_id: venue.id, event_name: 'Annual Tech Conference 2026', event_type: 'conference', event_date: futureDate2.toISOString().split('T')[0], event_time: '09:00', guest_count: 450, budget_total: 65000, status: 'planning' },
        { space_id: crystalBallroom.id, venue_id: venue.id, event_name: 'Smith-Johnson Wedding', event_type: 'wedding', event_date: futureDate3.toISOString().split('T')[0], event_time: '17:00', guest_count: 300, budget_total: 45000, status: 'confirmed' },
        { space_id: grandBallroom.id, venue_id: venue.id, event_name: 'Garcia-Patel Wedding', event_type: 'wedding', event_date: futureDate4.toISOString().split('T')[0], event_time: '18:00', guest_count: 280, budget_total: 42000, status: 'confirmed' },
        { space_id: heritageBanquet.id, venue_id: venue.id, event_name: 'New Year Gala 2027', event_type: 'corporate', event_date: futureDate6.toISOString().split('T')[0], event_time: '20:00', guest_count: 250, budget_total: 38000, status: 'planning' },
        { space_id: gardenTerrace.id, venue_id: venue.id, event_name: 'Summer Garden Party', event_type: 'social', event_date: futureDate2.toISOString().split('T')[0], event_time: '15:00', guest_count: 120, budget_total: 18000, status: 'confirmed' },
        { space_id: gardenTerrace.id, venue_id: venue.id, event_name: 'Spring Wedding Ceremony', event_type: 'wedding', event_date: futureDate3.toISOString().split('T')[0], event_time: '14:00', guest_count: 100, budget_total: 22000, status: 'planning' },
        { space_id: rooftopLounge.id, venue_id: venue.id, event_name: 'Product Launch Event', event_type: 'corporate', event_date: futureDate1.toISOString().split('T')[0], event_time: '11:00', guest_count: 75, budget_total: 15000, status: 'confirmed' },
        { space_id: rooftopLounge.id, venue_id: venue.id, event_name: 'Sunset Cocktail Reception', event_type: 'corporate', event_date: futureDate2.toISOString().split('T')[0], event_time: '18:30', guest_count: 90, budget_total: 16000, status: 'planning' },
        { space_id: rooftopLounge.id, venue_id: venue.id, event_name: 'Networking Mixer', event_type: 'social', event_date: futureDate1.toISOString().split('T')[0], event_time: '17:00', guest_count: 70, budget_total: 12000, status: 'confirmed' },
        { space_id: rooftopLounge.id, venue_id: venue.id, event_name: 'VIP Client Appreciation', event_type: 'corporate', event_date: futureDate5.toISOString().split('T')[0], event_time: '19:00', guest_count: 50, budget_total: 14000, status: 'planning' },
        { space_id: executiveBoardroom.id, venue_id: venue.id, event_name: 'Board Strategy Session', event_type: 'conference', event_date: futureDate1.toISOString().split('T')[0], event_time: '09:00', guest_count: 18, budget_total: 5000, status: 'confirmed' },
        { space_id: skylineConference.id, venue_id: venue.id, event_name: 'Quarterly All-Hands Meeting', event_type: 'conference', event_date: futureDate2.toISOString().split('T')[0], event_time: '10:00', guest_count: 45, budget_total: 8000, status: 'planning' },

        // Past Events (12 events - completed)
        { space_id: grandBallroom.id, venue_id: venue.id, event_name: 'Holiday Gala 2025', event_type: 'corporate', event_date: pastDate2.toISOString().split('T')[0], event_time: '19:00', guest_count: 400, budget_total: 55000, status: 'completed' },
        { space_id: crystalBallroom.id, venue_id: venue.id, event_name: 'Martinez-Lee Wedding', event_type: 'wedding', event_date: pastDate3.toISOString().split('T')[0], event_time: '16:00', guest_count: 320, budget_total: 48000, status: 'completed' },
        { space_id: grandBallroom.id, venue_id: venue.id, event_name: 'Industry Awards Ceremony', event_type: 'corporate', event_date: pastDate1.toISOString().split('T')[0], event_time: '18:00', guest_count: 280, budget_total: 40000, status: 'completed' },
        { space_id: heritageBanquet.id, venue_id: venue.id, event_name: 'Anderson-Brown Wedding', event_type: 'wedding', event_date: pastDate4.toISOString().split('T')[0], event_time: '17:30', guest_count: 260, budget_total: 39000, status: 'completed' },
        { space_id: heritageBanquet.id, venue_id: venue.id, event_name: 'Annual Fundraising Dinner', event_type: 'fundraiser', event_date: pastDate2.toISOString().split('T')[0], event_time: '18:30', guest_count: 220, budget_total: 32000, status: 'completed' },
        { space_id: heritageBanquet.id, venue_id: venue.id, event_name: 'Corporate Team Building', event_type: 'corporate', event_date: pastDate1.toISOString().split('T')[0], event_time: '12:00', guest_count: 180, budget_total: 25000, status: 'completed' },
        { space_id: rooftopLounge.id, venue_id: venue.id, event_name: 'Summer Sunset Soiree', event_type: 'social', event_date: pastDate3.toISOString().split('T')[0], event_time: '18:00', guest_count: 95, budget_total: 17000, status: 'completed' },
        { space_id: rooftopLounge.id, venue_id: venue.id, event_name: 'Product Launch Party', event_type: 'corporate', event_date: pastDate2.toISOString().split('T')[0], event_time: '19:30', guest_count: 75, budget_total: 13000, status: 'completed' },
        { space_id: gardenTerrace.id, venue_id: venue.id, event_name: 'Spring Garden Wedding', event_type: 'wedding', event_date: pastDate4.toISOString().split('T')[0], event_time: '15:00', guest_count: 130, budget_total: 24000, status: 'completed' },
        { space_id: gardenTerrace.id, venue_id: venue.id, event_name: 'Charity Garden Party', event_type: 'fundraiser', event_date: pastDate3.toISOString().split('T')[0], event_time: '14:00', guest_count: 110, budget_total: 19000, status: 'completed' },
        { space_id: skylineConference.id, venue_id: venue.id, event_name: 'Leadership Workshop', event_type: 'conference', event_date: pastDate1.toISOString().split('T')[0], event_time: '09:00', guest_count: 40, budget_total: 7000, status: 'completed' },
        { space_id: executiveBoardroom.id, venue_id: venue.id, event_name: 'Sales Kickoff Meeting', event_type: 'conference', event_date: pastDate2.toISOString().split('T')[0], event_time: '08:30', guest_count: 35, budget_total: 6500, status: 'completed' },
      ])
      .select();

    if (eventsError || !events || events.length === 0) {
      console.error('Events error details:', eventsError);
      throw new Error(eventsError?.message || 'Failed to create events');
    }

    // 5.5 Create Clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .insert([
        {
          venue_id: venue.id,
          company_name: 'Northwind Labs',
          contact_name: 'Alex Morgan',
          email: 'alex@northwindlabs.com',
          phone: '(415) 555-2101',
          notes: 'Prefers morning setup and AV walkthroughs.',
          notify_on_booking_updates: true,
        },
        {
          venue_id: venue.id,
          company_name: 'Brightside Weddings',
          contact_name: 'Sophie Reed',
          email: 'sophie@brightsideweddings.com',
          phone: '(415) 555-2102',
          notes: 'VIP wedding planner, detailed timelines.',
          notify_on_booking_updates: true,
        },
        {
          venue_id: venue.id,
          company_name: 'Apex Consulting',
          contact_name: 'Jordan Lee',
          email: 'jordan@apexconsulting.com',
          phone: '(415) 555-2103',
          notes: 'Corporate leadership events.',
          notify_on_booking_updates: false,
        },
        {
          venue_id: venue.id,
          company_name: 'Lumen Foundation',
          contact_name: 'Priya Patel',
          email: 'priya@lumenfoundation.org',
          phone: '(415) 555-2104',
          notes: 'Nonprofit fundraisers, prefers evening start.',
          notify_on_booking_updates: true,
        },
        {
          venue_id: venue.id,
          company_name: 'Crestline Tech',
          contact_name: 'Marcus Nolan',
          email: 'marcus@crestlinetech.com',
          phone: '(415) 555-2105',
          notes: 'Product launches with press needs.',
          notify_on_booking_updates: true,
        },
      ])
      .select();

    if (clientsError || !clients || clients.length === 0) {
      console.error('Clients error details:', clientsError);
      throw new Error(clientsError?.message || 'Failed to create clients');
    }

    const eventByName = new Map(events.map((event) => [event.event_name, event]));
    const clientByCompany = new Map(
      clients
        .map((client) => [client.company_name || client.contact_name, client])
        .filter((entry): entry is [string, any] => Boolean(entry[0]))
    );

    const clientEventLinks = [
      { eventName: 'Annual Tech Conference 2026', clientName: 'Northwind Labs' },
      { eventName: 'Smith-Johnson Wedding', clientName: 'Brightside Weddings' },
      { eventName: 'New Year Gala 2027', clientName: 'Apex Consulting' },
      { eventName: 'Annual Fundraising Dinner', clientName: 'Lumen Foundation' },
      { eventName: 'Product Launch Event', clientName: 'Crestline Tech' },
    ];

    await Promise.all(
      clientEventLinks.map(async ({ eventName, clientName }) => {
        const event = eventByName.get(eventName);
        const client = clientByCompany.get(clientName);
        if (!event || !client) return;
        await supabase.from('events').update({ client_id: client.id }).eq('id', event.id);
      })
    );

    // 6. Create Event-Vendor Assignments
    const assignments = [];
    const getServiceId = (slug: string) => serviceIdBySlug.get(slug);

    // Tech Conference assignments
    assignments.push(
      {
        event_id: events[0].id,
        vendor_id: vendors.find((v) => v.name === 'Gourmet Catering Co.')?.id,
        event_service_id: getServiceId('catering'),
        assignment_type: 'primary',
        quoted_cost: 15750, // 350 guests * $45
        confirmed: false,
      },
      {
        event_id: events[0].id,
        vendor_id: vendors.find((v) => v.name === 'TechSound Audio Visual')?.id,
        event_service_id: getServiceId('av'),
        assignment_type: 'primary',
        quoted_cost: 1500,
        confirmed: false,
      }
    );

    // Wedding assignments
    assignments.push(
      {
        event_id: events[1].id,
        vendor_id: vendors.find((v) => v.name === 'Premium Feast Services')?.id,
        event_service_id: getServiceId('catering'),
        assignment_type: 'primary',
        quoted_cost: 13000, // 200 guests * $65
        confirmed: true,
      },
      {
        event_id: events[1].id,
        vendor_id: vendors.find((v) => v.name === 'Bloom & Blossom')?.id,
        event_service_id: getServiceId('florals'),
        assignment_type: 'primary',
        quoted_cost: 3200, // 4 arrangements * $800
        confirmed: true,
      },
      {
        event_id: events[1].id,
        vendor_id: vendors.find((v) => v.name === 'DJ Masters Entertainment')?.id,
        event_service_id: getServiceId('entertainment'),
        assignment_type: 'primary',
        quoted_cost: 1200,
        confirmed: true,
      }
    );

    // Completed event 1 assignments with actual costs
    const completedEvent1Vendors = [
      {
        event_id: events[3].id,
        vendor_id: vendors.find((v) => v.name === 'Gourmet Catering Co.')?.id,
        event_service_id: getServiceId('catering'),
        assignment_type: 'primary',
        quoted_cost: 13500,
        actual_cost: 13500,
        confirmed: true,
      },
      {
        event_id: events[3].id,
        vendor_id: vendors.find((v) => v.name === 'TechSound Audio Visual')?.id,
        event_service_id: getServiceId('av'),
        assignment_type: 'primary',
        quoted_cost: 1500,
        actual_cost: 1650, // Slightly over
        confirmed: true,
      },
      {
        event_id: events[3].id,
        vendor_id: vendors.find((v) => v.name === 'VIP Valet Services')?.id,
        event_service_id: getServiceId('parking'),
        assignment_type: 'primary',
        quoted_cost: 4500,
        actual_cost: 4350, // Slightly under
        confirmed: true,
      },
    ];
    assignments.push(...completedEvent1Vendors);

    // Completed event 2 assignments
    const completedEvent2Vendors = [
      {
        event_id: events[4].id,
        vendor_id: vendors.find((v) => v.name === 'Premium Feast Services')?.id,
        event_service_id: getServiceId('catering'),
        assignment_type: 'primary',
        quoted_cost: 11700,
        actual_cost: 11700,
        confirmed: true,
      },
      {
        event_id: events[4].id,
        vendor_id: vendors.find((v) => v.name === 'ProAV Solutions')?.id,
        event_service_id: getServiceId('av'),
        assignment_type: 'primary',
        quoted_cost: 2000,
        actual_cost: 2000,
        confirmed: true,
      },
    ];
    assignments.push(...completedEvent2Vendors);

    const { data: eventVendors, error: assignmentsError } = await supabase
      .from('event_vendors')
      .insert(assignments.filter((a) => a.vendor_id && a.event_service_id))
      .select();

    if (assignmentsError) {
      console.error('Assignments error:', assignmentsError);
    }

    const requirementMap = new Map<string, { event_id: string; event_service_id: string; budget_amount: number }>();
    assignments
      .filter((a) => a.event_id && a.event_service_id)
      .forEach((assignment) => {
        const key = `${assignment.event_id}-${assignment.event_service_id}`;
        const current = requirementMap.get(key);
        const amount = assignment.quoted_cost || 0;
        requirementMap.set(key, {
          event_id: assignment.event_id,
          event_service_id: assignment.event_service_id,
          budget_amount: (current?.budget_amount || 0) + amount,
        });
      });

    const { error: requirementsError } = await supabase
      .from('event_service_requirements')
      .insert(Array.from(requirementMap.values()));

    if (requirementsError) {
      console.error('Event service requirements error:', requirementsError);
    }

    // 7. Create Reviews for completed events
    const reviews = [];

    // Reviews for Corporate Gala vendors
    for (const assignment of completedEvent1Vendors) {
      if (assignment.vendor_id) {
        const vendor = vendors.find((v) => v.id === assignment.vendor_id);
        reviews.push({
          event_id: events[3].id,
          vendor_id: assignment.vendor_id,
          on_time: vendor?.name !== 'TechSound Audio Visual', // AV was late
          quality_rating: vendor?.name === 'Gourmet Catering Co.' ? 5 : 4,
          cost_accurate: vendor?.name !== 'TechSound Audio Visual',
          would_use_again: true,
          notes:
            vendor?.name === 'TechSound Audio Visual'
              ? 'Great quality but arrived 15 minutes late. Cost slightly higher than quoted.'
              : vendor?.name === 'Gourmet Catering Co.'
              ? 'Exceptional service and food quality. Guests loved it!'
              : 'Professional service, good value.',
        });
      }
    }

    // Reviews for Spring Charity Auction vendors
    for (const assignment of completedEvent2Vendors) {
      if (assignment.vendor_id) {
        reviews.push({
          event_id: events[4].id,
          vendor_id: assignment.vendor_id,
          on_time: true,
          quality_rating: 5,
          cost_accurate: true,
          would_use_again: true,
          notes: 'Perfect execution. Highly recommended!',
        });
      }
    }

    const { error: reviewsError } = await supabase
      .from('vendor_reviews')
      .insert(reviews);

    if (reviewsError) {
      console.error('Reviews error:', reviewsError);
    }

    // 8. Create Client Communications
    const communicationsSeed = [
      {
        client_id: clientByCompany.get('Northwind Labs')?.id,
        event_id: eventByName.get('Annual Tech Conference 2026')?.id,
        message_type: 'booking_confirmed',
        subject: 'Booking Confirmed - Annual Tech Conference 2026',
        body: 'Confirmed booking details and shared the setup timeline. Waiting on final AV requirements.',
        sent_by: userId,
      },
      {
        client_id: clientByCompany.get('Brightside Weddings')?.id,
        event_id: eventByName.get('Smith-Johnson Wedding')?.id,
        message_type: 'booking_updated',
        subject: 'Wedding Timeline Update',
        body: 'Updated floor plan and guest count. Confirmed floral delivery window.',
        sent_by: userId,
      },
      {
        client_id: clientByCompany.get('Lumen Foundation')?.id,
        event_id: eventByName.get('Annual Fundraising Dinner')?.id,
        message_type: 'general',
        subject: 'Fundraising Dinner Logistics',
        body: 'Shared parking and security plan for the gala attendees.',
        sent_by: userId,
      },
    ];

    const communicationsToInsert = communicationsSeed.filter((entry) => entry.client_id);
    const { data: clientCommunications, error: communicationsError } = await supabase
      .from('client_communications')
      .insert(communicationsToInsert)
      .select();

    if (communicationsError) {
      console.error('Client communications error:', communicationsError);
    }

    return {
      success: true,
      message: 'Demo data seeded successfully!',
      counts: {
        venues: 1,
        spaces: spaces.length,
        vendors: vendors.length,
        events: events.length,
        assignments: eventVendors?.length || 0,
        reviews: reviews.length,
        clients: clients.length,
        client_communications: clientCommunications?.length || 0,
      },
    };
  } catch (error: any) {
    console.error('Seed data error:', error);
    return {
      success: false,
      message: error.message || 'Failed to seed demo data',
    };
  }
}
