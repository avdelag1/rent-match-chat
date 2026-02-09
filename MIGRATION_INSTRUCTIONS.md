# How to Apply the has_esc Column Migration

The error you're experiencing is because the `has_esc` (Electronic Stability Control) column is missing from the `listings` table in your Supabase database.

## Solution

You need to apply the migration manually through the Supabase dashboard:

### Steps:

1. **Go to Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project (rent-match-chat)

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the Migration**
   - Copy the following SQL:

   ```sql
   -- Add has_esc column to listings table
   ALTER TABLE public.listings ADD COLUMN has_esc BOOLEAN DEFAULT FALSE;

   -- Add comment for documentation
   COMMENT ON COLUMN public.listings.has_esc IS 'Electronic Stability Control feature for motorcycles';
   ```

   - Paste it into the SQL Editor
   - Click "Run" or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

4. **Verify the Column was Added**
   - You should see a message saying the query executed successfully
   - The `has_esc` column is now available in the listings table

### What This Migration Does:

- Adds a new boolean column `has_esc` to the `listings` table
- Sets the default value to `FALSE` for existing records
- Adds a comment describing the column's purpose

### After Migration:

- You'll be able to upload motorcycle listings with the ESC feature option
- The swipe cards will display properly
- All motorcycle features (ABS, ESC, traction control, heated grips, etc.) will work correctly

---

**Status**: ✅ Code changes committed and pushed to `claude/fix-listings-swipe-cards-8pUJx`
**Next Step**: Apply the SQL migration in Supabase dashboard
