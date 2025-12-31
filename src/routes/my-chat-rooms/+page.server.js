import { redirect } from "@sveltejs/kit";
import { users, conversations, listings, categories, messages } from "$lib/server/schema";
import { eq, and, or, desc, like, sql } from "drizzle-orm";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url }) {
  if (!locals.session || !locals.user) {
    throw redirect(302, "/login");
  }

  const db = locals.db;
  if (!db) {
    return { error: "Database not available" };
  }

  // Get marketplace user
  const marketplaceUser = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, locals.user.id))
    .limit(1);

  if (marketplaceUser.length === 0) {
    throw redirect(302, "/marketplace?error=profile_required");
  }

  const userId = marketplaceUser[0].id;

  // Get search query
  const searchQuery = url.searchParams.get("search") || "";

  // Get all conversations where user is buyer or seller
  const userConversationsRaw = await db
    .select({
      conversation: conversations,
      otherUser: users,
      listing: listings,
      category: categories,
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
    .leftJoin(categories, eq(listings.categoryId, categories.id))
    .where(or(
      eq(conversations.buyerId, userId),
      eq(conversations.sellerId, userId)
    ))
    .orderBy(desc(conversations.lastMessageAt), desc(conversations.createdAt));

  // Get unread counts and last message for each conversation
  const conversationsWithDetails = await Promise.all(
    userConversationsRaw.map(async (row) => {
      const conv = row.conversation;
      const isBuyer = conv.buyerId === userId;
      
      // Get unread count
      const userUnreadCount = isBuyer 
        ? (conv.buyerUnreadCount || 0)
        : (conv.sellerUnreadCount || 0);

      // Get last message if exists
      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      // Apply search filter
      const matchesSearch = !searchQuery || 
        row.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.otherUser?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) {
        return null;
      }

      // Ensure conversation ID exists
      if (!conv.id) {
        console.error("Conversation missing ID:", conv);
        return null;
      }

      return {
        id: Number(conv.id), // Ensure it's a number
        listingId: conv.listingId ? Number(conv.listingId) : null,
        buyerId: conv.buyerId ? Number(conv.buyerId) : null,
        sellerId: conv.sellerId ? Number(conv.sellerId) : null,
        lastMessageAt: conv.lastMessageAt,
        lastMessagePreview: conv.lastMessagePreview,
        userUnreadCount,
        isBuyer,
        otherUser: row.otherUser,
        listing: row.listing,
        category: row.category,
        lastMessage: lastMessage || null,
      };
    })
  );

  // Filter out null results from search
  const filteredConversations = conversationsWithDetails.filter(c => c !== null);

  // Calculate total unread count
  const totalUnread = filteredConversations.reduce((sum, conv) => sum + (conv.userUnreadCount || 0), 0);

  return {
    session: locals.session,
    user: locals.user,
    marketplaceUser: marketplaceUser[0],
    conversations: filteredConversations,
    totalUnread,
    searchQuery,
  };
}

