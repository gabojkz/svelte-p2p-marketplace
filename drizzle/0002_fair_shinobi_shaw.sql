CREATE TABLE "allowed_email_domains" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "allowed_email_domains_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"domain" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "allowed_email_domains_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
DROP INDEX "idx_email";--> statement-breakpoint
CREATE INDEX "idx_allowed_email_domains_domain" ON "allowed_email_domains" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "idx_allowed_email_domains_active" ON "allowed_email_domains" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email_verified";