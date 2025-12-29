import { createDb } from '../src/lib/server/db.js';
import { categories, listings, users } from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/marketplace_db';

// Sample listings data
const sampleListings = [
	// Electronics
	{
		title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
		description: 'Like new iPhone 15 Pro Max in perfect condition. Unlocked, comes with original box and charger. No scratches or damage.',
		categorySlug: 'electronics',
		type: 'product',
		price: 899,
		condition: 'like-new',
		brand: 'Apple',
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 1AA',
		featured: true,
		acceptsOffers: true
	},
	{
		title: 'MacBook Pro 14" M3 Pro - 512GB',
		description: 'Excellent condition MacBook Pro M3 Pro. 18GB RAM, 512GB SSD. Perfect for professionals. Original charger included.',
		categorySlug: 'electronics',
		type: 'product',
		price: 1650,
		condition: 'excellent',
		brand: 'Apple',
		locationCity: 'Gateshead',
		locationPostcode: 'NE8 1AB',
		featured: true
	},
	{
		title: 'Samsung Galaxy S24 Ultra 512GB',
		description: 'Brand new, sealed in box. Unlocked for all networks. Latest flagship with amazing camera.',
		categorySlug: 'electronics',
		type: 'product',
		price: 950,
		condition: 'new',
		brand: 'Samsung',
		locationCity: 'Sunderland',
		locationPostcode: 'SR1 1AA',
		acceptsOffers: true
	},
	// Motors
	{
		title: '2019 BMW 3 Series 320i M Sport',
		description: 'Well maintained BMW 3 Series with full service history. 45,000 miles. Automatic transmission, petrol engine. Excellent condition.',
		categorySlug: 'motors',
		type: 'product',
		price: 18500,
		condition: 'good',
		brand: 'BMW',
		locationCity: 'Newcastle',
		locationPostcode: 'NE2 1AA',
		featured: true,
		urgent: false
	},
	{
		title: '2021 Yamaha MT-07 ABS - Low Mileage',
		description: 'Fantastic motorcycle with only 3,200 miles. 689cc engine, perfect for commuting. Recent service completed.',
		categorySlug: 'motors',
		type: 'product',
		price: 5995,
		condition: 'like-new',
		brand: 'Yamaha',
		locationCity: 'Hexham',
		locationPostcode: 'NE46 1AA',
		acceptsOffers: true
	},
	// Fashion
	{
		title: 'Nike Air Jordan 1 Retro High OG - Size 10',
		description: 'New with box. Never worn. UK size 10 / EU 45. Limited edition colorway.',
		categorySlug: 'fashion',
		type: 'product',
		price: 180,
		condition: 'new',
		brand: 'Nike',
		locationCity: 'Sunderland',
		locationPostcode: 'SR2 1AA'
	},
	{
		title: 'Vintage Leather Jacket - Genuine Leather',
		description: 'Authentic vintage leather jacket in excellent condition. Size M. Classic style that never goes out of fashion.',
		categorySlug: 'fashion',
		type: 'product',
		price: 120,
		condition: 'good',
		brand: 'Unknown',
		locationCity: 'Durham',
		locationPostcode: 'DH1 1AA',
		acceptsOffers: true
	},
	// Home & Appliances
	{
		title: 'IKEA Kivik 3-Seater Corner Sofa - Grey',
		description: 'Good condition corner sofa. Some wear but structurally sound. Collection only due to size.',
		categorySlug: 'home',
		type: 'product',
		price: 350,
		condition: 'good',
		brand: 'IKEA',
		locationCity: 'Durham',
		locationPostcode: 'DH2 1AA',
		urgent: true,
		deliveryCollection: true,
		deliveryLocal: false
	},
	{
		title: 'Dyson V15 Detect Cordless Vacuum',
		description: 'Like new Dyson V15 with all attachments. Powerful suction, laser detection. Original box and charger included.',
		categorySlug: 'home',
		type: 'product',
		price: 450,
		condition: 'like-new',
		brand: 'Dyson',
		locationCity: 'Newcastle',
		locationPostcode: 'NE3 1AA',
		featured: true
	},
	// Sports
	{
		title: 'Specialized Roubaix Carbon Road Bike',
		description: 'High-end carbon road bike. 56cm frame, Shimano 105 groupset. Well maintained, ready to ride.',
		categorySlug: 'sports',
		type: 'product',
		price: 1850,
		condition: 'good',
		brand: 'Specialized',
		locationCity: 'Tynemouth',
		locationPostcode: 'NE30 1AA',
		acceptsOffers: true
	},
	{
		title: 'Adjustable Dumbbell Set 5-50kg',
		description: 'Space-saving adjustable dumbbells. Perfect for home gym. Like new condition with stand included.',
		categorySlug: 'sports',
		type: 'product',
		price: 280,
		condition: 'like-new',
		brand: 'Bowflex',
		locationCity: 'Jesmond',
		locationPostcode: 'NE2 1AA'
	},
	// Health & Beauty
	{
		title: 'Professional Makeup Brush Set - 24 Pieces',
		description: 'High-quality synthetic makeup brush set. Brand new, never used. Perfect for makeup artists or enthusiasts.',
		categorySlug: 'health-beauty',
		type: 'product',
		price: 45,
		condition: 'new',
		brand: 'Morphe',
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 2AA'
	},
	// Services
	{
		title: 'Professional Web Development Services',
		description: 'Experienced web developer offering custom website development. React, SvelteKit, Node.js. Portfolio available upon request.',
		categorySlug: 'professional',
		type: 'service',
		price: 500,
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 1AA',
		priceType: 'negotiable',
		acceptsOffers: true
	},
	{
		title: 'Home Electrical Repairs & Installation',
		description: 'Qualified electrician available for home repairs, installations, and rewiring. Fully insured and certified. Emergency callouts available.',
		categorySlug: 'home-improvement',
		type: 'service',
		price: 80,
		locationCity: 'Gateshead',
		locationPostcode: 'NE8 1AA',
		priceType: 'negotiable',
		featured: true
	},
	{
		title: 'Private Piano Lessons - All Levels',
		description: 'Experienced piano teacher offering private lessons for all ages and skill levels. Flexible scheduling. Home visits available.',
		categorySlug: 'education',
		type: 'service',
		price: 35,
		locationCity: 'Newcastle',
		locationPostcode: 'NE2 1AA',
		priceType: 'fixed',
		acceptsOffers: false
	},
	{
		title: 'Local Delivery & Courier Service',
		description: 'Reliable local delivery service. Same-day delivery available. Competitive rates for businesses and individuals.',
		categorySlug: 'logistics',
		type: 'service',
		price: 25,
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 1AA',
		priceType: 'negotiable'
	},
	// More Electronics
	{
		title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
		description: 'Premium noise cancelling headphones. Excellent sound quality. Like new, used only a few times.',
		categorySlug: 'electronics',
		type: 'product',
		price: 280,
		condition: 'like-new',
		brand: 'Sony',
		locationCity: 'Jesmond',
		locationPostcode: 'NE2 2AA',
		featured: true
	},
	{
		title: 'Gaming PC - RTX 4070, Ryzen 7 5800X',
		description: 'High-performance gaming PC. RTX 4070 GPU, Ryzen 7 5800X CPU, 32GB RAM, 1TB NVMe SSD. Runs all modern games at high settings.',
		categorySlug: 'electronics',
		type: 'product',
		price: 1200,
		condition: 'good',
		brand: 'Custom Build',
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 3AA',
		acceptsOffers: true
	},
	// More Motors
	{
		title: '2018 VW Golf GTI - Low Mileage',
		description: 'Well maintained Golf GTI with only 28,000 miles. Full service history. One owner. Excellent condition throughout.',
		categorySlug: 'motors',
		type: 'product',
		price: 16500,
		condition: 'excellent',
		brand: 'Volkswagen',
		locationCity: 'Newcastle',
		locationPostcode: 'NE4 1AA',
		featured: true
	},
	// More Home
	{
		title: 'Nespresso Vertuo Coffee Machine',
		description: 'Like new Nespresso Vertuo machine with milk frother. Includes 20 assorted pods. Perfect condition.',
		categorySlug: 'home',
		type: 'product',
		price: 150,
		condition: 'like-new',
		brand: 'Nespresso',
		locationCity: 'Gateshead',
		locationPostcode: 'NE8 2AA'
	},
	{
		title: 'King Size Memory Foam Mattress',
		description: 'Comfortable memory foam mattress. Medium firmness. Good condition, no stains. Collection only.',
		categorySlug: 'home',
		type: 'product',
		price: 200,
		condition: 'good',
		brand: 'Silentnight',
		locationCity: 'Durham',
		locationPostcode: 'DH1 2AA',
		deliveryCollection: true
	},
	// More Fashion
	{
		title: 'Designer Handbag - Authentic Gucci',
		description: 'Authentic Gucci handbag in excellent condition. Comes with dust bag and authenticity card. Rare find!',
		categorySlug: 'fashion',
		type: 'product',
		price: 850,
		condition: 'excellent',
		brand: 'Gucci',
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 4AA',
		featured: true,
		acceptsOffers: true
	},
	{
		title: 'Vintage Rolex Watch - 1980s',
		description: 'Authentic vintage Rolex watch from the 1980s. Recently serviced. Excellent working condition. Investment piece.',
		categorySlug: 'fashion',
		type: 'product',
		price: 3500,
		condition: 'excellent',
		brand: 'Rolex',
		locationCity: 'Newcastle',
		locationPostcode: 'NE1 5AA',
		acceptsOffers: true
	}
];

