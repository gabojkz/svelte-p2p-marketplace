#!/bin/bash
# Check database status in Podman container

echo "=== Checking Podman container status ==="
podman ps | grep marketplace-postgres || echo "Container not running!"

echo ""
echo "=== Listing all tables ==="
podman exec marketplace-postgres psql -U postgres -d marketplace_db -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

echo ""
echo "=== Checking migration status ==="
podman exec marketplace-postgres psql -U postgres -d marketplace_db -c "SELECT * FROM drizzle.__drizzle_migrations;" 2>/dev/null || echo "Migrations table not found or empty"

echo ""
echo "=== Counting key tables ==="
podman exec marketplace-postgres psql -U postgres -d marketplace_db -c "
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'listings', COUNT(*) FROM listings
UNION ALL
SELECT 'trades', COUNT(*) FROM trades;
" 2>/dev/null || echo "Some tables don't exist yet"

