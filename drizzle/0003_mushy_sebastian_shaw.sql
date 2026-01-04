ALTER TABLE "trades" ALTER COLUMN "currency" SET DEFAULT 'USDT';--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "currency_preference" SET DEFAULT 'USDT';--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "tiktok" varchar(100);--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "instagram" varchar(100);--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "whatsapp" varchar(20);--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "telegram" varchar(100);