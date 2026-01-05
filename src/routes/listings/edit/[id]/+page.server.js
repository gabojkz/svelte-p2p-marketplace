import { redirect } from "@sveltejs/kit";
import { listings, categories, users } from "$lib/server/schema";
import { eq, and } from "drizzle-orm";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, params }) {
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

  const listingId = Number(params.id);
  if (!listingId) {
    throw redirect(302, "/listings/create");
  }

  // Fetch the listing and verify ownership
  const listingData = await db
    .select({
      listing: listings,
      category: categories,
    })
    .from(listings)
    .leftJoin(categories, eq(listings.categoryId, categories.id))
    .where(
      and(
        eq(listings.id, listingId),
        eq(listings.userId, marketplaceUser[0].id)
      )
    )
    .limit(1);

  if (listingData.length === 0) {
    throw redirect(302, "/my-listings?error=listing_not_found");
  }

  // Fetch all active categories
  const categoriesData = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.displayOrder, categories.name);

  // Fetch listing images
  const { listingImages } = await import("$lib/server/schema");
  const images = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(listingImages.displayOrder);

  return {
    session: locals.session,
    user: locals.user,
    marketplaceUser: marketplaceUser[0],
    listing: {
      ...listingData[0].listing,
      category: listingData[0].category,
      images: images,
    },
    categories: categoriesData,
  };
}

