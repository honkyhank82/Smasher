# Database Migrations

This directory contains SQL migration scripts for the Smasher app database.

## Files

- `001_create_tables.sql` - PostgreSQL migration (for production)
- `001_create_tables_sqlite.sql` - SQLite migration (for development)

## Tables Created

### Core Tables
1. **messages** - Chat messages between users
2. **blocks** - Blocked user relationships
3. **reports** - User reports for moderation
4. **media** - User uploaded photos and videos
5. **subscriptions** - Premium subscription information
6. **buddies** - Buddy/favorite relationships
7. **verification_codes** - Email verification codes

### Modified Tables
- **users** - Added `birthdate` column for age calculation

## Running Migrations

### Development (SQLite)

If using `synchronize: true` in TypeORM config, tables will auto-create on server start.

To manually run migrations:
```bash
sqlite3 database.db < migrations/001_create_tables_sqlite.sql
```

### Production (PostgreSQL)

```bash
# Connect to your PostgreSQL database
psql -U your_user -d smasher_db -f migrations/001_create_tables.sql

# Or using environment variable
psql $DATABASE_URL -f migrations/001_create_tables.sql
```

### Using TypeORM CLI

```bash
# Generate migration from entities
npm run typeorm migration:generate -- -n CreateTables

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert
```

## Table Relationships

```
users (1) ----< (many) profiles
users (1) ----< (many) messages (as sender)
users (1) ----< (many) messages (as receiver)
users (1) ----< (many) blocks (as blocker)
users (1) ----< (many) blocks (as blocked)
users (1) ----< (many) reports (as reporter)
users (1) ----< (many) reports (as reported)
users (1) ----< (many) media
users (1) ----< (1) subscriptions
users (1) ----< (many) buddies
```

## Indexes

All tables have appropriate indexes for:
- Foreign keys
- Frequently queried columns
- Composite queries (e.g., user_id + is_profile_picture)

## Notes

- All tables use UUID primary keys (TEXT in SQLite)
- Timestamps use TIMESTAMP (DATETIME in SQLite)
- Boolean fields use BOOLEAN (INTEGER in SQLite)
- CASCADE deletes ensure data cleanup when users are deleted
- UNIQUE constraints prevent duplicate relationships
