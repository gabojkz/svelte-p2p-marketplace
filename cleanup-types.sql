-- Cleanup script: Drop existing enum types if they exist
-- Run this if you get "type already exists" errors
-- Usage: psql -h localhost -p 5433 -U postgres -d marketplace_db -f cleanup-types.sql

-- Drop types if they exist (in reverse dependency order)
DROP TYPE IF EXISTS "public"."condition" CASCADE;
DROP TYPE IF EXISTS "public"."crypto_type" CASCADE;
DROP TYPE IF EXISTS "public"."dispute_issue_type" CASCADE;
DROP TYPE IF EXISTS "public"."dispute_status" CASCADE;
DROP TYPE IF EXISTS "public"."escrow_status" CASCADE;
DROP TYPE IF EXISTS "public"."kyc_document_status" CASCADE;
DROP TYPE IF EXISTS "public"."kyc_document_type" CASCADE;
DROP TYPE IF EXISTS "public"."kyc_status" CASCADE;
DROP TYPE IF EXISTS "public"."listing_status" CASCADE;
DROP TYPE IF EXISTS "public"."listing_type" CASCADE;
DROP TYPE IF EXISTS "public"."message_type" CASCADE;
DROP TYPE IF EXISTS "public"."notification_type" CASCADE;
DROP TYPE IF EXISTS "public"."payment_method_type" CASCADE;
DROP TYPE IF EXISTS "public"."price_type" CASCADE;
DROP TYPE IF EXISTS "public"."trade_status" CASCADE;
DROP TYPE IF EXISTS "public"."transaction_status" CASCADE;
DROP TYPE IF EXISTS "public"."transaction_type" CASCADE;

-- Note: This will also drop any tables/columns that depend on these types
-- After running this, use: npm run db:push

