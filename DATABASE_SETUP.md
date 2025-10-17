# Database Setup Guide

## Overview

The Smasher app uses the following database tables:

### Existing Tables
- `users` - User accounts with authentication
- `profiles` - User profile information (display name, bio, location)

### New Tables (Added)
- `messages` - Chat messages between users
- `blocks` - Blocked user relationships
- `reports` - User reports for moderation
- `media` - User uploaded photos and videos
- `subscriptions` - Premium subscription information
- `buddies` - Buddy/favorite relationships
- `verification_codes` - Email verification codes

## Quick Start

### Development (SQLite - Auto-creates tables)

If you're using the default SQLite configuration with `synchronize: true`, tables will automatically be created when you start the server:

```bash
cd server
npm run start:dev
```

TypeORM will auto-create all tables based on the entities.

### Production (PostgreSQL - Manual migration)

For production, run the migration script:

```bash
# Connect to your PostgreSQL database
psql $DATABASE_URL -f migrations/001_create_tables.sql
```

Or manually:

```bash
psql -U your_user -d smasher_db -f migrations/001_create_tables.sql
```

## Database Schema

### Users Table (Modified)
```sql
ALTER TABLE users ADD COLUMN birthdate DATE;
```

### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Blocks Table
```sql
CREATE TABLE blocks (
    id UUID PRIMARY KEY,
    blocker_id UUID REFERENCES users(id),
    blocked_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);
```

### Reports Table
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    reporter_id UUID REFERENCES users(id),
    reported_id UUID REFERENCES users(id),
    reason VARCHAR(50) NOT NULL,
    details TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Media Table
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    file_key VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    is_profile_picture BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active',
    trial_used BOOLEAN DEFAULT FALSE,
    trial_ends_at TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    google_play_purchase_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Buddies Table
```sql
CREATE TABLE buddies (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    buddy_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, buddy_id)
);
```

## Verification

After running migrations, verify tables were created:

### PostgreSQL
```bash
psql $DATABASE_URL -c "\dt"
```

### SQLite
```bash
sqlite3 database.db ".tables"
```

## Expected Output

You should see these tables:
- users
- profiles
- messages
- blocks
- reports
- media
- subscriptions
- buddies
- verification_codes

## Troubleshooting

### Tables not created
- Check if migration file exists: `server/migrations/001_create_tables.sql`
- Verify database connection in `.env` file
- Check TypeORM logs for errors

### Permission errors
- Ensure database user has CREATE TABLE permissions
- For PostgreSQL: `GRANT ALL PRIVILEGES ON DATABASE smasher_db TO your_user;`

### Duplicate table errors
- Tables already exist - migration was already run
- Use `DROP TABLE IF EXISTS` or skip migration

## Environment Variables

Make sure these are set in your `.env` file:

```env
# PostgreSQL (Production)
DATABASE_URL=postgresql://user:password@localhost:5432/smasher_db

# Or SQLite (Development) - no DATABASE_URL needed
# Will use in-memory SQLite by default
```

## Next Steps

After database setup:
1. Start the backend server: `npm run start:dev`
2. Test API endpoints with Postman or the React Native app
3. Verify data is being saved correctly
