-- VERIFICATION: Check if conversations table has client_id and owner_id columns
SELECT column_name FROM information_schema.columns
WHERE table_name='conversations' AND column_name IN ('client_id', 'owner_id')
ORDER BY column_name;
