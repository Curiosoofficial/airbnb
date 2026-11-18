-- Demo-Daten der Live-Demo, Teil 1: 21 weitere Inserate, Demo-Gastgeber, Demo-Buchungen.
-- Die Fotos liegen im Storage-Bucket "images" (Unsplash-Lizenz), nicht im Repo.

DO $$
BEGIN
INSERT INTO "User"(id, email, "firstName", "lastName", "ProfileImage", "createdAt") VALUES
  ('demo_noah', 'noah@demo.invalid', 'Noah', 'Becker', 'https://avatar.vercel.sh/noah', '2016-06-03'),
  ('demo_elena', 'elena@demo.invalid', 'Elena', 'Papadakis', 'https://avatar.vercel.sh/elena', '2018-02-19'),
  ('demo_jonas', 'jonas@demo.invalid', 'Jonas', 'Vogel', 'https://avatar.vercel.sh/jonas', '2020-10-11'),
  ('demo_camille', 'camille@demo.invalid', 'Camille', 'Laurent', 'https://avatar.vercel.sh/camille', '2019-05-27'),
  ('demo_liam', 'liam@demo.invalid', 'Liam', 'OConnor', 'https://avatar.vercel.sh/liam', '2015-08-30')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Home"(id, title, description, guests, bedrooms, bathrooms, country, photo, price, "categoryName", "addedCategory", "addedDescription", "addedLocation", "createdAt", "userId") VALUES
