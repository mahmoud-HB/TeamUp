-- Migration: Create post_comments table with RLS
-- Purpose: Store comments on posts

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT,
  author_avatar_url TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id ON post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

-- Enable RLS
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read comments (public feed)
CREATE POLICY "post_comments_read_public" ON post_comments
  FOR SELECT
  USING (true);

-- Policy: Only the author can update their own comments
CREATE POLICY "post_comments_update_own" ON post_comments
  FOR UPDATE
  USING (auth.uid()::TEXT = author_id::TEXT)
  WITH CHECK (auth.uid()::TEXT = author_id::TEXT);

-- Policy: Only the author can delete their own comments
CREATE POLICY "post_comments_delete_own" ON post_comments
  FOR DELETE
  USING (auth.uid()::TEXT = author_id::TEXT);

-- Policy: Anyone authenticated can insert (add comments)
CREATE POLICY "post_comments_insert_authenticated" ON post_comments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