async function seedListings() {
	const db = createDb(databaseUrl);

	try {
		console.log('🌱 Seeding listings...');

		// Get all available users
		const allUsers = await db.select().from(users).where(eq(users.isActive, true));

		if (allUsers.length === 0) {
			console.log('❌ No active users found. Please run: npm run db:seed:users');
			console.log('   Or register a user first via /register');
			process.exit(1);
		}

		console.log(`📝 Found ${allUsers.length} active users. Distributing listings across them...`);

		// Get all categories
		const allCategories = await db.select().from(categories);
		const categoryMap = new Map(allCategories.map(cat => [cat.slug, cat]));

		let created = 0;
		let skipped = 0;

		// Create listings, distributing across users
		for (let i = 0; i < sampleListings.length; i++) {
			const listingData = sampleListings[i];
			// Distribute listings across users in a round-robin fashion
			const assignedUser = allUsers[i % allUsers.length];
			const userId = assignedUser.id;

			const category = categoryMap.get(listingData.categorySlug);
			
			if (!category) {
				console.log(`⏭️  Skipped: Category "${listingData.categorySlug}" not found`);
				skipped++;
				continue;
			}

			// Check if listing already exists (by title)
			const existing = await db
				.select()
				.from(listings)
				.where(eq(listings.title, listingData.title))
				.limit(1);

			if (existing.length > 0) {
				console.log(`⏭️  Skipped (exists): ${listingData.title}`);
				skipped++;
				continue;
			}

			// Map condition values (schema enum: 'new', 'like-new', 'good', 'fair', 'parts')
			const conditionMap = {
				'new': 'new',
				'like-new': 'like-new',
				'excellent': 'like-new',
				'good': 'good',
				'fair': 'fair'
			};

			const publishedAt = new Date();
			publishedAt.setHours(publishedAt.getHours() - Math.floor(Math.random() * 48)); // Random time in last 48 hours

			await db.insert(listings).values({
				userId: userId,
				categoryId: category.id,
				type: listingData.type,
				title: listingData.title,
				description: listingData.description,
				condition: listingData.condition ? conditionMap[listingData.condition] || 'good' : null,
				brand: listingData.brand || null,
				price: listingData.price.toString(),
				priceType: listingData.priceType || 'fixed',
				acceptsOffers: listingData.acceptsOffers || false,
				locationCity: listingData.locationCity,
				locationPostcode: listingData.locationPostcode,
				locationLatitude: (54.9783 + (Math.random() - 0.5) * 0.1).toString(), // Newcastle area
				locationLongitude: (-1.6178 + (Math.random() - 0.5) * 0.1).toString(),
				deliveryCollection: listingData.deliveryCollection !== undefined ? listingData.deliveryCollection : true,
				deliveryLocal: listingData.deliveryLocal || false,
				deliveryShipping: listingData.deliveryShipping || false,
				status: 'active',
				featured: listingData.featured || false,
				urgent: listingData.urgent || false,
				viewCount: Math.floor(Math.random() * 500),
				favoriteCount: Math.floor(Math.random() * 20),
				publishedAt: publishedAt
			});

			console.log(`✅ Created: ${listingData.title} (by ${assignedUser.username})`);
			created++;
		}

		// Show summary
		const totalListings = await db.select().from(listings);
		console.log(`\n📊 Summary:`);
		console.log(`   Created: ${created}`);
		console.log(`   Skipped: ${skipped}`);
		console.log(`   Total listings: ${totalListings.length}`);
		console.log(`   Active listings: ${totalListings.filter(l => l.status === 'active').length}`);

		console.log('\n✨ Listings seeded successfully!');
		process.exit(0);
	} catch (error) {
		console.error('❌ Error seeding listings:', error);
		process.exit(1);
	}
}

seedListings();

