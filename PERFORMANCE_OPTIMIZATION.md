# Database Performance Optimization Guide

## Overview
This document outlines performance optimizations for Neon PostgreSQL database connections in production, particularly when deployed on Cloudflare Workers.

## Current Performance Issues

### 1. N+1 Query Problem (FIXED)
**Problem**: The marketplace page was making 1 query for listings, then 2 queries per listing (category + image) = 41 queries for 20 listings.

**Solution**: Optimized to use JOINs and batch queries:
- Now uses LEFT JOIN to get categories with listings (1 query)
- Batch fetches images for all listings (1 query)
- Total: 2 queries instead of 41 queries

### 2. Connection Pooling (IMPROVED)
**Problem**: Neon HTTP driver wasn't configured for optimal connection reuse.

**Solution**: 
- Updated to preserve `pgbouncer=true` parameter when set
- Added fetch connection caching support
- Connection string now supports Neon's pooler endpoint

## Recommended Optimizations

### 1. Use Neon Pooler Endpoint (RECOMMENDED)
Neon provides a connection pooler that significantly reduces latency. Use the pooler endpoint in your connection string:

**Standard connection:**
```
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

**Pooler connection (better performance):**
```
postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require&pgbouncer=true
```

Or use port 6543:
```
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech:6543/dbname?sslmode=require&pgbouncer=true
```

**How to get pooler endpoint:**
1. Go to your Neon dashboard
2. Navigate to your project settings
3. Find the "Connection string" section
4. Select "Pooled connection" or "Transaction pooler"
5. Copy the connection string with `-pooler` in the hostname or port 6543

### 2. Use Cloudflare Hyperdrive (BEST PERFORMANCE)
Cloudflare Hyperdrive provides a globally distributed connection pool that dramatically reduces latency for serverless databases.

**Benefits:**
- Maintains persistent connections to your database
- Reduces connection establishment time from ~100-300ms to <10ms
- Works seamlessly with Neon
- Automatically handles connection pooling

**Setup Steps:**

1. **Create Hyperdrive Configuration:**
   ```bash
   # In Cloudflare Dashboard:
   # 1. Go to Workers & Pages > Hyperdrive
   # 2. Click "Create a Hyperdrive config"
   # 3. Enter your Neon connection string
   # 4. Name it (e.g., "neon-db")
   ```

2. **Update wrangler.toml:**
   ```toml
   [[hyperdrive]]
   id = "your-hyperdrive-config-id"
   localConnectionString = "postgresql://user:pass@localhost:5432/dbname"
   ```

3. **Update db.js to use Hyperdrive:**
   ```javascript
   // In src/lib/server/db.js, modify createDb function:
   export function createDb(databaseUrl, hyperdriveConnectionString = null) {
     // Use Hyperdrive if available (Cloudflare Workers)
     if (hyperdriveConnectionString) {
       const sql = neon(hyperdriveConnectionString);
       return drizzleNeon(sql, { schema });
     }
     // ... existing code
   }
   ```

4. **Update hooks.server.js:**
   ```javascript
   // In src/hooks.server.js:
   const databaseUrl = event.platform?.env?.DATABASE_URL || process.env.DATABASE_URL || '';
   const hyperdriveUrl = event.platform?.env?.HYPERDRIVE?.connectionString || null;
   
   if (databaseUrl && databaseUrl.trim() !== '') {
     event.locals.db = createDb(databaseUrl, hyperdriveUrl);
     // ...
   }
   ```

5. **Set Hyperdrive binding in Cloudflare:**
   - In Cloudflare Dashboard > Workers & Pages > Your Project > Settings
   - Add Hyperdrive binding with the config you created

**Performance Improvement:**
- Without Hyperdrive: ~150-300ms per query (connection + query)
- With Hyperdrive: ~10-50ms per query (reused connection + query)
- **3-6x faster database queries**

### 3. Query Optimization Tips

#### Use Indexes
Ensure your database has proper indexes:
```sql
-- Example indexes for common queries
CREATE INDEX idx_listings_status_category ON listings(status, category_id);
CREATE INDEX idx_listings_location ON listings(location_city, location_postcode);
CREATE INDEX idx_listing_images_listing_display ON listing_images(listing_id, display_order);
```

#### Batch Queries
Instead of:
```javascript
// BAD: N+1 queries
for (const item of items) {
  const category = await db.select().from(categories).where(eq(categories.id, item.categoryId));
}
```

Use:
```javascript
// GOOD: Single query with JOIN
const itemsWithCategories = await db
  .select({ item: items, category: categories })
  .from(items)
  .leftJoin(categories, eq(items.categoryId, categories.id));
```

#### Limit Data Transfer
Only select fields you need:
```javascript
// BAD: Selects all fields
.select().from(listings)

// GOOD: Selects only needed fields
.select({
  id: listings.id,
  title: listings.title,
  price: listings.price
}).from(listings)
```

### 4. Caching Strategy

Consider adding caching for frequently accessed data:

1. **Category List** - Cache for 1 hour (rarely changes)
2. **User Profile** - Cache for 5 minutes
3. **Featured Listings** - Cache for 15 minutes

Example with Cloudflare KV:
```javascript
// In +page.server.js
const cacheKey = 'categories';
let categories = await env.CACHE.get(cacheKey, { type: 'json' });

if (!categories) {
  categories = await db.select().from(categories);
  await env.CACHE.put(cacheKey, JSON.stringify(categories), { expirationTtl: 3600 });
}
```

## Monitoring Performance

### Check Query Performance
1. Enable query logging in Neon dashboard
2. Monitor slow queries (>100ms)
3. Use Neon's query analytics to identify bottlenecks

### Cloudflare Analytics
1. Check Workers analytics for:
   - CPU time per request
   - Request duration
   - Error rates

### Database Metrics
Monitor in Neon dashboard:
- Connection count
- Query latency
- Database size
- Active connections

## Current Optimizations Applied

✅ **N+1 Query Fix**: Marketplace page now uses JOINs (2 queries instead of 41)
✅ **Connection String Optimization**: Preserves pgbouncer parameter
✅ **Fetch Connection Caching**: Enabled for Neon HTTP driver

## Next Steps

1. **Immediate**: Switch to Neon pooler endpoint in production
2. **Short-term**: Set up Cloudflare Hyperdrive
3. **Long-term**: Add caching layer for frequently accessed data

## Testing Performance

To test performance improvements:

1. **Before optimization:**
   ```bash
   # Check query count in Neon dashboard
   # Time page load
   ```

2. **After optimization:**
   ```bash
   # Compare query count (should be much lower)
   # Compare page load time (should be faster)
   ```

## References

- [Neon Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [Cloudflare Hyperdrive](https://developers.cloudflare.com/workers/databases/third-party-integrations/neon/)
- [Neon Performance Tips](https://neon.tech/docs/performance)
- [Drizzle ORM Best Practices](https://orm.drizzle.team/docs/overview)
