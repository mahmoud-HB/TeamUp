-- Migration: Create user_follows table for follow relationships
-- Purpose: Store follow relationships between athletes/users

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at DESC);

-- Enable RLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read follows (public)
CREATE POLICY "user_follows_read_public" ON user_follows
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert
CREATE POLICY "user_follows_insert_authenticated" ON user_follows
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only the follower can delete their own follow
CREATE POLICY "user_follows_delete_own" ON user_follows
  FOR DELETE
  USING (auth.uid()::TEXT = follower_id::TEXT);

-- Helper function to count followers
CREATE OR REPLACE FUNCTION count_followers(user_id UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM user_follows WHERE following_id = user_id;
$$ LANGUAGE SQL IMMUTABLE;

-- Helper function to count following
CREATE OR REPLACE FUNCTION count_following(user_id UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM user_follows WHERE follower_id = user_id;
$$ LANGUAGE SQL IMMUTABLE;
