import { json, error } from "@sveltejs/kit";
import { trades, users, reviews } from "$lib/server/schema";
import { eq, and } from "drizzle-orm";

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request, locals }) {
  if (!locals.session || !locals.user) {
    throw error(401, "Unauthorized");
  }

  const db = locals.db;
  if (!db) {
    throw error(500, "Database not available");
  }

  const tradeId = Number(params.id);
  const body = await request.json();

  // Get marketplace user
  const [marketplaceUser] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, locals.user.id))
    .limit(1);

  if (!marketplaceUser) {
    throw error(400, "User profile not found");
  }

  // Validate required fields
  if (!body.rating || body.rating < 1 || body.rating > 5) {
    throw error(400, "Rating must be between 1 and 5");
  }

  if (!body.reviewerId || !body.revieweeId) {
    throw error(400, "Reviewer and reviewee IDs are required");
  }

  // Verify user is the reviewer
  if (Number(body.reviewerId) !== marketplaceUser.id) {
    throw error(403, "You can only submit reviews as yourself");
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

  // Verify trade is completed
  if (trade.status !== "completed") {
    throw error(400, "Can only review completed trades");
  }

  // Verify reviewee is the other party in the trade
  const revieweeId = Number(body.revieweeId);
  if (revieweeId !== trade.buyerId && revieweeId !== trade.sellerId) {
    throw error(400, "Reviewee must be the other party in the trade");
  }

  // Check if user has already submitted a review for this trade
  const [existingReview] = await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.tradeId, tradeId),
        eq(reviews.reviewerId, marketplaceUser.id)
      )
    )
    .limit(1);

  if (existingReview) {
    throw error(400, "You have already submitted a review for this trade");
  }

  // Create review
  try {
    const [newReview] = await db
      .insert(reviews)
      .values({
        tradeId: tradeId,
        reviewerId: marketplaceUser.id,
        revieweeId: revieweeId,
        rating: Number(body.rating),
        title: body.title || null,
        comment: body.comment || null,
        isPublic: body.isPublic !== false, // Default to true
      })
      .returning();

    return json({ success: true, review: newReview });
  } catch (err) {
    console.error("Error creating review:", err);
    throw error(500, "Failed to create review");
  }
}

