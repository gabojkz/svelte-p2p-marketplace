import { json, error } from "@sveltejs/kit";
import { disputes, users, trades } from "$lib/server/schema";
import { eq, and } from "drizzle-orm";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
  if (!locals.session || !locals.user) {
    throw error(401, "Unauthorized");
  }

  const db = locals.db;
  if (!db) {
    throw error(500, "Database not available");
  }

  // Get marketplace user
  const [marketplaceUser] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, locals.user.id))
    .limit(1);

  if (!marketplaceUser) {
    throw error(400, "User profile not found");
  }

  const body = await request.json();

  // Validate required fields
  if (!body.tradeId) {
    throw error(400, "Trade ID is required");
  }
  if (!body.reportedUserId) {
    throw error(400, "Reported user ID is required");
  }
  if (!body.issueType) {
    throw error(400, "Issue type is required");
  }
  if (!body.title || body.title.trim().length === 0) {
    throw error(400, "Title is required");
  }
  if (!body.description || body.description.trim().length < 20) {
    throw error(400, "Description must be at least 20 characters");
  }

  const tradeId = Number(body.tradeId);
  const reportedUserId = Number(body.reportedUserId);

  // Verify user is not reporting themselves
  if (reportedUserId === marketplaceUser.id) {
    throw error(400, "You cannot report yourself");
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

  // Verify reported user is the other party in the trade
  if (reportedUserId !== trade.buyerId && reportedUserId !== trade.sellerId) {
    throw error(400, "Reported user must be part of this trade");
  }

  // Check if user has already reported this trade
  const [existingDispute] = await db
    .select()
    .from(disputes)
    .where(
      and(
        eq(disputes.tradeId, tradeId),
        eq(disputes.reportedByUserId, marketplaceUser.id)
      )
    )
    .limit(1);

  if (existingDispute) {
    throw error(400, "You have already submitted a report for this trade");
  }

  // Create dispute
  try {
    const [newDispute] = await db
      .insert(disputes)
      .values({
        tradeId: tradeId,
        reportedByUserId: marketplaceUser.id,
        reportedAgainstUserId: reportedUserId,
        issueType: body.issueType,
        title: body.title.trim(),
        description: body.description.trim(),
        status: "open",
      })
      .returning();

    return json({ success: true, dispute: newDispute });
  } catch (err) {
    console.error("Error creating dispute:", err);
    throw error(500, "Failed to create report");
  }
}

