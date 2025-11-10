# 🗄️ Migration Viewer - Quick Reference

## Start the Viewer

```bash
# Linux/Mac
./start-migration-viewer.sh

# Windows
start-migration-viewer.bat
```

Then open: **http://localhost:8080/migration-viewer.html**

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` | Previous migration |
| `→` | Next migration |
| `Ctrl+C` / `Cmd+C` | Copy current migration SQL |

## Features at a Glance

- 📊 **136 migrations** available to browse
- 📋 **One-click copy** to clipboard
- 🔍 **Search** by filename or date
- 📅 **Metadata** display (date, size, lines)
- ⌨️ **Keyboard navigation** support
- 🎨 **Beautiful UI** with syntax highlighting

## Quick Workflow

1. Start the viewer
2. Navigate to your migration
3. Click "📋 Copy SQL"
4. Open Supabase SQL Editor
5. Paste and run
6. Click "Next →"
7. Repeat!

## Need Help?

See [MIGRATION_VIEWER_GUIDE.md](./MIGRATION_VIEWER_GUIDE.md) for detailed documentation.
