# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/686673c3-e550-4efd-907e-ac52efe85ffc

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/686673c3-e550-4efd-907e-ac52efe85ffc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/686673c3-e550-4efd-907e-ac52efe85ffc) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🗄️ Database Migrations

This project includes a **Migration Viewer** tool to help you browse and apply Supabase migrations one by one.

### Quick Start

**Linux/Mac:**
```sh
./start-migration-viewer.sh
```

**Windows:**
```cmd
start-migration-viewer.bat
```

Then open your browser to `http://localhost:8080/migration-viewer.html`

### Features

- 📊 Browse all 136+ migrations sequentially
- 📋 One-click copy SQL to clipboard
- 🔍 Search migrations by name or date
- ⌨️ Keyboard shortcuts (← → for navigation, Ctrl+C to copy)
- 📈 View migration metadata (date, size, line count)

### Documentation

For detailed instructions, see [MIGRATION_VIEWER_GUIDE.md](./MIGRATION_VIEWER_GUIDE.md)

For migration status and schema information, see [supabase/migrations/MIGRATION_STATUS.md](./supabase/migrations/MIGRATION_STATUS.md)
