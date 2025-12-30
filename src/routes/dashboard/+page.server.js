import { redirect } from '@sveltejs/kit';
import { users, user, listings, trades, reviews, userSettings } from '$lib/server/schema';
import { eq, and, or, desc, sql, inArray } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if (!locals.session || !locals.user) {
		throw redirect(302, '/login');
	}

	const db = locals.db;
	if (!db) {
		throw new Error('Database not available');
	}

	// Get marketplace user
	const [marketplaceUser] = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	// If no marketplace user exists, create one automatically
	if (!marketplaceUser) {
		// Generate a username from email or name
		const username = locals.user.name
			?.toLowerCase()
			.replace(/\s+/g, '')
			.replace(/[^a-z0-9]/g, '') || 
			locals.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

		// Check if username is unique, if not append random string
		let finalUsername = username;
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.username, finalUsername))
			.limit(1);

		if (existingUser.length > 0) {
			finalUsername = `${username}${Math.floor(Math.random() * 10000)}`;
		}

		// Split name into first and last
		const nameParts = locals.user.name?.split(' ') || [];
		const firstName = nameParts[0] || '';
		const lastName = nameParts.slice(1).join(' ') || '';

		// Create marketplace user profile
		const [newMarketplaceUser] = await db
			.insert(users)
			.values({
				authUserId: locals.user.id,
				username: finalUsername,
				firstName: firstName,
				lastName: lastName,
				isActive: true
			})
			.returning();

		return {
			session: locals.session,
			user: locals.user,
			marketplaceUser: newMarketplaceUser,
			accountStatus: {
				emailVerified: locals.user.emailVerified || false,
				phoneVerified: false,
				kycStatus: 'pending',
				twoFactorEnabled: false
			},
			listings: {
				active: 0,
				paused: 0,
				draft: 0,
				sold: 0,
				total: 0,
				recent: []
			},
			trades: {
				active: [],
				completed: [],
				totalCompleted: 0
			},
			stats: {
				totalListings: 0,
				activeListings: 0,
				completedTrades: 0,
				averageRating: 0,
				totalReviews: 0
			}
		};
	}

	const userId = marketplaceUser.id;

	// Get account status
	const [settings] = await db
		.select()
		.from(userSettings)
		.where(eq(userSettings.userId, userId))
		.limit(1);

	const accountStatus = {
		emailVerified: locals.user.emailVerified || false,
		phoneVerified: marketplaceUser.phoneVerified || false,
		kycStatus: marketplaceUser.kycStatus || 'pending',
		twoFactorEnabled: marketplaceUser.twoFactorEnabled || false
	};

	// Get listings statistics
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

	// Get recent listings (last 5)
	const recentListings = await db
		.select({
			id: listings.id,
			title: listings.title,
			price: listings.price,
			status: listings.status,
			viewCount: listings.viewCount,
			favoriteCount: listings.favoriteCount,
			createdAt: listings.createdAt
		})
		.from(listings)
		.where(eq(listings.userId, userId))
		.orderBy(desc(listings.createdAt))
		.limit(5);

	// Get active trades (not completed or cancelled)
	const activeTrades = await db
		.select({
			id: trades.id,
			tradeNumber: trades.tradeNumber,
			listingId: trades.listingId,
			sellerId: trades.sellerId,
			buyerId: trades.buyerId,
			amount: trades.amount,
			status: trades.status,
			createdAt: trades.createdAt
		})
		.from(trades)
		.where(and(
			or(
				eq(trades.sellerId, userId),
				eq(trades.buyerId, userId)
			),
			sql`${trades.status} NOT IN ('completed', 'cancelled')`
		))
		.orderBy(desc(trades.createdAt))
		.limit(5);

	// Get completed trades
	const [completedTradesCount] = await db
		.select({ count: sql`count(*)::int` })
		.from(trades)
		.where(and(
			or(
				eq(trades.sellerId, userId),
				eq(trades.buyerId, userId)
			),
			eq(trades.status, 'completed')
		));

	const completedTrades = await db
		.select({
			id: trades.id,
			tradeNumber: trades.tradeNumber,
			listingId: trades.listingId,
			sellerId: trades.sellerId,
			buyerId: trades.buyerId,
			amount: trades.amount,
			status: trades.status,
			completedAt: trades.completedAt,
			createdAt: trades.createdAt
		})
		.from(trades)
		.where(and(
			or(
				eq(trades.sellerId, userId),
				eq(trades.buyerId, userId)
			),
			eq(trades.status, 'completed')
		))
		.orderBy(desc(trades.completedAt))
		.limit(5);

	// Get listing titles for trades
	const listingIds = [...new Set([
		...activeTrades.map(t => t.listingId),
		...completedTrades.map(t => t.listingId)
	])];

	const listingTitles = new Map();
	if (listingIds.length > 0) {
		const listingsData = await db
			.select({
				id: listings.id,
				title: listings.title
			})
			.from(listings)
			.where(inArray(listings.id, listingIds));

		listingsData.forEach(listing => {
			listingTitles.set(listing.id, listing.title);
		});
	}

	// Get other user info for trades
	const userIds = new Set();
	activeTrades.forEach(t => {
		if (t.sellerId !== userId) userIds.add(t.sellerId);
		if (t.buyerId !== userId) userIds.add(t.buyerId);
	});
	completedTrades.forEach(t => {
		if (t.sellerId !== userId) userIds.add(t.sellerId);
		if (t.buyerId !== userId) userIds.add(t.buyerId);
	});

	const otherUsers = new Map();
	if (userIds.size > 0) {
		const userIdsArray = Array.from(userIds);
		const usersData = await db
			.select({
				id: users.id,
				username: users.username,
				firstName: users.firstName,
				lastName: users.lastName
			})
			.from(users)
			.where(inArray(users.id, userIdsArray));

		usersData.forEach(u => {
			otherUsers.set(u.id, u);
		});
	}

	// Get review statistics
	const [reviewStats] = await db
		.select({
			avgRating: sql`COALESCE(AVG(${reviews.rating})::numeric, 0)`,
			count: sql`count(*)::int`
		})
		.from(reviews)
		.where(eq(reviews.revieweeId, userId));

	return {
		session: locals.session,
		user: locals.user,
		marketplaceUser,
		accountStatus,
		listings: {
			active: activeCount?.count || 0,
			paused: pausedCount?.count || 0,
			draft: draftCount?.count || 0,
			sold: soldCount?.count || 0,
			total: (activeCount?.count || 0) + (pausedCount?.count || 0) + (draftCount?.count || 0) + (soldCount?.count || 0),
			recent: recentListings
		},
		trades: {
			active: activeTrades.map(t => ({
				...t,
				listingTitle: listingTitles.get(t.listingId) || 'Unknown Listing',
				otherUser: t.sellerId === userId 
					? otherUsers.get(t.buyerId) 
					: otherUsers.get(t.sellerId),
				isSeller: t.sellerId === userId
			})),
			completed: completedTrades.map(t => ({
				...t,
				listingTitle: listingTitles.get(t.listingId) || 'Unknown Listing',
				otherUser: t.sellerId === userId 
					? otherUsers.get(t.buyerId) 
					: otherUsers.get(t.sellerId),
				isSeller: t.sellerId === userId
			})),
			totalCompleted: completedTradesCount?.count || 0
		},
		stats: {
			totalListings: (activeCount?.count || 0) + (pausedCount?.count || 0) + (draftCount?.count || 0) + (soldCount?.count || 0),
			activeListings: activeCount?.count || 0,
			completedTrades: completedTradesCount?.count || 0,
			averageRating: Number(reviewStats?.avgRating) || 0,
			totalReviews: reviewStats?.count || 0
		}
	};
}
