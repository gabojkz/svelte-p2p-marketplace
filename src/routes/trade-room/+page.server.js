import { redirect, error } from '@sveltejs/kit';
import { listings, users, user, categories, trades, conversations, messages } from '$lib/server/schema';
import { eq, and, or, desc, inArray } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url }) {
	if (!locals.session || !locals.user) {
		throw redirect(302, '/login');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const listingId = Number(url.searchParams.get('listingId'));

	if (!listingId || isNaN(listingId)) {
		throw error(400, 'Invalid listing ID');
	}

	// Get marketplace user
	const [marketplaceUser] = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (!marketplaceUser) {
		throw redirect(302, '/dashboard?error=profile_required');
	}

	// Get listing with seller info (including auth user for emailVerified)
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

	// Check if listing is active
	if (listing.listing.status !== 'active') {
		throw error(400, 'Listing is not available');
	}

	// Don't allow sellers to message themselves
	if (listing.listing.userId === marketplaceUser.id) {
		throw error(400, 'You cannot trade with yourself');
	}

	// Get or create conversation
	let conversation = await db
		.select()
		.from(conversations)
		.where(
			and(
				eq(conversations.listingId, listingId),
				eq(conversations.buyerId, marketplaceUser.id),
				eq(conversations.sellerId, listing.listing.userId)
			)
		)
		.limit(1);

	if (conversation.length === 0) {
		// Create new conversation
		const [newConversation] = await db
			.insert(conversations)
			.values({
				listingId: listingId,
				buyerId: marketplaceUser.id,
				sellerId: listing.listing.userId
			})
			.returning();
		conversation = [newConversation];
	}

	const conversationId = conversation[0].id;

	// Get messages for this conversation
	const conversationMessages = await db
		.select({
			id: messages.id,
			content: messages.content,
			senderId: messages.senderId,
			createdAt: messages.createdAt,
			isRead: messages.isRead
		})
		.from(messages)
		.where(eq(messages.conversationId, conversationId))
		.orderBy(desc(messages.createdAt))
		.limit(50);

	// Reverse to show oldest first
	conversationMessages.reverse();

	// Get active trade if exists (handle case where trades table might not exist)
	// Valid trade_status enum values: 'initiated', 'payment_pending', 'paid', 'in_progress', 'completed', 'cancelled', 'disputed'
	let activeTrade = null;
	try {
		const tradeResult = await db
			.select()
			.from(trades)
			.where(
				and(
					eq(trades.listingId, listingId),
					or(
						eq(trades.buyerId, marketplaceUser.id),
						eq(trades.sellerId, marketplaceUser.id)
					),
					inArray(trades.status, ['initiated', 'payment_pending', 'paid', 'in_progress'])
				)
			)
			.limit(1);
		activeTrade = tradeResult[0] || null;
	} catch (err) {
		// Trades table might not exist yet, that's okay
		console.warn('Trades table not available:', err);
		activeTrade = null;
	}

	return {
		session: locals.session,
		user: locals.user,
		marketplaceUser,
		listing: {
			...listing.listing,
			category: listing.category,
			seller: listing.seller ? {
				...listing.seller,
				emailVerified: listing.authUser?.emailVerified || false
			} : null
		},
		conversation: conversation[0],
		messages: conversationMessages,
		trade: activeTrade
	};
}

