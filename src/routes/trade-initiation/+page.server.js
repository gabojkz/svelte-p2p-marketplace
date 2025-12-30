import { redirect, error } from "@sveltejs/kit";
import {
  listings,
  users,
  user,
  categories,
  reviews,
  trades,
} from "$lib/server/schema";
import { eq, and, or, sql } from "drizzle-orm";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, url }) {
  if (!locals.session || !locals.user) {
    throw redirect(302, "/login");
  }

  const db = locals.db;
  if (!db) {
    throw error(500, "Database not available");
  }

  const listingId = Number(url.searchParams.get("listingId"));

  if (!listingId || isNaN(listingId)) {
    throw error(400, "Invalid listing ID");
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

  // Get listing with seller info (including auth user for emailVerified)
  const [listing] = await db
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

  if (!listing || !listing.listing) {
    throw error(404, "Listing not found");
  }

  // Check if listing is active
  if (listing.listing.status !== "active") {
    throw error(400, "Listing is not available");
  }

  // Don't allow sellers to buy their own listings
  if (listing.listing.userId === marketplaceUser.id) {
    throw error(400, "You cannot buy your own listing");
  }

  // Get seller stats
  const sellerId = listing.listing.userId;

  const [sellerReviews] = await db
    .select({
      avgRating: sql`COALESCE(AVG(${reviews.rating})::numeric, 0)`,
      count: sql`count(*)::int`,
    })
    .from(reviews)
    .where(eq(reviews.revieweeId, sellerId));

  const [sellerTradesCount] = await db
    .select({ count: sql`count(*)::int` })
    .from(trades)
    .where(
      and(
        or(eq(trades.sellerId, sellerId), eq(trades.buyerId, sellerId)),
        eq(trades.status, "completed"),
      ),
    );

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
            stats: {
              avgRating: Number(sellerReviews?.avgRating) || 0,
              reviewsCount: sellerReviews?.count || 0,
              completedTrades: sellerTradesCount?.count || 0,
            },
          }
        : null,
    },
  };
}
