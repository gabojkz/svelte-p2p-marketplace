import { json, error } from '@sveltejs/kit';
import { favorites, listings, users } from '$lib/server/schema';
import { eq, and } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, locals }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	// Get marketplace user
	const [marketplaceUser] = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (!marketplaceUser) {
		throw error(400, 'User profile not found');
	}

	const listingId = Number(params.listingId);

	// Check if listing is favorited
	const [favorite] = await db
		.select()
		.from(favorites)
		.where(
			and(
				eq(favorites.userId, marketplaceUser.id),
				eq(favorites.listingId, listingId)
			)
		)
		.limit(1);

	return json({ isFavorite: !!favorite });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, locals }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	// Get marketplace user
	const [marketplaceUser] = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (!marketplaceUser) {
		throw error(400, 'User profile not found');
	}

	const listingId = Number(params.listingId);

	// Check if listing exists
	const [listing] = await db
		.select()
		.from(listings)
		.where(eq(listings.id, listingId))
		.limit(1);

	if (!listing) {
		return json({ error: 'Listing not found' }, { status: 404 });
	}

	// Check if already favorited
	const [existingFavorite] = await db
		.select()
		.from(favorites)
		.where(
			and(
				eq(favorites.userId, marketplaceUser.id),
				eq(favorites.listingId, listingId)
			)
		)
		.limit(1);

	if (existingFavorite) {
		return json({ error: 'Listing already in favorites' }, { status: 400 });
	}

	try {
		// Add to favorites
		const [newFavorite] = await db
			.insert(favorites)
			.values({
				userId: marketplaceUser.id,
				listingId: listingId
			})
			.returning();

		// Update favorite count on listing
		await db
			.update(listings)
			.set({
				favoriteCount: (listing.favoriteCount || 0) + 1
			})
			.where(eq(listings.id, listingId));

		return json({ success: true, favorite: newFavorite });
	} catch (err) {
		console.error('Error adding favorite:', err);
		return json({ error: 'Failed to add favorite' }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, locals }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	// Get marketplace user
	const [marketplaceUser] = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (!marketplaceUser) {
		throw error(400, 'User profile not found');
	}

	const listingId = Number(params.listingId);

	// Get listing to update favorite count
	const [listing] = await db
		.select()
		.from(listings)
		.where(eq(listings.id, listingId))
		.limit(1);

	// Delete favorite
	const deletedFavorites = await db
		.delete(favorites)
		.where(
			and(
				eq(favorites.userId, marketplaceUser.id),
				eq(favorites.listingId, listingId)
			)
		)
		.returning();

	if (deletedFavorites.length === 0) {
		return json({ error: 'Favorite not found' }, { status: 404 });
	}

	// Update favorite count on listing
	if (listing && listing.favoriteCount > 0) {
		await db
			.update(listings)
			.set({
				favoriteCount: Math.max(0, (listing.favoriteCount || 0) - 1)
			})
			.where(eq(listings.id, listingId));
	}

	return json({ success: true });
}

