import { json, error } from '@sveltejs/kit';
import { conversations, users, listings, messages } from '$lib/server/schema';
import { eq, and, or, desc } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, url }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	// Get marketplace user
	const marketplaceUser = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (marketplaceUser.length === 0) {
		throw error(400, 'User profile not found');
	}

	const userId = marketplaceUser[0].id;

	// Get all conversations where user is buyer or seller
	const userConversationsRaw = await db
		.select({
			conversation: conversations,
			otherUser: users,
			listing: listings
		})
		.from(conversations)
		.leftJoin(
			users,
			or(
				and(eq(conversations.buyerId, userId), eq(users.id, conversations.sellerId)),
				and(eq(conversations.sellerId, userId), eq(users.id, conversations.buyerId))
			)
		)
		.leftJoin(listings, eq(conversations.listingId, listings.id))
		.where(or(
			eq(conversations.buyerId, userId),
			eq(conversations.sellerId, userId)
		))
		.orderBy(desc(conversations.lastMessageAt), desc(conversations.createdAt));

	// Transform to match expected format
	const userConversations = userConversationsRaw.map(row => ({
		...row.conversation,
		otherUser: row.otherUser,
		listing: row.listing
	}));

	return json({ conversations: userConversations });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const body = await request.json();
	const { listingId, sellerId } = body;

	if (!listingId || !sellerId) {
		throw error(400, 'Missing listingId or sellerId');
	}

	// Get marketplace user
	const marketplaceUser = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (marketplaceUser.length === 0) {
		throw error(400, 'User profile not found');
	}

	const buyerId = marketplaceUser[0].id;

	// Check if conversation already exists
	const existing = await db
		.select()
		.from(conversations)
		.where(
			and(
				eq(conversations.listingId, Number(listingId)),
				eq(conversations.buyerId, buyerId),
				eq(conversations.sellerId, Number(sellerId))
			)
		)
		.limit(1);

	if (existing.length > 0) {
		return json({ conversation: existing[0] });
	}

	// Create new conversation
	const [newConversation] = await db
		.insert(conversations)
		.values({
			listingId: Number(listingId),
			buyerId: buyerId,
			sellerId: Number(sellerId)
		})
		.returning();

	return json({ conversation: newConversation });
}

