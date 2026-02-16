-- =====================================================
-- MARKETPLACE SEED DATA
-- =====================================================
-- Creates 24 test venues with diverse attributes for
-- marketplace development and testing.
-- Run with service_role key (bypasses RLS).
-- Safe to re-run: uses ON CONFLICT DO NOTHING.
--
-- NOTE: This creates test auth users and profiles.
-- Use only in development environments.
-- =====================================================


-- Create test auth users (required before profiles due to FK constraint)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data) VALUES
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'venue1@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'venue2@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'venue3@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'venue4@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'venue5@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'venue6@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'venue7@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000008', 'authenticated', 'authenticated', 'venue8@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000009', 'authenticated', 'authenticated', 'venue9@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000010', 'authenticated', 'authenticated', 'venue10@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000011', 'authenticated', 'authenticated', 'venue11@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000012', 'authenticated', 'authenticated', 'venue12@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000013', 'authenticated', 'authenticated', 'venue13@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000014', 'authenticated', 'authenticated', 'venue14@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000015', 'authenticated', 'authenticated', 'venue15@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000016', 'authenticated', 'authenticated', 'venue16@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000017', 'authenticated', 'authenticated', 'venue17@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000018', 'authenticated', 'authenticated', 'venue18@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000019', 'authenticated', 'authenticated', 'venue19@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000020', 'authenticated', 'authenticated', 'venue20@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000021', 'authenticated', 'authenticated', 'venue21@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000022', 'authenticated', 'authenticated', 'venue22@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000023', 'authenticated', 'authenticated', 'venue23@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb),
  ('00000000-0000-0000-0000-000000000000', 'a0000001-0000-0000-0000-000000000024', 'authenticated', 'authenticated', 'venue24@test.marketplace', crypt('testpassword123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;


-- Create test profiles (using deterministic UUIDs for idempotency)
INSERT INTO profiles (id, email, full_name, company_name, phone) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'venue1@test.marketplace', 'Sarah Johnson', 'Grandeur Events LLC', '(214) 555-0101'),
  ('a0000001-0000-0000-0000-000000000002', 'venue2@test.marketplace', 'Michael Chen', 'Skyline Hospitality', '(512) 555-0102'),
  ('a0000001-0000-0000-0000-000000000003', 'venue3@test.marketplace', 'Emily Rivera', 'Heritage Venues Inc', '(713) 555-0103'),
  ('a0000001-0000-0000-0000-000000000004', 'venue4@test.marketplace', 'James Patterson', 'Urban Spaces Group', '(214) 555-0104'),
  ('a0000001-0000-0000-0000-000000000005', 'venue5@test.marketplace', 'Olivia Williams', 'Lakeside Properties', '(817) 555-0105'),
  ('a0000001-0000-0000-0000-000000000006', 'venue6@test.marketplace', 'David Martinez', 'The Garden Co', '(210) 555-0106'),
  ('a0000001-0000-0000-0000-000000000007', 'venue7@test.marketplace', 'Ashley Brown', 'Starlight Venues', '(512) 555-0107'),
  ('a0000001-0000-0000-0000-000000000008', 'venue8@test.marketplace', 'Robert Taylor', 'Summit Conference Group', '(214) 555-0108'),
  ('a0000001-0000-0000-0000-000000000009', 'venue9@test.marketplace', 'Jennifer Davis', 'Coastal Events', '(361) 555-0109'),
  ('a0000001-0000-0000-0000-000000000010', 'venue10@test.marketplace', 'Christopher Wilson', 'Metro Convention Center', '(713) 555-0110'),
  ('a0000001-0000-0000-0000-000000000011', 'venue11@test.marketplace', 'Amanda Lee', 'Rustic Charm Venues', '(940) 555-0111'),
  ('a0000001-0000-0000-0000-000000000012', 'venue12@test.marketplace', 'Daniel Garcia', 'Pearl Hospitality', '(210) 555-0112'),
  ('a0000001-0000-0000-0000-000000000013', 'venue13@test.marketplace', 'Lauren Anderson', 'Vineyard Events', '(830) 555-0113'),
  ('a0000001-0000-0000-0000-000000000014', 'venue14@test.marketplace', 'Matthew Thomas', 'Downtown Event Space', '(214) 555-0114'),
  ('a0000001-0000-0000-0000-000000000015', 'venue15@test.marketplace', 'Jessica Robinson', 'The Arts District', '(512) 555-0115'),
  ('a0000001-0000-0000-0000-000000000016', 'venue16@test.marketplace', 'Andrew Clark', 'Bluebonnet Ranch', '(254) 555-0116'),
  ('a0000001-0000-0000-0000-000000000017', 'venue17@test.marketplace', 'Stephanie Hall', 'Magnolia Hall Events', '(903) 555-0117'),
  ('a0000001-0000-0000-0000-000000000018', 'venue18@test.marketplace', 'Kevin Allen', 'Industrial Chic Venues', '(817) 555-0118'),
  ('a0000001-0000-0000-0000-000000000019', 'venue19@test.marketplace', 'Rachel Young', 'The Botanical House', '(512) 555-0119'),
  ('a0000001-0000-0000-0000-000000000020', 'venue20@test.marketplace', 'Brian King', 'Hilltop Event Center', '(210) 555-0120'),
  ('a0000001-0000-0000-0000-000000000021', 'venue21@test.marketplace', 'Nicole Wright', 'Lakeview Lodge', '(903) 555-0121'),
  ('a0000001-0000-0000-0000-000000000022', 'venue22@test.marketplace', 'Joshua Lopez', 'The Historic Depot', '(817) 555-0122'),
  ('a0000001-0000-0000-0000-000000000023', 'venue23@test.marketplace', 'Samantha Hill', 'Sunset Terrace', '(361) 555-0123'),
  ('a0000001-0000-0000-0000-000000000024', 'venue24@test.marketplace', 'Tyler Scott', 'The Modern Loft', '(214) 555-0124')
ON CONFLICT (id) DO NOTHING;


-- Create 24 diverse venues across Texas cities
INSERT INTO venues (id, owner_id, name, address, city, state, zip_code, phone, email, venue_type, description, website, page_status, latitude, longitude, view_count, inquiry_count) VALUES
  -- Dallas venues
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'The Grandeur Ballroom', '1200 Commerce St', 'Dallas', 'TX', '75201', '(214) 555-0201', 'events@grandeurballroom.test', 'banquet_hall', 'An elegant ballroom in the heart of Dallas, perfect for weddings, galas, and corporate events. Features crystal chandeliers, marble floors, and a stunning rooftop terrace with skyline views.', 'https://grandeurballroom.test', 'published', 32.7767, -96.7970, 342, 28),
  ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'Urban Loft Dallas', '500 Elm St', 'Dallas', 'TX', '75202', '(214) 555-0204', 'events@urbanloftdallas.test', 'conference_center', 'A modern industrial-chic event space in Deep Ellum, ideal for corporate retreats, product launches, and creative celebrations. Exposed brick, soaring ceilings, and state-of-the-art AV.', 'https://urbanloftdallas.test', 'published', 32.7831, -96.7836, 187, 15),
  ('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'Summit Conference Center', '3000 Oak Lawn Ave', 'Dallas', 'TX', '75219', '(214) 555-0208', 'events@summitcc.test', 'conference_center', 'Full-service conference center with 12 meeting rooms, a 500-seat auditorium, and complete catering services. Perfect for multi-day conferences and trade shows.', 'https://summitcc.test', 'published', 32.8098, -96.8068, 456, 52),
  ('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000014', 'The Adolphus Event Hall', '1321 Commerce St', 'Dallas', 'TX', '75201', '(214) 555-0214', 'events@adolphushall.test', 'hotel', 'Historic downtown venue inside a restored 1912 hotel. Combines old-world charm with modern amenities. Multiple event spaces from intimate dining rooms to grand ballrooms.', 'https://adolphushall.test', 'published', 32.7801, -96.7989, 298, 34),
  ('b0000001-0000-0000-0000-000000000024', 'a0000001-0000-0000-0000-000000000024', 'The Modern Gallery', '2100 Ross Ave', 'Dallas', 'TX', '75201', '(214) 555-0224', 'events@moderngallery.test', 'conference_center', 'A contemporary art gallery that doubles as a stunning event venue. White walls, natural light, and rotating art installations create a unique backdrop for any event.', 'https://moderngallery.test', 'published', 32.7872, -96.7938, 89, 7),

  -- Austin venues
  ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'Skyline Rooftop Austin', '200 Congress Ave', 'Austin', 'TX', '78701', '(512) 555-0202', 'events@skylinerooftop.test', 'hotel', 'Breathtaking rooftop venue with panoramic views of the Austin skyline and Lady Bird Lake. Indoor-outdoor flexibility, premium bar service, and gourmet catering options.', 'https://skylinerooftop.test', 'published', 30.2672, -97.7431, 523, 41),
  ('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'Starlight Pavilion', '4500 S Lamar Blvd', 'Austin', 'TX', '78745', '(512) 555-0207', 'events@starlightpavilion.test', 'banquet_hall', 'Open-air pavilion surrounded by live oaks and string lights. Bohemian elegance meets Texas charm. Live music stage, fire pits, and farm-to-table catering.', 'https://starlightpavilion.test', 'published', 30.2302, -97.7939, 412, 38),
  ('b0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000015', 'The Arts District Studio', '1011 San Jacinto Blvd', 'Austin', 'TX', '78701', '(512) 555-0215', 'events@artsdistrictstudio.test', 'conference_center', 'Creative event space in the heart of Austin''s arts district. Versatile layout, gallery walls, and a private courtyard. Perfect for launches, pop-ups, and celebrations.', 'https://artsdistrictstudio.test', 'published', 30.2710, -97.7368, 178, 12),
  ('b0000001-0000-0000-0000-000000000019', 'a0000001-0000-0000-0000-000000000019', 'The Botanical House', '5800 Walter E Long Park Rd', 'Austin', 'TX', '78725', '(512) 555-0219', 'events@botanicalhouse.test', 'resort', 'A greenhouse-inspired venue surrounded by curated gardens and native Texas wildflowers. Floor-to-ceiling glass walls, climate-controlled, and stunning at every season.', 'https://botanicalhouse.test', 'published', 30.3126, -97.6237, 267, 22),

  -- Houston venues
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'Heritage Manor Houston', '1500 Hermann Dr', 'Houston', 'TX', '77004', '(713) 555-0203', 'events@heritagemanor.test', 'resort', 'A historic estate surrounded by manicured gardens and ancient oaks. Multiple indoor and outdoor event spaces with old Southern charm and modern luxury.', 'https://heritagemanor.test', 'published', 29.7220, -95.3885, 389, 33),
  ('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010', 'Metro Convention Hall', '1001 Avenida de las Americas', 'Houston', 'TX', '77010', '(713) 555-0210', 'events@metroconvention.test', 'conference_center', 'Large-scale convention center with 50,000 sq ft of flexible event space. Exhibition halls, breakout rooms, and a grand ballroom. Full AV and IT infrastructure.', 'https://metroconvention.test', 'published', 29.7525, -95.3565, 612, 67),

  -- San Antonio venues
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 'The Garden at Pearl', '200 E Grayson St', 'San Antonio', 'TX', '78215', '(210) 555-0206', 'events@gardenatpearl.test', 'resort', 'Nestled in the Pearl District along the River Walk, this garden venue offers a blend of nature and urban sophistication. Waterfalls, stone pathways, and twinkling lights.', 'https://gardenatpearl.test', 'published', 29.4435, -98.4801, 445, 39),
  ('b0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000012', 'Pearl Ballroom', '303 Pearl Pkwy', 'San Antonio', 'TX', '78215', '(210) 555-0212', 'events@pearlballroom.test', 'banquet_hall', 'Upscale ballroom in the Pearl District with exposed industrial beams and floor-to-ceiling windows overlooking the River Walk. Modern elegance with historic character.', 'https://pearlballroom.test', 'published', 29.4429, -98.4789, 334, 29),
  ('b0000001-0000-0000-0000-000000000020', 'a0000001-0000-0000-0000-000000000020', 'Hilltop Event Center', '18730 Stone Oak Pkwy', 'San Antonio', 'TX', '78258', '(210) 555-0220', 'events@hilltopcenter.test', 'conference_center', 'Hilltop venue with sweeping views of the Texas Hill Country. Modern facility with indoor/outdoor options, perfect for corporate events and milestone celebrations.', 'https://hilltopcenter.test', 'published', 29.6236, -98.4824, 156, 11),

  -- Fort Worth venues
  ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'Lakeside Estate', '6500 Lake Shore Dr', 'Fort Worth', 'TX', '76135', '(817) 555-0205', 'events@lakesideestate.test', 'resort', 'A waterfront estate on Eagle Mountain Lake with private dock, manicured grounds, and a restored farmhouse. Rustic elegance for weddings and retreats.', 'https://lakesideestate.test', 'published', 32.8852, -97.4719, 278, 24),
  ('b0000001-0000-0000-0000-000000000018', 'a0000001-0000-0000-0000-000000000018', 'The Foundry Fort Worth', '200 Carroll St', 'Fort Worth', 'TX', '76107', '(817) 555-0218', 'events@foundryforth.test', 'conference_center', 'A converted iron foundry with exposed steel, polished concrete, and dramatic lighting. Industrial-chic venue for modern weddings, corporate events, and art exhibitions.', 'https://foundryforth.test', 'published', 32.7499, -97.3326, 201, 16),
  ('b0000001-0000-0000-0000-000000000022', 'a0000001-0000-0000-0000-000000000022', 'The Historic Depot', '1401 Jones St', 'Fort Worth', 'TX', '76102', '(817) 555-0222', 'events@historicdepot.test', 'banquet_hall', 'A beautifully restored 1920s train depot in the Stockyards district. Vaulted ceilings, original tile work, and a covered outdoor platform for cocktail hours.', 'https://historicdepot.test', 'published', 32.7900, -97.3474, 245, 19),

  -- Other Texas cities
  ('b0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'Coastal Breeze Pavilion', '100 Shoreline Blvd', 'Corpus Christi', 'TX', '78401', '(361) 555-0209', 'events@coastalbreeze.test', 'resort', 'Oceanfront event pavilion on Corpus Christi Bay. Open-air design with retractable walls, ocean breezes, and spectacular sunset views. Beach ceremonies available.', 'https://coastalbreeze.test', 'published', 27.8006, -97.3964, 198, 14),
  ('b0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000011', 'Rustic Charm Ranch', '8800 FM 1830', 'Argyle', 'TX', '76226', '(940) 555-0211', 'events@rusticcharmranch.test', 'resort', 'A 200-acre working ranch with a restored barn, outdoor amphitheater, and luxury glamping. Western-themed events with gourmet ranch cuisine and horseback activities.', 'https://rusticcharmranch.test', 'published', 33.1181, -97.1833, 167, 13),
  ('b0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'Hill Country Vineyard', '2200 Vineyard Lane', 'Fredericksburg', 'TX', '78624', '(830) 555-0213', 'events@hillcountryvineyard.test', 'resort', 'A working vineyard in the heart of Texas Hill Country. Tuscan-inspired architecture, barrel room receptions, and wine-paired dining under the stars.', 'https://hillcountryvineyard.test', 'published', 30.2752, -98.8720, 356, 31),
  ('b0000001-0000-0000-0000-000000000016', 'a0000001-0000-0000-0000-000000000016', 'Bluebonnet Ranch', '4400 Ranch Road 12', 'Wimberley', 'TX', '78676', '(254) 555-0216', 'events@bluebonnetranch.test', 'resort', 'Scenic Hill Country ranch with a restored limestone barn, cypress-lined creek, and wildflower meadows. Intimate venue for destination weddings and private retreats.', 'https://bluebonnetranch.test', 'published', 29.9974, -98.0987, 289, 25),
  ('b0000001-0000-0000-0000-000000000017', 'a0000001-0000-0000-0000-000000000017', 'Magnolia Hall', '300 N Main St', 'Tyler', 'TX', '75702', '(903) 555-0217', 'events@magnoliahall.test', 'banquet_hall', 'Classic Southern venue surrounded by magnolia trees and rose gardens. Antebellum-inspired architecture with modern amenities. Bridal suite and groom''s quarters included.', 'https://magnoliahall.test', 'published', 32.3513, -95.3011, 134, 10),
  ('b0000001-0000-0000-0000-000000000021', 'a0000001-0000-0000-0000-000000000021', 'Lakeview Lodge', '1500 Pine Island Rd', 'Jefferson', 'TX', '75657', '(903) 555-0221', 'events@lakeviewlodge.test', 'resort', 'Lakefront lodge nestled in the East Texas pines. Lodge-style architecture with a stone fireplace, wrap-around porch, and private lake access. Intimate and serene.', 'https://lakeviewlodge.test', 'draft', 32.7576, -94.3496, 45, 2),
  ('b0000001-0000-0000-0000-000000000023', 'a0000001-0000-0000-0000-000000000023', 'Sunset Terrace', '300 N Shoreline Blvd', 'Corpus Christi', 'TX', '78401', '(361) 555-0223', 'events@sunsetterrace.test', 'hotel', 'Rooftop terrace venue with unobstructed bay views. Modern design, retractable glass roof, and a stunning sunset backdrop. Full bar and catering services.', 'https://sunsetterrace.test', 'published', 27.7994, -97.3936, 112, 8)
ON CONFLICT (id) DO NOTHING;


-- Create venue_public_settings for all venues
INSERT INTO venue_public_settings (venue_id, is_visible_on_marketplace, featured, search_keywords, auto_respond_enabled, auto_respond_message, response_time_goal) VALUES
  ('b0000001-0000-0000-0000-000000000001', true, true, ARRAY['dallas', 'ballroom', 'wedding', 'gala', 'corporate', 'luxury'], true, 'Thank you for your inquiry! Our events team will get back to you within 24 hours.', '24h'),
  ('b0000001-0000-0000-0000-000000000002', true, true, ARRAY['austin', 'rooftop', 'skyline', 'cocktail', 'corporate', 'party'], true, 'Thanks for reaching out! We''ll respond within a few hours.', '4h'),
  ('b0000001-0000-0000-0000-000000000003', true, false, ARRAY['houston', 'estate', 'garden', 'wedding', 'southern', 'historic'], true, 'Thank you for your interest in Heritage Manor! We will contact you shortly.', '24h'),
  ('b0000001-0000-0000-0000-000000000004', true, false, ARRAY['dallas', 'loft', 'industrial', 'corporate', 'product launch', 'creative'], false, NULL, '24h'),
  ('b0000001-0000-0000-0000-000000000005', true, false, ARRAY['fort worth', 'lakeside', 'estate', 'wedding', 'retreat', 'rustic'], true, 'We''d love to host your event! Our coordinator will reach out within 48 hours.', '48h'),
  ('b0000001-0000-0000-0000-000000000006', true, true, ARRAY['san antonio', 'garden', 'river walk', 'outdoor', 'wedding', 'nature'], true, 'Thank you for your inquiry about The Garden at Pearl!', '12h'),
  ('b0000001-0000-0000-0000-000000000007', true, false, ARRAY['austin', 'pavilion', 'outdoor', 'bohemian', 'live music', 'wedding'], false, NULL, '24h'),
  ('b0000001-0000-0000-0000-000000000008', true, true, ARRAY['dallas', 'conference', 'convention', 'trade show', 'meeting', 'corporate'], true, 'Thank you for considering Summit Conference Center. Our sales team will respond within 1 business hour.', '1h'),
  ('b0000001-0000-0000-0000-000000000009', true, false, ARRAY['corpus christi', 'beach', 'ocean', 'wedding', 'sunset', 'coastal'], false, NULL, '24h'),
  ('b0000001-0000-0000-0000-000000000010', true, true, ARRAY['houston', 'convention', 'expo', 'conference', 'large event', 'trade show'], true, 'Thank you for your inquiry. A dedicated event coordinator will contact you shortly.', '4h'),
  ('b0000001-0000-0000-0000-000000000011', true, false, ARRAY['argyle', 'ranch', 'rustic', 'barn', 'western', 'wedding', 'outdoor'], true, 'Howdy! Thanks for your interest in Rustic Charm Ranch!', '48h'),
  ('b0000001-0000-0000-0000-000000000012', true, false, ARRAY['san antonio', 'pearl district', 'ballroom', 'wedding', 'upscale', 'river walk'], false, NULL, '24h'),
  ('b0000001-0000-0000-0000-000000000013', true, true, ARRAY['fredericksburg', 'vineyard', 'wine', 'hill country', 'wedding', 'destination'], true, 'Thank you for your inquiry! Our vineyard events team will be in touch soon.', '24h'),
  ('b0000001-0000-0000-0000-000000000014', true, false, ARRAY['dallas', 'historic', 'hotel', 'downtown', 'wedding', 'gala', 'elegant'], false, NULL, '24h'),
  ('b0000001-0000-0000-0000-000000000015', true, false, ARRAY['austin', 'arts', 'gallery', 'creative', 'pop-up', 'launch', 'studio'], false, NULL, '24h'),
  ('b0000001-0000-0000-0000-000000000016', true, false, ARRAY['wimberley', 'hill country', 'ranch', 'barn', 'wedding', 'intimate', 'destination'], true, 'Thank you for considering Bluebonnet Ranch for your special day!', '48h'),
  ('b0000001-0000-0000-0000-000000000017', true, false, ARRAY['tyler', 'southern', 'magnolia', 'wedding', 'classic', 'garden'], false, NULL, '24h'),
  ('b0000001-0000-0000-0000-000000000018', true, false, ARRAY['fort worth', 'industrial', 'foundry', 'modern', 'wedding', 'corporate', 'art'], false, NULL, '24h'),
  ('b0000001-0000-0000-0000-000000000019', true, false, ARRAY['austin', 'botanical', 'greenhouse', 'garden', 'wedding', 'nature', 'unique'], true, 'Thank you for your interest in The Botanical House!', '24h'),
  ('b0000001-0000-0000-0000-000000000020', true, false, ARRAY['san antonio', 'hilltop', 'hill country', 'views', 'corporate', 'celebration'], false, NULL, '24h'),
  ('b0000001-0000-0000-0000-000000000021', false, false, ARRAY['jefferson', 'lake', 'lodge', 'intimate', 'retreat'], false, NULL, '48h'),
  ('b0000001-0000-0000-0000-000000000022', true, false, ARRAY['fort worth', 'historic', 'stockyards', 'train depot', 'western', 'wedding'], false, NULL, '24h'),
  ('b0000001-0000-0000-0000-000000000023', true, false, ARRAY['corpus christi', 'rooftop', 'bay', 'sunset', 'modern', 'cocktail'], false, NULL, '24h'),
  ('b0000001-0000-0000-0000-000000000024', true, false, ARRAY['dallas', 'gallery', 'modern', 'art', 'corporate', 'creative'], false, NULL, '24h')
ON CONFLICT (venue_id) DO NOTHING;


-- Create spaces for each venue (2-3 spaces per venue, showing first 8 venues)
INSERT INTO spaces (id, venue_id, name, capacity, space_type, square_footage, hourly_rate, amenities, is_active, capacity_standing, display_order, public_description) VALUES
  -- The Grandeur Ballroom (Dallas)
  ('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Grand Ballroom', 400, 'ballroom', 5500, 2000, ARRAY['Stage', 'Dance Floor', 'AV Equipment', 'WiFi', 'Catering Kitchen'], true, 550, 1, 'Our flagship ballroom with crystal chandeliers and a built-in stage.'),
  ('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'Skyline Terrace', 150, 'rooftop', 2000, 1200, ARRAY['Bar Area', 'Outdoor Space', 'WiFi', 'Heaters'], true, 200, 2, 'Rooftop terrace with panoramic views of the Dallas skyline.'),
  ('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', 'Executive Suite', 30, 'conference_room', 600, 400, ARRAY['Projector', 'WiFi', 'Whiteboard', 'Video Conferencing'], true, 40, 3, 'Private meeting room for board meetings and VIP gatherings.'),

  -- Skyline Rooftop Austin
  ('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000002', 'Main Rooftop', 250, 'rooftop', 3500, 1800, ARRAY['Bar Area', 'Dance Floor', 'AV Equipment', 'WiFi', 'Outdoor Space'], true, 350, 1, 'Open-air rooftop with unobstructed views of the Austin skyline.'),
  ('c0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000002', 'Indoor Lounge', 100, 'banquet_hall', 1500, 800, ARRAY['Bar Area', 'AV Equipment', 'WiFi', 'Climate Control'], true, 130, 2, 'Climate-controlled indoor lounge with floor-to-ceiling windows.'),

  -- Heritage Manor Houston
  ('c0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000003', 'Manor House', 200, 'banquet_hall', 3000, 1500, ARRAY['Dance Floor', 'AV Equipment', 'WiFi', 'Catering Kitchen', 'Bridal Suite'], true, 250, 1, 'The main estate house with ornate parlors and a grand dining room.'),
  ('c0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000003', 'Garden Pavilion', 300, 'outdoor_garden', 4000, 1200, ARRAY['Outdoor Space', 'String Lights', 'Dance Floor'], true, 400, 2, 'Open-air pavilion surrounded by century-old oaks and manicured gardens.'),

  -- Urban Loft Dallas
  ('c0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000004', 'Main Loft', 200, 'banquet_hall', 3200, 1100, ARRAY['AV Equipment', 'WiFi', 'Projector', 'Sound System'], true, 300, 1, 'Open-concept loft with exposed brick and 20-foot ceilings.'),
  ('c0000001-0000-0000-0000-000000000009', 'b0000001-0000-0000-0000-000000000004', 'Mezzanine', 60, 'meeting_room', 800, 500, ARRAY['WiFi', 'Projector', 'Whiteboard'], true, 80, 2, 'Elevated mezzanine overlooking the main loft space.'),

  -- Lakeside Estate Fort Worth
  ('c0000001-0000-0000-0000-000000000010', 'b0000001-0000-0000-0000-000000000005', 'Lakefront Lawn', 250, 'outdoor_garden', 5000, 1400, ARRAY['Outdoor Space', 'String Lights', 'Tent Available'], true, 350, 1, 'Expansive lakefront lawn with private dock and sunset views.'),
  ('c0000001-0000-0000-0000-000000000011', 'b0000001-0000-0000-0000-000000000005', 'Farmhouse Hall', 120, 'banquet_hall', 1800, 900, ARRAY['Dance Floor', 'Bar Area', 'Fireplace', 'WiFi'], true, 150, 2, 'Restored farmhouse with rustic charm and modern comforts.'),

  -- The Garden at Pearl (San Antonio)
  ('c0000001-0000-0000-0000-000000000012', 'b0000001-0000-0000-0000-000000000006', 'Main Garden', 200, 'outdoor_garden', 3500, 1300, ARRAY['Outdoor Space', 'String Lights', 'Fountain', 'WiFi'], true, 280, 1, 'Lush garden with stone pathways, waterfalls, and native plantings.'),
  ('c0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000006', 'River Room', 80, 'banquet_hall', 1200, 700, ARRAY['AV Equipment', 'WiFi', 'Bar Area', 'River View'], true, 100, 2, 'Intimate indoor space with panoramic River Walk views.'),

  -- Summit Conference Center (Dallas)
  ('c0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000008', 'Main Auditorium', 500, 'ballroom', 8000, 2500, ARRAY['Stage', 'AV Equipment', 'WiFi', 'Projector', 'Sound System', 'Lighting Rig'], true, 600, 1, '500-seat auditorium with tiered seating and full AV production.'),
  ('c0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000008', 'Breakout Room A', 50, 'conference_room', 700, 350, ARRAY['WiFi', 'Projector', 'Whiteboard', 'Video Conferencing'], true, 60, 2, 'Flexible breakout room for workshops and small sessions.'),
  ('c0000001-0000-0000-0000-000000000016', 'b0000001-0000-0000-0000-000000000008', 'Exhibition Hall', 1000, 'other', 15000, 3500, ARRAY['WiFi', 'Loading Dock', 'Power Outlets', 'Climate Control'], true, 1500, 3, 'Open exhibition hall for trade shows, expos, and large-scale events.')
ON CONFLICT (id) DO NOTHING;


-- Create venue_event_types for select venues
INSERT INTO venue_event_types (venue_id, event_type_key, event_type_label) VALUES
  -- The Grandeur Ballroom
  ('b0000001-0000-0000-0000-000000000001', 'wedding', 'Wedding'),
  ('b0000001-0000-0000-0000-000000000001', 'corporate', 'Corporate Event'),
  ('b0000001-0000-0000-0000-000000000001', 'gala', 'Gala'),
  ('b0000001-0000-0000-0000-000000000001', 'conference', 'Conference'),
  -- Skyline Rooftop Austin
  ('b0000001-0000-0000-0000-000000000002', 'corporate', 'Corporate Event'),
  ('b0000001-0000-0000-0000-000000000002', 'party', 'Party'),
  ('b0000001-0000-0000-0000-000000000002', 'cocktail', 'Cocktail Reception'),
  ('b0000001-0000-0000-0000-000000000002', 'wedding', 'Wedding'),
  -- Heritage Manor Houston
  ('b0000001-0000-0000-0000-000000000003', 'wedding', 'Wedding'),
  ('b0000001-0000-0000-0000-000000000003', 'gala', 'Gala'),
  ('b0000001-0000-0000-0000-000000000003', 'birthday', 'Birthday Party'),
  -- Summit Conference Center
  ('b0000001-0000-0000-0000-000000000008', 'conference', 'Conference'),
  ('b0000001-0000-0000-0000-000000000008', 'corporate', 'Corporate Event'),
  ('b0000001-0000-0000-0000-000000000008', 'trade_show', 'Trade Show'),
  ('b0000001-0000-0000-0000-000000000008', 'seminar', 'Seminar'),
  -- Hill Country Vineyard
  ('b0000001-0000-0000-0000-000000000013', 'wedding', 'Wedding'),
  ('b0000001-0000-0000-0000-000000000013', 'corporate', 'Corporate Retreat'),
  ('b0000001-0000-0000-0000-000000000013', 'party', 'Private Party'),
  -- The Garden at Pearl
  ('b0000001-0000-0000-0000-000000000006', 'wedding', 'Wedding'),
  ('b0000001-0000-0000-0000-000000000006', 'corporate', 'Corporate Event'),
  ('b0000001-0000-0000-0000-000000000006', 'party', 'Party'),
  ('b0000001-0000-0000-0000-000000000006', 'birthday', 'Birthday')
ON CONFLICT (venue_id, event_type_key) DO NOTHING;


-- Create venue_amenities for select venues
INSERT INTO venue_amenities (venue_id, amenity_key, amenity_label) VALUES
  -- The Grandeur Ballroom
  ('b0000001-0000-0000-0000-000000000001', 'av_system', 'AV System'),
  ('b0000001-0000-0000-0000-000000000001', 'wifi', 'WiFi'),
  ('b0000001-0000-0000-0000-000000000001', 'parking', 'Valet Parking'),
  ('b0000001-0000-0000-0000-000000000001', 'catering_kitchen', 'Full Catering Kitchen'),
  ('b0000001-0000-0000-0000-000000000001', 'accessible', 'ADA Accessible'),
  ('b0000001-0000-0000-0000-000000000001', 'climate_control', 'Climate Control'),
  ('b0000001-0000-0000-0000-000000000001', 'dance_floor', 'Dance Floor'),
  ('b0000001-0000-0000-0000-000000000001', 'bar_area', 'Full Bar'),
  -- Skyline Rooftop Austin
  ('b0000001-0000-0000-0000-000000000002', 'wifi', 'WiFi'),
  ('b0000001-0000-0000-0000-000000000002', 'parking', 'Parking Garage'),
  ('b0000001-0000-0000-0000-000000000002', 'bar_area', 'Premium Bar'),
  ('b0000001-0000-0000-0000-000000000002', 'outdoor_space', 'Outdoor Terrace'),
  ('b0000001-0000-0000-0000-000000000002', 'av_system', 'AV System'),
  -- Heritage Manor Houston
  ('b0000001-0000-0000-0000-000000000003', 'parking', 'Free Parking'),
  ('b0000001-0000-0000-0000-000000000003', 'outdoor_space', 'Garden & Grounds'),
  ('b0000001-0000-0000-0000-000000000003', 'catering_kitchen', 'Catering Kitchen'),
  ('b0000001-0000-0000-0000-000000000003', 'accessible', 'ADA Accessible'),
  ('b0000001-0000-0000-0000-000000000003', 'green_room', 'Bridal Suite'),
  -- Summit Conference Center
  ('b0000001-0000-0000-0000-000000000008', 'av_system', 'Full AV Production'),
  ('b0000001-0000-0000-0000-000000000008', 'wifi', 'Enterprise WiFi'),
  ('b0000001-0000-0000-0000-000000000008', 'parking', 'Parking Garage (500 spaces)'),
  ('b0000001-0000-0000-0000-000000000008', 'catering_kitchen', 'Commercial Kitchen'),
  ('b0000001-0000-0000-0000-000000000008', 'accessible', 'ADA Accessible'),
  ('b0000001-0000-0000-0000-000000000008', 'climate_control', 'Climate Control'),
  ('b0000001-0000-0000-0000-000000000008', 'stage', 'Built-in Stage')
ON CONFLICT (venue_id, amenity_key) DO NOTHING;


-- Create venue_packages for select venues
INSERT INTO venue_packages (venue_id, name, description, base_price, pricing_model, inclusions, is_visible_on_public_page, display_order) VALUES
  -- The Grandeur Ballroom
  ('b0000001-0000-0000-0000-000000000001', 'Essential Package', 'Venue rental with basic setup', 5000, 'flat', '["Venue rental (6 hours)", "Tables and chairs", "Basic lighting", "Setup and cleanup"]'::jsonb, true, 1),
  ('b0000001-0000-0000-0000-000000000001', 'Premium Package', 'Full-service event package', 85, 'per_person', '["Everything in Essential", "Full catering menu", "Premium bar service", "DJ and sound system", "Event coordinator"]'::jsonb, true, 2),
  ('b0000001-0000-0000-0000-000000000001', 'Luxury Package', 'All-inclusive luxury experience', 150, 'per_person', '["Everything in Premium", "Live band or orchestra", "Floral arrangements", "Photography", "Valet parking", "Custom lighting design"]'::jsonb, true, 3),
  -- Skyline Rooftop Austin
  ('b0000001-0000-0000-0000-000000000002', 'Cocktail Hour', 'Rooftop cocktail reception', 3500, 'flat', '["2-hour venue rental", "Bar setup", "Light appetizers", "Background music"]'::jsonb, true, 1),
  ('b0000001-0000-0000-0000-000000000002', 'Sunset Celebration', 'Full evening rooftop event', 8000, 'flat', '["4-hour venue rental", "Full bar", "Passed appetizers", "DJ", "Event staff"]'::jsonb, true, 2),
  -- Summit Conference Center
  ('b0000001-0000-0000-0000-000000000008', 'Half-Day Meeting', 'Morning or afternoon session', 2500, 'flat', '["4-hour room rental", "AV equipment", "WiFi", "Coffee and water service"]'::jsonb, true, 1),
  ('b0000001-0000-0000-0000-000000000008', 'Full-Day Conference', 'Complete conference package', 75, 'per_person', '["8-hour room rental", "Full AV production", "Breakfast and lunch", "All-day beverages", "Breakout rooms"]'::jsonb, true, 2),
  ('b0000001-0000-0000-0000-000000000008', 'Multi-Day Event', 'Extended conference or expo', 60, 'per_person', '["Multi-day pricing", "Exhibition hall access", "Full catering", "Dedicated event manager", "Signage and branding"]'::jsonb, true, 3)
ON CONFLICT DO NOTHING;


-- Create venue_testimonials for select venues
INSERT INTO venue_testimonials (venue_id, client_name, client_company, event_type, quote, star_rating, is_published, display_order, source) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Maria Rodriguez', 'Rodriguez-Chen Wedding', 'wedding', 'The Grandeur Ballroom made our wedding dreams come true. The staff was incredible and every detail was perfect.', 5, true, 1, 'manual'),
  ('b0000001-0000-0000-0000-000000000001', 'Tom Henderson', 'Acme Corp', 'corporate', 'We''ve hosted our annual gala here for three years running. The service and venue quality are consistently excellent.', 5, true, 2, 'manual'),
  ('b0000001-0000-0000-0000-000000000002', 'Lisa Park', 'TechStart Inc', 'corporate', 'The rooftop views were the highlight of our company launch party. Everyone was blown away by the atmosphere.', 5, true, 1, 'manual'),
  ('b0000001-0000-0000-0000-000000000002', 'Jake & Emma Turner', NULL, 'wedding', 'Saying our vows with the Austin skyline behind us was magical. Skyline Rooftop exceeded every expectation.', 5, true, 2, 'manual'),
  ('b0000001-0000-0000-0000-000000000003', 'Catherine Blackwell', NULL, 'wedding', 'Heritage Manor felt like stepping into a dream. The gardens were stunning and the staff treated us like family.', 5, true, 1, 'manual'),
  ('b0000001-0000-0000-0000-000000000006', 'Diana & Carlos Reyes', NULL, 'wedding', 'The Garden at Pearl was the perfect mix of natural beauty and city convenience. Our guests loved every moment.', 5, true, 1, 'manual'),
  ('b0000001-0000-0000-0000-000000000008', 'Sarah Mitchell', 'Global Tech Forum', 'conference', 'Summit Conference Center handled our 400-person conference flawlessly. The AV and catering were top-notch.', 4, true, 1, 'manual'),
  ('b0000001-0000-0000-0000-000000000013', 'Robert & Amy Foster', NULL, 'wedding', 'Getting married at a vineyard in Hill Country was our dream, and this venue made it even better than we imagined.', 5, true, 1, 'manual')
ON CONFLICT DO NOTHING;


-- Seed some search queries for analytics testing
INSERT INTO venue_search_queries (query_text, location, event_type, guest_count, filters, results_count, session_id) VALUES
  ('wedding venues', 'Dallas', 'wedding', 200, '{"venue_type": "banquet_hall"}'::jsonb, 5, 'seed-session-1'),
  ('corporate event space', 'Austin', 'corporate', 100, '{}'::jsonb, 4, 'seed-session-2'),
  ('outdoor wedding venue', 'San Antonio', 'wedding', 150, '{"amenities": ["outdoor_space"]}'::jsonb, 3, 'seed-session-3'),
  ('conference center', 'Dallas', 'conference', 500, '{"venue_type": "conference_center"}'::jsonb, 2, 'seed-session-4'),
  ('rooftop party', 'Austin', 'party', 80, '{}'::jsonb, 2, 'seed-session-5'),
  ('vineyard wedding', 'Fredericksburg', 'wedding', 100, '{}'::jsonb, 1, 'seed-session-6'),
  ('large corporate event', 'Houston', 'corporate', 300, '{}'::jsonb, 2, 'seed-session-7'),
  ('intimate wedding venue', NULL, 'wedding', 50, '{}'::jsonb, 8, 'seed-session-8'),
  ('barn wedding texas', NULL, 'wedding', 120, '{"venue_type": "resort"}'::jsonb, 4, 'seed-session-9'),
  ('birthday party venue', 'San Antonio', 'birthday', 40, '{}'::jsonb, 3, 'seed-session-10')
ON CONFLICT DO NOTHING;


-- =====================================================
-- MARKETPLACE SEED DATA COMPLETE
-- =====================================================
-- Created: 24 profiles, 24 venues, 24 public settings,
-- 17 spaces, 22 event types, 26 amenities, 8 packages,
-- 8 testimonials, 10 search queries
-- =====================================================
