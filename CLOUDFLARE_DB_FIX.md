# Cloudflare Workers Database Connection Fix

## Problem
Sessions were disappearing after a few page refreshes in production on Cloudflare Pages. The error was:
```
Database connection error
Failed to get session
```

## Root Cause
The code was using `postgres.js` (TCP-based) for remote database connections, which **does not work in Cloudflare Workers**. Cloudflare Workers only support HTTP-based connections.

## Solution
Changed `src/lib/server/db.js` to **automatically select the appropriate driver**:
- ✅ **Local databases** (localhost): Uses `postgres.js` with Drizzle (TCP-based)
- ✅ **Remote databases** (Neon): Uses Neon HTTP driver (`@neondatabase/serverless`) with Drizzle (HTTP-based)
- ✅ Neon HTTP driver uses HTTP fetch API (works in Cloudflare Workers)
- ✅ Works with Neon databases
- ✅ Works in both production (Cloudflare) and local development

## Changes Made

### 1. Automatic driver selection
- **Local databases**: Uses `postgres.js` with `drizzle-orm/postgres-js` (TCP-based)
- **Remote databases**: Uses `@neondatabase/serverless` with `drizzle-orm/neon-http` (HTTP-based)
- Automatically detects local vs remote based on hostname

### 2. Connection logic
- Singleton pattern ensures connection reuse
- Connection created at module scope (edge-safe)
- Local databases: Uses original connection string as-is
- Remote databases: Cleans up params and ensures SSL

### 3. Connection string cleanup (remote only)
- Removes `pgbouncer` and `pooler` params that can interfere
- Ensures `sslmode=require` for secure connections

## Important Notes

### ✅ What Works Now
- Database connections in Cloudflare Workers (using Neon HTTP driver)
- Session persistence across page refreshes
- Works with Neon databases
- Works in local development (using postgres.js for localhost)

### ❌ What Was Broken
- Using `postgres.js` for remote databases in Cloudflare Workers (TCP sockets don't work in Workers)
- Connections would fail after a few requests
- Better Auth couldn't read sessions (database connection failed)

## Connection String Requirements

For Neon on Cloudflare Workers, use your Neon connection string:

```
postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require
```

**Important:**
- Include `?sslmode=require` for secure connections
- The code will automatically clean up any `pgbouncer` or `pooler` params
- For local development, use `postgresql://localhost:5432/[DATABASE]`

## Verification

After deploying, check Cloudflare logs for:
```
Creating database connection with Neon HTTP (fetch) driver
```

For local development, you should see:
```
Creating database connection with postgres.js (TCP) driver
```

You should **NOT** see:
- "Database connection error" after initial connection
- "Failed to get session" errors
- "fetch failed" errors when using localhost

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
The code automatically uses `postgres.js` for local databases (localhost, 127.0.0.1) and Neon HTTP driver for remote databases. This provides the best compatibility for both environments.

## References

- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
- [Drizzle ORM Neon HTTP](https://orm.drizzle.team/docs/get-started-postgresql#neon-serverless)
- [Cloudflare Workers Limitations](https://developers.cloudflare.com/workers/platform/limits/)

