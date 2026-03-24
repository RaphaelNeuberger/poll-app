-- =============================================================================
-- PollApp – Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table: polls
-- Stores all survey definitions.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS polls (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  deadline    TIMESTAMPTZ,
  category    TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: options
-- Stores the answer options for each poll.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS options (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id    UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- Table: votes
-- Records each vote cast, preventing duplicate votes per user per poll.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS votes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id          UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id        UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  voter_identifier TEXT NOT NULL,
  UNIQUE (poll_id, voter_identifier)
);

-- -----------------------------------------------------------------------------
-- Indexes for query performance
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_options_poll_id ON options(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id   ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id ON votes(option_id);

-- -----------------------------------------------------------------------------
-- Function: increment_vote_count
-- Called via Supabase RPC to atomically increment an option's vote count.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_vote_count(option_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE options
  SET vote_count = vote_count + 1
  WHERE id = option_id_param;
END;
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- Enable anonymous read access; restrict writes to authenticated or anon users.
-- -----------------------------------------------------------------------------
ALTER TABLE polls   ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes   ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read polls and options
CREATE POLICY "Public read polls"   ON polls   FOR SELECT USING (true);
CREATE POLICY "Public read options" ON options FOR SELECT USING (true);
CREATE POLICY "Public read votes"   ON votes   FOR SELECT USING (true);

-- Allow anonymous users to insert polls, options, and votes
CREATE POLICY "Anon insert polls"   ON polls   FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert options" ON options FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert votes"   ON votes   FOR INSERT WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- Enable Realtime on votes table (for live result updates)
-- -----------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- -----------------------------------------------------------------------------
-- Sample data (optional – remove in production)
-- -----------------------------------------------------------------------------
-- INSERT INTO polls (title, description, deadline) VALUES
--   ('Best Frontend Framework 2025?', 'Vote for your favorite!', NOW() + INTERVAL '7 days'),
--   ('Remote or Office?', 'Where do you prefer to work?', NOW() + INTERVAL '2 days');
