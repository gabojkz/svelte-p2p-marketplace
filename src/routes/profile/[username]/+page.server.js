import { error } from '@sveltejs/kit';
import { users, user, userSettings, listings, trades, reviews } from '$lib/server/schema';
import { eq, and, desc, sql, or } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals, url }) {
	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const username = params.username;

	// Get user by username with auth user data
	const [profileData] = await db
		.select({
			marketplaceUser: users,
			authUser: user
		})
		.from(users)
		.leftJoin(user, eq(users.authUserId, user.id))
		.where(eq(users.username, username))
		.limit(1);

	if (!profileData || !profileData.marketplaceUser) {
		throw error(404, 'User not found');
	}

	const profileUser = profileData.marketplaceUser;
	const authUser = profileData.authUser;

	// Get user settings to check privacy preferences
	const [settings] = await db
		.select()
		.from(userSettings)
		.where(eq(userSettings.userId, profileUser.id))
		.limit(1);

	// Get user's active listings count
	const [listingsCount] = await db
		.select({ count: sql`count(*)::int` })
		.from(listings)
		.where(and(
			eq(listings.userId, profileUser.id),
			eq(listings.status, 'active')
		));

	// Get recent listings (limit 6)
	const recentListings = await db
		.select({
			id: listings.id,
			title: listings.title,
			price: listings.price,
			locationCity: listings.locationCity,
			locationPostcode: listings.locationPostcode,
			featured: listings.featured,
			createdAt: listings.createdAt
		})
		.from(listings)
		.where(and(
			eq(listings.userId, profileUser.id),
			eq(listings.status, 'active')
		))
		.orderBy(desc(listings.createdAt))
		.limit(6);

	// Get trade statistics
	const [totalTradesResult] = await db
		.select({ count: sql`count(*)::int` })
		.from(trades)
		.where(or(
			eq(trades.sellerId, profileUser.id),
			eq(trades.buyerId, profileUser.id)
		));

	const [completedTradesResult] = await db
		.select({ count: sql`count(*)::int` })
		.from(trades)
		.where(and(
			or(
				eq(trades.sellerId, profileUser.id),
				eq(trades.buyerId, profileUser.id)
			),
			eq(trades.status, 'completed')
		));

	// Get reviews/ratings for reputation
	const userReviews = await db
		.select({
			rating: reviews.rating,
			comment: reviews.comment
		})
		.from(reviews)
		.where(eq(reviews.revieweeId, profileUser.id));

	// Calculate average rating
	const averageRating = userReviews.length > 0
		? userReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / userReviews.length
		: 0;

	// Get last login time (from users table)
	const lastLoginAt = profileUser.lastLoginAt;

	// Check if current user is viewing their own profile
	let isOwnProfile = false;
	if (locals.session && locals.user) {
		const [currentMarketplaceUser] = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, locals.user.id))
			.limit(1);
		
		if (currentMarketplaceUser && currentMarketplaceUser.id === profileUser.id) {
			isOwnProfile = true;
		}
	}

	// Build public profile data respecting privacy settings
	const publicProfile = {
		id: profileUser.id,
		username: profileUser.username,
		firstName: profileUser.firstName,
		lastName: profileUser.lastName,
		bio: profileUser.bio,
		avatarUrl: profileUser.avatarUrl,
		locationCity: profileUser.locationCity,
		locationPostcode: profileUser.locationPostcode,
		createdAt: profileUser.createdAt,
		emailVerified: authUser?.emailVerified || false,
		lastLoginAt: lastLoginAt,
		// Only include email/phone if privacy settings allow or it's own profile
		email: (settings?.showEmail || isOwnProfile) ? (authUser?.email || null) : null,
		phone: (settings?.showPhone || isOwnProfile) ? profileUser.phone : null,
		phoneVerified: (settings?.showPhone || isOwnProfile) ? profileUser.phoneVerified : null
	};

	return {
		profileUser: publicProfile,
		settings: settings || null,
		listingsCount: listingsCount?.count || 0,
		recentListings,
		totalTrades: totalTradesResult?.count || 0,
		completedTrades: completedTradesResult?.count || 0,
		averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
		totalReviews: userReviews.length,
		isOwnProfile,
		currentUser: locals.user || null
	};
}

