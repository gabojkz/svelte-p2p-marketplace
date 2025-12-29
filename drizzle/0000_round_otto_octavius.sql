CREATE TYPE "public"."condition" AS ENUM('new', 'like-new', 'good', 'fair', 'parts');--> statement-breakpoint
CREATE TYPE "public"."crypto_type" AS ENUM('BTC', 'ETH', 'USDT');--> statement-breakpoint
CREATE TYPE "public"."dispute_issue_type" AS ENUM('no_response', 'no_show', 'wrong_item', 'scam', 'other');--> statement-breakpoint
CREATE TYPE "public"."dispute_status" AS ENUM('open', 'investigating', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."escrow_status" AS ENUM('reserved', 'released', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."kyc_document_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."kyc_document_type" AS ENUM('passport', 'driver_license', 'national_id', 'utility_bill');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'active', 'paused', 'sold', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('product', 'service');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'system', 'location', 'attachment');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('trade_started', 'trade_message', 'trade_completed', 'review_received', 'dispute_opened', 'listing_sold');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('bank_transfer', 'venmo', 'zelle', 'paypal', 'cash_app', 'other');--> statement-breakpoint
CREATE TYPE "public"."price_type" AS ENUM('fixed', 'negotiable', 'free', 'swap');--> statement-breakpoint
CREATE TYPE "public"."trade_status" AS ENUM('initiated', 'payment_pending', 'paid', 'in_progress', 'completed', 'cancelled', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('deposit', 'withdrawal', 'trade_payment', 'trade_receipt', 'refund');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" "listing_type" NOT NULL,
	"icon" varchar(50),
	"parent_id" bigint,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "dispute_evidence" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dispute_evidence_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"dispute_id" bigint NOT NULL,
	"uploaded_by_user_id" bigint NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"file_type" varchar(50),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "disputes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"trade_id" bigint NOT NULL,
	"reported_by_user_id" bigint NOT NULL,
	"reported_against_user_id" bigint NOT NULL,
	"issue_type" "dispute_issue_type" NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"status" "dispute_status" DEFAULT 'open',
	"resolution" text,
	"resolved_by_admin_id" bigint,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "favorites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"listing_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "idx_favorites_user_listing" UNIQUE("user_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "kyc_documents" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kyc_documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"document_type" "kyc_document_type" NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"status" "kyc_document_status" DEFAULT 'pending',
	"rejection_reason" text,
	"reviewed_by_admin_id" bigint,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_attributes" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "listing_attributes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"listing_id" bigint NOT NULL,
	"attribute_key" varchar(100) NOT NULL,
	"attribute_value" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_images" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "listing_images_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"listing_id" bigint NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"thumbnail_url" varchar(500),
	"display_order" integer DEFAULT 0,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_payment_methods" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "listing_payment_methods_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"listing_id" bigint NOT NULL,
	"payment_method_type" "payment_method_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "listings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"category_id" bigint NOT NULL,
	"subcategory_id" bigint,
	"type" "listing_type" NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"condition" "condition",
	"brand" varchar(100),
	"price" numeric(12, 2) NOT NULL,
	"price_type" "price_type" DEFAULT 'fixed',
	"accepts_offers" boolean DEFAULT false,
	"location_city" varchar(100) NOT NULL,
	"location_postcode" varchar(20) NOT NULL,
	"location_latitude" numeric(10, 8),
	"location_longitude" numeric(11, 8),
	"delivery_collection" boolean DEFAULT true,
	"delivery_local" boolean DEFAULT false,
	"delivery_shipping" boolean DEFAULT false,
	"status" "listing_status" DEFAULT 'draft',
	"featured" boolean DEFAULT false,
	"urgent" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"favorite_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"sold_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text,
	"related_trade_id" bigint,
	"related_listing_id" bigint,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payment_methods_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"type" "payment_method_type" NOT NULL,
	"label" varchar(100),
	"account_details" text,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"trade_id" bigint NOT NULL,
	"reviewer_id" bigint NOT NULL,
	"reviewee_id" bigint NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(200),
	"comment" text,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "search_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint,
	"search_query" varchar(255),
	"category_id" bigint,
	"filters_json" jsonb,
	"results_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "trade_messages" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trade_messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"trade_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"message_type" "message_type" DEFAULT 'text',
	"content" text,
	"attachment_url" varchar(500),
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_status_history" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trade_status_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"trade_id" bigint NOT NULL,
	"old_status" varchar(50),
	"new_status" varchar(50) NOT NULL,
	"changed_by_user_id" bigint,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trades_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"trade_number" varchar(20) NOT NULL,
	"listing_id" bigint NOT NULL,
	"seller_id" bigint NOT NULL,
	"buyer_id" bigint NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'GBP',
	"status" "trade_status" DEFAULT 'initiated',
	"escrow_status" "escrow_status" DEFAULT 'reserved',
	"meeting_scheduled_at" timestamp,
	"meeting_location" varchar(255),
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trades_trade_number_unique" UNIQUE("trade_number")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"trade_id" bigint,
	"type" "transaction_type" NOT NULL,
	"crypto_type" "crypto_type" NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"amount_usd" numeric(12, 2),
	"status" "transaction_status" DEFAULT 'pending',
	"transaction_hash" varchar(255),
	"from_address" varchar(255),
	"to_address" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"sms_notifications" boolean DEFAULT false,
	"show_email" boolean DEFAULT false,
	"show_phone" boolean DEFAULT false,
	"currency_preference" varchar(10) DEFAULT 'GBP',
	"language" varchar(10) DEFAULT 'en',
	"timezone" varchar(50) DEFAULT 'UTC',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"auth_user_id" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone" varchar(20),
	"phone_verified" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"avatar_url" varchar(500),
	"bio" text,
	"location_city" varchar(100),
	"location_postcode" varchar(20),
	"location_latitude" numeric(10, 8),
	"location_longitude" numeric(11, 8),
	"kyc_status" "kyc_status" DEFAULT 'pending',
	"kyc_verified_at" timestamp,
	"two_factor_enabled" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"is_banned" boolean DEFAULT false,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_user_id_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wallets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"btc_balance" numeric(18, 8) DEFAULT '0',
	"eth_balance" numeric(18, 8) DEFAULT '0',
	"usdt_balance" numeric(18, 8) DEFAULT '0',
	"total_balance_usd" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_evidence" ADD CONSTRAINT "dispute_evidence_dispute_id_disputes_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."disputes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_evidence" ADD CONSTRAINT "dispute_evidence_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_reported_by_user_id_users_id_fk" FOREIGN KEY ("reported_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_reported_against_user_id_users_id_fk" FOREIGN KEY ("reported_against_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolved_by_admin_id_users_id_fk" FOREIGN KEY ("resolved_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_reviewed_by_admin_id_users_id_fk" FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_attributes" ADD CONSTRAINT "listing_attributes_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_payment_methods" ADD CONSTRAINT "listing_payment_methods_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_subcategory_id_categories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_trade_id_trades_id_fk" FOREIGN KEY ("related_trade_id") REFERENCES "public"."trades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_listing_id_listings_id_fk" FOREIGN KEY ("related_listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_messages" ADD CONSTRAINT "trade_messages_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_messages" ADD CONSTRAINT "trade_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_status_history" ADD CONSTRAINT "trade_status_history_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_status_history" ADD CONSTRAINT "trade_status_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_user_id_user_id_fk" FOREIGN KEY ("auth_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_type" ON "categories" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_categories_parent" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_dispute_evidence_dispute" ON "dispute_evidence" USING btree ("dispute_id");--> statement-breakpoint
CREATE INDEX "idx_disputes_trade" ON "disputes" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "idx_disputes_reported_by" ON "disputes" USING btree ("reported_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_disputes_status" ON "disputes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_favorites_user" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_favorites_listing" ON "favorites" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_kyc_documents_user" ON "kyc_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_kyc_documents_status" ON "kyc_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_listing_attributes_listing" ON "listing_attributes" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_listing_attributes_key" ON "listing_attributes" USING btree ("listing_id","attribute_key");--> statement-breakpoint
CREATE INDEX "idx_listing_images_listing" ON "listing_images" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_listing_images_order" ON "listing_images" USING btree ("listing_id","display_order");--> statement-breakpoint
CREATE INDEX "idx_listing" ON "listing_payment_methods" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_listings_user" ON "listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_listings_category" ON "listings" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_listings_status" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_listings_location" ON "listings" USING btree ("location_latitude","location_longitude");--> statement-breakpoint
CREATE INDEX "idx_listings_price" ON "listings" USING btree ("price");--> statement-breakpoint
CREATE INDEX "idx_listings_created" ON "listings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_read" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_created" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_user" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_type" ON "payment_methods" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_reviews_trade" ON "reviews" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_reviewer" ON "reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_reviewee" ON "reviews" USING btree ("reviewee_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_rating" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "idx_search_history_user" ON "search_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_search_history_created" ON "search_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_trade_messages_trade" ON "trade_messages" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "idx_trade_messages_user" ON "trade_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_trade_messages_created" ON "trade_messages" USING btree ("trade_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_trade_status_history_trade" ON "trade_status_history" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "idx_trade_status_history_created" ON "trade_status_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_trades_trade_number" ON "trades" USING btree ("trade_number");--> statement-breakpoint
CREATE INDEX "idx_trades_listing" ON "trades" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "idx_trades_seller" ON "trades" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "idx_trades_buyer" ON "trades" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "idx_trades_status" ON "trades" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_trades_created" ON "trades" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_user" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_trade" ON "transactions" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_type" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_transactions_status" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_transactions_created" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_settings_user" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_location" ON "users" USING btree ("location_latitude","location_longitude");--> statement-breakpoint
CREATE INDEX "idx_wallets_user" ON "wallets" USING btree ("user_id");