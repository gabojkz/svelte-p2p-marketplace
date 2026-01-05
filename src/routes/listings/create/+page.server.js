import { redirect } from "@sveltejs/kit";
import { categories } from "$lib/server/schema";
import { eq } from "drizzle-orm";

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
  const { users } = await import("$lib/server/schema");
  const marketplaceUser = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, locals.user.id))
    .limit(1);

  if (marketplaceUser.length === 0) {
    throw redirect(302, "/marketplace?error=profile_required");
  }

  // Fetch all active categories
  const categoriesData = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.displayOrder, categories.name);

  return {
    session: locals.session,
    user: locals.user,
    marketplaceUser: marketplaceUser[0],
    categories: categoriesData,
  };
}

