import { json, error } from "@sveltejs/kit";
import { trades, users } from "$lib/server/schema";
import { eq } from "drizzle-orm";

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

  // Check if trade is already completed
  if (trade.status === "completed") {
    return json({ success: true, message: "Trade already completed", trade });
  }

  // Check if trade is cancelled
  if (trade.status === "cancelled") {
    throw error(400, "Cannot complete a cancelled trade");
  }

  // Update trade status to completed
  await db
    .update(trades)
    .set({
      status: "completed",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(trades.id, tradeId));

  // Note: We don't mark the listing as "sold" because the seller
  // may want to sell the same item multiple times

  return json({ success: true, message: "Trade completed successfully" });
}

