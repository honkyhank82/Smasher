-- Migration: Create profile_views table
-- This table tracks when users view other users' profiles

-- ============================================
-- PROFILE_VIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_profile_views_viewer (viewer_id),
    INDEX idx_profile_views_viewed (viewed_id),
    INDEX idx_profile_views_viewed_at (viewed_at),
    INDEX idx_profile_views_viewed_viewer_at (viewed_id, viewed_at DESC)
);

-- Create a unique index to prevent duplicate views within a short time window
-- This allows tracking multiple views but prevents spam
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_views_unique_daily 
ON profile_views(viewer_id, viewed_id, DATE(viewed_at));

COMMENT ON TABLE profile_views IS 'Tracks profile views for analytics and "who viewed me" feature';
