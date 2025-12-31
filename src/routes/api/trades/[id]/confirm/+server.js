import { json, error } from "@sveltejs/kit";
import { trades, users, conversations, messages } from "$lib/server/schema";
import { eq, and } from "drizzle-orm";

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, locals }) {
  if (!locals.session || !locals.user) {
    throw error(401, "Unauthorized");
  }

  const db = locals.db;
  if (!db) {
    throw error(500, "Database not available");
  }

  const tradeId = Number(params.id);

  // Get marketplace user
  const [marketplaceUser] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, locals.user.id))
    .limit(1);

  if (!marketplaceUser) {
    throw error(400, "User profile not found");
  }

  // Get trade
  const [trade] = await db
    .select()
    .from(trades)
    .where(eq(trades.id, tradeId))
    .limit(1);

  if (!trade) {
    throw error(404, "Trade not found");
  }

  // Verify user is part of this trade
  if (trade.buyerId !== marketplaceUser.id && trade.sellerId !== marketplaceUser.id) {
    throw error(403, "Access denied");
  }

  // Check if trade is already confirmed or completed
  if (trade.status !== "initiated") {
    throw error(400, "Trade is not in initiated status");
  }

  // Determine who initiated (buyer always initiates currently)
  // The other party (seller) should confirm
  if (trade.buyerId === marketplaceUser.id) {
    throw error(400, "You cannot confirm your own trade initiation");
  }

  // Update trade status to in_progress (confirmed)
  await db
    .update(trades)
    .set({
      status: "in_progress",
      updatedAt: new Date(),
    })
    .where(eq(trades.id, tradeId));

  // Get conversation for this trade
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.listingId, trade.listingId),
        eq(conversations.buyerId, trade.buyerId),
        eq(conversations.sellerId, trade.sellerId)
      )
    )
    .limit(1);

  // Create system message about trade confirmation
  if (conversation) {
    const [confirmingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, marketplaceUser.id))
      .limit(1);

    const userName = confirmingUser?.firstName || confirmingUser?.username || "User";
    
    await db
      .insert(messages)
      .values({
        conversationId: conversation.id,
        senderId: marketplaceUser.id,
        content: `${userName} has confirmed the trade.`,
        isRead: false,
      });

    // Update conversation - increment unread count for the other party
    const isBuyer = conversation.buyerId === marketplaceUser.id;
    await db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: `${userName} has confirmed the trade.`,
        buyerUnreadCount: isBuyer ? conversation.buyerUnreadCount : conversation.buyerUnreadCount + 1,
        sellerUnreadCount: isBuyer ? conversation.sellerUnreadCount + 1 : conversation.sellerUnreadCount,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversation.id));
  }

  return json({ success: true, message: "Trade confirmed successfully" });
}

