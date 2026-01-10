import { redirect } from "@sveltejs/kit";
import { listings, categories, users } from "$lib/server/schema";
import { eq, and } from "drizzle-orm";
import { getR2PublicUrl } from "$lib/server/r2.js";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, params, platform }) {
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
  const imagesData = await db
    .select()
    .from(listingImages)
    .where(eq(listingImages.listingId, listingId))
    .orderBy(listingImages.displayOrder);

  // Convert image keys to full R2 URLs
  const images = imagesData.map((img) => {
    // Check if imageUrl is already a full URL (starts with http:// or https://)
    // If not, it's a key and needs to be converted
    const imageUrl = img.imageUrl?.startsWith('http://') || img.imageUrl?.startsWith('https://')
      ? img.imageUrl
      : getR2PublicUrl(img.imageUrl, false, platform);
    
    const thumbnailUrl = img.thumbnailUrl?.startsWith('http://') || img.thumbnailUrl?.startsWith('https://')
      ? img.thumbnailUrl
      : getR2PublicUrl(img.thumbnailUrl || img.imageUrl, false, platform);

    return {
      ...img,
      imageUrl,
      thumbnailUrl
    };
  });

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