(gen_random_uuid()::text, 'Overwater Bungalow in the Maldives', 'Private bungalow on stilts above a turquoise lagoon. Step from the deck straight into the water, breakfast arrives by boat.', 2, 1, 1, 'MV', 'beachfront-overwater.jpg', 650, 'beachfront', true, true, true, now() + interval '4 minutes', 'demo_mia'),
(gen_random_uuid()::text, 'Cliffside Suite in Santorini', 'Whitewashed suite on the caldera edge with a private terrace. Watch the sunset over the Aegean without leaving your lounger.', 2, 1, 1, 'GR', 'view-santorini.jpg', 340, 'amazingView', true, true, true, now() + interval '3 minutes', 'demo_elena'),
(gen_random_uuid()::text, 'Tower Room in a Highland Castle', 'Sleep in the tower of a 13th-century castle on a sea loch. Stone walls, a four-poster bed and a view over the Highlands.', 2, 1, 1, 'GB', 'historic-castle.jpg', 420, 'historic', true, true, true, now() + interval '2 minutes', 'demo_liam'),
(gen_random_uuid()::text, 'Hobbit-Style Earth House', 'Round green door, grass roof and a cosy fireplace. Built into the hillside, warm in winter and cool in summer.', 2, 1, 1, 'NZ', 'earth-hobbit.jpg', 210, 'erathhome', true, true, true, now() + interval '1 minutes', 'demo_liam'),
(gen_random_uuid()::text, 'Beach House on the Outer Banks', 'Classic beach house with a wraparound porch, two minutes from the dunes. Perfect for a family summer by the ocean.', 8, 4, 3, 'US', 'beach-blue-house.jpg', 240, 'beach', true, true, true, now() - interval '7 minutes', 'demo_noah'),
(gen_random_uuid()::text, 'Minimalist Villa in Ibiza', 'Bright white villa with an infinity pool, outdoor lounge and chef kitchen. Quiet north coast, 15 minutes to the beach clubs.', 8, 4, 4, 'ES', 'luxe-villa.jpg', 780, 'luxe', true, true, true, now() - interval '14 minutes', 'demo_elena'),
(gen_random_uuid()::text, 'Treehouse in the Rainforest', 'Wooden treehouse in the canopy with a hanging bridge and jungle views. Wake up to howler monkeys and toucans.', 2, 1, 1, 'CR', 'trending-treehouse.jpg', 185, 'trending', true, true, true, now() - interval '21 minutes', 'demo_mia'),
(gen_random_uuid()::text, 'Container Tiny Home in Copenhagen', 'Upcycled shipping container turned into a smart tiny home. Big windows, a small garden and bikes to explore the city.', 2, 1, 1, 'DK', 'tiny-container.jpg', 95, 'tiny', true, true, true, now() - interval '28 minutes', 'demo_jonas'),
(gen_random_uuid()::text, 'Grass-Roof Cabins by the Fjord', 'Traditional cabins with living grass roofs above a quiet fjord. Wood stove, sauna and a rowing boat included.', 4, 2, 1, 'NO', 'earth-grass-roofs.jpg', 170, 'erathhome', true, true, true, now() - interval '35 minutes', 'demo_sofia'),
(gen_random_uuid()::text, 'Stone Cottage by the Sea', 'Old fisherman cottage right above the waves on the Wild Atlantic Way. Peat fire, sea air and long coastal walks.', 4, 2, 1, 'IE', 'beachfront-stone-cottage.jpg', 140, 'beachfront', true, true, true, now() - interval '42 minutes', 'demo_liam'),
(gen_random_uuid()::text, 'Riad with Courtyard Pool', 'Traditional riad in the old medina with carved arches and a plunge pool in the courtyard. Rooftop terrace for mint tea at sunset.', 6, 3, 3, 'MA', 'pool-riad.jpg', 230, 'pool', true, true, true, now() - interval '49 minutes', 'demo_elena'),
(gen_random_uuid()::text, 'Surf House in Santa Cruz', 'Laid-back surf house a short walk from Steamer Lane. Board rack, outdoor shower and a deck for sunset barbecues.', 6, 3, 2, 'US', 'surf-blue-house.jpg', 260, 'surfing', true, true, true, now() - interval '56 minutes', 'demo_noah'),
(gen_random_uuid()::text, 'Black Barn House', 'Architect-built barn in black timber with floor-to-ceiling glass. Scandinavian design, underfloor heating and a forest view.', 6, 3, 2, 'DK', 'design-black-house.jpg', 230, 'design', true, true, true, now() - interval '63 minutes', 'demo_jonas'),
(gen_random_uuid()::text, 'Floating House in Amsterdam', 'Colourful floating home on the water, 15 minutes by bike to the centre. Swim from the terrace on warm days.', 4, 2, 1, 'NL', 'omg-floating.jpg', 190, 'omg', true, true, true, now() - interval '70 minutes', 'demo_camille'),
(gen_random_uuid()::text, 'Thatched Cottage in Normandy', 'Thatched-roof cottage surrounded by meadows and apple orchards. Fresh cider from the neighbour and the coast 20 minutes away.', 5, 3, 2, 'FR', 'countryside-provence.jpg', 150, 'countryside', true, true, true, now() - interval '77 minutes', 'demo_camille'),
(gen_random_uuid()::text, 'Lakeside Estate in Ontario', 'Grand lakeside estate with a private dock, home cinema and gardens. Ideal for big family gatherings.', 14, 7, 6, 'CA', 'design-concrete.jpg', 1200, 'luxe', true, true, true, now() - interval '84 minutes', 'demo_noah'),
(gen_random_uuid()::text, 'Ocean-View Penthouse in Dubai', 'Penthouse on the 40th floor with panoramic windows over the Gulf. Concierge, gym and rooftop pool in the building.', 4, 2, 2, 'AE', 'luxe-penthouse.jpg', 890, 'luxe', true, true, true, now() - interval '91 minutes', 'demo_elena'),
(gen_random_uuid()::text, 'Mountain Hut above the Fjord', 'Simple hut on a hiking trail high above the fjord. No road access, just you, the mountains and an unforgettable view.', 2, 1, 1, 'NO', 'view-fjord.jpg', 120, 'amazingView', true, true, true, now() - interval '98 minutes', 'demo_sofia'),
(gen_random_uuid()::text, 'Industrial Loft in Berlin', 'Spacious loft in a former factory in Kreuzberg. Vintage furniture, high ceilings and the best cafes around the corner.', 2, 1, 1, 'DE', 'trending-loft.jpg', 130, 'trending', true, true, true, now() - interval '105 minutes', 'demo_jonas'),
(gen_random_uuid()::text, 'Beach Villa in Barbados', 'Colonial-style villa with a lawn down to the beach, shaded by palm trees. Calm Caribbean water for snorkelling.', 8, 4, 4, 'BB', 'beach-white-house.jpg', 360, 'beach', true, true, true, now() - interval '112 minutes', 'demo_noah'),
(gen_random_uuid()::text, 'Surf Lodge in Ericeira', 'Relaxed surf lodge between palm trees, close to the famous reef breaks. Surf lessons and board rental on request.', 4, 2, 1, 'PT', 'surf-palms.jpg', 115, 'surfing', true, true, true, now() - interval '119 minutes', 'demo_mia');

INSERT INTO "Reservation"(id, "startDate", "endDate", guests, "totalPrice", "userId", "homeId")
SELECT r.id, r.s::date, r.e::date, r.g, (r.e::date - r.s::date) * h.price, r.u, h.id
FROM (VALUES
  ('demo_r5', '2026-12-01', '2026-12-04', 2, 'demo_lea', 'Cliffside Suite in Santorini'),
  ('demo_r6', '2027-01-15', '2027-01-20', 2, 'demo_marco', 'Overwater Bungalow in the Maldives')
) AS r(id, s, e, g, u, title)
JOIN "Home" h ON h.title = r.title
ON CONFLICT (id) DO NOTHING;
END
$$;