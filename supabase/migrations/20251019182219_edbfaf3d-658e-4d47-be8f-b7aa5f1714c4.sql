-- Update existing client profiles with photos and better data
-- This will add realistic images and bios to existing clients

UPDATE profiles
SET 
  images = ARRAY[
    'https://i.pravatar.cc/500?img=' || ((random() * 70)::int + 1)::text,
    'https://i.pravatar.cc/500?img=' || ((random() * 70)::int + 1)::text,
    'https://i.pravatar.cc/500?img=' || ((random() * 70)::int + 1)::text
  ],
  age = CASE 
    WHEN age IS NULL THEN (random() * 20 + 25)::int
    ELSE age
  END,
  bio = CASE 
    WHEN id = (SELECT user_id FROM user_roles WHERE role = 'client' ORDER BY user_id LIMIT 1 OFFSET 0) 
      THEN 'Looking for a modern apartment with pool access. Pet-friendly is a must! Budget flexible for the right place. Love yoga and beach life.'
    WHEN id = (SELECT user_id FROM user_roles WHERE role = 'client' ORDER BY user_id LIMIT 1 OFFSET 1)
      THEN 'Professional software engineer seeking long-term rental. Need high-speed internet and quiet workspace. Non-smoker.'
    WHEN id = (SELECT user_id FROM user_roles WHERE role = 'client' ORDER BY user_id LIMIT 1 OFFSET 2)
      THEN 'Yoga instructor looking for a zen space near the beach. Love outdoor activities and healthy living. Motorcycle enthusiast!'
    ELSE 'Digital nomad seeking comfortable living space with good amenities. Flexible on budget, looking for the perfect match.'
  END,
  interests = CASE
    WHEN interests IS NULL OR array_length(interests, 1) IS NULL THEN
      ARRAY['Property Rental', 'Beach Lover', 'Digital Nomad', 'Fitness Enthusiast']
    ELSE interests
  END,
  lifestyle_tags = CASE
    WHEN lifestyle_tags IS NULL OR array_length(lifestyle_tags, 1) IS NULL THEN
      ARRAY['Digital Nomad', 'Professional', 'Pet-Friendly Required', 'Beach lover']
    ELSE lifestyle_tags
  END,
  budget_min = COALESCE(budget_min, 1500),
  budget_max = COALESCE(budget_max, 3000),
  verified = true,
  is_active = true
WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'client')
  AND (images IS NULL OR array_length(images, 1) IS NULL OR images = ARRAY[]::text[]);