# Database Connection Debugging Guide

## Issue
Getting errors when trying to query `allowed_email_domains` table from Cloudflare deployment connected to Supabase.

## Changes Made

### 1. Fixed Database Driver Selection
- **Problem**: Code was using Neon HTTP driver for Supabase, which may not be compatible
- **Solution**: Updated `src/lib/server/db.js` to use `postgres.js` for Supabase connections instead of Neon HTTP driver
- **Note**: Neon HTTP driver is now only used for actual Neon databases

### 2. Enhanced Error Logging
Added detailed error logging in:
- `src/hooks.server.js` - Database connection errors
- `src/lib/server/auth.js` - Allowed email domains query errors
- `src/routes/api/auth/validate-email/+server.js` - Email validation errors

### 3. Created Database Test Endpoint
Created `/api/debug/db-test` endpoint to test database connectivity.

**Usage:**
```bash
# In production, you'll need to set DB_TEST_SECRET env variable
curl https://your-domain.com/api/debug/db-test?key=YOUR_SECRET
```

This endpoint will test:
- Database connection creation
- Simple SQL query
- Query to `allowed_email_domains` table
- Specific domain query (gmail.com)

## Important: Cloudflare Workers Limitation

⚠️ **CRITICAL**: `postgres.js` uses TCP connections, which **may not work in Cloudflare Workers**. Cloudflare Workers only support HTTP-based connections.

### Solutions for Supabase on Cloudflare Workers:

#### Option 1: Use Supabase Connection Pooler (Recommended)
Use Supabase's **Transaction Pooler** connection string (port 6543) which supports HTTP:

1. In Supabase Dashboard:
   - Go to **Project Settings** → **Database**
   - Find **Connection string** section
   - Select **Transaction** mode (not Session)
   - Copy the connection string (should have `:6543` port)

2. The connection string should look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

3. Set this as `DATABASE_URL` in Cloudflare:
   ```bash
   wrangler secret put DATABASE_URL
   ```

#### Option 2: Use Supabase REST API (Alternative)
If TCP connections don't work, you may need to use Supabase's REST API instead of direct database queries. This would require significant code changes.

#### Option 3: Use Neon HTTP Driver with Supabase
Some users report success using Neon's HTTP driver with Supabase's pooler URL. You can test this by temporarily modifying the code.

## Debugging Steps

### 1. Verify Environment Variable
Check if `DATABASE_URL` is set correctly in Cloudflare:

```bash
# View logs to see if DATABASE_URL is present
wrangler pages deployment tail
```

Look for log messages showing:
- Database URL length
- Database URL preview
- Whether it's detected as Supabase

### 2. Test Database Connection
Visit the test endpoint (after setting up):
```
https://your-domain.com/api/debug/db-test?key=YOUR_SECRET
```

### 3. Check Cloudflare Logs
View real-time logs:
```bash
wrangler pages deployment tail
```

Look for:
- "Using postgres.js for Supabase connection" message
- Any connection errors
- Detailed error messages from enhanced logging

### 4. Verify Supabase Connection String Format
Ensure your connection string:
- Uses port **6543** (Transaction pooler) or **5432** (Direct connection)
- Includes `?pgbouncer=true` if using pooler
- Has correct credentials

### 5. Test Connection String Locally
Test the connection string works locally first:
```bash
DATABASE_URL="your-supabase-connection-string" npm run dev
```

## Common Issues

### Issue: "Failed query" error
**Possible causes:**
1. Connection string format incorrect
2. Wrong port (should be 6543 for pooler)
3. Credentials incorrect
4. Network/firewall blocking connection

### Issue: Connection timeout
**Possible causes:**
1. Using direct connection (port 5432) instead of pooler (port 6543)
2. Supabase project paused (free tier)
3. Network issues

### Issue: "Table does not exist"
**Possible causes:**
1. Migrations not run on Supabase
2. Wrong database/schema
3. Connection string pointing to wrong database

## Next Steps

1. **Verify connection string format** - Ensure you're using Transaction pooler URL
2. **Test the debug endpoint** - Use `/api/debug/db-test` to see detailed error messages
3. **Check Cloudflare logs** - Look for the enhanced error messages
4. **If postgres.js doesn't work** - Consider using Supabase REST API or Neon HTTP driver as fallback

## Environment Variables Checklist

Make sure these are set in Cloudflare:
- ✅ `DATABASE_URL` - Supabase connection string (Transaction pooler recommended)
- ✅ `BETTER_AUTH_SECRET` - Auth secret
- ⚠️ `DB_TEST_SECRET` - Optional, for testing endpoint security

Set secrets:
```bash
wrangler secret put DATABASE_URL
wrangler secret put BETTER_AUTH_SECRET
```

