-- Migration: Create all tables for Smasher app
-- Run this SQL script to set up the database

-- ============================================
-- USERS TABLE (add birthdate column if not exists)
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS birthdate DATE;

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_receiver (receiver_id),
    INDEX idx_messages_created_at (created_at)
);

-- ============================================
-- BLOCKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate blocks
    UNIQUE(blocker_id, blocked_id),
    
    -- Indexes for performance
    INDEX idx_blocks_blocker (blocker_id),
    INDEX idx_blocks_blocked (blocked_id)
);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL,
    details TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_reports_reporter (reporter_id),
    INDEX idx_reports_reported (reported_id),
    INDEX idx_reports_status (status),
    INDEX idx_reports_created_at (created_at)
);

-- ============================================
-- MEDIA TABLE (for profile pictures and gallery)
-- ============================================
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_key VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    is_profile_picture BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_media_user (user_id),
    INDEX idx_media_profile_picture (user_id, is_profile_picture)
);

-- ============================================
-- SUBSCRIPTIONS TABLE (for premium features)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    trial_used BOOLEAN DEFAULT FALSE,
    trial_ends_at TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    google_play_purchase_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Only one active subscription per user
    UNIQUE(user_id),
    
    -- Indexes for performance
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_user (user_id)
);

-- ============================================
-- BUDDIES TABLE (for buddy list/favorites)
-- ============================================
CREATE TABLE IF NOT EXISTS buddies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buddy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate buddy relationships
    UNIQUE(user_id, buddy_id),
    
    -- Indexes for performance
    INDEX idx_buddies_user (user_id),
    INDEX idx_buddies_buddy (buddy_id)
);

-- ============================================
-- VERIFICATION CODES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_verification_email (email),
    INDEX idx_verification_expires (expires_at)
);

-- ============================================
-- Add indexes to existing tables for performance
-- ============================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(lat, lng);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE messages IS 'Stores chat messages between users';
COMMENT ON TABLE blocks IS 'Stores blocked user relationships';
COMMENT ON TABLE reports IS 'Stores user reports for moderation';
COMMENT ON TABLE media IS 'Stores user uploaded photos and videos';
COMMENT ON TABLE subscriptions IS 'Stores premium subscription information';
COMMENT ON TABLE buddies IS 'Stores buddy/favorite relationships';
