import { json, error } from '@sveltejs/kit';
import { listings, users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request, locals }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const listingId = Number(params.id);
	const body = await request.json();
	const { status } = body;

	if (!status || !['active', 'paused', 'draft', 'sold', 'deleted'].includes(status)) {
		throw error(400, 'Invalid status');
	}

	// Get marketplace user
	const marketplaceUser = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (marketplaceUser.length === 0) {
		throw error(400, 'User profile not found');
	}

	// Verify listing belongs to user
	const [listing] = await db
		.select()
		.from(listings)
		.where(eq(listings.id, listingId))
		.limit(1);

	if (!listing) {
		throw error(404, 'Listing not found');
	}

	if (listing.userId !== marketplaceUser[0].id) {
		throw error(403, 'Access denied');
	}

	// Update listing status
	await db
		.update(listings)
		.set({
			status: status,
			updatedAt: new Date(),
			publishedAt: status === 'active' && !listing.publishedAt ? new Date() : listing.publishedAt
		})
		.where(eq(listings.id, listingId));

	return json({ success: true, status });
}

