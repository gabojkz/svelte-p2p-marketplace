import { redirect } from "@sveltejs/kit";
import { users, trades, listings, categories } from "$lib/server/schema";
import { eq, and, or, like, desc, asc, sql, inArray } from "drizzle-orm";

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

  // Get query parameters
  const searchQuery = url.searchParams.get("search") || "";
  const statusFilter = url.searchParams.get("status") || "all";
  const roleFilter = url.searchParams.get("role") || "all"; // buyer, seller, all
  const sortBy = url.searchParams.get("sort") || "newest";
  const sortOrder = url.searchParams.get("order") || "desc";

  // Build where conditions - user must be buyer or seller
  const conditions = [
    or(eq(trades.buyerId, userId), eq(trades.sellerId, userId))
  ];

  // Status filter
  if (statusFilter !== "all") {
    conditions.push(eq(trades.status, statusFilter));
  }

  // Role filter
  if (roleFilter === "buyer") {
    conditions.push(eq(trades.buyerId, userId));
  } else if (roleFilter === "seller") {
    conditions.push(eq(trades.sellerId, userId));
  }

  // Build order by
  let orderBy;
  const sortColumn =
    sortBy === "amount"
      ? trades.amount
      : sortBy === "status"
        ? trades.status
        : sortBy === "tradeNumber"
          ? trades.tradeNumber
          : trades.createdAt;

  orderBy = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  // Fetch trades with listing info
  const userTrades = await db
    .select({
      trade: trades,
      listing: listings,
      category: categories,
    })
    .from(trades)
    .leftJoin(listings, eq(trades.listingId, listings.id))
    .leftJoin(categories, eq(listings.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(orderBy);

  // Process trades to include buyer/seller info properly
  const tradesWithDetails = await Promise.all(
    userTrades.map(async (row) => {
      // Get buyer and seller separately
      const [buyer] = await db
        .select()
        .from(users)
        .where(eq(users.id, row.trade.buyerId))
        .limit(1);

      const [seller] = await db
        .select()
        .from(users)
        .where(eq(users.id, row.trade.sellerId))
        .limit(1);

      // Determine user's role in this trade
      const isBuyer = row.trade.buyerId === userId;
      const isSeller = row.trade.sellerId === userId;
      const otherParty = isBuyer ? seller : buyer;

      // Apply search filter if provided
      const matchesSearch = !searchQuery || 
        row.trade.tradeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        otherParty?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        otherParty?.username?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) {
        return null;
      }

      return {
        ...row.trade,
        listing: row.listing,
        category: row.category,
        buyer: buyer || null,
        seller: seller || null,
        userRole: isBuyer ? "buyer" : "seller",
        otherParty: otherParty || null,
      };
    })
  );

  // Filter out null results from search
  const filteredTrades = tradesWithDetails.filter(t => t !== null);

  // Get statistics
  const [allTradesCount] = await db
    .select({ count: sql`count(*)::int` })
    .from(trades)
    .where(or(eq(trades.buyerId, userId), eq(trades.sellerId, userId)));

  const [activeTradesCount] = await db
    .select({ count: sql`count(*)::int` })
    .from(trades)
    .where(
      and(
        or(eq(trades.buyerId, userId), eq(trades.sellerId, userId)),
        inArray(trades.status, ["initiated", "payment_pending", "paid", "in_progress"])
      )
    );

  const [completedTradesCount] = await db
    .select({ count: sql`count(*)::int` })
    .from(trades)
    .where(
      and(
        or(eq(trades.buyerId, userId), eq(trades.sellerId, userId)),
        eq(trades.status, "completed")
      )
    );

  const [buyerTradesCount] = await db
    .select({ count: sql`count(*)::int` })
    .from(trades)
    .where(eq(trades.buyerId, userId));

  const [sellerTradesCount] = await db
    .select({ count: sql`count(*)::int` })
    .from(trades)
    .where(eq(trades.sellerId, userId));

  return {
    session: locals.session,
    user: locals.user,
    marketplaceUser: marketplaceUser[0],
    trades: filteredTrades,
    stats: {
      total: allTradesCount?.count || 0,
      active: activeTradesCount?.count || 0,
      completed: completedTradesCount?.count || 0,
      asBuyer: buyerTradesCount?.count || 0,
      asSeller: sellerTradesCount?.count || 0,
    },
    filters: {
      searchQuery,
      statusFilter,
      roleFilter,
      sortBy,
      sortOrder,
    },
  };
}

