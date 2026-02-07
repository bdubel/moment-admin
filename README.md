# Moment Admin Dashboard

Admin dashboard for managing Moment app beta groups and member auto-friending.

## Features

- Password-protected admin access
- View all beta groups
- See active members in each group
- See pending members (phone numbers awaiting signup)
- Real-time data from Supabase

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file (see `.env.example`):
   ```bash
   cp .env.example .env.local
   ```

3. Update environment variables:
   - `ADMIN_PASSWORD`: 16-digit random password for admin access
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deployed to **admin.moment.community** via Vercel.

### Vercel Environment Variables

Add these in the Vercel project settings:
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## How It Works

### Beta Groups System

1. **Admin adds pending members** - Phone numbers are added to `beta_group_pending_members`
2. **User signs up** - When user creates account with their phone number
3. **Auto-enrollment** - System automatically adds user to beta group
4. **Auto-friending** - User becomes friends with all other group members
5. **Pending removed** - Phone number removed from pending list

See the main app repository for full documentation on the beta groups system.

## Security

- Password-protected via simple authentication
- Admin password stored in environment variables
- Session-based auth (stored in sessionStorage)
- Use subdomain isolation (admin.moment.community) for additional security

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Supabase (database)
- Vercel (hosting)
