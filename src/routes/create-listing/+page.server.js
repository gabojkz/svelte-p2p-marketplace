import { redirect } from "@sveltejs/kit";
import { categories } from "$lib/server/schema";
import { eq } from "drizzle-orm";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const db = locals.db;

  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.displayOrder, categories.name);

  if (!locals.session) {
    throw redirect(302, "/login");
  }

  return {
    session: locals.session,
    user: locals.user,
    categories: allCategories,
  };
}
