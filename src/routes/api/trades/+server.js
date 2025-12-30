import { json, error } from "@sveltejs/kit";
import { listings, users, categories } from "$lib/server/schema";
import { eq } from "drizzle-orm";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
  if (!locals.session || !locals.user) {
    throw error(401, "Unauthorized");
  }

  const db = locals.db;
  if (!db) {
    throw error(500, "Database not available");
  }

  const body = await request.json();

  console.log(body);

  try {
    // return json({ success: true, listing: newListing });
  } catch (err) {
    console.error("Error creating listing:", err);
    // return json({ error: "Failed to create listing" }, { status: 500 });
  }
}
