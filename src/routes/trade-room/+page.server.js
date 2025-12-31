import { redirect, error } from "@sveltejs/kit";
import {
  listings,
  users,
  user,
  categories,
  trades,
  conversations,
  messages,
} from "$lib/server/schema";
import { eq, and, or, desc, inArray } from "drizzle-orm";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url }) {
  if (!locals.session || !locals.user) {
    throw redirect(302, "/login");
  }

  const db = locals.db;
  if (!db) {
    throw error(500, "Database not available");
  }

  // Get conversationId from URL (preferred) or listingId (fallback for backwards compatibility)
  const conversationIdParam = url.searchParams.get("conversationId");
  const listingIdParam = url.searchParams.get("listingId");

  let conversationId = null;
  let listingId = null;

  if (conversationIdParam) {
    // Use conversationId if provided
    const parsedId = Number(conversationIdParam);
    if (isNaN(parsedId) || parsedId <= 0 || !isFinite(parsedId)) {
      throw error(400, `Invalid conversation ID: "${conversationIdParam}" (parsed as: ${parsedId})`);
    }
    conversationId = parsedId;
  } else if (listingIdParam) {
    // Fallback to listingId for backwards compatibility
    listingId = Number(listingIdParam);
    if (!listingId || isNaN(listingId)) {
      throw error(400, "Invalid listing ID");
    }
  } else {
    throw error(400, "Either conversationId or listingId is required");
  }

  // Get marketplace user
  const [marketplaceUser] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, locals.user.id))
    .limit(1);

  if (!marketplaceUser) {
    throw redirect(302, "/marketplace?error=profile_required");
  }

  let conversation = null;
  let listing = null;

  if (conversationId) {
    // Fetch conversation by ID
    const [foundConversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!foundConversation) {
      throw error(404, "Conversation not found");
    }

    // Verify the current user is part of this conversation
    // Convert to numbers for comparison (bigint comparison)
    const buyerIdNum = Number(foundConversation.buyerId);
    const sellerIdNum = Number(foundConversation.sellerId);
    const userIdNum = Number(marketplaceUser.id);
    
    if (buyerIdNum !== userIdNum && sellerIdNum !== userIdNum) {
      throw error(403, "You are not authorized to view this conversation");
    }

    conversation = foundConversation;
    listingId = foundConversation.listingId;
  }

  // Get listing with seller info (including auth user for emailVerified)
  if (listingId) {
    const [listingData] = await db
      .select({
        listing: listings,
        category: categories,
        seller: users,
        authUser: user,
      })
      .from(listings)
      .leftJoin(categories, eq(listings.categoryId, categories.id))
      .leftJoin(users, eq(listings.userId, users.id))
      .leftJoin(user, eq(users.authUserId, user.id))
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listingData || !listingData.listing) {
      throw error(404, "Listing not found");
    }

    listing = listingData;

    // Check if listing is active
    if (listing.listing.status !== "active") {
      throw error(400, "Listing is not available");
    }

    // Don't allow sellers to message themselves
    if (listing.listing.userId === marketplaceUser.id) {
      throw error(400, "You cannot trade with yourself");
    }
  }

  // If conversationId was not provided, get or create conversation using listingId
  if (!conversation && listingId) {
    // Get or create conversation
    let existingConversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.listingId, listingId),
          eq(conversations.buyerId, marketplaceUser.id),
          eq(conversations.sellerId, listing.listing.userId),
        ),
      )
      .limit(1);

    if (existingConversation.length === 0) {
      // Create new conversation
      const [newConversation] = await db
        .insert(conversations)
        .values({
          listingId: listingId,
          buyerId: marketplaceUser.id,
          sellerId: listing.listing.userId,
        })
        .returning();
      existingConversation = [newConversation];
    }

    conversation = existingConversation[0];
    conversationId = conversation.id;
  }

  if (!conversation) {
    throw error(404, "Conversation not found");
  }

  // Get the other party (buyer if current user is seller, seller if current user is buyer)
  const isCurrentUserBuyer = conversation.buyerId === marketplaceUser.id;
  const otherPartyId = isCurrentUserBuyer 
    ? conversation.sellerId 
    : conversation.buyerId;

  // Fetch the other party's user data
  const [otherParty] = await db
    .select({
      user: users,
      authUser: user,
    })
    .from(users)
    .leftJoin(user, eq(users.authUserId, user.id))
    .where(eq(users.id, otherPartyId))
    .limit(1);

  const otherPartyData = otherParty?.user ? {
    ...otherParty.user,
    emailVerified: otherParty.authUser?.emailVerified || false,
    lastLoginAt: otherParty.user.lastLoginAt,
  } : null;

  // Get messages for this conversation
  const conversationMessages = await db
    .select({
      id: messages.id,
      content: messages.content,
      senderId: messages.senderId,
      createdAt: messages.createdAt,
      isRead: messages.isRead,
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
            eq(trades.sellerId, marketplaceUser.id),
          ),
          inArray(trades.status, [
            "initiated",
            "payment_pending",
            "paid",
            "in_progress",
          ]),
        ),
      )
      .limit(1);
    activeTrade = tradeResult[0] || null;
  } catch (err) {
    // Trades table might not exist yet, that's okay
    console.warn("Trades table not available:", err);
    activeTrade = null;
  }

  return {
    session: locals.session,
    user: locals.user,
    marketplaceUser,
    listing: {
      ...listing.listing,
      category: listing.category,
      seller: listing.seller
        ? {
            ...listing.seller,
            emailVerified: listing.authUser?.emailVerified || false,
          }
        : null,
    },
    conversation: conversation,
    messages: conversationMessages,
    trade: activeTrade,
    otherParty: otherPartyData,
    isCurrentUserBuyer,
  };
}
