# Apply Account Status Migration

## Your Database Setup

Your app uses **TypeORM with auto-synchronize**, which means:
- In development: Schema updates automatically when you start the server
- In production: You need to apply migrations manually

## ✅ Easy Method: Let TypeORM Handle It

Since you have `synchronize: true` enabled in development, the new columns will be added automatically when you restart your server!

### Step 1: Restart Your Server

```powershell
cd C:\DevProjects\smasher\server
npm run start:dev
```

TypeORM will detect the new fields in `User` entity and automatically add them to your database:
- `account_status`
- `deactivated_at`
- `deleted_at`
- `deletion_scheduled_at`

### Step 2: Verify (Optional)

Check your server logs. You should see TypeORM creating the new columns:

```
query: ALTER TABLE "users" ADD "account_status" varchar DEFAULT 'active'
query: ALTER TABLE "users" ADD "deactivated_at" datetime
query: ALTER TABLE "users" ADD "deleted_at" datetime
query: ALTER TABLE "users" ADD "deletion_scheduled_at" datetime
```

That's it! ✅

---

## 🚀 For Production (Fly.io)

Your production database is on Fly.io/Neon. Here are your options:

### Option 1: Use TypeORM Synchronize (Quick & Easy)

**Current Setup**: Your `app.module.ts` has:
```typescript
synchronize: process.env.NODE_ENV !== 'production'
```

**To enable auto-sync in production temporarily:**

1. Edit `server/src/app.module.ts`:
```typescript
synchronize: true, // Enable for migration
```

2. Deploy:
```powershell
cd server
fly deploy
```

3. TypeORM will auto-create the columns

4. **Important**: Revert the change:
```typescript
synchronize: process.env.NODE_ENV !== 'production', // Back to safe mode
```

5. Deploy again:
```powershell
fly deploy
```

### Option 2: Manual SQL via Fly.io Console (Recommended)

1. Connect to your production database:
```powershell
fly postgres connect -a smasher-db
```

2. Run the migration SQL:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
```

3. Exit:
```sql
\q
```

### Option 3: Use Neon Dashboard (Easiest)

If your database is on Neon:

1. Go to https://console.neon.tech/
2. Select your project
3. Go to SQL Editor
4. Paste this SQL:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
```

5. Click "Run"

---

## 🧪 Testing

After applying the migration, test the endpoints:

### Test Deactivation

```powershell
# Get your auth token first (login via the app)
$token = "your-jwt-token-here"

# Deactivate account
curl -X POST https://smasher-api.fly.dev/users/deactivate `
  -H "Authorization: Bearer $token"

# Check status
curl https://smasher-api.fly.dev/users/account-status `
  -H "Authorization: Bearer $token"
```

### Test Deletion

```powershell
# Schedule deletion
curl -X POST https://smasher-api.fly.dev/users/delete `
  -H "Authorization: Bearer $token"

# Cancel deletion
curl -X POST https://smasher-api.fly.dev/users/cancel-deletion `
  -H "Authorization: Bearer $token"
```

---

## ⚠️ Important Notes

### Development
- ✅ Auto-sync is enabled - just restart the server
- ✅ No manual migration needed
- ✅ TypeORM handles everything

### Production
- ⚠️ Auto-sync is disabled for safety
- ⚠️ Must apply migration manually
- ⚠️ Use one of the three options above

### Why Not Use psql?

You don't have PostgreSQL installed locally, and you don't need it! Your database is hosted on:
- Neon (cloud PostgreSQL)
- Or Fly.io Postgres

You access it through:
- Fly.io CLI: `fly postgres connect`
- Neon Dashboard: Web-based SQL editor
- Or let TypeORM handle it automatically

---

## 🎯 Recommended Approach

**For Development (Local):**
```powershell
cd C:\DevProjects\smasher\server
npm run start:dev
```
Done! TypeORM auto-creates the columns.

**For Production (Fly.io):**
1. Go to Neon Dashboard
2. Use SQL Editor
3. Run the ALTER TABLE commands
4. Deploy your updated backend

---

## ✅ Verification

After applying the migration, verify it worked:

### Check Server Logs
Look for:
```
[TypeORM] Column 'account_status' added to 'users' table
```

### Test the API
```powershell
# In your app, go to Settings
# You should see "Deactivate Account" and "Delete Account" buttons
# Try clicking them - they should work!
```

### Check Database (Optional)
If using Neon Dashboard:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('account_status', 'deactivated_at', 'deleted_at', 'deletion_scheduled_at');
```

---

## 🐛 Troubleshooting

### "Column already exists" error
- Migration already applied
- Safe to ignore
- The `IF NOT EXISTS` clause prevents errors

### TypeORM not creating columns
- Check `User` entity has the new fields
- Verify `synchronize: true` in development
- Restart the server completely

### Production migration fails
- Check database connection
- Verify you have ALTER TABLE permissions
- Try the Neon Dashboard method

---

## 📝 Summary

**Development**: Just restart your server - TypeORM handles it automatically! ✅

**Production**: Use Neon Dashboard SQL Editor to run the ALTER TABLE commands.

No need for `psql` - your database is in the cloud!
