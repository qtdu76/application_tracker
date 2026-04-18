# Application Tracker

A web app for tracking job applications, contacts, notes, deadlines, and application documents.

This project is built with Next.js, React, Tailwind CSS, and Supabase. It uses Supabase Auth for sign-in, Postgres tables for tracker data, Row Level Security for per-user access, and Supabase Storage for uploaded attachments.

## Features

- Track applications by company, role, status, deadline, location, industry, and notes
- Manage contacts linked to companies and applications
- Keep freeform job-search notes
- Upload CVs, cover letters, and other application documents
- Protect tracker data behind Supabase Auth
- Deploy as a standalone Dockerized Next.js app

## Requirements

- Node.js 20+
- npm
- A Supabase project

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill in your Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-sb-publishable-key
SUPABASE_SECRET_KEY=your-sb-secret-key
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is safe for browser use. `SUPABASE_SECRET_KEY`
is server-only and is only needed for admin actions such as deleting a user.
Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` values are still supported.

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

This app expects Supabase Auth, database tables, Row Level Security policies, and a storage bucket for attachments.

The current migrations are in `migrations/`:

- `create_user_notes_table.sql`
- `007_auth_and_tracker_isolation.sql`
- `008_admin_profile_approval.sql`
- `009_approve_new_signups_by_default.sql`

These were copied from the original private app during extraction. They are useful, but the public repo still needs a clean initial schema migration for fresh installs, especially for the base `applications` and `contacts` tables.

Expected tables:

- `user_profiles`
- `applications`
- `contacts`
- `user_notes`

Expected storage bucket:

- `application-attachments`

### Google OAuth

Google sign-in is supported through Supabase Auth.

To enable it:

1. Create or open a Google Cloud project.
2. Configure the Google OAuth consent screen for your app.
3. Create a Web application OAuth Client ID.
4. Add your site origin to Authorized JavaScript origins, for example `http://localhost:3000` while developing and your production domain later.
5. Add your Supabase Google provider callback URL to Authorized redirect URIs. Supabase shows this URL in the Google provider settings, and it looks like `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.
6. In Supabase, open Authentication > Providers > Google, enable Google, and paste the Google OAuth Client ID and Client Secret.
7. In Supabase Auth URL Configuration, allow your app callback URL, for example `http://localhost:3000/auth/callback` and your production callback URL.

Google Workspace is not required. A normal Google account can create the Google Cloud project and OAuth client.

If Supabase returns `Unsupported provider: provider is not enabled`, Google is not enabled in the Supabase project configured by `NEXT_PUBLIC_SUPABASE_URL`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Docker

Builds use the standalone Next.js output.

```bash
docker compose up -d --build
```

The compose file expects the app to join an external Docker network named `proxy_net`. Adjust `docker-compose.yml` if your server uses a different reverse proxy setup.

## Deployment

`deploy.sh` pulls the latest code from the configured branch, loads `.env.local` or `.env`, rebuilds the Docker image, and restarts the container.

```bash
./deploy.sh
```

Set these variables if needed:

```bash
APP_DIR=/path/to/application_tracker
DEPLOY_BRANCH=main
ENV_FILE=/path/to/.env
```

## Project Layout

```text
app/page.tsx                    Tracker UI
app/_components/                Tracker-only UI components
app/api/applications/           Application CRUD API
app/api/admin/                  Admin user approval API
app/api/contacts/               Contact CRUD API
app/api/notes/                  User notes API
app/admin/                      Admin user approval panel
app/auth/                       Login, signup, and access denied pages
app/auth/callback/              Supabase OAuth code exchange route
app/profile/                    Account profile page
app/privacy/                    Privacy policy page
components/                     Shared app components
utils/supabase/                 Supabase browser/server clients
types/                          Shared TypeScript types
migrations/                     Supabase SQL migrations
```

## Status

This repo has just been extracted from a larger personal website. The app builds and lints, but the database migrations still need to be consolidated before this is a polished one-command install for new Supabase projects.

## License

MIT
