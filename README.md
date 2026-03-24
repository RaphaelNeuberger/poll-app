# PollApp

A real-time survey application built with Angular 21 and Supabase. Create surveys, share them, vote on options and watch the results update live.

## Tech Stack

- **Angular 21** – standalone components, signals, reactive forms
- **Supabase** – PostgreSQL database with Row Level Security and Realtime subscriptions
- **TypeScript** – strict mode, no `any`
- **SCSS** – BEM naming, CSS custom properties

## Features

- Create surveys with multiple answer options, deadline and category
- Browse active and past surveys with category filter
- Vote on a survey and see live bar chart results update in real time
- "Ending soon" section highlights surveys expiring within 48 hours
- Duplicate votes are prevented via a localStorage voter ID

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** and run `supabase-schema.sql` to create all tables, indexes, RLS policies and the realtime subscription
3. Copy your project URL and anon key into `src/environments/environment.ts`:

```ts
export const environment = {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key'
};
```

### 3. Run the dev server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

## Project Structure

```
src/app/
  core/
    models/         Poll, PollOption, Vote interfaces
    services/       PollService, SupabaseService
  features/
    home/           Home screen with hero, tabs and urgent polls
    poll-detail/    Detail view with voting and live results
  shared/
    components/
      poll-card/          Single survey card
      urgent-polls/       Ending-soon section
      create-poll-modal/  New survey dialog
```

## Database

The schema is defined in `supabase-schema.sql`. It includes:

- `polls` – survey title, description, deadline, category
- `options` – answer options per poll with vote counts
- `votes` – one row per voter per poll (enforced via UNIQUE constraint)
- `increment_vote_count` – RPC function for atomic vote counting
- RLS policies for public read and anonymous insert
