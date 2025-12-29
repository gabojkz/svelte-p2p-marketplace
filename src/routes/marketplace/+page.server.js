import { categories, listings, users } from '$lib/server/schema.js';
import { eq, and, or, like, sql, desc, asc } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url }) {
	const db = locals.db;

	if (!db) {
		throw new Error('Database connection not found');
	}

	// Get marketplace user if logged in
	let marketplaceUser = null;
	if (locals.session && locals.user) {
		const [userProfile] = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, locals.user.id))
			.limit(1);
		marketplaceUser = userProfile || null;
	}

	try {
		// Get query parameters
		const searchQuery = url.searchParams.get('q') || '';
		const categorySlug = url.searchParams.get('category') || '';
		const location = url.searchParams.get('location') || '';
		const sortBy = url.searchParams.get('sort') || 'newest';
		const page = parseInt(url.searchParams.get('page') || '1', 10);
		const limit = 20;
		const offset = (page - 1) * limit;

		// Build where conditions
		const conditions = [eq(listings.status, 'active')];

		// Search query
		if (searchQuery) {
			const searchCondition = or(
				like(listings.title, `%${searchQuery}%`),
				like(listings.description, `%${searchQuery}%`)
			);
			if (searchCondition) {
				conditions.push(searchCondition);
			}
		}

		// Category filter
		let categoryId = null;
		if (categorySlug) {
			const [category] = await db
				.select()
				.from(categories)
				.where(eq(categories.slug, categorySlug))
				.limit(1);
			
			if (category) {
				categoryId = category.id;
				conditions.push(eq(listings.categoryId, categoryId));
			}
		}

		// Location filter (if needed)
		if (location) {
			conditions.push(like(listings.locationCity, `%${location}%`));
		}

		// Build order by
		let orderBy;
		switch (sortBy) {
			case 'price-low':
				orderBy = asc(listings.price);
				break;
			case 'price-high':
				orderBy = desc(listings.price);
				break;
			case 'oldest':
				orderBy = asc(listings.createdAt);
				break;
			case 'newest':
			default:
				orderBy = desc(listings.createdAt);
				break;
		}

		// Fetch listings
		const listingsData = await db
			.select({
				id: listings.id,
				title: listings.title,
				description: listings.description,
				price: listings.price,
				locationCity: listings.locationCity,
				locationPostcode: listings.locationPostcode,
				categoryId: listings.categoryId,
				userId: listings.userId,
				featured: listings.featured,
				urgent: listings.urgent,
				viewCount: listings.viewCount,
				createdAt: listings.createdAt
			})
			.from(listings)
			.where(and(...conditions))
			.orderBy(orderBy)
			.limit(limit)
			.offset(offset);

		// Get category info for each listing
		const listingsWithCategories = await Promise.all(
			listingsData.map(async (listing) => {
				const [category] = await db
					.select()
					.from(categories)
					.where(eq(categories.id, listing.categoryId))
					.limit(1);

				return {
					...listing,
					category: category || null
				};
			})
		);

		// Get total count
		const [countResult] = await db
			.select({ count: sql`count(*)::int` })
			.from(listings)
			.where(and(...conditions));

		const totalCount = Number(countResult?.count) || 0;

		// Fetch all active categories for filters
		const allCategories = await db
			.select()
			.from(categories)
			.where(eq(categories.isActive, true))
			.orderBy(categories.displayOrder, categories.name);

		console.log(allCategories)

		return {
			listings: listingsWithCategories,
			categories: allCategories,
			totalCount,
			currentPage: page,
			totalPages: Math.ceil(totalCount / limit),
			marketplaceUser,
			filters: {
				searchQuery,
				categorySlug,
				location,
				sortBy
			}
		};
	} catch (error) {
		console.error('Error loading marketplace data:', error);
		return {
			listings: [],
			categories: [],
			totalCount: 0,
			currentPage: 1,
			totalPages: 0,
			filters: {
				searchQuery: '',
				categorySlug: '',
				location: '',
				sortBy: 'newest'
			}
		};
	}
}

