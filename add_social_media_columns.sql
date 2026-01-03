-- Add social media columns to user_settings table
-- Run this SQL script directly on your database

ALTER TABLE "user_settings" 
ADD COLUMN IF NOT EXISTS "tiktok" varchar(100),
ADD COLUMN IF NOT EXISTS "instagram" varchar(100),
ADD COLUMN IF NOT EXISTS "whatsapp" varchar(20),
ADD COLUMN IF NOT EXISTS "telegram" varchar(100);

