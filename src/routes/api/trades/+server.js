import { json, error } from "@sveltejs/kit";
import { listings, users, trades } from "$lib/server/schema";
import { eq, and, or, inArray, desc } from "drizzle-orm";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
  if (!locals.session || !locals.user) {
    throw error(401, "Unauthorized");
  }
  console.log("post method");

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
  if (!body.listingId) {
    throw error(400, "Listing ID is required");
  }
  if (!body.buyerId) {
    throw error(400, "Buyer ID is required");
  }
  if (!body.sellerId) {
    throw error(400, "Seller ID is required");
  }

  const listingId = Number(body.listingId);
  const buyerId = Number(body.buyerId);
  const sellerId = Number(body.sellerId);

  // Verify the user is the buyer
  if (buyerId !== marketplaceUser.id) {
    throw error(403, "You can only start trades as the buyer");
  }

  // Get listing
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) {
    throw error(404, "Listing not found");
  }

  const amount = parseFloat(listing.price);

  // Verify listing is active
  if (listing.status !== "active") {
    throw error(400, "Listing is not available for trade");
  }

  // Verify seller ID matches listing owner
  if (listing.userId !== sellerId) {
    throw error(400, "Seller ID does not match listing owner");
  }

  // Don't allow users to trade with themselves
  if (buyerId === sellerId) {
    throw error(400, "You cannot trade with yourself");
  }

  // Check if there's already an active trade for this listing
  const existingTrade = await db
    .select()
    .from(trades)
    .where(
      and(
        eq(trades.listingId, listingId),
        or(eq(trades.buyerId, buyerId), eq(trades.sellerId, sellerId)),
        inArray(trades.status, [
          "initiated",
          "payment_pending",
          "paid",
          "in_progress",
        ]),
      ),
    )
    .limit(1);

  if (existingTrade.length > 0) {
    throw error(400, "An active trade already exists for this listing");
  }

  // Generate unique trade number (format: YYMMDD-HHMMSS-XXX - max 20 chars)
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD (6 chars)
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS (6 chars)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0"); // XXX (3 chars)
  const tradeNumber = `${dateStr}-${timeStr}-${random}`; // Total: 6 + 1 + 6 + 1 + 3 = 17 chars

  try {
    // Create the trade
    const [newTrade] = await db
      .insert(trades)
      .values({
        tradeNumber: tradeNumber,
        listingId: listingId,
        buyerId: buyerId,
        sellerId: sellerId,
        amount: amount.toString(),
        currency: body.currency || "GBP",
        status: body.status || "initiated",
      })
      .returning();

    return json({ success: true, trade: newTrade });
  } catch (err) {
    console.error("Error creating trade:", err);

    // Check for unique constraint violation (trade number)
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "23505"
    ) {
      // Retry with a new trade number
      const retryRandom = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const retryTradeNumber = `${dateStr}-${timeStr}-${retryRandom}`;

      try {
        const [newTrade] = await db
          .insert(trades)
          .values({
            tradeNumber: retryTradeNumber,
            listingId: listingId,
            buyerId: buyerId,
            sellerId: sellerId,
            amount: amount.toString(),
            currency: body.currency || "USD",
            status: body.status || "initiated",
          })
          .returning();

        return json({ success: true, trade: newTrade });
      } catch (retryErr) {
        console.error("Error creating trade on retry:", retryErr);
        throw error(500, "Failed to create trade");
      }
    }

    throw error(500, "Failed to create trade");
  }
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, request, locals }) {
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

  const listingId = url.searchParams.get("listingId");
  const buyerId = url.searchParams.get("buyerId");
  const sellerId = url.searchParams.get("sellerId");

  // Validate required fields
  if (!listingId) {
    throw error(400, "Listing ID is required");
  }
  if (!buyerId) {
    throw error(400, "Buyer ID is required");
  }
  if (!sellerId) {
    throw error(400, "Seller ID is required");
  }

  // Verify the user is the buyer
  if (buyerId === sellerId) {
    throw error(403, "You can only start trades as the buyer");
  }

  // Check if there's a trade for this listing (including cancelled to show rejection state)
  const foundTrade = await db
    .select()
    .from(trades)
    .where(
      and(
        eq(trades.listingId, Number(listingId)),
        or(eq(trades.buyerId, Number(buyerId)), eq(trades.sellerId, Number(sellerId))),
        inArray(trades.status, [
          "initiated",
          "payment_pending",
          "paid",
          "in_progress",
          "cancelled",
          "completed",
        ]),
      ),
    )
    .orderBy(desc(trades.createdAt))
    .limit(1);

  return json({ success: true, trade: foundTrade });
}
