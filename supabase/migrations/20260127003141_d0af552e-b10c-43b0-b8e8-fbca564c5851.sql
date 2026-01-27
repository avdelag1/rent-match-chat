-- Fix missing images for Joanna Canero's listings
-- The images were uploaded to storage but never linked to the listings table

-- Update Casa Lucho (created 02:30:11) with images uploaded 02:25-02:30
UPDATE public.listings 
SET images = ARRAY[
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741552747-ydjvj6l1u6k.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741613795-2iworr1bb4b.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741639591-fwzqoc3xrtq.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741640504-yqf0ac68ylh.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741652359-5uch7ereypl.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741695108-tc7iwieasws.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741705891-sea4xp74qxd.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741727526-4oc6b3u4waf.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741761840-q2r1go444z.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741770476-9dtjdevi8me.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741781468-6qreezvpnl4.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762741799091-r222jjgd0b.jpg'
]
WHERE id = 'ff64ca54-75c0-465e-8a6b-5e9481f2a029';

-- Update Casa Serafin (created 03:35:43) with images uploaded 03:28-03:35
UPDATE public.listings 
SET images = ARRAY[
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745320733-fsmcw74i51m.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745322193-dghns3ve9vs.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745323144-46r070noeey.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745323935-a2qun22dt2.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745379368-1vab0szov34.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745401835-gbnj8m71m8l.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745432037-y113kgztbbe.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745433197-90fzej4ryo8.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745434015-mhdf4af05l.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745501415-8tcjuq974ce.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745502728-eu1js5u80vv.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745504093-yoqd17j1h6g.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745504962-reow5bhgpbk.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745516621-6r24af2li1m.jpg',
  'https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/15ae38bd-df8e-44a0-af59-ce0b4ec22c90/1762745518010-07b8vn93gsgi.jpg'
]
WHERE id = '6370546a-8fb9-4ced-9974-960d989e0a5c';