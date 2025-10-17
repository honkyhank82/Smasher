-- Migration: Add account status fields for deactivation and deletion
-- This allows users to deactivate or delete their accounts

-- ============================================
-- Add account status columns to users table
-- ============================================

-- Add account_status column (active, deactivated, deleted)
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';

-- Add deactivated_at timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP NULL;

-- Add deleted_at timestamp (soft delete)
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add deletion_scheduled_at timestamp (30-day grace period)
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP NULL;

-- Create index for account status queries
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

-- ============================================
-- Comments
-- ============================================

COMMENT ON COLUMN users.account_status IS 'User account status: active, deactivated, or deleted';
COMMENT ON COLUMN users.deactivated_at IS 'Timestamp when account was deactivated (can be reactivated)';
COMMENT ON COLUMN users.deleted_at IS 'Timestamp when account was soft deleted (30-day grace period)';
COMMENT ON COLUMN users.deletion_scheduled_at IS 'Timestamp when account deletion was requested (actual deletion after 30 days)';
