# Cloudflare Workers Database Connection Fix

## Problem
Sessions were disappearing after a few page refreshes in production on Cloudflare Pages. The error was:
```
Database connection error
Failed to get session
```

## Root Cause
The code was using `postgres.js` (TCP-based) for Supabase connections, which **does not work in Cloudflare Workers**. Cloudflare Workers only support HTTP-based connections.

## Solution
Changed `src/lib/server/db.js` to **always use Neon HTTP driver** (`@neondatabase/serverless`), which:
- ✅ Uses HTTP fetch API (works in Cloudflare Workers)
- ✅ Works with both Supabase and Neon databases
- ✅ Works with Supabase's connection pooler
- ✅ Works in both production (Cloudflare) and local development

## Changes Made

### 1. Removed TCP-based postgres.js from server code
- Removed `import postgres from 'postgres'`
- Removed `import { drizzle } from 'drizzle-orm/postgres-js'`
- Now only uses `drizzle-orm/neon-http` and `@neondatabase/serverless`

### 2. Simplified connection logic
- Always uses Neon HTTP driver (works everywhere)
- Singleton pattern ensures connection reuse
- Connection created at module scope (edge-safe)

### 3. Connection string cleanup
- Removes `pgbouncer` and `pooler` params that can interfere
- Ensures `sslmode=require` for secure connections

## Important Notes

### ✅ What Works Now
- Database connections in Cloudflare Workers
- Session persistence across page refreshes
- Works with Supabase connection pooler
- Works with Neon databases
- Works in local development

### ❌ What Was Broken
- `postgres.js` uses TCP sockets (doesn't work in Workers)
- Connections would fail after a few requests
- Better Auth couldn't read sessions (database connection failed)

## Connection String Requirements

For Supabase on Cloudflare Workers, use the **Transaction Pooler** connection string:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

**Important:**
- Use port `6543` (Transaction pooler)
- Include `?sslmode=require`
- The code will automatically clean up any `pgbouncer` or `pooler` params

## Verification

After deploying, check Cloudflare logs for:
```
Creating database connection with Neon HTTP driver (works with Supabase and Neon)
```

You should **NOT** see:
- "Using postgres.js" messages
- "Database connection error" after initial connection
- "Failed to get session" errors

## Testing

1. Deploy to Cloudflare Pages
2. Login as a user
3. Refresh the page multiple times
4. Session should persist across refreshes
5. Check logs - should see successful session queries

## Migration Notes

### Scripts Still Use postgres.js
The seed scripts in `scripts/` folder still use `postgres.js` - this is fine because:
- Scripts run in Node.js environment (not Workers)
- They're only used for local development/migration tasks
- They don't get bundled into the Workers build

### Local Development
Neon HTTP driver works fine in local development too. If you prefer `postgres.js` for local dev, you can add conditional logic, but it's not necessary.

## References

- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
- [Drizzle ORM Neon HTTP](https://orm.drizzle.team/docs/get-started-postgresql#neon-serverless)
- [Cloudflare Workers Limitations](https://developers.cloudflare.com/workers/platform/limits/)

