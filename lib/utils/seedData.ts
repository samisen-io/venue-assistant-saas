import { SupabaseClient } from '@supabase/supabase-js';

export interface SeedDataResult {
  success: boolean;
  message: string;
  counts?: {
    venues: number;
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

  // Events (references venues)
  await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Vendors (references venues)
  await supabase.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

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

    // 1. Create Venues
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .insert([
        {
          owner_id: userId,
          name: 'Grand Ballroom Hotel',
          address: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zip_code: '94102',
          phone: '(415) 555-0100',
          email: 'events@grandballroom.com',
          capacity: 500,
          venue_type: 'hotel',
        },
        {
          owner_id: userId,
          name: 'Riverside Conference Center',
          address: '456 River Road',
          city: 'Portland',
          state: 'OR',
          zip_code: '97201',
          phone: '(503) 555-0200',
          email: 'info@riversidecc.com',
          capacity: 300,
          venue_type: 'conference_center',
        },
        {
          owner_id: userId,
          name: 'Downtown Banquet Hall',
          address: '789 Downtown Ave',
          city: 'Seattle',
          state: 'WA',
          zip_code: '98101',
          phone: '(206) 555-0300',
          email: 'bookings@downtownbanquet.com',
          capacity: 200,
          venue_type: 'banquet_hall',
        },
      ])
      .select();

    if (venuesError || !venues || venues.length === 0) {
      console.error('Venues error details:', venuesError);
      throw new Error(venuesError?.message || 'Failed to create venues');
    }

    const venue1 = venues[0];
    const venue2 = venues[1];
    const venue3 = venues[2];

    // 2. Create Vendors for each venue
    const vendorData = [
      // Catering vendors
      {
        venue_id: venue1.id,
        name: 'Gourmet Catering Co.',
        category: 'catering',
        contact_name: 'Sarah Johnson',
        contact_email: 'sarah@gourmetcatering.com',
        contact_phone: '(415) 555-1001',
        cost_per_unit: 45,
        website: 'https://gourmetcatering.example.com',
        reliability_score: 92,
        total_events: 15,
        on_time_count: 14,
        on_time_percentage: 93.3,
        avg_quality_rating: 4.7,
      },
      {
        venue_id: venue1.id,
        name: 'Budget Bites Catering',
        category: 'catering',
        contact_name: 'Mike Chen',
        contact_email: 'mike@budgetbites.com',
        contact_phone: '(415) 555-1002',
        cost_per_unit: 25,
        reliability_score: 75,
        total_events: 20,
        on_time_count: 16,
        on_time_percentage: 80,
        avg_quality_rating: 3.8,
      },
      {
        venue_id: venue2.id,
        name: 'Premium Feast Services',
        category: 'catering',
        contact_name: 'Emily Rodriguez',
        contact_email: 'emily@premiumfeast.com',
        contact_phone: '(503) 555-2001',
        cost_per_unit: 65,
        reliability_score: 95,
        total_events: 12,
        on_time_count: 12,
        on_time_percentage: 100,
        avg_quality_rating: 4.9,
      },
      // AV vendors
      {
        venue_id: venue1.id,
        name: 'TechSound Audio Visual',
        category: 'av',
        contact_name: 'David Park',
        contact_email: 'david@techsound.com',
        contact_phone: '(415) 555-1003',
        cost_per_unit: 1500,
        reliability_score: 88,
        total_events: 25,
        on_time_count: 23,
        on_time_percentage: 92,
        avg_quality_rating: 4.5,
      },
      {
        venue_id: venue2.id,
        name: 'ProAV Solutions',
        category: 'av',
        contact_name: 'Lisa Anderson',
        contact_email: 'lisa@proavsolutions.com',
        contact_phone: '(503) 555-2002',
        cost_per_unit: 2000,
        reliability_score: 91,
        total_events: 18,
        on_time_count: 17,
        on_time_percentage: 94.4,
        avg_quality_rating: 4.6,
      },
      // Florals vendors
      {
        venue_id: venue1.id,
        name: 'Bloom & Blossom',
        category: 'florals',
        contact_name: 'Rachel Green',
        contact_email: 'rachel@bloomblossom.com',
        contact_phone: '(415) 555-1004',
        cost_per_unit: 800,
        reliability_score: 90,
        total_events: 30,
        on_time_count: 28,
        on_time_percentage: 93.3,
        avg_quality_rating: 4.8,
      },
      {
        venue_id: venue3.id,
        name: 'Elegant Petals',
        category: 'florals',
        contact_name: 'Jennifer Wu',
        contact_email: 'jennifer@elegantpetals.com',
        contact_phone: '(206) 555-3001',
        cost_per_unit: 600,
        reliability_score: 85,
        total_events: 22,
        on_time_count: 19,
        on_time_percentage: 86.4,
        avg_quality_rating: 4.3,
      },
      // Parking vendors
      {
        venue_id: venue1.id,
        name: 'VIP Valet Services',
        category: 'parking',
        contact_name: 'Tom Martinez',
        contact_email: 'tom@vipvalet.com',
        contact_phone: '(415) 555-1005',
        cost_per_unit: 15,
        reliability_score: 87,
        total_events: 35,
        on_time_count: 32,
        on_time_percentage: 91.4,
        avg_quality_rating: 4.4,
      },
      // Security vendors
      {
        venue_id: venue2.id,
        name: 'SafeGuard Security',
        category: 'security',
        contact_name: 'James Wilson',
        contact_email: 'james@safeguard.com',
        contact_phone: '(503) 555-2003',
        cost_per_unit: 50,
        reliability_score: 93,
        total_events: 28,
        on_time_count: 27,
        on_time_percentage: 96.4,
        avg_quality_rating: 4.7,
      },
      // Entertainment vendors
      {
        venue_id: venue1.id,
        name: 'DJ Masters Entertainment',
        category: 'entertainment',
        contact_name: 'Chris Taylor',
        contact_email: 'chris@djmasters.com',
        contact_phone: '(415) 555-1006',
        cost_per_unit: 1200,
        reliability_score: 89,
        total_events: 40,
        on_time_count: 37,
        on_time_percentage: 92.5,
        avg_quality_rating: 4.6,
      },
      {
        venue_id: venue3.id,
        name: 'Live Band Productions',
        category: 'entertainment',
        contact_name: 'Amanda Brooks',
        contact_email: 'amanda@livebandpro.com',
        contact_phone: '(206) 555-3002',
        cost_per_unit: 2500,
        reliability_score: 94,
        total_events: 16,
        on_time_count: 16,
        on_time_percentage: 100,
        avg_quality_rating: 4.9,
      },
    ];

    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .insert(vendorData)
      .select();

    if (vendorsError || !vendors || vendors.length === 0) {
      throw new Error('Failed to create vendors');
    }

    // 3. Create Events
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 30);
    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 60);
    const futureDate3 = new Date(today);
    futureDate3.setDate(today.getDate() + 90);
    const pastDate1 = new Date(today);
    pastDate1.setDate(today.getDate() - 30);
    const pastDate2 = new Date(today);
    pastDate2.setDate(today.getDate() - 60);

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .insert([
        {
          venue_id: venue1.id,
          event_name: 'Annual Tech Conference 2026',
          event_type: 'conference',
          event_date: futureDate1.toISOString().split('T')[0],
          event_time: '09:00',
          guest_count: 350,
          budget_total: 50000,
          status: 'planning',
        },
        {
          venue_id: venue1.id,
          event_name: 'Smith-Johnson Wedding',
          event_type: 'wedding',
          event_date: futureDate2.toISOString().split('T')[0],
          event_time: '17:00',
          guest_count: 200,
          budget_total: 35000,
          status: 'confirmed',
        },
        {
          venue_id: venue2.id,
          event_name: 'Q4 Business Summit',
          event_type: 'conference',
          event_date: futureDate3.toISOString().split('T')[0],
          event_time: '08:30',
          guest_count: 150,
          budget_total: 25000,
          status: 'planning',
        },
        {
          venue_id: venue1.id,
          event_name: 'Corporate Gala 2025',
          event_type: 'corporate',
          event_date: pastDate1.toISOString().split('T')[0],
          event_time: '18:00',
          guest_count: 300,
          budget_total: 45000,
          status: 'completed',
        },
        {
          venue_id: venue2.id,
          event_name: 'Spring Charity Auction',
          event_type: 'fundraiser',
          event_date: pastDate2.toISOString().split('T')[0],
          event_time: '19:00',
          guest_count: 180,
          budget_total: 30000,
          status: 'completed',
        },
        {
          venue_id: venue3.id,
          event_name: 'Holiday Party 2025',
          event_type: 'corporate',
          event_date: pastDate1.toISOString().split('T')[0],
          event_time: '18:30',
          guest_count: 120,
          budget_total: 20000,
          status: 'completed',
        },
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
        venues: venues.length,
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
