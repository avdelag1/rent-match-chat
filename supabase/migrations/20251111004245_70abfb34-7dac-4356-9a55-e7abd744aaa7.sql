-- Fix client@client.com user role (should be client, not owner)
UPDATE user_roles 
SET role = 'client'
WHERE user_id = '997d9507-2b29-4566-9a1c-eb0f10357e14';