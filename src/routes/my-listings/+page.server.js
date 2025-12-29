import { redirect } from '@sveltejs/kit';
import { users, listings, categories, trades } from '$lib/server/schema';
import { eq, and, or, like, sql, desc, asc } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url }) {
	if (!locals.session || !locals.user) {
		throw redirect(302, '/login');
	}

	const db = locals.db;
	if (!db) {
		return { error: 'Database not available' };
	}

	// Get marketplace user
	const marketplaceUser = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (marketplaceUser.length === 0) {
		throw redirect(302, '/dashboard?error=profile_required');
	}

	const userId = marketplaceUser[0].id;

	// Get query parameters
	const searchQuery = url.searchParams.get('search') || '';
	const statusFilter = url.searchParams.get('status') || 'all';
	const sortBy = url.searchParams.get('sort') || 'newest';
	const sortOrder = url.searchParams.get('order') || 'desc';

	// Build where conditions
	const conditions = [eq(listings.userId, userId)];

	// Status filter
	if (statusFilter !== 'all') {
		conditions.push(eq(listings.status, statusFilter));
	}

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

	// Build order by
	let orderBy;
	const sortColumn = sortBy === 'price' ? listings.price : 
	                  sortBy === 'title' ? listings.title :
	                  sortBy === 'status' ? listings.status :
	                  listings.createdAt;
	
	orderBy = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

	// Fetch listings
	const userListings = await db
		.select({
			id: listings.id,
			title: listings.title,
			description: listings.description,
			price: listings.price,
			type: listings.type,
			status: listings.status,
			featured: listings.featured,
			urgent: listings.urgent,
			viewCount: listings.viewCount,
			favoriteCount: listings.favoriteCount,
			categoryId: listings.categoryId,
			locationCity: listings.locationCity,
			locationPostcode: listings.locationPostcode,
			createdAt: listings.createdAt,
			updatedAt: listings.updatedAt,
			publishedAt: listings.publishedAt
		})
		.from(listings)
		.where(and(...conditions))
		.orderBy(orderBy);

	// Get category info and trade counts for each listing
	const listingsWithDetails = await Promise.all(
		userListings.map(async (listing) => {
			// Get category
			const [category] = await db
				.select()
				.from(categories)
				.where(eq(categories.id, listing.categoryId))
				.limit(1);

			// Get trade count for this listing
			const [tradeCount] = await db
				.select({ count: sql`count(*)::int` })
				.from(trades)
				.where(eq(trades.listingId, listing.id));

			return {
				...listing,
				category: category || null,
				tradeCount: tradeCount?.count || 0
			};
		})
	);

	// Get statistics
	const [activeCount] = await db
		.select({ count: sql`count(*)::int` })
		.from(listings)
		.where(and(
			eq(listings.userId, userId),
			eq(listings.status, 'active')
		));

	const [pausedCount] = await db
		.select({ count: sql`count(*)::int` })
		.from(listings)
		.where(and(
			eq(listings.userId, userId),
			eq(listings.status, 'paused')
		));

	const [draftCount] = await db
		.select({ count: sql`count(*)::int` })
		.from(listings)
		.where(and(
			eq(listings.userId, userId),
			eq(listings.status, 'draft')
		));

	const [soldCount] = await db
		.select({ count: sql`count(*)::int` })
		.from(listings)
		.where(and(
			eq(listings.userId, userId),
			eq(listings.status, 'sold')
		));

	// Get total trades count
	const [totalTradesResult] = await db
		.select({ count: sql`count(*)::int` })
		.from(trades)
		.where(or(
			eq(trades.sellerId, userId),
			eq(trades.buyerId, userId)
		));

	// Get all categories for the modal
	const allCategories = await db
		.select()
		.from(categories)
		.where(eq(categories.isActive, true))
		.orderBy(categories.displayOrder, categories.name);

	return {
		session: locals.session,
		user: locals.user,
		marketplaceUser: marketplaceUser[0],
		listings: listingsWithDetails,
		categories: allCategories,
		stats: {
			active: activeCount?.count || 0,
			paused: pausedCount?.count || 0,
			draft: draftCount?.count || 0,
			sold: soldCount?.count || 0,
			total: listingsWithDetails.length,
			totalTrades: totalTradesResult?.count || 0
		},
		filters: {
			searchQuery,
			statusFilter,
			sortBy,
			sortOrder
		}
	};
}

