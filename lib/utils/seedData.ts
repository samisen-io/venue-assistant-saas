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

  // Events (references spaces and venues)
  await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Vendors (references venues)
  await supabase.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

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
        email: 'events@grandhotel.com',
        venue_type: 'hotel',
        description: 'Premier event venue in downtown San Francisco',
      })
      .select()
      .single();

    if (venueError || !venue) {
      console.error('Venue error details:', venueError);
      throw new Error(venueError?.message || 'Failed to create venue');
    }

    // 2. Create Multiple Spaces within the venue (16 spaces - 4x increase)
    const { data: spaces, error: spacesError } = await supabase
      .from('spaces')
      .insert([
        // Ballrooms (4 spaces)
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
          name: 'Royal Ballroom',
          capacity: 350,
          space_type: 'ballroom',
          floor_level: '3rd Floor',
          square_footage: 3800,
          hourly_rate: 1200,
          notes: 'Classic ballroom with vintage decor',
        },
        {
          venue_id: venue.id,
          name: 'Sunset Ballroom',
          capacity: 300,
          space_type: 'ballroom',
          floor_level: '4th Floor',
          square_footage: 3500,
          hourly_rate: 1100,
          notes: 'Modern ballroom with floor-to-ceiling windows',
        },
        // Conference Rooms (4 spaces)
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
          name: 'Innovation Hub',
          capacity: 40,
          space_type: 'conference_room',
          floor_level: '4th Floor',
          square_footage: 700,
          hourly_rate: 400,
          notes: 'Tech-enabled collaborative workspace',
        },
        {
          venue_id: venue.id,
          name: 'Sterling Meeting Room',
          capacity: 30,
          space_type: 'meeting_room',
          floor_level: '3rd Floor',
          square_footage: 600,
          hourly_rate: 350,
          notes: 'Intimate meeting space for small groups',
        },
        // Outdoor Spaces (3 spaces)
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
          name: 'Rose Garden Pavilion',
          capacity: 120,
          space_type: 'outdoor_garden',
          floor_level: 'Ground Floor',
          square_footage: 1800,
          hourly_rate: 700,
          notes: 'Covered outdoor pavilion surrounded by roses',
        },
        {
          venue_id: venue.id,
          name: 'Courtyard Plaza',
          capacity: 80,
          space_type: 'outdoor_garden',
          floor_level: 'Ground Floor',
          square_footage: 1200,
          hourly_rate: 600,
          notes: 'Charming courtyard with string lights',
        },
        // Rooftop Spaces (3 spaces)
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
          name: 'Sky Deck',
          capacity: 80,
          space_type: 'rooftop',
          floor_level: 'Rooftop',
          square_footage: 1300,
          hourly_rate: 900,
          notes: 'Open-air rooftop with bar setup',
        },
        {
          venue_id: venue.id,
          name: 'Penthouse Terrace',
          capacity: 60,
          space_type: 'rooftop',
          floor_level: 'Penthouse',
          square_footage: 1000,
          hourly_rate: 850,
          notes: 'Exclusive rooftop terrace with premium amenities',
        },
        // Banquet Halls (2 spaces)
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
        {
          venue_id: venue.id,
          name: 'Marquee Banquet Hall',
          capacity: 200,
          space_type: 'banquet_hall',
          floor_level: '1st Floor',
          square_footage: 2500,
          hourly_rate: 850,
          notes: 'Versatile banquet space with adjustable lighting',
        },
      ])
      .select();

    if (spacesError || !spaces || spaces.length === 0) {
      console.error('Spaces error details:', spacesError);
      throw new Error(spacesError?.message || 'Failed to create spaces');
    }

    // Reference spaces by index
    const ballrooms = spaces.slice(0, 4);
    const conferenceRooms = spaces.slice(4, 8);
    const outdoorSpaces = spaces.slice(8, 11);
    const rooftopSpaces = spaces.slice(11, 14);
    const banquetHalls = spaces.slice(14, 16);

    // 3. Create Vendors (44 vendors - 4x increase, attached to venue)
    const vendorData = [
      // Catering vendors (12 total)
      { venue_id: venue.id, name: 'Gourmet Catering Co.', category: 'catering', contact_name: 'Sarah Johnson', contact_email: 'sarah@gourmetcatering.com', contact_phone: '(415) 555-1001', cost_per_unit: 45, website: 'https://gourmetcatering.example.com', reliability_score: 92, total_events: 15, on_time_count: 14, on_time_percentage: 93.3, avg_quality_rating: 4.7 },
      { venue_id: venue.id, name: 'Budget Bites Catering', category: 'catering', contact_name: 'Mike Chen', contact_email: 'mike@budgetbites.com', contact_phone: '(415) 555-1002', cost_per_unit: 25, reliability_score: 75, total_events: 20, on_time_count: 16, on_time_percentage: 80, avg_quality_rating: 3.8 },
      { venue_id: venue.id, name: 'Premium Feast Services', category: 'catering', contact_name: 'Emily Rodriguez', contact_email: 'emily@premiumfeast.com', contact_phone: '(415) 555-2001', cost_per_unit: 65, reliability_score: 95, total_events: 12, on_time_count: 12, on_time_percentage: 100, avg_quality_rating: 4.9 },
      { venue_id: venue.id, name: 'Savory Delights Catering', category: 'catering', contact_name: 'Maria Garcia', contact_email: 'maria@savorydelights.com', contact_phone: '(415) 555-1007', cost_per_unit: 55, reliability_score: 88, total_events: 18, on_time_count: 16, on_time_percentage: 88.9, avg_quality_rating: 4.5 },
      { venue_id: venue.id, name: 'Elite Cuisine Events', category: 'catering', contact_name: 'Robert Kim', contact_email: 'robert@elitecuisine.com', contact_phone: '(415) 555-1008', cost_per_unit: 75, reliability_score: 96, total_events: 14, on_time_count: 14, on_time_percentage: 100, avg_quality_rating: 4.8 },
      { venue_id: venue.id, name: 'Fresh & Tasty Catering', category: 'catering', contact_name: 'Linda Martinez', contact_email: 'linda@freshtasty.com', contact_phone: '(415) 555-1009', cost_per_unit: 35, reliability_score: 82, total_events: 22, on_time_count: 18, on_time_percentage: 81.8, avg_quality_rating: 4.2 },
      { venue_id: venue.id, name: 'Gourmet Gardens Catering', category: 'catering', contact_name: 'James Thompson', contact_email: 'james@gourmetgardens.com', contact_phone: '(415) 555-1010', cost_per_unit: 50, reliability_score: 90, total_events: 16, on_time_count: 15, on_time_percentage: 93.8, avg_quality_rating: 4.6 },
      { venue_id: venue.id, name: 'Urban Eats Catering', category: 'catering', contact_name: 'Anna Lee', contact_email: 'anna@urbaneats.com', contact_phone: '(415) 555-1011', cost_per_unit: 40, reliability_score: 85, total_events: 19, on_time_count: 16, on_time_percentage: 84.2, avg_quality_rating: 4.3 },
      { venue_id: venue.id, name: 'Classic Comfort Foods', category: 'catering', contact_name: 'David Brown', contact_email: 'david@classiccomfort.com', contact_phone: '(415) 555-1012', cost_per_unit: 30, reliability_score: 78, total_events: 25, on_time_count: 20, on_time_percentage: 80, avg_quality_rating: 4.0 },
      { venue_id: venue.id, name: 'Artisan Table Catering', category: 'catering', contact_name: 'Sophie White', contact_email: 'sophie@artisantable.com', contact_phone: '(415) 555-1013', cost_per_unit: 70, reliability_score: 93, total_events: 11, on_time_count: 11, on_time_percentage: 100, avg_quality_rating: 4.9 },
      { venue_id: venue.id, name: 'Global Flavors Catering', category: 'catering', contact_name: 'Carlos Rivera', contact_email: 'carlos@globalflavors.com', contact_phone: '(415) 555-1014', cost_per_unit: 60, reliability_score: 87, total_events: 13, on_time_count: 12, on_time_percentage: 92.3, avg_quality_rating: 4.4 },
      { venue_id: venue.id, name: 'Simple Elegance Catering', category: 'catering', contact_name: 'Patricia Davis', contact_email: 'patricia@simpleelegance.com', contact_phone: '(415) 555-1015', cost_per_unit: 48, reliability_score: 91, total_events: 17, on_time_count: 16, on_time_percentage: 94.1, avg_quality_rating: 4.7 },

      // AV vendors (8 total)
      { venue_id: venue.id, name: 'TechSound Audio Visual', category: 'av', contact_name: 'David Park', contact_email: 'david@techsound.com', contact_phone: '(415) 555-1003', cost_per_unit: 1500, reliability_score: 88, total_events: 25, on_time_count: 23, on_time_percentage: 92, avg_quality_rating: 4.5 },
      { venue_id: venue.id, name: 'ProAV Solutions', category: 'av', contact_name: 'Lisa Anderson', contact_email: 'lisa@proavsolutions.com', contact_phone: '(415) 555-2002', cost_per_unit: 2000, reliability_score: 91, total_events: 18, on_time_count: 17, on_time_percentage: 94.4, avg_quality_rating: 4.6 },
      { venue_id: venue.id, name: 'Crystal Clear AV', category: 'av', contact_name: 'Michael Johnson', contact_email: 'michael@crystalclearav.com', contact_phone: '(415) 555-1016', cost_per_unit: 1800, reliability_score: 89, total_events: 20, on_time_count: 18, on_time_percentage: 90, avg_quality_rating: 4.5 },
      { venue_id: venue.id, name: 'Elite Audio Visual', category: 'av', contact_name: 'Jennifer Lopez', contact_email: 'jennifer@eliteav.com', contact_phone: '(415) 555-1017', cost_per_unit: 2200, reliability_score: 94, total_events: 15, on_time_count: 15, on_time_percentage: 100, avg_quality_rating: 4.8 },
      { venue_id: venue.id, name: 'SoundStage Productions', category: 'av', contact_name: 'Kevin Wright', contact_email: 'kevin@soundstage.com', contact_phone: '(415) 555-1018', cost_per_unit: 1600, reliability_score: 86, total_events: 22, on_time_count: 19, on_time_percentage: 86.4, avg_quality_rating: 4.3 },
      { venue_id: venue.id, name: 'Visionary AV Systems', category: 'av', contact_name: 'Rachel Adams', contact_email: 'rachel@visionaryav.com', contact_phone: '(415) 555-1019', cost_per_unit: 1900, reliability_score: 92, total_events: 17, on_time_count: 16, on_time_percentage: 94.1, avg_quality_rating: 4.7 },
      { venue_id: venue.id, name: 'Premier Sound & Light', category: 'av', contact_name: 'Thomas Miller', contact_email: 'thomas@premiersound.com', contact_phone: '(415) 555-1020', cost_per_unit: 1700, reliability_score: 90, total_events: 19, on_time_count: 18, on_time_percentage: 94.7, avg_quality_rating: 4.6 },
      { venue_id: venue.id, name: 'Dynamic Audio Visual', category: 'av', contact_name: 'Nicole Turner', contact_email: 'nicole@dynamicav.com', contact_phone: '(415) 555-1021', cost_per_unit: 2100, reliability_score: 93, total_events: 16, on_time_count: 15, on_time_percentage: 93.8, avg_quality_rating: 4.7 },

      // Florals vendors (8 total)
      { venue_id: venue.id, name: 'Bloom & Blossom', category: 'florals', contact_name: 'Rachel Green', contact_email: 'rachel@bloomblossom.com', contact_phone: '(415) 555-1004', cost_per_unit: 800, reliability_score: 90, total_events: 30, on_time_count: 28, on_time_percentage: 93.3, avg_quality_rating: 4.8 },
      { venue_id: venue.id, name: 'Elegant Petals', category: 'florals', contact_name: 'Jennifer Wu', contact_email: 'jennifer@elegantpetals.com', contact_phone: '(415) 555-3001', cost_per_unit: 600, reliability_score: 85, total_events: 22, on_time_count: 19, on_time_percentage: 86.4, avg_quality_rating: 4.3 },
      { venue_id: venue.id, name: 'Rose Garden Florals', category: 'florals', contact_name: 'Olivia Martinez', contact_email: 'olivia@rosegarden.com', contact_phone: '(415) 555-1022', cost_per_unit: 750, reliability_score: 88, total_events: 26, on_time_count: 24, on_time_percentage: 92.3, avg_quality_rating: 4.6 },
      { venue_id: venue.id, name: 'Petal Perfection', category: 'florals', contact_name: 'Emma Wilson', contact_email: 'emma@petalperfection.com', contact_phone: '(415) 555-1023', cost_per_unit: 850, reliability_score: 92, total_events: 24, on_time_count: 23, on_time_percentage: 95.8, avg_quality_rating: 4.7 },
      { venue_id: venue.id, name: 'Botanical Bliss', category: 'florals', contact_name: 'Sophia Chen', contact_email: 'sophia@botanicalbliss.com', contact_phone: '(415) 555-1024', cost_per_unit: 700, reliability_score: 86, total_events: 28, on_time_count: 24, on_time_percentage: 85.7, avg_quality_rating: 4.4 },
      { venue_id: venue.id, name: 'Luxe Blooms', category: 'florals', contact_name: 'Isabella Garcia', contact_email: 'isabella@luxeblooms.com', contact_phone: '(415) 555-1025', cost_per_unit: 950, reliability_score: 94, total_events: 20, on_time_count: 19, on_time_percentage: 95, avg_quality_rating: 4.8 },
      { venue_id: venue.id, name: 'Garden Dreams Florals', category: 'florals', contact_name: 'Mia Rodriguez', contact_email: 'mia@gardendreams.com', contact_phone: '(415) 555-1026', cost_per_unit: 650, reliability_score: 83, total_events: 25, on_time_count: 21, on_time_percentage: 84, avg_quality_rating: 4.2 },
      { venue_id: venue.id, name: 'Floral Artistry', category: 'florals', contact_name: 'Ava Thomas', contact_email: 'ava@floralartistry.com', contact_phone: '(415) 555-1027', cost_per_unit: 900, reliability_score: 91, total_events: 21, on_time_count: 20, on_time_percentage: 95.2, avg_quality_rating: 4.7 },

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

      // Entertainment vendors (8 total)
      { venue_id: venue.id, name: 'DJ Masters Entertainment', category: 'entertainment', contact_name: 'Chris Taylor', contact_email: 'chris@djmasters.com', contact_phone: '(415) 555-1006', cost_per_unit: 1200, reliability_score: 89, total_events: 40, on_time_count: 37, on_time_percentage: 92.5, avg_quality_rating: 4.6 },
      { venue_id: venue.id, name: 'Live Band Productions', category: 'entertainment', contact_name: 'Amanda Brooks', contact_email: 'amanda@livebandpro.com', contact_phone: '(415) 555-3002', cost_per_unit: 2500, reliability_score: 94, total_events: 16, on_time_count: 16, on_time_percentage: 100, avg_quality_rating: 4.9 },
      { venue_id: venue.id, name: 'Groove City DJs', category: 'entertainment', contact_name: 'Tyler Scott', contact_email: 'tyler@groovecity.com', contact_phone: '(415) 555-1034', cost_per_unit: 1100, reliability_score: 87, total_events: 38, on_time_count: 34, on_time_percentage: 89.5, avg_quality_rating: 4.4 },
      { venue_id: venue.id, name: 'Acoustic Harmony Band', category: 'entertainment', contact_name: 'Sarah Mitchell', contact_email: 'sarah@acousticharmony.com', contact_phone: '(415) 555-1035', cost_per_unit: 2200, reliability_score: 92, total_events: 18, on_time_count: 17, on_time_percentage: 94.4, avg_quality_rating: 4.7 },
      { venue_id: venue.id, name: 'Party Beats Entertainment', category: 'entertainment', contact_name: 'Justin Harris', contact_email: 'justin@partybeats.com', contact_phone: '(415) 555-1036', cost_per_unit: 1300, reliability_score: 90, total_events: 35, on_time_count: 32, on_time_percentage: 91.4, avg_quality_rating: 4.5 },
      { venue_id: venue.id, name: 'Symphony Strings Quartet', category: 'entertainment', contact_name: 'Victoria Clark', contact_email: 'victoria@symphonystrings.com', contact_phone: '(415) 555-1037', cost_per_unit: 1800, reliability_score: 96, total_events: 22, on_time_count: 22, on_time_percentage: 100, avg_quality_rating: 4.9 },
      { venue_id: venue.id, name: 'Electric Nights DJ Service', category: 'entertainment', contact_name: 'Brandon Lee', contact_email: 'brandon@electricnights.com', contact_phone: '(415) 555-1038', cost_per_unit: 1000, reliability_score: 85, total_events: 42, on_time_count: 36, on_time_percentage: 85.7, avg_quality_rating: 4.3 },
      { venue_id: venue.id, name: 'Jazz Collective Band', category: 'entertainment', contact_name: 'Nathan Young', contact_email: 'nathan@jazzcollective.com', contact_phone: '(415) 555-1039', cost_per_unit: 2000, reliability_score: 93, total_events: 20, on_time_count: 19, on_time_percentage: 95, avg_quality_rating: 4.8 },
    ];

    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .insert(vendorData)
      .select();

    if (vendorsError || !vendors || vendors.length === 0) {
      throw new Error('Failed to create vendors');
    }

    // 4. Create Events (24 events - 4x increase, distributed across spaces)
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
        { space_id: ballrooms[0].id, venue_id: venue.id, event_name: 'Annual Tech Conference 2026', event_type: 'conference', event_date: futureDate2.toISOString().split('T')[0], event_time: '09:00', guest_count: 450, budget_total: 65000, status: 'planning' },
        { space_id: ballrooms[1].id, venue_id: venue.id, event_name: 'Smith-Johnson Wedding', event_type: 'wedding', event_date: futureDate3.toISOString().split('T')[0], event_time: '17:00', guest_count: 300, budget_total: 45000, status: 'confirmed' },
        { space_id: ballrooms[2].id, venue_id: venue.id, event_name: 'Garcia-Patel Wedding', event_type: 'wedding', event_date: futureDate4.toISOString().split('T')[0], event_time: '18:00', guest_count: 280, budget_total: 42000, status: 'confirmed' },
        { space_id: ballrooms[3].id, venue_id: venue.id, event_name: 'New Year Gala 2027', event_type: 'corporate', event_date: futureDate6.toISOString().split('T')[0], event_time: '20:00', guest_count: 250, budget_total: 38000, status: 'planning' },
        { space_id: outdoorSpaces[0].id, venue_id: venue.id, event_name: 'Summer Garden Party', event_type: 'social', event_date: futureDate2.toISOString().split('T')[0], event_time: '15:00', guest_count: 120, budget_total: 18000, status: 'confirmed' },
        { space_id: outdoorSpaces[1].id, venue_id: venue.id, event_name: 'Spring Wedding Ceremony', event_type: 'wedding', event_date: futureDate3.toISOString().split('T')[0], event_time: '14:00', guest_count: 100, budget_total: 22000, status: 'planning' },
        { space_id: outdoorSpaces[2].id, venue_id: venue.id, event_name: 'Product Launch Event', event_type: 'corporate', event_date: futureDate1.toISOString().split('T')[0], event_time: '11:00', guest_count: 75, budget_total: 15000, status: 'confirmed' },
        { space_id: rooftopSpaces[0].id, venue_id: venue.id, event_name: 'Sunset Cocktail Reception', event_type: 'corporate', event_date: futureDate2.toISOString().split('T')[0], event_time: '18:30', guest_count: 90, budget_total: 16000, status: 'planning' },
        { space_id: rooftopSpaces[1].id, venue_id: venue.id, event_name: 'Networking Mixer', event_type: 'social', event_date: futureDate1.toISOString().split('T')[0], event_time: '17:00', guest_count: 70, budget_total: 12000, status: 'confirmed' },
        { space_id: rooftopSpaces[2].id, venue_id: venue.id, event_name: 'VIP Client Appreciation', event_type: 'corporate', event_date: futureDate5.toISOString().split('T')[0], event_time: '19:00', guest_count: 50, budget_total: 14000, status: 'planning' },
        { space_id: conferenceRooms[0].id, venue_id: venue.id, event_name: 'Board Strategy Session', event_type: 'conference', event_date: futureDate1.toISOString().split('T')[0], event_time: '09:00', guest_count: 18, budget_total: 5000, status: 'confirmed' },
        { space_id: conferenceRooms[1].id, venue_id: venue.id, event_name: 'Quarterly All-Hands Meeting', event_type: 'conference', event_date: futureDate2.toISOString().split('T')[0], event_time: '10:00', guest_count: 45, budget_total: 8000, status: 'planning' },

        // Past Events (12 events - completed)
        { space_id: ballrooms[0].id, venue_id: venue.id, event_name: 'Holiday Gala 2025', event_type: 'corporate', event_date: pastDate2.toISOString().split('T')[0], event_time: '19:00', guest_count: 400, budget_total: 55000, status: 'completed' },
        { space_id: ballrooms[1].id, venue_id: venue.id, event_name: 'Martinez-Lee Wedding', event_type: 'wedding', event_date: pastDate3.toISOString().split('T')[0], event_time: '16:00', guest_count: 320, budget_total: 48000, status: 'completed' },
        { space_id: ballrooms[2].id, venue_id: venue.id, event_name: 'Industry Awards Ceremony', event_type: 'corporate', event_date: pastDate1.toISOString().split('T')[0], event_time: '18:00', guest_count: 280, budget_total: 40000, status: 'completed' },
        { space_id: ballrooms[3].id, venue_id: venue.id, event_name: 'Anderson-Brown Wedding', event_type: 'wedding', event_date: pastDate4.toISOString().split('T')[0], event_time: '17:30', guest_count: 260, budget_total: 39000, status: 'completed' },
        { space_id: banquetHalls[0].id, venue_id: venue.id, event_name: 'Annual Fundraising Dinner', event_type: 'fundraiser', event_date: pastDate2.toISOString().split('T')[0], event_time: '18:30', guest_count: 220, budget_total: 32000, status: 'completed' },
        { space_id: banquetHalls[1].id, venue_id: venue.id, event_name: 'Corporate Team Building', event_type: 'corporate', event_date: pastDate1.toISOString().split('T')[0], event_time: '12:00', guest_count: 180, budget_total: 25000, status: 'completed' },
        { space_id: rooftopSpaces[0].id, venue_id: venue.id, event_name: 'Summer Sunset Soiree', event_type: 'social', event_date: pastDate3.toISOString().split('T')[0], event_time: '18:00', guest_count: 95, budget_total: 17000, status: 'completed' },
        { space_id: rooftopSpaces[1].id, venue_id: venue.id, event_name: 'Product Launch Party', event_type: 'corporate', event_date: pastDate2.toISOString().split('T')[0], event_time: '19:30', guest_count: 75, budget_total: 13000, status: 'completed' },
        { space_id: outdoorSpaces[0].id, venue_id: venue.id, event_name: 'Spring Garden Wedding', event_type: 'wedding', event_date: pastDate4.toISOString().split('T')[0], event_time: '15:00', guest_count: 130, budget_total: 24000, status: 'completed' },
        { space_id: outdoorSpaces[1].id, venue_id: venue.id, event_name: 'Charity Garden Party', event_type: 'fundraiser', event_date: pastDate3.toISOString().split('T')[0], event_time: '14:00', guest_count: 110, budget_total: 19000, status: 'completed' },
        { space_id: conferenceRooms[1].id, venue_id: venue.id, event_name: 'Leadership Workshop', event_type: 'conference', event_date: pastDate1.toISOString().split('T')[0], event_time: '09:00', guest_count: 40, budget_total: 7000, status: 'completed' },
        { space_id: conferenceRooms[2].id, venue_id: venue.id, event_name: 'Sales Kickoff Meeting', event_type: 'conference', event_date: pastDate2.toISOString().split('T')[0], event_time: '08:30', guest_count: 35, budget_total: 6500, status: 'completed' },
      ])
      .select();

    if (eventsError || !events || events.length === 0) {
      console.error('Events error details:', eventsError);
      throw new Error(eventsError?.message || 'Failed to create events');
    }

    // 4. Create Event-Vendor Assignments
    const assignments = [];

    // Tech Conference assignments
    assignments.push(
      {
        event_id: events[0].id,
        vendor_id: vendors.find((v) => v.name === 'Gourmet Catering Co.')?.id,
        vendor_type: 'primary',
        category: 'catering',
        quoted_cost: 15750, // 350 guests * $45
        status: 'pending',
      },
      {
        event_id: events[0].id,
        vendor_id: vendors.find((v) => v.name === 'TechSound Audio Visual')?.id,
        vendor_type: 'primary',
        category: 'av',
        quoted_cost: 1500,
        status: 'pending',
      }
    );

    // Wedding assignments
    assignments.push(
      {
        event_id: events[1].id,
        vendor_id: vendors.find((v) => v.name === 'Premium Feast Services')?.id,
        vendor_type: 'primary',
        category: 'catering',
        quoted_cost: 13000, // 200 guests * $65
        status: 'confirmed',
      },
      {
        event_id: events[1].id,
        vendor_id: vendors.find((v) => v.name === 'Bloom & Blossom')?.id,
        vendor_type: 'primary',
        category: 'florals',
        quoted_cost: 3200, // 4 arrangements * $800
        status: 'confirmed',
      },
      {
        event_id: events[1].id,
        vendor_id: vendors.find((v) => v.name === 'DJ Masters Entertainment')?.id,
        vendor_type: 'primary',
        category: 'entertainment',
        quoted_cost: 1200,
        status: 'confirmed',
      }
    );

    // Completed event 1 assignments with actual costs
    const completedEvent1Vendors = [
      {
        event_id: events[3].id,
        vendor_id: vendors.find((v) => v.name === 'Gourmet Catering Co.')?.id,
        vendor_type: 'primary',
        category: 'catering',
        quoted_cost: 13500,
        actual_cost: 13500,
        status: 'confirmed',
      },
      {
        event_id: events[3].id,
        vendor_id: vendors.find((v) => v.name === 'TechSound Audio Visual')?.id,
        vendor_type: 'primary',
        category: 'av',
        quoted_cost: 1500,
        actual_cost: 1650, // Slightly over
        status: 'confirmed',
      },
      {
        event_id: events[3].id,
        vendor_id: vendors.find((v) => v.name === 'VIP Valet Services')?.id,
        vendor_type: 'primary',
        category: 'parking',
        quoted_cost: 4500,
        actual_cost: 4350, // Slightly under
        status: 'confirmed',
      },
    ];
    assignments.push(...completedEvent1Vendors);

    // Completed event 2 assignments
    const completedEvent2Vendors = [
      {
        event_id: events[4].id,
        vendor_id: vendors.find((v) => v.name === 'Premium Feast Services')?.id,
        vendor_type: 'primary',
        category: 'catering',
        quoted_cost: 11700,
        actual_cost: 11700,
        status: 'confirmed',
      },
      {
        event_id: events[4].id,
        vendor_id: vendors.find((v) => v.name === 'ProAV Solutions')?.id,
        vendor_type: 'primary',
        category: 'av',
        quoted_cost: 2000,
        actual_cost: 2000,
        status: 'confirmed',
      },
    ];
    assignments.push(...completedEvent2Vendors);

    const { data: eventVendors, error: assignmentsError } = await supabase
      .from('event_vendors')
      .insert(assignments.filter((a) => a.vendor_id))
      .select();

    if (assignmentsError) {
      console.error('Assignments error:', assignmentsError);
    }

    // 5. Create Reviews for completed events
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
