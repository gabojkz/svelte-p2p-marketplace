import { error } from '@sveltejs/kit';
import { listings, users, user, categories, reviews, trades, favorites, listingImages, userSettings } from '$lib/server/schema';
import { eq, and, or, ne, sql, desc } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals, url }) {
	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	// Get listing ID from path parameter
	const listingId = Number(params.id);

	if (!listingId || isNaN(listingId)) {
		throw error(400, 'Invalid listing ID');
	}

	// Get listing with category and seller info (including auth user for emailVerified)
	const [listing] = await db
		.select({
			listing: listings,
			category: categories,
			seller: users,
			authUser: user
		})
		.from(listings)
		.leftJoin(categories, eq(listings.categoryId, categories.id))
		.leftJoin(users, eq(listings.userId, users.id))
		.leftJoin(user, eq(users.authUserId, user.id))
		.where(eq(listings.id, listingId))
		.limit(1);

	if (!listing || !listing.listing) {
		throw error(404, 'Listing not found');
	}

	// Check if listing is active (or if user is the owner)
	let canView = listing.listing.status === 'active';
	
	if (locals.session && locals.user) {
		const [marketplaceUser] = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, locals.user.id))
			.limit(1);

		if (marketplaceUser && marketplaceUser.id === listing.listing.userId) {
			canView = true; // Owner can always view their own listing
		}
	}

	if (!canView) {
		throw error(404, 'Listing not found or not available');
	}

	// Increment view count
	await db
		.update(listings)
		.set({ viewCount: sql`${listings.viewCount} + 1` })
		.where(eq(listings.id, listingId));

	// Get seller stats
	const sellerId = listing.listing.userId;
	
	// Get seller's total listings count
	const [sellerListingsCount] = await db
		.select({ count: sql`count(*)::int` })
		.from(listings)
		.where(and(
			eq(listings.userId, sellerId),
			eq(listings.status, 'active')
		));

	// Get seller's reviews and rating
	const [sellerReviews] = await db
		.select({
			avgRating: sql`COALESCE(AVG(${reviews.rating})::numeric, 0)`,
			count: sql`count(*)::int`
		})
		.from(reviews)
		.where(eq(reviews.revieweeId, sellerId));

	// Get seller's completed trades
	const [sellerTradesCount] = await db
		.select({ count: sql`count(*)::int` })
		.from(trades)
		.where(and(
			or(eq(trades.sellerId, sellerId), eq(trades.buyerId, sellerId)),
			eq(trades.status, 'completed')
		));

	// Get similar listings (same category, different listing, active only)
	const similarListings = await db
		.select({
			id: listings.id,
			title: listings.title,
			price: listings.price,
			locationCity: listings.locationCity,
			locationPostcode: listings.locationPostcode,
			featured: listings.featured,
			urgent: listings.urgent,
			viewCount: listings.viewCount,
			createdAt: listings.createdAt,
			category: categories
		})
		.from(listings)
		.leftJoin(categories, eq(listings.categoryId, categories.id))
		.where(and(
			eq(listings.categoryId, listing.listing.categoryId),
			ne(listings.id, listingId),
			eq(listings.status, 'active')
		))
		.orderBy(desc(listings.createdAt))
		.limit(4);

	// Get marketplace user if logged in
	let marketplaceUser = null;
	let isFavorite = false;
	if (locals.session && locals.user) {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, locals.user.id))
			.limit(1);

		marketplaceUser = user || null;

		// Check if listing is in user's favorites
		if (marketplaceUser) {
			const [favorite] = await db
				.select()
				.from(favorites)
				.where(and(
					eq(favorites.userId, marketplaceUser.id),
					eq(favorites.listingId, listingId)
				))
				.limit(1);

			isFavorite = !!favorite;
		}
	}

	// Get subcategory if exists
	let subcategory = null;
	if (listing.listing.subcategoryId) {
		const [sub] = await db
			.select()
			.from(categories)
			.where(eq(categories.id, listing.listing.subcategoryId))
			.limit(1);
		subcategory = sub || null;
	}

	// Get listing images
	const listingImagesData = await db
		.select()
		.from(listingImages)
		.where(eq(listingImages.listingId, listingId))
		.orderBy(listingImages.displayOrder);

	// Get seller's contact information (only if user is logged in)
	let sellerContactInfo = null;
	if (locals.session && locals.user && listing.seller) {
		const [sellerSettings] = await db
			.select()
			.from(userSettings)
			.where(eq(userSettings.userId, listing.seller.id))
			.limit(1);

		if (sellerSettings) {
			sellerContactInfo = {
				phone: sellerSettings.showPhone ? listing.seller.phone : null,
				whatsapp: sellerSettings.whatsapp || null,
				telegram: sellerSettings.telegram || null
			};
		}
	}

	return {
		listing: {
			...listing.listing,
			category: listing.category,
			subcategory: subcategory,
			images: listingImagesData,
			seller: listing.seller ? {
				...listing.seller,
				emailVerified: listing.authUser?.emailVerified || false,
				stats: {
					listingsCount: sellerListingsCount?.count || 0,
					avgRating: Number(sellerReviews?.avgRating) || 0,
					reviewsCount: sellerReviews?.count || 0,
					completedTrades: sellerTradesCount?.count || 0
				}
			} : null
		},
		sellerContactInfo,
		similarListings,
		marketplaceUser,
		isFavorite,
		session: locals.session,
		user: locals.user
	};
}

