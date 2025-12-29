import { categories, listings, users } from "$lib/server/schema.js";
import { count, eq, and, desc, sql } from "drizzle-orm";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const db = locals.db;

  if (!db) {
    return {
      categories: [],
      featuredListings: [],
      stats: {
        activeListings: 0,
        verifiedSellers: 0,
        satisfactionRate: 98,
      },
    };
  }

  try {
    // Fetch categories with listing counts using subquery
    const categoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        type: categories.type,
        icon: categories.icon,
        parentId: categories.parentId,
        listingCount: sql`(
					SELECT COUNT(*)::int
					FROM ${listings}
					WHERE ${listings.categoryId} = ${categories.id}
					AND ${listings.status} = 'active'
				)`,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.displayOrder, categories.name);

    // Fetch featured listings (active, featured, limit 4)
    const featuredListingsData = await db
      .select({
        id: listings.id,
        title: listings.title,
        price: listings.price,
        locationCity: listings.locationCity,
        locationPostcode: listings.locationPostcode,
        categoryId: listings.categoryId,
        featured: listings.featured,
        urgent: listings.urgent,
        viewCount: listings.viewCount,
        createdAt: listings.createdAt,
      })
      .from(listings)
      .where(and(eq(listings.status, "active"), eq(listings.featured, true)))
      .orderBy(desc(listings.createdAt))
      .limit(4);

    // Get category info for featured listings
    const featuredListingsWithCategories = await Promise.all(
      featuredListingsData.map(async (/** @type {any} */ listing) => {
        const category = await db
          .select()
          .from(categories)
          .where(eq(categories.id, listing.categoryId))
          .limit(1);

        return {
          ...listing,
          category: category[0] || null,
        };
      }),
    );

    // Calculate stats
    const [activeListingsResult] = await db
      .select({ count: count() })
      .from(listings)
      .where(eq(listings.status, "active"));

    const [verifiedSellersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.kycStatus, "verified"), eq(users.isActive, true)));

    const activeListingsCount = activeListingsResult?.count || 0;
    const verifiedSellersCount = verifiedSellersResult?.count || 0;

    // Calculate satisfaction rate from reviews (if reviews table exists)
    // For now, return default 98%
    const satisfactionRate = 98;

    return {
      categories: categoriesData.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        type: cat.type,
        icon: cat.icon,
        parentId: cat.parentId,
        listingCount: Number(/** @type {any} */ (cat.listingCount)) || 0,
      })),
      featuredListings: featuredListingsWithCategories,
      stats: {
        activeListings: Number(activeListingsCount) || 0,
        verifiedSellers: Number(verifiedSellersCount) || 0,
        satisfactionRate,
      },
    };
  } catch (error) {
    console.error("Error loading home page data:", error);
    // Return empty data on error
    return {
      categories: [],
      featuredListings: [],
      stats: {
        activeListings: 0,
        verifiedSellers: 0,
        satisfactionRate: 98,
      },
    };
  }
}
