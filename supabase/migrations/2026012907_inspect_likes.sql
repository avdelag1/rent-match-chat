-- INSPECT CURRENT LIKES TABLE SCHEMA
-- Run this to see what columns actually exist

SELECT '=== CURRENT LIKES TABLE SCHEMA ===' as message;

-- List all columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'likes' 
ORDER BY ordinal_position;

-- Check if table exists and show row count
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes')
    THEN '✅ Table EXISTS' ELSE '❌ Table MISSING' END as table_status,
    (SELECT COUNT(*) FROM public.likes) as current_rows;

-- Show sample data to understand structure
SELECT * FROM public.likes LIMIT 3;
