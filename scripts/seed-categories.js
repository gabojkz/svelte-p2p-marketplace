import { createDb } from '../src/lib/server/db.js';
import { categories } from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/marketplace_db';

// Structure: Parent categories first, then subcategories with parentId
const categoryData = [
	// ============================================
	// PRODUCTS / ARTICLES (Parent Category)
	// ============================================
	{ name: '🛒 PRODUCTS / ARTICLES', slug: 'products-articles', type: 'product', icon: '🛒', parentId: null, displayOrder: 1 },
	
	// Electronics (under Products)
	{ name: '📱 Electronics', slug: 'electronics', type: 'product', icon: '📱', parentSlug: 'products-articles', displayOrder: 1 },
	{ name: 'Mobile phones and accessories', slug: 'mobile-phones-accessories', type: 'product', icon: null, parentSlug: 'electronics', displayOrder: 1 },
	{ name: 'Computers and laptops', slug: 'computers-laptops', type: 'product', icon: null, parentSlug: 'electronics', displayOrder: 2 },
	{ name: 'Tablets', slug: 'tablets', type: 'product', icon: null, parentSlug: 'electronics', displayOrder: 3 },
	{ name: 'Gaming consoles and video games', slug: 'gaming-consoles-games', type: 'product', icon: null, parentSlug: 'electronics', displayOrder: 4 },
	{ name: 'TVs, audio, and cameras', slug: 'tvs-audio-cameras', type: 'product', icon: null, parentSlug: 'electronics', displayOrder: 5 },
	{ name: 'Smart home devices', slug: 'smart-home-devices', type: 'product', icon: null, parentSlug: 'electronics', displayOrder: 6 },
	
	// Fashion and Accessories
	{ name: '👗 Fashion and Accessories', slug: 'fashion-accessories', type: 'product', icon: '👗', parentSlug: 'products-articles', displayOrder: 2 },
	{ name: "Men's clothing", slug: 'mens-clothing', type: 'product', icon: null, parentSlug: 'fashion-accessories', displayOrder: 1 },
	{ name: "Women's clothing", slug: 'womens-clothing', type: 'product', icon: null, parentSlug: 'fashion-accessories', displayOrder: 2 },
	{ name: 'Footwear', slug: 'footwear', type: 'product', icon: null, parentSlug: 'fashion-accessories', displayOrder: 3 },
	{ name: 'Bags', slug: 'bags', type: 'product', icon: null, parentSlug: 'fashion-accessories', displayOrder: 4 },
	{ name: 'Watches and jewelry', slug: 'watches-jewelry', type: 'product', icon: null, parentSlug: 'fashion-accessories', displayOrder: 5 },
	
	// Home, Furniture, and Garden
	{ name: '🏠 Home, Furniture, and Garden', slug: 'home-furniture-garden', type: 'product', icon: '🏠', parentSlug: 'products-articles', displayOrder: 3 },
	{ name: 'Furniture', slug: 'furniture', type: 'product', icon: null, parentSlug: 'home-furniture-garden', displayOrder: 1 },
	{ name: 'Home décor', slug: 'home-decor', type: 'product', icon: null, parentSlug: 'home-furniture-garden', displayOrder: 2 },
	{ name: 'Kitchenware', slug: 'kitchenware', type: 'product', icon: null, parentSlug: 'home-furniture-garden', displayOrder: 3 },
	{ name: 'Appliances', slug: 'appliances', type: 'product', icon: null, parentSlug: 'home-furniture-garden', displayOrder: 4 },
	{ name: 'Garden tools and equipment', slug: 'garden-tools-equipment', type: 'product', icon: null, parentSlug: 'home-furniture-garden', displayOrder: 5 },
	{ name: 'Outdoor furniture', slug: 'outdoor-furniture', type: 'product', icon: null, parentSlug: 'home-furniture-garden', displayOrder: 6 },
	
	// Vehicles and Transport
	{ name: '🚗 Vehicles and Transport', slug: 'vehicles-transport', type: 'product', icon: '🚗', parentSlug: 'products-articles', displayOrder: 4 },
	{ name: 'Cars', slug: 'cars', type: 'product', icon: null, parentSlug: 'vehicles-transport', displayOrder: 1 },
	{ name: 'Motorcycles and scooters', slug: 'motorcycles-scooters', type: 'product', icon: null, parentSlug: 'vehicles-transport', displayOrder: 2 },
	{ name: 'Bicycles', slug: 'bicycles', type: 'product', icon: null, parentSlug: 'vehicles-transport', displayOrder: 3 },
	{ name: 'Vehicle parts and accessories', slug: 'vehicle-parts-accessories', type: 'product', icon: null, parentSlug: 'vehicles-transport', displayOrder: 4 },
	
	// Hobbies and Leisure
	{ name: '🎮 Hobbies and Leisure', slug: 'hobbies-leisure', type: 'product', icon: '🎮', parentSlug: 'products-articles', displayOrder: 5 },
	{ name: 'Sports equipment', slug: 'sports-equipment', type: 'product', icon: null, parentSlug: 'hobbies-leisure', displayOrder: 1 },
	{ name: 'Fitness gear', slug: 'fitness-gear', type: 'product', icon: null, parentSlug: 'hobbies-leisure', displayOrder: 2 },
	{ name: 'Musical instruments', slug: 'musical-instruments', type: 'product', icon: null, parentSlug: 'hobbies-leisure', displayOrder: 3 },
	{ name: 'Toys and games', slug: 'toys-games', type: 'product', icon: null, parentSlug: 'hobbies-leisure', displayOrder: 4 },
	{ name: 'Arts and crafts', slug: 'arts-crafts', type: 'product', icon: null, parentSlug: 'hobbies-leisure', displayOrder: 5 },
	
	// Books, Media, and Education
	{ name: '📚 Books, Media, and Education', slug: 'books-media-education', type: 'product', icon: '📚', parentSlug: 'products-articles', displayOrder: 6 },
	{ name: 'Books and textbooks', slug: 'books-textbooks', type: 'product', icon: null, parentSlug: 'books-media-education', displayOrder: 1 },
	{ name: 'Magazines', slug: 'magazines', type: 'product', icon: null, parentSlug: 'books-media-education', displayOrder: 2 },
	{ name: 'CDs, DVDs, and Blu-rays', slug: 'cds-dvds-bluray', type: 'product', icon: null, parentSlug: 'books-media-education', displayOrder: 3 },
	{ name: 'Educational materials', slug: 'educational-materials', type: 'product', icon: null, parentSlug: 'books-media-education', displayOrder: 4 },
	
	// Collectibles and Antiques
	{ name: '🏺 Collectibles and Antiques', slug: 'collectibles-antiques', type: 'product', icon: '🏺', parentSlug: 'products-articles', displayOrder: 7 },
	{ name: 'Antiques', slug: 'antiques', type: 'product', icon: null, parentSlug: 'collectibles-antiques', displayOrder: 1 },
	{ name: 'Collectible items', slug: 'collectible-items', type: 'product', icon: null, parentSlug: 'collectibles-antiques', displayOrder: 2 },
	{ name: 'Trading cards', slug: 'trading-cards', type: 'product', icon: null, parentSlug: 'collectibles-antiques', displayOrder: 3 },
	{ name: 'Coins and stamps', slug: 'coins-stamps', type: 'product', icon: null, parentSlug: 'collectibles-antiques', displayOrder: 4 },
	
	// Health and Beauty
	{ name: '💄 Health and Beauty', slug: 'health-beauty', type: 'product', icon: '💄', parentSlug: 'products-articles', displayOrder: 8 },
	{ name: 'Beauty products', slug: 'beauty-products', type: 'product', icon: null, parentSlug: 'health-beauty', displayOrder: 1 },
	{ name: 'Hair care and grooming tools', slug: 'hair-care-grooming', type: 'product', icon: null, parentSlug: 'health-beauty', displayOrder: 2 },
	{ name: 'Wellness products', slug: 'wellness-products', type: 'product', icon: null, parentSlug: 'health-beauty', displayOrder: 3 },
	{ name: 'Fitness equipment', slug: 'fitness-equipment', type: 'product', icon: null, parentSlug: 'health-beauty', displayOrder: 4 },
	
	// Agriculture and Livestock
	{ name: '🌾 Agriculture and Livestock', slug: 'agriculture-livestock', type: 'product', icon: '🌾', parentSlug: 'products-articles', displayOrder: 9 },
	{ name: 'Agricultural machinery and equipment', slug: 'agricultural-machinery', type: 'product', icon: null, parentSlug: 'agriculture-livestock', displayOrder: 1 },
	{ name: 'Seeds and plants', slug: 'seeds-plants', type: 'product', icon: null, parentSlug: 'agriculture-livestock', displayOrder: 2 },
	{ name: 'Livestock and animal feed', slug: 'livestock-animal-feed', type: 'product', icon: null, parentSlug: 'agriculture-livestock', displayOrder: 3 },
	{ name: 'Fertilizers and agricultural supplies', slug: 'fertilizers-agricultural-supplies', type: 'product', icon: null, parentSlug: 'agriculture-livestock', displayOrder: 4 },
	
	// Pets and Animals
	{ name: '🐾 Pets and Animals', slug: 'pets-animals', type: 'product', icon: '🐾', parentSlug: 'products-articles', displayOrder: 10 },
	{ name: 'Pet supplies', slug: 'pet-supplies', type: 'product', icon: null, parentSlug: 'pets-animals', displayOrder: 1 },
	{ name: 'Farm animals (with rules)', slug: 'farm-animals', type: 'product', icon: null, parentSlug: 'pets-animals', displayOrder: 2 },
	
	// Crypto and Blockchain (Products)
	{ name: '₿ Crypto and Blockchain (Products)', slug: 'crypto-blockchain-products', type: 'product', icon: '₿', parentSlug: 'products-articles', displayOrder: 11 },
	{ name: 'Hardware wallets', slug: 'hardware-wallets', type: 'product', icon: null, parentSlug: 'crypto-blockchain-products', displayOrder: 1 },
	{ name: 'Mining equipment', slug: 'mining-equipment', type: 'product', icon: null, parentSlug: 'crypto-blockchain-products', displayOrder: 2 },
	
	// Free, Swap, and Community
	{ name: '🎁 Free, Swap, and Community', slug: 'free-swap-community', type: 'product', icon: '🎁', parentSlug: 'products-articles', displayOrder: 12 },
	{ name: 'Free items', slug: 'free-items', type: 'product', icon: null, parentSlug: 'free-swap-community', displayOrder: 1 },
	{ name: 'Item swaps', slug: 'item-swaps', type: 'product', icon: null, parentSlug: 'free-swap-community', displayOrder: 2 },
	
	// ============================================
	// SERVICES (Parent Category)
	// ============================================
	{ name: '🧰 SERVICES', slug: 'services', type: 'service', icon: '🧰', parentId: null, displayOrder: 2 },
	
	// Home & Local Services
	{ name: '🏠 Home & Local Services', slug: 'home-local-services', type: 'service', icon: '🏠', parentSlug: 'services', displayOrder: 1 },
	{ name: 'House cleaning', slug: 'house-cleaning', type: 'service', icon: null, parentSlug: 'home-local-services', displayOrder: 1 },
	{ name: 'Garden cleaning & basic landscaping', slug: 'garden-cleaning-landscaping', type: 'service', icon: null, parentSlug: 'home-local-services', displayOrder: 2 },
	{ name: 'Furniture assembly', slug: 'furniture-assembly', type: 'service', icon: null, parentSlug: 'home-local-services', displayOrder: 3 },
	{ name: 'Small home repairs', slug: 'small-home-repairs', type: 'service', icon: null, parentSlug: 'home-local-services', displayOrder: 4 },
	{ name: 'Painting & decorating', slug: 'painting-decorating', type: 'service', icon: null, parentSlug: 'home-local-services', displayOrder: 5 },
	{ name: 'Moving help (labor only)', slug: 'moving-help', type: 'service', icon: null, parentSlug: 'home-local-services', displayOrder: 6 },
	{ name: 'Trash removal', slug: 'trash-removal', type: 'service', icon: null, parentSlug: 'home-local-services', displayOrder: 7 },
	{ name: 'Handyman help', slug: 'handyman-help', type: 'service', icon: null, parentSlug: 'home-local-services', displayOrder: 8 },
	{ name: 'Carpentry & woodworking', slug: 'carpentry-woodworking', type: 'service', icon: null, parentSlug: 'home-local-services', displayOrder: 9 },
	{ name: 'Plumbing & electrical', slug: 'plumbing-electrical', type: 'service', icon: null, parentSlug: 'home-local-services', displayOrder: 10 },
	{ name: 'Air conditioning & heating repair', slug: 'ac-heating-repair', type: 'service', icon: null, parentSlug: 'home-local-services', displayOrder: 11 },
	
	// Vehicle & Transport Services
	{ name: '🚗 Vehicle & Transport Services', slug: 'vehicle-transport-services', type: 'service', icon: '🚗', parentSlug: 'services', displayOrder: 2 },
	{ name: 'Rides (non-commercial)', slug: 'rides-non-commercial', type: 'service', icon: null, parentSlug: 'vehicle-transport-services', displayOrder: 1 },
	{ name: 'Vehicle cleaning (interior/exterior)', slug: 'vehicle-cleaning', type: 'service', icon: null, parentSlug: 'vehicle-transport-services', displayOrder: 2 },
	{ name: 'Bicycle repair', slug: 'bicycle-repair', type: 'service', icon: null, parentSlug: 'vehicle-transport-services', displayOrder: 3 },
	
	// Agriculture Services
	{ name: '🌿 Agriculture Services', slug: 'agriculture-services', type: 'service', icon: '🌿', parentSlug: 'services', displayOrder: 3 },
	{ name: 'Agricultural services', slug: 'agricultural-services', type: 'service', icon: null, parentSlug: 'agriculture-services', displayOrder: 1 },
	{ name: 'Farm animal care help', slug: 'farm-animal-care', type: 'service', icon: null, parentSlug: 'agriculture-services', displayOrder: 2 },
	{ name: 'Stable / farm assistance', slug: 'stable-farm-assistance', type: 'service', icon: null, parentSlug: 'agriculture-services', displayOrder: 3 },
	
	// Travel, Hotels, and Tourism
	{ name: '🏨 Travel, Hotels, and Tourism', slug: 'travel-hotels-tourism', type: 'service', icon: '🏨', parentSlug: 'services', displayOrder: 4 },
	{ name: 'Hotels and resorts', slug: 'hotels-resorts', type: 'service', icon: null, parentSlug: 'travel-hotels-tourism', displayOrder: 1 },
	{ name: 'Guesthouses and hostels', slug: 'guesthouses-hostels', type: 'service', icon: null, parentSlug: 'travel-hotels-tourism', displayOrder: 2 },
	{ name: 'Holiday rentals', slug: 'holiday-rentals', type: 'service', icon: null, parentSlug: 'travel-hotels-tourism', displayOrder: 3 },
	{ name: 'Short-term stays', slug: 'short-term-stays', type: 'service', icon: null, parentSlug: 'travel-hotels-tourism', displayOrder: 4 },
	{ name: 'Camping and eco-lodges', slug: 'camping-eco-lodges', type: 'service', icon: null, parentSlug: 'travel-hotels-tourism', displayOrder: 5 },
	{ name: 'Tour guides and travel services', slug: 'tour-guides-travel', type: 'service', icon: null, parentSlug: 'travel-hotels-tourism', displayOrder: 6 },
	
	// Events and Entertainment
	{ name: '🎉 Events and Entertainment', slug: 'events-entertainment', type: 'service', icon: '🎉', parentSlug: 'services', displayOrder: 5 },
	{ name: 'Event tickets', slug: 'event-tickets', type: 'service', icon: null, parentSlug: 'events-entertainment', displayOrder: 1 },
	{ name: 'Event venues', slug: 'event-venues', type: 'service', icon: null, parentSlug: 'events-entertainment', displayOrder: 2 },
	{ name: 'DJs and performers', slug: 'djs-performers', type: 'service', icon: null, parentSlug: 'events-entertainment', displayOrder: 3 },
	{ name: 'Event planning services', slug: 'event-planning', type: 'service', icon: null, parentSlug: 'events-entertainment', displayOrder: 4 },
	{ name: 'Catering services', slug: 'catering-services', type: 'service', icon: null, parentSlug: 'events-entertainment', displayOrder: 5 },
	{ name: 'Equipment rental (sound, lighting, tents)', slug: 'equipment-rental', type: 'service', icon: null, parentSlug: 'events-entertainment', displayOrder: 6 },
	
	// Creative & Professional Services
	{ name: '🎨 Creative & Professional Services', slug: 'creative-professional-services', type: 'service', icon: '🎨', parentSlug: 'services', displayOrder: 6 },
	{ name: 'Graphic design', slug: 'graphic-design', type: 'service', icon: null, parentSlug: 'creative-professional-services', displayOrder: 1 },
	{ name: 'Photography', slug: 'photography', type: 'service', icon: null, parentSlug: 'creative-professional-services', displayOrder: 2 },
	{ name: 'Video editing', slug: 'video-editing', type: 'service', icon: null, parentSlug: 'creative-professional-services', displayOrder: 3 },
	{ name: 'Writing and translation', slug: 'writing-translation', type: 'service', icon: null, parentSlug: 'creative-professional-services', displayOrder: 4 },
	
	// Tech Services
	{ name: '💻 Tech Services', slug: 'tech-services', type: 'service', icon: '💻', parentSlug: 'services', displayOrder: 7 },
	{ name: 'Website creation', slug: 'website-creation', type: 'service', icon: null, parentSlug: 'tech-services', displayOrder: 1 },
	{ name: 'App development', slug: 'app-development', type: 'service', icon: null, parentSlug: 'tech-services', displayOrder: 2 },
	{ name: 'IT support', slug: 'it-support', type: 'service', icon: null, parentSlug: 'tech-services', displayOrder: 3 },
	{ name: 'Computer and phone repair', slug: 'computer-phone-repair', type: 'service', icon: null, parentSlug: 'tech-services', displayOrder: 4 },
	
	// Classes and Education
	{ name: '🎓 Classes and Education', slug: 'classes-education', type: 'service', icon: '🎓', parentSlug: 'services', displayOrder: 8 },
	{ name: 'Tutoring', slug: 'tutoring', type: 'service', icon: null, parentSlug: 'classes-education', displayOrder: 1 },
	{ name: 'Music lessons', slug: 'music-lessons', type: 'service', icon: null, parentSlug: 'classes-education', displayOrder: 2 },
	{ name: 'Language lessons', slug: 'language-lessons', type: 'service', icon: null, parentSlug: 'classes-education', displayOrder: 3 },
	{ name: 'Exam preparation', slug: 'exam-preparation', type: 'service', icon: null, parentSlug: 'classes-education', displayOrder: 4 },
	
	// Pet Services
	{ name: '🐕 Pet Services', slug: 'pet-services', type: 'service', icon: '🐕', parentSlug: 'services', displayOrder: 9 },
	{ name: 'Dog walking', slug: 'dog-walking', type: 'service', icon: null, parentSlug: 'pet-services', displayOrder: 1 },
	{ name: 'Pet sitting', slug: 'pet-sitting', type: 'service', icon: null, parentSlug: 'pet-services', displayOrder: 2 },
	{ name: 'Pet feeding', slug: 'pet-feeding', type: 'service', icon: null, parentSlug: 'pet-services', displayOrder: 3 },
	{ name: 'Pet grooming (basic)', slug: 'pet-grooming', type: 'service', icon: null, parentSlug: 'pet-services', displayOrder: 4 },
	
	// Crypto and Blockchain (Services)
	{ name: '₿ Crypto and Blockchain (Services)', slug: 'crypto-blockchain-services', type: 'service', icon: '₿', parentSlug: 'services', displayOrder: 10 },
	{ name: 'Cryptocurrency exchanges', slug: 'cryptocurrency-exchanges', type: 'service', icon: null, parentSlug: 'crypto-blockchain-services', displayOrder: 1 },
	{ name: 'On-ramp / off-ramp services', slug: 'onramp-offramp-services', type: 'service', icon: null, parentSlug: 'crypto-blockchain-services', displayOrder: 2 },
	{ name: 'OTC broker listings', slug: 'otc-broker-listings', type: 'service', icon: null, parentSlug: 'crypto-blockchain-services', displayOrder: 3 },
	
	// Business and Professional Services
	{ name: '🏢 Business and Professional Services', slug: 'business-professional-services', type: 'service', icon: '🏢', parentSlug: 'services', displayOrder: 11 },
	{ name: 'Business services', slug: 'business-services', type: 'service', icon: null, parentSlug: 'business-professional-services', displayOrder: 1 },
	{ name: 'Marketing and advertising', slug: 'marketing-advertising', type: 'service', icon: null, parentSlug: 'business-professional-services', displayOrder: 2 },
	{ name: 'Consulting', slug: 'consulting', type: 'service', icon: null, parentSlug: 'business-professional-services', displayOrder: 3 },
	
	// Requests / Wanted Ads
	{ name: '📢 Requests / Wanted Ads', slug: 'requests-wanted-ads', type: 'service', icon: '📢', parentSlug: 'services', displayOrder: 12 },
	{ name: 'Service requests', slug: 'service-requests', type: 'service', icon: null, parentSlug: 'requests-wanted-ads', displayOrder: 1 },
	{ name: 'Item requests', slug: 'item-requests', type: 'service', icon: null, parentSlug: 'requests-wanted-ads', displayOrder: 2 },
	
	// Property and Real Estate
	{ name: '🏠 Property and Real Estate', slug: 'property-real-estate', type: 'service', icon: '🏠', parentSlug: 'services', displayOrder: 13 },
	{ name: 'Properties for rent', slug: 'properties-rent', type: 'service', icon: null, parentSlug: 'property-real-estate', displayOrder: 1 },
	{ name: 'Properties for sale', slug: 'properties-sale', type: 'service', icon: null, parentSlug: 'property-real-estate', displayOrder: 2 },
	{ name: 'Rooms and shared housing', slug: 'rooms-shared-housing', type: 'service', icon: null, parentSlug: 'property-real-estate', displayOrder: 3 },
	{ name: 'Land and farms', slug: 'land-farms', type: 'service', icon: null, parentSlug: 'property-real-estate', displayOrder: 4 },
	{ name: 'Commercial properties', slug: 'commercial-properties', type: 'service', icon: null, parentSlug: 'property-real-estate', displayOrder: 5 },
	
	// Jobs and Gigs
	{ name: '💼 Jobs and Gigs', slug: 'jobs-gigs', type: 'service', icon: '💼', parentSlug: 'services', displayOrder: 14 },
	{ name: 'Full-time jobs', slug: 'full-time-jobs', type: 'service', icon: null, parentSlug: 'jobs-gigs', displayOrder: 1 },
	{ name: 'Part-time jobs', slug: 'part-time-jobs', type: 'service', icon: null, parentSlug: 'jobs-gigs', displayOrder: 2 },
	{ name: 'Freelance work', slug: 'freelance-work', type: 'service', icon: null, parentSlug: 'jobs-gigs', displayOrder: 3 },
	{ name: 'Temporary work', slug: 'temporary-work', type: 'service', icon: null, parentSlug: 'jobs-gigs', displayOrder: 4 },
	{ name: 'Internships', slug: 'internships', type: 'service', icon: null, parentSlug: 'jobs-gigs', displayOrder: 5 },
	
	// Community Services
	{ name: '🎁 Community Services', slug: 'community-services', type: 'service', icon: '🎁', parentSlug: 'services', displayOrder: 15 },
	{ name: 'Community help', slug: 'community-help', type: 'service', icon: null, parentSlug: 'community-services', displayOrder: 1 },
	{ name: 'Lost and found', slug: 'lost-found', type: 'service', icon: null, parentSlug: 'community-services', displayOrder: 2 },
];

