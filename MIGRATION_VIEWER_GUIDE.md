# 🗄️ Migration Viewer Guide

This guide explains how to use the Migration Viewer tool to browse and copy Supabase migrations one by one for activation in the Supabase SQL Editor.

## Quick Start

### Option 1: Using a Local Web Server (Recommended)

1. **Open a terminal in the project root directory**

2. **Start a simple HTTP server:**

   Using Python 3:
   ```bash
   python3 -m http.server 8000
   ```

   Or using Python 2:
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   Or using Node.js (if you have `http-server` installed):
   ```bash
   npx http-server -p 8000
   ```

   Or using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser and navigate to:**
   ```
   http://localhost:8000/migration-viewer.html
   ```

### Option 2: Direct File Access

You can also open the file directly in your browser, but some features may not work due to CORS restrictions:

1. Navigate to the project directory
2. Double-click `migration-viewer.html` or drag it into your browser

## Features

### 📊 Navigation

- **Previous/Next Buttons**: Navigate through migrations sequentially
- **Arrow Keys**: Use ← and → keyboard shortcuts for quick navigation
- **Search Box**: Filter migrations by filename or date

### 📋 Copy Functionality

- **Copy SQL Button**: Click to copy the current migration SQL to clipboard
- **Keyboard Shortcut**: Press `Ctrl+C` (or `Cmd+C` on Mac) when not selecting text to copy the migration
- **Success Notification**: A green notification appears when SQL is copied successfully

### 📈 Statistics

The tool displays:
- Total number of migrations (137 total)
- Current migration number
- File metadata (date, line count, file size)

### 🔍 Search

Type in the search box to filter migrations by:
- Filename
- Date
- Migration ID

## How to Use with Supabase

1. **Open the Migration Viewer** in your browser
2. **Navigate to the first migration** you need to apply
3. **Click "Copy SQL"** to copy the migration content
4. **Open Supabase Dashboard** → Navigate to SQL Editor
5. **Paste the SQL** and run it
6. **Click "Next"** in the Migration Viewer to move to the next migration
7. **Repeat steps 3-6** for all pending migrations

## All Available Migrations

The viewer includes all 137 migrations from your repository:

### Core Setup (August-September 2025)
- Initial database schema and tables
- User authentication and profiles
- Basic listings functionality

### Feature Additions (September-October 2025)
- Reviews system
- Messaging enhancements
- Notification system
- Calendar and scheduling
- Storage buckets
- Saved searches

### Recent Updates (October-November 2025)
- Client profile fields (demographics, lifestyle)
- Database health checks
- Comprehensive listings setup
- Security settings
- Schema fixes and optimizations
- Admin users table
- Policy cleanup

## Tips

1. **Run migrations in order**: The timestamp in the filename indicates the order
2. **Check dependencies**: Some migrations depend on previous ones
3. **Backup first**: Always backup your database before running migrations
4. **Test in staging**: If possible, test migrations in a staging environment first
5. **Track progress**: Keep notes on which migrations you've applied

## Troubleshooting

### Migration Viewer doesn't load
- Make sure you're running a local web server
- Check browser console for errors (F12 → Console tab)
- Verify the `supabase/migrations/` directory exists

### Copy button doesn't work
- Check clipboard permissions in your browser
- Try the keyboard shortcut instead (`Ctrl+C`)
- Use manual copy: select the SQL text and copy normally

### Missing migrations
- Verify all `.sql` files are in the `supabase/migrations/` directory
- Refresh the page to reload the migration list

## Migration File Structure

Each migration file follows this naming pattern:
```
YYYYMMDDHHMMSS_uuid.sql
```

For example:
```
20251108070001_cleanup_duplicate_policies_and_functions.sql
```

Where:
- `20251108` = November 8, 2025
- `070001` = 07:00:01 AM
- `cleanup_duplicate_policies_and_functions` = descriptive name
- `.sql` = SQL file extension

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Migration Status**: See `supabase/migrations/MIGRATION_STATUS.md`
- **Database Schema**: See `SUPABASE_DEPLOYMENT_GUIDE.md`

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your web server is running
3. Ensure all migration files are present in the `supabase/migrations/` directory
4. Review the `MIGRATION_STATUS.md` file for migration details

---

**Last Updated**: November 8, 2025  
**Total Migrations**: 137  
**Format**: HTML + JavaScript (Standalone)
