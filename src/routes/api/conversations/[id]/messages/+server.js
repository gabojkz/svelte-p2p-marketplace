import { json, error } from '@sveltejs/kit';
import { conversations, messages, users } from '$lib/server/schema';
import { eq, and, desc, ne } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, locals }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const conversationId = Number(params.id);

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

	// Verify user is part of this conversation
	const conversation = await db
		.select()
		.from(conversations)
		.where(eq(conversations.id, conversationId))
		.limit(1);

	if (conversation.length === 0) {
		throw error(404, 'Conversation not found');
	}

	const conv = conversation[0];
	if (conv.buyerId !== userId && conv.sellerId !== userId) {
		throw error(403, 'Access denied');
	}

	// Get messages
	const conversationMessages = await db
		.select({
			id: messages.id,
			conversationId: messages.conversationId,
			senderId: messages.senderId,
			content: messages.content,
			isRead: messages.isRead,
			readAt: messages.readAt,
			createdAt: messages.createdAt,
			sender: users
		})
		.from(messages)
		.leftJoin(users, eq(messages.senderId, users.id))
		.where(eq(messages.conversationId, conversationId))
		.orderBy(desc(messages.createdAt))
		.limit(100);

	// Mark messages as read for current user (only messages not sent by current user)
	const unreadMessages = await db
		.select()
		.from(messages)
		.where(
			and(
				eq(messages.conversationId, conversationId),
				ne(messages.senderId, userId), // Not sent by current user
				eq(messages.isRead, false)
			)
		);

	if (unreadMessages.length > 0) {
		await db
			.update(messages)
			.set({
				isRead: true,
				readAt: new Date()
			})
			.where(
				and(
					eq(messages.conversationId, conversationId),
					ne(messages.senderId, userId),
					eq(messages.isRead, false)
				)
			);
	}

	// Update unread count
	if (conv.buyerId === userId) {
		await db
			.update(conversations)
			.set({ buyerUnreadCount: 0 })
			.where(eq(conversations.id, conversationId));
	} else {
		await db
			.update(conversations)
			.set({ sellerUnreadCount: 0 })
			.where(eq(conversations.id, conversationId));
	}

	return json({ messages: conversationMessages.reverse() }); // Reverse to show oldest first
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request, locals }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const conversationId = Number(params.id);
	const body = await request.json();
	const { content } = body;

	if (!content || content.trim() === '') {
		throw error(400, 'Message content is required');
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

	// Verify user is part of this conversation
	const conversation = await db
		.select()
		.from(conversations)
		.where(eq(conversations.id, conversationId))
		.limit(1);

	if (conversation.length === 0) {
		throw error(404, 'Conversation not found');
	}

	const conv = conversation[0];
	if (conv.buyerId !== userId && conv.sellerId !== userId) {
		throw error(403, 'Access denied');
	}

	// Create message
	const [newMessage] = await db
		.insert(messages)
		.values({
			conversationId: conversationId,
			senderId: userId,
			content: content.trim(),
			isRead: false
		})
		.returning();

	// Update conversation
	const preview = content.trim().length > 200 ? content.trim().substring(0, 200) + '...' : content.trim();
	const isBuyer = conv.buyerId === userId;
	
	await db
		.update(conversations)
		.set({
			lastMessageAt: new Date(),
			lastMessagePreview: preview,
			buyerUnreadCount: isBuyer ? conv.buyerUnreadCount : conv.buyerUnreadCount + 1,
			sellerUnreadCount: isBuyer ? conv.sellerUnreadCount + 1 : conv.sellerUnreadCount,
			updatedAt: new Date()
		})
		.where(eq(conversations.id, conversationId));

	// Get sender info
	const sender = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	return json({
		message: {
			...newMessage,
			sender: sender[0]
		}
	});
}

