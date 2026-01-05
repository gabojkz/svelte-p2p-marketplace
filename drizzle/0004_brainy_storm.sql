DROP TABLE "dispute_evidence" CASCADE;--> statement-breakpoint
DROP TABLE "kyc_documents" CASCADE;--> statement-breakpoint
DROP TABLE "listing_attributes" CASCADE;--> statement-breakpoint
DROP TABLE "listing_payment_methods" CASCADE;--> statement-breakpoint
DROP TABLE "notifications" CASCADE;--> statement-breakpoint
DROP TABLE "payment_methods" CASCADE;--> statement-breakpoint
DROP TABLE "search_history" CASCADE;--> statement-breakpoint
DROP TABLE "trade_messages" CASCADE;--> statement-breakpoint
DROP TABLE "trade_status_history" CASCADE;--> statement-breakpoint
DROP TABLE "transactions" CASCADE;--> statement-breakpoint
DROP TABLE "wallets" CASCADE;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "status" SET DEFAULT 'initiated'::text;--> statement-breakpoint
DROP TYPE "public"."trade_status";--> statement-breakpoint
CREATE TYPE "public"."trade_status" AS ENUM('initiated', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "status" SET DEFAULT 'initiated'::"public"."trade_status";--> statement-breakpoint
ALTER TABLE "trades" ALTER COLUMN "status" SET DATA TYPE "public"."trade_status" USING "status"::"public"."trade_status";--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "name_es" varchar(100);--> statement-breakpoint
ALTER TABLE "trades" DROP COLUMN "escrow_status";--> statement-breakpoint
DROP TYPE "public"."crypto_type";--> statement-breakpoint
DROP TYPE "public"."escrow_status";--> statement-breakpoint
DROP TYPE "public"."kyc_document_status";--> statement-breakpoint
DROP TYPE "public"."kyc_document_type";--> statement-breakpoint
DROP TYPE "public"."notification_type";--> statement-breakpoint
DROP TYPE "public"."payment_method_type";--> statement-breakpoint
DROP TYPE "public"."transaction_status";--> statement-breakpoint
DROP TYPE "public"."transaction_type";