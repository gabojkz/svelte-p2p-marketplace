import { createDb } from '../src/lib/server/db.js';
import { categories } from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/marketplace_db';

const productCategories = [
	{ name: 'Electronics & Tech', slug: 'electronics', type: 'product', icon: '📱', displayOrder: 1 },
	{ name: 'Home & Appliances', slug: 'home', type: 'product', icon: '🏠', displayOrder: 2 },
	{ name: 'Energy & Hardware', slug: 'hardware', type: 'product', icon: '🔧', displayOrder: 3 },
	{ name: 'Fashion & Accessories', slug: 'fashion', type: 'product', icon: '👕', displayOrder: 4 },
	{ name: 'Motors & Automotive', slug: 'motors', type: 'product', icon: '🚗', displayOrder: 5 },
	{ name: 'Health & Beauty', slug: 'health-beauty', type: 'product', icon: '💄', displayOrder: 6 },
	{ name: 'Collectibles & Art', slug: 'collectibles', type: 'product', icon: '🎨', displayOrder: 7 },
	{ name: 'Sports & Outdoors', slug: 'sports', type: 'product', icon: '⚽', displayOrder: 8 }
];

const serviceCategories = [
	{ name: 'Home Improvement', slug: 'home-improvement', type: 'service', icon: '🔨', displayOrder: 1 },
	{ name: 'Health & Wellness', slug: 'health-services', type: 'service', icon: '❤️', displayOrder: 2 },
	{ name: 'Professional & Digital', slug: 'professional', type: 'service', icon: '💼', displayOrder: 3 },
	{ name: 'Education & Training', slug: 'education', type: 'service', icon: '📚', displayOrder: 4 },
	{ name: 'Logistics & Transport', slug: 'logistics', type: 'service', icon: '🚚', displayOrder: 5 }
];

async function seedCategories() {
	const db = createDb(databaseUrl);

	try {
		console.log('🌱 Seeding categories...');

		// Insert product categories
		for (const category of productCategories) {
			const existing = await db
				.select()
				.from(categories)
				.where(eq(categories.slug, category.slug))
				.limit(1);

			if (existing.length === 0) {
				await db.insert(categories).values({
					name: category.name,
					slug: category.slug,
					type: category.type,
					icon: category.icon,
					displayOrder: category.displayOrder,
					isActive: true
				});
				console.log(`✅ Added: ${category.name}`);
			} else {
				console.log(`⏭️  Skipped (exists): ${category.name}`);
			}
		}

		// Insert service categories
		for (const category of serviceCategories) {
			const existing = await db
				.select()
				.from(categories)
				.where(eq(categories.slug, category.slug))
				.limit(1);

			if (existing.length === 0) {
				await db.insert(categories).values({
					name: category.name,
					slug: category.slug,
					type: category.type,
					icon: category.icon,
					displayOrder: category.displayOrder,
					isActive: true
				});
				console.log(`✅ Added: ${category.name}`);
			} else {
				console.log(`⏭️  Skipped (exists): ${category.name}`);
			}
		}

		// Show summary
		const allCategories = await db.select().from(categories);
		console.log(`\n📊 Total categories: ${allCategories.length}`);
		console.log(`   Products: ${allCategories.filter(c => c.type === 'product').length}`);
		console.log(`   Services: ${allCategories.filter(c => c.type === 'service').length}`);

		console.log('\n✨ Categories seeded successfully!');
		process.exit(0);
	} catch (error) {
		console.error('❌ Error seeding categories:', error);
		process.exit(1);
	}
}

seedCategories();


