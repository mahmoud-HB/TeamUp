-- Migration: Create posts table with RLS
-- Purpose: Store feed posts (photos, achievements, job postings, text updates)

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_type TEXT NOT NULL CHECK (author_type IN ('athlete', 'organization')),
  author_id UUID NOT NULL,
  author_name TEXT,
  author_avatar_url TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('photo', 'achievement', 'job', 'text')),
  content TEXT NOT NULL,
  image_url TEXT,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_kind ON posts(kind);
CREATE INDEX IF NOT EXISTS idx_posts_offer_id ON posts(offer_id);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read posts (public feed)
CREATE POLICY "posts_read_public" ON posts
  FOR SELECT
  USING (true);

-- Policy: Only the author can update their own posts
CREATE POLICY "posts_update_own" ON posts
  FOR UPDATE
  USING (auth.uid()::TEXT = author_id::TEXT)
  WITH CHECK (auth.uid()::TEXT = author_id::TEXT);

-- Policy: Only the author can delete their own posts
CREATE POLICY "posts_delete_own" ON posts
  FOR DELETE
  USING (auth.uid()::TEXT = author_id::TEXT);

-- Policy: Anyone authenticated can insert (create posts)
CREATE POLICY "posts_insert_authenticated" ON posts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
