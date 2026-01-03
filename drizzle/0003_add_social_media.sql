-- Add social media columns to user_settings table
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "tiktok" varchar(100);
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "instagram" varchar(100);
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "whatsapp" varchar(20);
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "telegram" varchar(100);

