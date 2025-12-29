-- Seed categories for P2P Marketplace
-- Run this with: psql -h localhost -p 5433 -U postgres -d marketplace_db -f seed-categories.sql
-- Or: podman exec -i marketplace-postgres psql -U postgres -d marketplace_db < seed-categories.sql

-- Insert Product Categories
INSERT INTO categories (name, slug, type, icon, display_order, is_active) VALUES
('Electronics & Tech', 'electronics', 'product', '📱', 1, true),
('Home & Appliances', 'home', 'product', '🏠', 2, true),
('Energy & Hardware', 'hardware', 'product', '🔧', 3, true),
('Fashion & Accessories', 'fashion', 'product', '👕', 4, true),
('Motors & Automotive', 'motors', 'product', '🚗', 5, true),
('Health & Beauty', 'health-beauty', 'product', '💄', 6, true),
('Collectibles & Art', 'collectibles', 'product', '🎨', 7, true),
('Sports & Outdoors', 'sports', 'product', '⚽', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert Service Categories
INSERT INTO categories (name, slug, type, icon, display_order, is_active) VALUES
('Home Improvement', 'home-improvement', 'service', '🔨', 1, true),
('Health & Wellness', 'health-services', 'service', '❤️', 2, true),
('Professional & Digital', 'professional', 'service', '💼', 3, true),
('Education & Training', 'education', 'service', '📚', 4, true),
('Logistics & Transport', 'logistics', 'service', '🚚', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Verify categories were inserted
SELECT name, slug, type, icon FROM categories ORDER BY type, display_order;


