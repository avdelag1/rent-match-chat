-- Step 1: Drop the incorrect composite constraint if it exists
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

-- Step 2: Drop the role check constraint to allow any text values
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- Step 3: Add the correct unique constraint on user_id only (one role per user)
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Step 4: Migrate existing users who don't have roles yet
INSERT INTO user_roles (id, user_id, role)
SELECT 
  gen_random_uuid(),
  p.id,
  'client'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id
)
AND p.id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;