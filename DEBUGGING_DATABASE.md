# Database Connection Debugging Guide

## Issue
Getting errors when trying to query `allowed_email_domains` table from Cloudflare deployment connected to Neon or local PostgreSQL.

## Changes Made

### 1. Fixed Database Driver Selection
- **Problem**: Code was using Neon HTTP driver for all connections, which doesn't work with local PostgreSQL (TCP-based)
- **Solution**: Updated `src/lib/server/db.js` to automatically select the appropriate driver:
  - **Local databases** (localhost): Uses `postgres.js` with Drizzle (TCP-based)
  - **Remote databases** (Neon): Uses Neon HTTP driver with Drizzle (HTTP-based)

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

⚠️ **CRITICAL**: `postgres.js` uses TCP connections, which **does not work in Cloudflare Workers**. Cloudflare Workers only support HTTP-based connections.

### Solutions for Cloudflare Workers:

#### For Neon Databases (Recommended for Production)
Neon databases work perfectly with Cloudflare Workers using the Neon HTTP driver:

1. Get your Neon connection string from the Neon dashboard
2. The connection string should look like:
   ```
   postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require
   ```

3. Set this as `DATABASE_URL` in Cloudflare:
   ```bash
   wrangler secret put DATABASE_URL
   ```

The code will automatically use the Neon HTTP driver for remote databases.

#### For Local Development
Use a local PostgreSQL connection string:
```
postgresql://postgres:password@localhost:5432/database
```

The code will automatically use `postgres.js` (TCP-based) for localhost connections.

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
- Whether it's detected as local or Neon

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
- "Creating database connection with Neon HTTP (fetch) driver" message (for remote)
- "Creating database connection with postgres.js (TCP) driver" message (for local)
- Any connection errors
- Detailed error messages from enhanced logging

### 4. Verify Connection String Format
For Neon databases, ensure your connection string:
- Uses the correct Neon hostname (from Neon dashboard)
- Includes `?sslmode=require` for secure connections
- Has correct credentials

For local databases:
- Uses `localhost` or `127.0.0.1` as hostname
- Uses port **5432** (default PostgreSQL port)
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
1. For Neon: Network issues or incorrect hostname
2. For local: PostgreSQL server not running
3. Firewall blocking connection
4. Incorrect port number

### Issue: "Table does not exist"
**Possible causes:**
1. Migrations not run on Supabase
2. Wrong database/schema
3. Connection string pointing to wrong database

## Next Steps

1. **Verify connection string format** - Ensure you're using the correct format for Neon or local PostgreSQL
2. **Test the debug endpoint** - Use `/api/debug/db-test` to see detailed error messages
3. **Check Cloudflare logs** - Look for the enhanced error messages
4. **Verify driver selection** - Check logs to confirm the correct driver is being used

## Environment Variables Checklist

Make sure these are set in Cloudflare:
- ✅ `DATABASE_URL` - Neon connection string (for production) or local PostgreSQL connection string (for development)
- ✅ `BETTER_AUTH_SECRET` - Auth secret
- ⚠️ `DB_TEST_SECRET` - Optional, for testing endpoint security

Set secrets:
```bash
wrangler secret put DATABASE_URL
wrangler secret put BETTER_AUTH_SECRET
```

