import { createDb } from '../src/lib/server/db.js';
import { categories } from '../src/lib/server/schema.js';
import { eq } from 'drizzle-orm';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/marketplace_db';

// Spanish translations mapping by slug
const spanishNames = {
	// Products
	'electronics': 'Electrónica',
	'fashion-clothing': 'Moda y Ropa',
	'home-garden': 'Hogar y Jardín',
	'vehicles': 'Vehículos',
	'sports-hobbies': 'Deportes y Pasatiempos',
	'books-media': 'Libros y Medios',
	'health-beauty': 'Salud y Belleza',
	'other-products': 'Otros Productos',
	
	// Services
	'home-services': 'Servicios del Hogar',
	'vehicle-services': 'Servicios de Vehículos',
	'professional-services': 'Servicios Profesionales',
	'education-tutoring': 'Educación y Tutorías',
	'health-wellness': 'Salud y Bienestar',
	'tech-services': 'Servicios Tecnológicos',
	'other-services': 'Otros Servicios'
};

// Simplified essential categories - no subcategories, just top-level categories
const categoryData = [
	// ============================================
	// PRODUCTS
	// ============================================
	{ name: 'Electronics', slug: 'electronics', type: 'product', icon: '📱', parentId: null, displayOrder: 1 },
	{ name: 'Fashion & Clothing', slug: 'fashion-clothing', type: 'product', icon: '👗', parentId: null, displayOrder: 2 },
	{ name: 'Home & Garden', slug: 'home-garden', type: 'product', icon: '🏠', parentId: null, displayOrder: 3 },
	{ name: 'Vehicles', slug: 'vehicles', type: 'product', icon: '🚗', parentId: null, displayOrder: 4 },
	{ name: 'Sports & Hobbies', slug: 'sports-hobbies', type: 'product', icon: '⚽', parentId: null, displayOrder: 5 },
	{ name: 'Books & Media', slug: 'books-media', type: 'product', icon: '📚', parentId: null, displayOrder: 6 },
	{ name: 'Health & Beauty', slug: 'health-beauty', type: 'product', icon: '💄', parentId: null, displayOrder: 7 },
	{ name: 'Other Products', slug: 'other-products', type: 'product', icon: '📦', parentId: null, displayOrder: 8 },
	
	// ============================================
	// SERVICES
	// ============================================
	{ name: 'Home Services', slug: 'home-services', type: 'service', icon: '🏠', parentId: null, displayOrder: 1 },
	{ name: 'Vehicle Services', slug: 'vehicle-services', type: 'service', icon: '🚗', parentId: null, displayOrder: 2 },
	{ name: 'Professional Services', slug: 'professional-services', type: 'service', icon: '💼', parentId: null, displayOrder: 3 },
	{ name: 'Education & Tutoring', slug: 'education-tutoring', type: 'service', icon: '🎓', parentId: null, displayOrder: 4 },
	{ name: 'Health & Wellness', slug: 'health-wellness', type: 'service', icon: '❤️', parentId: null, displayOrder: 5 },
	{ name: 'Tech Services', slug: 'tech-services', type: 'service', icon: '💻', parentId: null, displayOrder: 6 },
	{ name: 'Other Services', slug: 'other-services', type: 'service', icon: '🔧', parentId: null, displayOrder: 7 }
];

async function seedCategories() {
	const db = createDb(databaseUrl);

	try {
		console.log('🌱 Seeding simplified categories...\n');

		// Option to clear existing categories first (uncomment if needed)
		// console.log('🗑️  Clearing existing categories...');
		// await db.delete(categories);
		// console.log('✅ Cleared existing categories\n');

		// Insert or update categories
		for (const category of categoryData) {
			const existing = await db
				.select()
				.from(categories)
				.where(eq(categories.slug, category.slug))
				.limit(1);

			const nameEs = spanishNames[category.slug] || null;

			if (existing.length === 0) {
				await db
					.insert(categories)
					.values({
						name: category.name,
						nameEs: nameEs,
						slug: category.slug,
						type: category.type,
						icon: category.icon,
						parentId: category.parentId,
						displayOrder: category.displayOrder,
						isActive: true
					});
				console.log(`✅ Added: ${category.name}`);
			} else {
				await db
					.update(categories)
					.set({
						name: category.name,
						nameEs: nameEs,
						type: category.type,
						icon: category.icon,
						parentId: category.parentId,
						displayOrder: category.displayOrder,
						isActive: true
					})
					.where(eq(categories.id, existing[0].id));
				console.log(`🔄 Updated: ${category.name}`);
			}
		}

		// Deactivate old categories that are not in the new list
		const allCategories = await db.select().from(categories);
		const newSlugs = new Set(categoryData.map(c => c.slug));
		
		for (const cat of allCategories) {
			if (!newSlugs.has(cat.slug)) {
				await db
					.update(categories)
					.set({ isActive: false })
					.where(eq(categories.id, cat.id));
				console.log(`⏸️  Deactivated: ${cat.name}`);
			}
		}

		// Show summary
		const activeCategories = await db
			.select()
			.from(categories)
			.where(eq(categories.isActive, true));
		
		const products = activeCategories.filter(c => c.type === 'product');
		const services = activeCategories.filter(c => c.type === 'service');

		console.log(`\n📊 Summary:`);
		console.log(`   Total active categories: ${activeCategories.length}`);
		console.log(`   Products: ${products.length}`);
		console.log(`   Services: ${services.length}`);

		console.log('\n✨ Categories seeded successfully!');
		process.exit(0);
	} catch (error) {
		console.error('❌ Error seeding categories:', error);
		process.exit(1);
	}
}

seedCategories();
