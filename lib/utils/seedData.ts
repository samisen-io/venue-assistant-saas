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
      venue_photos?: number;
      venue_amenities?: number;
      venue_event_types?: number;
      venue_packages?: number;
      venue_package_addons?: number;
      venue_testimonials?: number;
      venue_availability?: number;
      venue_blackout_dates?: number;
      conversations?: number;
      conversation_messages?: number;
      leads?: number;
      lead_activities?: number;
      proposals?: number;
      agent_runs?: number;
      vendor_communications?: number;
      vendor_quotes?: number;
      page_analytics?: number;
      venue_page_versions?: number;
    };
}

async function safeDeleteWhereNotEq(
  supabase: SupabaseClient,
  table: string,
  column: string = 'id'
): Promise<void> {
  const { error } = await supabase
    .from(table as unknown as never)
    .delete()
    .neq(column, '00000000-0000-0000-0000-000000000000');

  if (error) {
    const code = (error as { code?: string })?.code;
    if (code === '42P01') return;
    throw error;
  }
}

export async function clearAllData(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  // New public-page and AI tables (delete first due FK dependencies)
  await safeDeleteWhereNotEq(supabase, 'conversation_messages');
  await safeDeleteWhereNotEq(supabase, 'conversations');
  await safeDeleteWhereNotEq(supabase, 'lead_activities');
  await safeDeleteWhereNotEq(supabase, 'proposals');
  await safeDeleteWhereNotEq(supabase, 'leads');
  await safeDeleteWhereNotEq(supabase, 'page_analytics');
  await safeDeleteWhereNotEq(supabase, 'venue_page_versions');
  await safeDeleteWhereNotEq(supabase, 'venue_ai_settings');
  await safeDeleteWhereNotEq(supabase, 'venue_blackout_dates');
  await safeDeleteWhereNotEq(supabase, 'venue_calendar_settings');
  await safeDeleteWhereNotEq(supabase, 'venue_availability');
  await safeDeleteWhereNotEq(supabase, 'venue_testimonials');
  await safeDeleteWhereNotEq(supabase, 'venue_package_addons');
  await safeDeleteWhereNotEq(supabase, 'venue_packages');
  await safeDeleteWhereNotEq(supabase, 'venue_event_types');
  await safeDeleteWhereNotEq(supabase, 'venue_amenities');
  await safeDeleteWhereNotEq(supabase, 'venue_photos');

  // Agent/vendor outreach tables (delete before events/vendors due to FK deps)
  await safeDeleteWhereNotEq(supabase, 'vendor_quotes');
  await safeDeleteWhereNotEq(supabase, 'vendor_communications');
  await safeDeleteWhereNotEq(supabase, 'agent_runs');
  await safeDeleteWhereNotEq(supabase, 'preview_tokens');

  // Delete in correct order due to foreign key constraints
  // Reviews first (references events and vendors)
  await safeDeleteWhereNotEq(supabase, 'vendor_reviews');

  // Event vendors (references events and vendors)
  await safeDeleteWhereNotEq(supabase, 'event_vendors');

  // Event service requirements
  await safeDeleteWhereNotEq(supabase, 'event_service_requirements');

  // Vendor services
  await safeDeleteWhereNotEq(supabase, 'vendor_services', 'vendor_id');

  // Event services
  await safeDeleteWhereNotEq(supabase, 'event_services');

  // Client communications
  await safeDeleteWhereNotEq(supabase, 'client_communications');

  // Events (references spaces and venues)
  await safeDeleteWhereNotEq(supabase, 'events');

  // Vendors (references venues)
  await safeDeleteWhereNotEq(supabase, 'vendors');

  // Clients (references venues)
  await safeDeleteWhereNotEq(supabase, 'clients');

  // Spaces (references venues)
  await safeDeleteWhereNotEq(supabase, 'spaces');

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
        website: 'https://grandhotel.example.com',
        slug: `grand-hotel-conference-center-${demoEmailSuffix.toLowerCase()}`,
        tagline: 'Where memorable events come to life in downtown San Francisco',
        hero_image_url: 'https://images.unsplash.com/photo-1519167758481-83f29c89b7b5?auto=format&fit=crop&w=1920&q=80',
        page_status: 'published',
        latitude: 37.7749,
        longitude: -122.4194,
        social_links: {
          facebook: 'https://facebook.com/grandhotel',
          instagram: 'https://instagram.com/grandhotel',
          linkedin: 'https://linkedin.com/company/grandhotel',
        },
        privacy_settings: {
          hide_address: false,
          hide_phone: false,
          hide_email: false,
        },
        business_hours: {
          mon: { open: '08:00', close: '19:00' },
          tue: { open: '08:00', close: '19:00' },
          wed: { open: '08:00', close: '19:00' },
          thu: { open: '08:00', close: '19:00' },
          fri: { open: '08:00', close: '20:00' },
          sat: { open: '09:00', close: '17:00' },
          sun: { open: '10:00', close: '16:00' },
        },
        seo_title: 'Grand Hotel & Conference Center | San Francisco Event Venue',
        seo_description: 'Book a premium San Francisco venue with ballroom, rooftop, and AI-powered instant inquiry support.',
        seo_keywords: 'san francisco event venue, ballroom rental, conference venue, wedding venue',
        og_image_url: 'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?auto=format&fit=crop&w=1200&q=80',
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
          capacity_standing: 650,
          capacity_theater: 550,
          photo_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
          display_order: 1,
          public_description: 'A grand ballroom ideal for conferences, galas, and large receptions.',
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
          capacity_standing: 500,
          capacity_theater: 430,
          photo_url: 'https://images.unsplash.com/photo-1519167758481-83f29c89b7b5?auto=format&fit=crop&w=1200&q=80',
          display_order: 2,
          public_description: 'Elegant setting for weddings and upscale social events.',
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
          capacity_standing: 30,
          capacity_theater: 24,
          photo_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
          display_order: 3,
          public_description: 'Private boardroom designed for executive strategy sessions.',
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
          capacity_standing: 70,
          capacity_theater: 60,
          photo_url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
          display_order: 4,
          public_description: 'Bright conference space with skyline views and modern AV.',
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
          capacity_standing: 220,
          capacity_theater: 160,
          photo_url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80',
          display_order: 5,
          public_description: 'Outdoor garden perfect for ceremonies and cocktail receptions.',
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
          capacity_standing: 180,
          capacity_theater: 110,
          photo_url: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb2104f?auto=format&fit=crop&w=1200&q=80',
          display_order: 6,
          public_description: 'Rooftop venue with sweeping city views and sunset ambiance.',
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
          capacity_standing: 320,
          capacity_theater: 270,
          photo_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
          display_order: 7,
          public_description: 'Classic banquet hall for receptions, dinners, and celebrations.',
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

    const vendorData = vendorSeedData.map((vendorSeed) => {
      const { category, ...vendor } = vendorSeed;
      void category;
      return vendor;
    });

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
    const clientByCompany = new Map<string, { id: string }>(
      clients
        .map((client) => [client.company_name || client.contact_name, client])
        .filter((entry): entry is [string, { id: string }] => Boolean(entry[0]))
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

    // 9. Seed public page tables
    const photosSeed = [
      { section_name: 'Main Venue', image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80', caption: 'Grand ballroom setup', alt_text: 'Grand ballroom with round tables', display_order: 1, is_section_thumbnail: true },
      { section_name: 'Main Venue', image_url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1600&q=80', caption: 'Garden ceremony', alt_text: 'Outdoor ceremony aisle in garden', display_order: 2, is_section_thumbnail: false },
      { section_name: 'Main Venue', image_url: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb2104f?auto=format&fit=crop&w=1600&q=80', caption: 'Rooftop reception', alt_text: 'Guests mingling on rooftop at sunset', display_order: 3, is_section_thumbnail: false },
      { section_name: 'Event Spaces', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80', caption: 'Executive boardroom', alt_text: 'Boardroom meeting table and chairs', display_order: 4, is_section_thumbnail: true },
      { section_name: 'Event Spaces', image_url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1600&q=80', caption: 'Conference format', alt_text: 'Conference room with presentation setup', display_order: 5, is_section_thumbnail: false },
      { section_name: 'Event Spaces', image_url: 'https://images.unsplash.com/photo-1519167758481-83f29c89b7b5?auto=format&fit=crop&w=1600&q=80', caption: 'Wedding reception', alt_text: 'Decorated ballroom for wedding', display_order: 6, is_section_thumbnail: false },
      { section_name: 'Past Events', image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80', caption: 'Corporate gala evening', alt_text: 'Formal gala dinner event', display_order: 7, is_section_thumbnail: true },
      { section_name: 'Past Events', image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1600&q=80', caption: 'Awards stage moment', alt_text: 'Award stage with lighting', display_order: 8, is_section_thumbnail: false },
      { section_name: 'Amenities', image_url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1600&q=80', caption: 'Catering service', alt_text: 'Catering spread for event guests', display_order: 9, is_section_thumbnail: true },
      { section_name: 'Amenities', image_url: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1600&q=80', caption: 'AV and lighting', alt_text: 'Stage with AV and lighting setup', display_order: 10, is_section_thumbnail: false },
    ];
    const { data: venuePhotos, error: venuePhotosError } = await supabase
      .from('venue_photos')
      .insert(photosSeed.map((p) => ({ venue_id: venue.id, ...p })))
      .select();
    if (venuePhotosError) {
      console.error('Venue photos error:', venuePhotosError);
      throw new Error(venuePhotosError.message || 'Failed to seed venue photos');
    }

    const amenitiesSeed = [
      { amenity_key: 'av_system', amenity_label: 'Built-in AV System' },
      { amenity_key: 'wifi', amenity_label: 'High-Speed WiFi' },
      { amenity_key: 'parking', amenity_label: 'On-site Parking (200 spots)' },
      { amenity_key: 'catering_kitchen', amenity_label: 'Commercial Catering Kitchen' },
      { amenity_key: 'accessible', amenity_label: 'Accessible Facilities' },
      { amenity_key: 'climate_control', amenity_label: 'Climate Controlled Spaces' },
      { amenity_key: 'outdoor_space', amenity_label: 'Outdoor Garden Area' },
      { amenity_key: 'bar_area', amenity_label: 'Dedicated Bar Area' },
    ];
    const { data: venueAmenities, error: venueAmenitiesError } = await supabase
      .from('venue_amenities')
      .insert(amenitiesSeed.map((a) => ({ venue_id: venue.id, ...a })))
      .select();
    if (venueAmenitiesError) {
      console.error('Venue amenities error:', venueAmenitiesError);
      throw new Error(venueAmenitiesError.message || 'Failed to seed venue amenities');
    }

    const eventTypesSeed = [
      { event_type_key: 'corporate_meetings', event_type_label: 'Corporate Meetings' },
      { event_type_key: 'weddings', event_type_label: 'Weddings' },
      { event_type_key: 'conferences', event_type_label: 'Conferences' },
      { event_type_key: 'product_launches', event_type_label: 'Product Launches' },
      { event_type_key: 'galas', event_type_label: 'Galas & Fundraisers' },
    ];
    const { data: venueEventTypes, error: venueEventTypesError } = await supabase
      .from('venue_event_types')
      .insert(eventTypesSeed.map((e) => ({ venue_id: venue.id, ...e })))
      .select();
    if (venueEventTypesError) {
      console.error('Venue event types error:', venueEventTypesError);
      throw new Error(venueEventTypesError.message || 'Failed to seed venue event types');
    }

    const { data: venuePackages, error: venuePackagesError } = await supabase
      .from('venue_packages')
      .insert([
        {
          venue_id: venue.id,
          name: 'Essential Package',
          description: 'Venue rental with tables, chairs, and basic AV.',
          base_price: 4500,
          pricing_model: 'flat',
          inclusions: ['Venue rental (6 hours)', 'Tables and chairs', 'Basic AV setup'],
          is_visible_on_public_page: true,
          display_order: 1,
        },
        {
          venue_id: venue.id,
          name: 'Signature Package',
          description: 'Most popular package with catering and staffing.',
          base_price: 95,
          pricing_model: 'per_person',
          inclusions: ['Venue rental (8 hours)', 'Standard catering', 'Service staff'],
          is_visible_on_public_page: true,
          display_order: 2,
        },
        {
          venue_id: venue.id,
          name: 'Premium Experience',
          description: 'High-touch premium package for flagship events.',
          base_price: 12000,
          pricing_model: 'tiered',
          tiered_pricing: [
            { minGuests: 1, maxGuests: 100, price: 12000 },
            { minGuests: 101, maxGuests: 250, price: 18000 },
            { minGuests: 251, maxGuests: 500, price: 25000 },
          ],
          inclusions: ['Full-day rental', 'Premium AV', 'Coordinator', 'Custom floor plan'],
          is_visible_on_public_page: true,
          display_order: 3,
        },
      ])
      .select();
    if (venuePackagesError || !venuePackages) {
      console.error('Venue packages error:', venuePackagesError);
      throw new Error(venuePackagesError?.message || 'Failed to seed venue packages');
    }

    const essentialPkg = venuePackages.find((p) => p.name === 'Essential Package');
    const signaturePkg = venuePackages.find((p) => p.name === 'Signature Package');
    const premiumPkg = venuePackages.find((p) => p.name === 'Premium Experience');
    const { data: venuePackageAddons, error: venuePackageAddonsError } = await supabase
      .from('venue_package_addons')
      .insert([
        {
          venue_id: venue.id,
          name: 'Extended AV Production',
          description: 'Advanced lighting, live stream, and sound technician.',
          price: 1800,
          available_with_packages: [signaturePkg?.id, premiumPkg?.id].filter(Boolean),
        },
        {
          venue_id: venue.id,
          name: 'Welcome Cocktail Hour',
          description: '60-minute cocktail service prior to main event.',
          price: 2200,
          available_with_packages: [essentialPkg?.id, signaturePkg?.id, premiumPkg?.id].filter(Boolean),
        },
      ])
      .select();
    if (venuePackageAddonsError) {
      console.error('Venue package addons error:', venuePackageAddonsError);
      throw new Error(venuePackageAddonsError.message || 'Failed to seed venue package addons');
    }

    const { data: venueTestimonials, error: venueTestimonialsError } = await supabase
      .from('venue_testimonials')
      .insert([
        {
          venue_id: venue.id,
          client_name: 'Alex Morgan',
          client_company: 'Northwind Labs',
          event_type: 'Corporate Conference',
          quote: 'The team delivered flawlessly. The venue, AV, and service were top-tier.',
          star_rating: 5,
          event_date: events[0]?.event_date,
          event_id: events[0]?.id,
          is_published: true,
          display_order: 1,
          source: 'event_import',
        },
        {
          venue_id: venue.id,
          client_name: 'Sophie Reed',
          client_company: 'Brightside Weddings',
          event_type: 'Wedding Reception',
          quote: 'Beautiful spaces and incredible support. Our clients loved every moment.',
          star_rating: 5,
          event_date: events[1]?.event_date,
          event_id: events[1]?.id,
          is_published: true,
          display_order: 2,
          source: 'event_import',
        },
        {
          venue_id: venue.id,
          client_name: 'Jordan Lee',
          client_company: 'Apex Consulting',
          event_type: 'Leadership Summit',
          quote: 'Strong operations and responsive staff. We would gladly return.',
          star_rating: 4,
          is_published: false,
          display_order: 3,
          source: 'manual',
        },
        {
          venue_id: venue.id,
          client_name: 'Priya Patel',
          client_company: 'Lumen Foundation',
          event_type: 'Fundraising Dinner',
          quote: 'Excellent atmosphere and execution for our nonprofit gala.',
          star_rating: 5,
          is_published: false,
          display_order: 4,
          source: 'manual',
        },
      ])
      .select();
    if (venueTestimonialsError) {
      console.error('Venue testimonials error:', venueTestimonialsError);
      throw new Error(venueTestimonialsError.message || 'Failed to seed venue testimonials');
    }

    const { error: venueCalendarSettingsError } = await supabase
      .from('venue_calendar_settings')
      .insert({
        venue_id: venue.id,
        show_availability: true,
        setup_buffer_days: 1,
        teardown_buffer_days: 1,
        min_advance_booking_days: 14,
        max_advance_booking_months: 12,
      });
    if (venueCalendarSettingsError) {
      console.error('Venue calendar settings error:', venueCalendarSettingsError);
      throw new Error(venueCalendarSettingsError.message || 'Failed to seed venue calendar settings');
    }

    const todayForPublic = new Date();
    const blackout1Start = new Date(todayForPublic); blackout1Start.setDate(todayForPublic.getDate() + 40);
    const blackout1End = new Date(todayForPublic); blackout1End.setDate(todayForPublic.getDate() + 41);
    const blackout2Start = new Date(todayForPublic); blackout2Start.setDate(todayForPublic.getDate() + 80);
    const blackout2End = new Date(todayForPublic); blackout2End.setDate(todayForPublic.getDate() + 82);
    const blackout3Start = new Date(todayForPublic); blackout3Start.setDate(todayForPublic.getDate() + 120);
    const blackout3End = new Date(todayForPublic); blackout3End.setDate(todayForPublic.getDate() + 120);
    const { data: venueBlackoutDates, error: venueBlackoutDatesError } = await supabase
      .from('venue_blackout_dates')
      .insert([
        { venue_id: venue.id, start_date: blackout1Start.toISOString().split('T')[0], end_date: blackout1End.toISOString().split('T')[0], reason: 'Maintenance' },
        { venue_id: venue.id, start_date: blackout2Start.toISOString().split('T')[0], end_date: blackout2End.toISOString().split('T')[0], reason: 'Private Buyout' },
        { venue_id: venue.id, start_date: blackout3Start.toISOString().split('T')[0], end_date: blackout3End.toISOString().split('T')[0], reason: 'Holiday Closure' },
      ])
      .select();
    if (venueBlackoutDatesError) {
      console.error('Venue blackout dates error:', venueBlackoutDatesError);
      throw new Error(venueBlackoutDatesError.message || 'Failed to seed venue blackout dates');
    }

    const { error: venueAISettingsError } = await supabase
      .from('venue_ai_settings')
      .insert({
        venue_id: venue.id,
        tone: 'friendly',
        response_length: 'balanced',
        greeting_message: 'Hi! I can help you check dates, capacities, and pricing packages.',
        show_pricing_in_chat: true,
        request_contact_after_messages: 3,
        suggest_alternative_dates: true,
        manager_name: 'Sarah Johnson',
        manager_email: `manager+${demoEmailSuffix}@example.com`,
      });
    if (venueAISettingsError) {
      console.error('Venue AI settings error:', venueAISettingsError);
      throw new Error(venueAISettingsError.message || 'Failed to seed venue AI settings');
    }

    const availabilitySeed: Array<{
      venue_id: string;
      date: string;
      status: 'available' | 'tentative' | 'booked';
      note?: string;
      event_id?: string;
    }> = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(todayForPublic);
      d.setDate(todayForPublic.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      let status: 'available' | 'tentative' | 'booked' = 'available';
      let note: string | undefined;
      let eventId: string | undefined;
      if (i % 11 === 0) {
        status = 'booked';
        note = 'Confirmed booking';
        eventId = events[0]?.id;
      } else if (i % 7 === 0) {
        status = 'tentative';
        note = 'Tentative hold';
      }
      availabilitySeed.push({ venue_id: venue.id, date: dateStr, status, note, event_id: eventId });
    }
    const { data: venueAvailability, error: venueAvailabilityError } = await supabase
      .from('venue_availability')
      .insert(availabilitySeed)
      .select();
    if (venueAvailabilityError) {
      console.error('Venue availability error:', venueAvailabilityError);
      throw new Error(venueAvailabilityError.message || 'Failed to seed venue availability');
    }

    // 10. Seed leads, conversations, messages, activities, and proposal
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .insert([
        {
          venue_id: venue.id,
          source: 'ai_chat',
          contact_name: 'Emily Carter',
          contact_email: `emily+${demoEmailSuffix}@example.com`,
          contact_phone: '(415) 555-3011',
          company: 'Carter Creative',
          event_type: 'Product Launch',
          event_date: events[6]?.event_date,
          guest_count: 85,
          estimated_budget: 18000,
          status: 'qualified',
          priority_score: 82,
        },
        {
          venue_id: venue.id,
          source: 'ai_chat',
          contact_name: 'Michael Thompson',
          contact_email: `michael+${demoEmailSuffix}@example.com`,
          contact_phone: '(415) 555-3012',
          company: 'Thompson Legal',
          event_type: 'Corporate Meeting',
          event_date: events[10]?.event_date,
          guest_count: 25,
          estimated_budget: 6000,
          status: 'new',
          priority_score: 55,
        },
        {
          venue_id: venue.id,
          source: 'manual',
          contact_name: 'Lena Patel',
          contact_email: `lena+${demoEmailSuffix}@example.com`,
          contact_phone: '(415) 555-3013',
          company: 'Patel Family',
          event_type: 'Wedding',
          event_date: events[2]?.event_date,
          guest_count: 220,
          estimated_budget: 45000,
          status: 'proposal_sent',
          priority_score: 91,
        },
        {
          venue_id: venue.id,
          source: 'email',
          contact_name: 'Noah Rivera',
          contact_email: `noah+${demoEmailSuffix}@example.com`,
          event_type: 'Fundraiser',
          guest_count: 180,
          estimated_budget: 28000,
          status: 'contacted',
          priority_score: 72,
        },
        {
          venue_id: venue.id,
          source: 'phone',
          contact_name: 'Grace Kim',
          contact_email: `grace+${demoEmailSuffix}@example.com`,
          event_type: 'Conference',
          guest_count: 320,
          estimated_budget: 52000,
          status: 'new',
          priority_score: 88,
        },
      ])
      .select();
    if (leadsError || !leads) {
      console.error('Leads error:', leadsError);
      throw new Error(leadsError?.message || 'Failed to seed leads');
    }

    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .insert([
        {
          venue_id: venue.id,
          prospect_email: leads[0]?.contact_email,
          prospect_name: leads[0]?.contact_name,
          prospect_phone: leads[0]?.contact_phone,
          prospect_company: leads[0]?.company,
          status: 'active',
          lead_id: leads[0]?.id,
          message_count: 4,
          session_id: `session-${demoEmailSuffix}-1`,
        },
        {
          venue_id: venue.id,
          prospect_email: leads[1]?.contact_email,
          prospect_name: leads[1]?.contact_name,
          prospect_phone: leads[1]?.contact_phone,
          prospect_company: leads[1]?.company,
          status: 'active',
          lead_id: leads[1]?.id,
          message_count: 3,
          session_id: `session-${demoEmailSuffix}-2`,
        },
        {
          venue_id: venue.id,
          prospect_email: leads[2]?.contact_email,
          prospect_name: leads[2]?.contact_name,
          prospect_phone: leads[2]?.contact_phone,
          prospect_company: leads[2]?.company,
          status: 'completed',
          lead_id: leads[2]?.id,
          message_count: 6,
          session_id: `session-${demoEmailSuffix}-3`,
        },
      ])
      .select();
    if (conversationsError || !conversations) {
      console.error('Conversations error:', conversationsError);
      throw new Error(conversationsError?.message || 'Failed to seed conversations');
    }

    await supabase.from('leads').update({ conversation_id: conversations[0]?.id }).eq('id', leads[0]?.id);
    await supabase.from('leads').update({ conversation_id: conversations[1]?.id }).eq('id', leads[1]?.id);
    await supabase.from('leads').update({ conversation_id: conversations[2]?.id }).eq('id', leads[2]?.id);

    const { data: conversationMessages, error: conversationMessagesError } = await supabase
      .from('conversation_messages')
      .insert([
        { conversation_id: conversations[0].id, role: 'user', content: 'I need a venue for a product launch in about six weeks.' },
        { conversation_id: conversations[0].id, role: 'assistant', content: 'Great! How many guests are you expecting and what date range are you considering?' },
        { conversation_id: conversations[0].id, role: 'user', content: 'Around 80-90 guests, ideally a Thursday evening.' },
        { conversation_id: conversations[0].id, role: 'assistant', content: 'Perfect. We have availability and packages starting at $4,500.' },
        { conversation_id: conversations[1].id, role: 'user', content: 'Can you host a board meeting for 25 people?' },
        { conversation_id: conversations[1].id, role: 'assistant', content: 'Yes, our Executive Boardroom is a strong fit. Would you like a sample quote?' },
        { conversation_id: conversations[2].id, role: 'user', content: 'We are planning a 220-guest wedding.' },
        { conversation_id: conversations[2].id, role: 'assistant', content: 'Congratulations! Our team can help with ceremony + reception planning.' },
        { conversation_id: conversations[2].id, role: 'user', content: 'Please send a detailed proposal.' },
      ])
      .select();
    if (conversationMessagesError) {
      console.error('Conversation messages error:', conversationMessagesError);
      throw new Error(conversationMessagesError.message || 'Failed to seed conversation messages');
    }

    const leadActivitiesSeed = leads.flatMap((lead, index) => ([
      { lead_id: lead.id, activity_type: 'created', description: 'Lead created from seed data', metadata: { source: lead.source } },
      { lead_id: lead.id, activity_type: 'status_changed', description: `Status set to ${lead.status}`, metadata: { status: lead.status } },
      ...(index === 2 ? [{ lead_id: lead.id, activity_type: 'proposal_sent', description: 'Proposal sent to lead', metadata: {} }] : []),
    ]));
    const { data: leadActivities, error: leadActivitiesError } = await supabase
      .from('lead_activities')
      .insert(leadActivitiesSeed)
      .select();
    if (leadActivitiesError) {
      console.error('Lead activities error:', leadActivitiesError);
      throw new Error(leadActivitiesError.message || 'Failed to seed lead activities');
    }

    const proposalReference = `PROP-${new Date().getFullYear()}-${demoEmailSuffix.toUpperCase()}-001`;
    const { data: proposals, error: proposalsError } = await supabase
      .from('proposals')
      .insert({
        lead_id: leads[2].id,
        venue_id: venue.id,
        reference_number: proposalReference,
        event_summary: {
          event_type: 'Wedding',
          guest_count: 220,
          target_date: leads[2].event_date,
        },
        pricing_breakdown: {
          venue: 12000,
          catering: 13200,
          av: 2200,
          total: 27400,
        },
        inclusions: ['Full-day venue access', 'Premium AV package', 'Event coordinator'],
        terms_and_policies: '50% deposit required. Final headcount due 14 days prior.',
        total_estimated: 27400,
        deposit_amount: 13700,
        valid_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0],
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select();
    if (proposalsError) {
      console.error('Proposals error:', proposalsError);
      throw new Error(proposalsError.message || 'Failed to seed proposals');
    }

    // 11. Seed Agent Runs for completed past events
    const holidayGala = events[12]; // Holiday Gala 2025 (completed)
    const awardsEvent = events[14]; // Industry Awards Ceremony (completed)
    const agentRunStarted1 = new Date(pastDate2);
    agentRunStarted1.setDate(agentRunStarted1.getDate() - 7); // Started a week before event
    const agentRunCompleted1 = new Date(agentRunStarted1);
    agentRunCompleted1.setDate(agentRunStarted1.getDate() + 2);
    const agentRunStarted2 = new Date(pastDate1);
    agentRunStarted2.setDate(agentRunStarted2.getDate() - 10);
    const agentRunCompleted2 = new Date(agentRunStarted2);
    agentRunCompleted2.setDate(agentRunStarted2.getDate() + 1);

    const { data: agentRuns, error: agentRunsError } = await supabase
      .from('agent_runs')
      .insert([
        {
          event_id: holidayGala.id,
          trigger_type: 'manual',
          status: 'completed',
          started_at: agentRunStarted1.toISOString(),
          completed_at: agentRunCompleted1.toISOString(),
          last_activity_at: agentRunCompleted1.toISOString(),
          vendors_targeted: 5,
          vendors_contacted: 4,
          vendors_responded: 3,
          quotes_received: 3,
          error_count: 0,
          logs: [
            { ts: agentRunStarted1.toISOString(), msg: 'Agent run started for Holiday Gala 2025' },
            { ts: agentRunCompleted1.toISOString(), msg: 'All vendors responded. Run complete.' },
          ],
        },
        {
          event_id: awardsEvent.id,
          trigger_type: 'manual',
          status: 'completed',
          started_at: agentRunStarted2.toISOString(),
          completed_at: agentRunCompleted2.toISOString(),
          last_activity_at: agentRunCompleted2.toISOString(),
          vendors_targeted: 3,
          vendors_contacted: 3,
          vendors_responded: 2,
          quotes_received: 2,
          error_count: 0,
          logs: [
            { ts: agentRunStarted2.toISOString(), msg: 'Agent run started for Industry Awards Ceremony' },
            { ts: agentRunCompleted2.toISOString(), msg: 'Vendor responses collected. Run complete.' },
          ],
        },
      ])
      .select();
    if (agentRunsError) {
      console.error('Agent runs error:', agentRunsError);
      throw new Error(agentRunsError.message || 'Failed to seed agent runs');
    }

    // 12. Seed Vendor Communications (outbound + inbound pairs)
    const gourmetCatering = vendors.find((v) => v.name === 'Gourmet Catering Co.');
    const techSoundAV = vendors.find((v) => v.name === 'TechSound Audio Visual');
    const vipValet = vendors.find((v) => v.name === 'VIP Valet Services');
    const premiumFeast = vendors.find((v) => v.name === 'Premium Feast Services');
    const proAV = vendors.find((v) => v.name === 'ProAV Solutions');

    const commSentAt1 = new Date(agentRunStarted1);
    commSentAt1.setHours(commSentAt1.getHours() + 1);
    const commReplyAt1 = new Date(commSentAt1);
    commReplyAt1.setHours(commSentAt1.getHours() + 8);

    const commSentAt2 = new Date(agentRunStarted2);
    commSentAt2.setHours(commSentAt2.getHours() + 1);
    const commReplyAt2 = new Date(commSentAt2);
    commReplyAt2.setHours(commSentAt2.getHours() + 6);

    const vendorCommsSeed = [
      // Holiday Gala outreach
      {
        event_id: holidayGala.id,
        vendor_id: gourmetCatering!.id,
        direction: 'outbound',
        subject: 'Catering Inquiry - Holiday Gala 2025 (400 guests)',
        body: 'Hi Sarah, we are hosting a Holiday Gala for 400 guests and would love to get a quote from Gourmet Catering Co.',
        from_email: `events+${demoEmailSuffix}@example.com`,
        to_email: 'sarah@gourmetcatering.com',
        status: 'delivered',
        sent_at: commSentAt1.toISOString(),
      },
      {
        event_id: holidayGala.id,
        vendor_id: gourmetCatering!.id,
        direction: 'inbound',
        subject: 'Re: Catering Inquiry - Holiday Gala 2025 (400 guests)',
        body: 'Hi! We would be happy to cater your Holiday Gala. For 400 guests, our standard package is $45/person ($18,000 total). We can customize the menu to your preferences.',
        from_email: 'sarah@gourmetcatering.com',
        to_email: `events+${demoEmailSuffix}@example.com`,
        status: 'received',
        received_at: commReplyAt1.toISOString(),
        processed: true,
      },
      {
        event_id: holidayGala.id,
        vendor_id: techSoundAV!.id,
        direction: 'outbound',
        subject: 'AV Setup Inquiry - Holiday Gala 2025',
        body: 'Hi David, we need full AV setup for a 400-guest corporate gala in the Grand Ballroom. Can you provide a quote?',
        from_email: `events+${demoEmailSuffix}@example.com`,
        to_email: 'david@techsound.com',
        status: 'delivered',
        sent_at: commSentAt1.toISOString(),
      },
      {
        event_id: holidayGala.id,
        vendor_id: techSoundAV!.id,
        direction: 'inbound',
        subject: 'Re: AV Setup Inquiry - Holiday Gala 2025',
        body: 'David here. Full AV package for the Grand Ballroom would be $1,650 including sound system, projectors, and lighting. Setup starts 3 hours before event.',
        from_email: 'david@techsound.com',
        to_email: `events+${demoEmailSuffix}@example.com`,
        status: 'received',
        received_at: commReplyAt1.toISOString(),
        processed: true,
      },
      {
        event_id: holidayGala.id,
        vendor_id: vipValet!.id,
        direction: 'outbound',
        subject: 'Valet Parking - Holiday Gala 2025 (300 cars estimated)',
        body: 'Hi Tom, we expect around 300 vehicles for our Holiday Gala. Can you provide valet parking services?',
        from_email: `events+${demoEmailSuffix}@example.com`,
        to_email: 'tom@vipvalet.com',
        status: 'delivered',
        sent_at: commSentAt1.toISOString(),
      },
      {
        event_id: holidayGala.id,
        vendor_id: vipValet!.id,
        direction: 'inbound',
        subject: 'Re: Valet Parking - Holiday Gala 2025 (300 cars estimated)',
        body: 'We can handle 300 vehicles. Rate is $15/car, estimated total $4,500. We will have 6 valets on site.',
        from_email: 'tom@vipvalet.com',
        to_email: `events+${demoEmailSuffix}@example.com`,
        status: 'received',
        received_at: commReplyAt1.toISOString(),
        processed: true,
      },
      // Awards event outreach
      {
        event_id: awardsEvent.id,
        vendor_id: premiumFeast!.id,
        direction: 'outbound',
        subject: 'Catering Quote - Industry Awards Ceremony (280 guests)',
        body: 'Hi Emily, requesting a catering quote for our Industry Awards Ceremony, 280 guests, formal dinner service.',
        from_email: `events+${demoEmailSuffix}@example.com`,
        to_email: 'emily@premiumfeast.com',
        status: 'delivered',
        sent_at: commSentAt2.toISOString(),
      },
      {
        event_id: awardsEvent.id,
        vendor_id: premiumFeast!.id,
        direction: 'inbound',
        subject: 'Re: Catering Quote - Industry Awards Ceremony (280 guests)',
        body: 'Emily here. For a formal 280-guest dinner, our premium package runs $65/person ($18,200 total). Includes passed appetizers, plated dinner, and dessert station.',
        from_email: 'emily@premiumfeast.com',
        to_email: `events+${demoEmailSuffix}@example.com`,
        status: 'received',
        received_at: commReplyAt2.toISOString(),
        processed: true,
      },
    ];

    const { data: vendorComms, error: vendorCommsError } = await supabase
      .from('vendor_communications')
      .insert(vendorCommsSeed)
      .select();
    if (vendorCommsError) {
      console.error('Vendor communications error:', vendorCommsError);
      throw new Error(vendorCommsError.message || 'Failed to seed vendor communications');
    }

    // 13. Seed Vendor Quotes (from inbound replies)
    const inboundComms = vendorComms?.filter((c) => c.direction === 'inbound') || [];
    const gourmetInbound = inboundComms.find((c) => c.vendor_id === gourmetCatering!.id && c.event_id === holidayGala.id);
    const techSoundInbound = inboundComms.find((c) => c.vendor_id === techSoundAV!.id);
    const vipValetInbound = inboundComms.find((c) => c.vendor_id === vipValet!.id);
    const premiumFeastInbound = inboundComms.find((c) => c.vendor_id === premiumFeast!.id);

    const { data: vendorQuotes, error: vendorQuotesError } = await supabase
      .from('vendor_quotes')
      .insert([
        {
          event_id: holidayGala.id,
          vendor_id: gourmetCatering!.id,
          communication_id: gourmetInbound?.id,
          total_cost: 18000,
          breakdown: { per_person: 45, guests: 400, total: 18000 },
          availability_confirmed: true,
          available_date: holidayGala.event_date,
          payment_terms: 'Net 30, 50% deposit',
          status: 'approved',
          approved_at: agentRunCompleted1.toISOString(),
        },
        {
          event_id: holidayGala.id,
          vendor_id: techSoundAV!.id,
          communication_id: techSoundInbound?.id,
          total_cost: 1650,
          breakdown: { sound_system: 600, projectors: 400, lighting: 450, setup: 200 },
          availability_confirmed: true,
          available_date: holidayGala.event_date,
          setup_time: '3 hours before event',
          payment_terms: 'Due on event day',
          status: 'approved',
          approved_at: agentRunCompleted1.toISOString(),
        },
        {
          event_id: holidayGala.id,
          vendor_id: vipValet!.id,
          communication_id: vipValetInbound?.id,
          total_cost: 4500,
          breakdown: { rate_per_car: 15, estimated_cars: 300, valets: 6 },
          availability_confirmed: true,
          available_date: holidayGala.event_date,
          payment_terms: 'Net 15',
          status: 'approved',
          approved_at: agentRunCompleted1.toISOString(),
        },
        {
          event_id: awardsEvent.id,
          vendor_id: premiumFeast!.id,
          communication_id: premiumFeastInbound?.id,
          total_cost: 18200,
          breakdown: { per_person: 65, guests: 280, includes: 'appetizers, plated dinner, dessert station' },
          availability_confirmed: true,
          available_date: awardsEvent.event_date,
          payment_terms: '50% deposit, balance due 7 days before event',
          status: 'approved',
          approved_at: agentRunCompleted2.toISOString(),
        },
      ])
      .select();
    if (vendorQuotesError) {
      console.error('Vendor quotes error:', vendorQuotesError);
      throw new Error(vendorQuotesError.message || 'Failed to seed vendor quotes');
    }

    // 14. Seed Page Analytics (sample events over last 14 days)
    const analyticsSeed: Array<{
      venue_id: string;
      event_type: string;
      metadata: Record<string, unknown>;
      referrer?: string;
      session_id: string;
      created_at: string;
    }> = [];

    const referrers = [
      'https://www.google.com',
      'https://www.instagram.com',
      'https://www.facebook.com',
      null,
      'https://www.theknot.com',
      'https://www.yelp.com',
    ];

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const dayDate = new Date(todayForPublic);
      dayDate.setDate(todayForPublic.getDate() - dayOffset);
      const sessionBase = `analytics-${demoEmailSuffix}-d${dayOffset}`;

      // 1-3 page views per day
      const viewsCount = dayOffset < 3 ? 3 : dayOffset < 7 ? 2 : 1;
      for (let v = 0; v < viewsCount; v++) {
        const viewTime = new Date(dayDate);
        viewTime.setHours(9 + v * 3, Math.floor(Math.random() * 60));
        analyticsSeed.push({
          venue_id: venue.id,
          event_type: 'page_view',
          metadata: { page: '/' },
          referrer: referrers[dayOffset % referrers.length] || undefined,
          session_id: `${sessionBase}-v${v}`,
          created_at: viewTime.toISOString(),
        });
      }

      // chat_opened on some days
      if (dayOffset % 3 === 0) {
        const chatTime = new Date(dayDate);
        chatTime.setHours(14, 30);
        analyticsSeed.push({
          venue_id: venue.id,
          event_type: 'chat_opened',
          metadata: { trigger: 'cta_button' },
          session_id: `${sessionBase}-chat`,
          created_at: chatTime.toISOString(),
        });
      }

      // cta_click on some days
      if (dayOffset % 4 === 0) {
        const ctaTime = new Date(dayDate);
        ctaTime.setHours(16, 15);
        analyticsSeed.push({
          venue_id: venue.id,
          event_type: 'cta_click',
          metadata: { button: 'check_availability' },
          session_id: `${sessionBase}-cta`,
          created_at: ctaTime.toISOString(),
        });
      }

      // gallery_view on some days
      if (dayOffset % 5 === 0) {
        const galleryTime = new Date(dayDate);
        galleryTime.setHours(11, 45);
        analyticsSeed.push({
          venue_id: venue.id,
          event_type: 'gallery_view',
          metadata: { section: 'Main Venue' },
          session_id: `${sessionBase}-gal`,
          created_at: galleryTime.toISOString(),
        });
      }
    }

    // Add a few lead_captured and other events
    const leadCaptureDate1 = new Date(todayForPublic);
    leadCaptureDate1.setDate(todayForPublic.getDate() - 2);
    leadCaptureDate1.setHours(15, 20);
    const leadCaptureDate2 = new Date(todayForPublic);
    leadCaptureDate2.setDate(todayForPublic.getDate() - 6);
    leadCaptureDate2.setHours(10, 45);
    analyticsSeed.push(
      {
        venue_id: venue.id,
        event_type: 'lead_captured',
        metadata: { source: 'ai_chat' },
        session_id: `analytics-${demoEmailSuffix}-lead1`,
        created_at: leadCaptureDate1.toISOString(),
      },
      {
        venue_id: venue.id,
        event_type: 'lead_captured',
        metadata: { source: 'inquiry_form' },
        session_id: `analytics-${demoEmailSuffix}-lead2`,
        created_at: leadCaptureDate2.toISOString(),
      },
      {
        venue_id: venue.id,
        event_type: 'calendar_click',
        metadata: { month: '2026-03' },
        session_id: `analytics-${demoEmailSuffix}-cal`,
        created_at: new Date(todayForPublic.getTime() - 3 * 86400000).toISOString(),
      },
      {
        venue_id: venue.id,
        event_type: 'phone_click',
        metadata: {},
        session_id: `analytics-${demoEmailSuffix}-phone`,
        created_at: new Date(todayForPublic.getTime() - 5 * 86400000).toISOString(),
      },
    );

    const { data: pageAnalytics, error: pageAnalyticsError } = await supabase
      .from('page_analytics')
      .insert(analyticsSeed)
      .select();
    if (pageAnalyticsError) {
      console.error('Page analytics error:', pageAnalyticsError);
      throw new Error(pageAnalyticsError.message || 'Failed to seed page analytics');
    }

    // 15. Seed Venue Page Versions (2 version snapshots)
    const version1Date = new Date(todayForPublic);
    version1Date.setDate(todayForPublic.getDate() - 30);
    const version2Date = new Date(todayForPublic);
    version2Date.setDate(todayForPublic.getDate() - 7);

    const { data: pageVersions, error: pageVersionsError } = await supabase
      .from('venue_page_versions')
      .insert([
        {
          venue_id: venue.id,
          version_number: 1,
          snapshot: {
            name: venue.name,
            tagline: 'Premier event venue in downtown San Francisco',
            description: venue.description,
            page_status: 'published',
            photos_count: 6,
            packages_count: 2,
            amenities_count: 5,
          },
          published_by: userId,
          change_summary: 'Initial page publish with basic venue info and photos',
          created_at: version1Date.toISOString(),
        },
        {
          venue_id: venue.id,
          version_number: 2,
          snapshot: {
            name: venue.name,
            tagline: venue.tagline,
            description: venue.description,
            page_status: 'published',
            photos_count: 10,
            packages_count: 3,
            amenities_count: 8,
            testimonials_count: 2,
            ai_chat_enabled: true,
          },
          published_by: userId,
          change_summary: 'Added gallery photos, pricing packages, testimonials, and AI chat',
          created_at: version2Date.toISOString(),
        },
      ])
      .select();
    if (pageVersionsError) {
      console.error('Page versions error:', pageVersionsError);
      throw new Error(pageVersionsError.message || 'Failed to seed page versions');
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
        venue_photos: venuePhotos?.length || 0,
        venue_amenities: venueAmenities?.length || 0,
        venue_event_types: venueEventTypes?.length || 0,
        venue_packages: venuePackages?.length || 0,
        venue_package_addons: venuePackageAddons?.length || 0,
        venue_testimonials: venueTestimonials?.length || 0,
        venue_availability: venueAvailability?.length || 0,
        venue_blackout_dates: venueBlackoutDates?.length || 0,
        conversations: conversations?.length || 0,
        conversation_messages: conversationMessages?.length || 0,
        leads: leads?.length || 0,
        lead_activities: leadActivities?.length || 0,
        proposals: proposals?.length || 0,
        agent_runs: agentRuns?.length || 0,
        vendor_communications: vendorComms?.length || 0,
        vendor_quotes: vendorQuotes?.length || 0,
        page_analytics: pageAnalytics?.length || 0,
        venue_page_versions: pageVersions?.length || 0,
      },
    };
  } catch (error: unknown) {
    console.error('Seed data error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to seed demo data',
    };
  }
}
