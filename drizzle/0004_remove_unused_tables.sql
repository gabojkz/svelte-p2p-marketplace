-- Remove unused tables and columns
-- This migration removes dead code identified in UNUSED_DB_TABLES.md

-- Drop unused tables (in reverse dependency order)
DROP TABLE IF EXISTS "dispute_evidence" CASCADE;
DROP TABLE IF EXISTS "search_history" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "kyc_documents" CASCADE;
DROP TABLE IF EXISTS "listing_payment_methods" CASCADE;
DROP TABLE IF EXISTS "payment_methods" CASCADE;
DROP TABLE IF EXISTS "transactions" CASCADE;
DROP TABLE IF EXISTS "wallets" CASCADE;
DROP TABLE IF EXISTS "trade_status_history" CASCADE;
DROP TABLE IF EXISTS "trade_messages" CASCADE;
DROP TABLE IF EXISTS "listing_attributes" CASCADE;

-- Remove unused column from trades table
ALTER TABLE "trades" DROP COLUMN IF EXISTS "escrow_status";

-- Drop unused enum types
DROP TYPE IF EXISTS "escrow_status";
DROP TYPE IF EXISTS "kyc_document_type";
DROP TYPE IF EXISTS "kyc_document_status";
DROP TYPE IF EXISTS "transaction_type";
DROP TYPE IF EXISTS "crypto_type";
DROP TYPE IF EXISTS "transaction_status";
DROP TYPE IF EXISTS "payment_method_type";
DROP TYPE IF EXISTS "notification_type";

-- Update trade_status enum to remove unused values
-- Note: PostgreSQL doesn't support removing enum values directly
-- This would require recreating the enum, which is complex
-- The unused values (payment_pending, paid, disputed) will remain in the enum
-- but won't be used in the application code