async function seedCategories() {
	const db = createDb(databaseUrl);

	try {
		console.log('🌱 Seeding categories...\n');

		// First, clear existing categories (optional - comment out if you want to keep existing)
		// await db.delete(categories);
		// console.log('🗑️  Cleared existing categories\n');

		// Create a map to store category IDs by slug for parent relationships
		const categoryMap = new Map();

		// First pass: Insert/update all categories (without parent relationships yet)
		for (const category of categoryData) {
			const existing = await db
				.select()
				.from(categories)
				.where(eq(categories.slug, category.slug))
				.limit(1);

			let categoryId;
			if (existing.length === 0) {
				const result = await db
					.insert(categories)
					.values({
						name: category.name,
						slug: category.slug,
						type: category.type,
						icon: category.icon,
						parentId: null, // Will be set in second pass
						displayOrder: category.displayOrder,
						isActive: true
					})
					.returning({ id: categories.id });

				categoryId = result[0].id;
				categoryMap.set(category.slug, categoryId);
				console.log(`✅ Added: ${category.name}`);
			} else {
				categoryId = existing[0].id;
				categoryMap.set(category.slug, categoryId);
				// Update existing category (parentId will be set in second pass)
				await db
					.update(categories)
					.set({
						name: category.name,
						type: category.type,
						icon: category.icon,
						displayOrder: category.displayOrder
					})
					.where(eq(categories.id, categoryId));
				console.log(`🔄 Updated: ${category.name}`);
			}
		}

		// Second pass: Update parent relationships
		console.log('\n🔗 Setting parent relationships...');
		for (const category of categoryData) {
			if (category.parentSlug) {
				const parentId = categoryMap.get(category.parentSlug);
				const categoryId = categoryMap.get(category.slug);
				
				if (parentId && categoryId) {
					await db
						.update(categories)
						.set({ parentId: parentId })
						.where(eq(categories.id, categoryId));
					console.log(`   ✓ Linked ${category.name} → ${category.parentSlug}`);
				}
			}
		}

		// Show summary
		const allCategories = await db.select().from(categories);
		const products = allCategories.filter(c => c.type === 'product');
		const services = allCategories.filter(c => c.type === 'service');
		const topLevel = allCategories.filter(c => !c.parentId);
		const subcategories = allCategories.filter(c => c.parentId);

		console.log(`\n📊 Summary:`);
		console.log(`   Total categories: ${allCategories.length}`);
		console.log(`   Products: ${products.length}`);
		console.log(`   Services: ${services.length}`);
		console.log(`   Top-level categories: ${topLevel.length}`);
		console.log(`   Subcategories: ${subcategories.length}`);

		console.log('\n✨ Categories seeded successfully!');
		process.exit(0);
	} catch (error) {
		console.error('❌ Error seeding categories:', error);
		process.exit(1);
	}
}

seedCategories();
