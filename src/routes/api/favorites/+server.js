import { json, error } from '@sveltejs/kit';
import { favorites, listings, users, categories } from '$lib/server/schema';
import { eq, and, desc } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals }) {
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

	// Get all favorites for this user with listing details
	const userFavorites = await db
		.select({
			id: favorites.id,
			listingId: favorites.listingId,
			createdAt: favorites.createdAt,
			listing: listings,
			category: categories
		})
		.from(favorites)
		.innerJoin(listings, eq(favorites.listingId, listings.id))
		.leftJoin(categories, eq(listings.categoryId, categories.id))
		.where(eq(favorites.userId, marketplaceUser.id))
		.orderBy(desc(favorites.createdAt));

	return json({
		favorites: userFavorites.map(fav => ({
			id: fav.id,
			listingId: fav.listingId,
			createdAt: fav.createdAt,
			listing: {
				...fav.listing,
				category: fav.category
			}
		}))
	});
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const body = await request.json();
	const { listingId } = body;

	if (!listingId) {
		return json({ error: 'Listing ID is required' }, { status: 400 });
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

	// Check if listing exists
	const [listing] = await db
		.select()
		.from(listings)
		.where(eq(listings.id, Number(listingId)))
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
				eq(favorites.listingId, Number(listingId))
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
				listingId: Number(listingId)
			})
			.returning();

		// Update favorite count on listing
		await db
			.update(listings)
			.set({
				favoriteCount: (listing.favoriteCount || 0) + 1
			})
			.where(eq(listings.id, Number(listingId)));

		return json({ success: true, favorite: newFavorite });
	} catch (err) {
		console.error('Error adding favorite:', err);
		return json({ error: 'Failed to add favorite' }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ request, locals }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const body = await request.json();
	const { listingId } = body;

	if (!listingId) {
		return json({ error: 'Listing ID is required' }, { status: 400 });
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

	// Get listing to update favorite count
	const [listing] = await db
		.select()
		.from(listings)
		.where(eq(listings.id, Number(listingId)))
		.limit(1);

	// Delete favorite
	const deletedFavorites = await db
		.delete(favorites)
		.where(
			and(
				eq(favorites.userId, marketplaceUser.id),
				eq(favorites.listingId, Number(listingId))
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
			.where(eq(listings.id, Number(listingId)));
	}

	return json({ success: true });
}

