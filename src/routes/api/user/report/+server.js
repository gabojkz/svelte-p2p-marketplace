import { json, error } from "@sveltejs/kit";
import { users, listings } from "$lib/server/schema";
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
  if (!body.reportedUserId) {
    throw error(400, "Reported user ID is required");
  }
  if (!body.issueType) {
    throw error(400, "Issue type is required");
  }
  if (!body.title || body.title.trim().length === 0) {
    throw error(400, "Title is required");
  }
  if (!body.description || body.description.trim().length < 20) {
    throw error(400, "Description must be at least 20 characters");
  }

  const reportedUserId = Number(body.reportedUserId);

  // Verify user is not reporting themselves
  if (reportedUserId === marketplaceUser.id) {
    throw error(400, "You cannot report yourself");
  }

  // Verify reported user exists
  const [reportedUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, reportedUserId))
    .limit(1);

  if (!reportedUser) {
    throw error(404, "Reported user not found");
  }

  // If listingId is provided, verify it exists and belongs to the reported user
  if (body.listingId) {
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, Number(body.listingId)))
      .limit(1);

    if (!listing) {
      throw error(404, "Listing not found");
    }

    if (listing.userId !== reportedUserId) {
      throw error(400, "Listing does not belong to the reported user");
    }
  }

  // For now, we'll log the report and return success
  // In a production system, you would save this to a reports table
  console.log("User Report Submitted:", {
    reportedBy: marketplaceUser.id,
    reportedUser: reportedUserId,
    listingId: body.listingId || null,
    issueType: body.issueType,
    title: body.title,
    description: body.description,
    context: body.context || "listing",
    timestamp: new Date().toISOString()
  });

  // TODO: Save to a user_reports table in the database
  // For now, we'll just return success

  return json({ 
    success: true, 
    message: "Report submitted successfully. Our team will review it shortly." 
  });
}

