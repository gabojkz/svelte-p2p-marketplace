import { json, error } from '@sveltejs/kit';
import { listings, users, listingImages } from '$lib/server/schema';
import { eq, sql } from 'drizzle-orm';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request, locals }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const listingId = Number(params.id);

	// Get marketplace user
	const [marketplaceUser] = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, locals.user.id))
		.limit(1);

	if (!marketplaceUser) {
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

	if (listing.userId !== marketplaceUser.id) {
		throw error(403, 'Access denied');
	}

	const body = await request.json();
	const { images } = body;

	if (!Array.isArray(images) || images.length === 0) {
		return json({ error: 'No images provided' }, { status: 400 });
	}

	try {
		// Get current image count to set display order
		const [currentCount] = await db
			.select({ count: sql`count(*)::int` })
			.from(listingImages)
			.where(eq(listingImages.listingId, listingId));

		const existingCount = currentCount?.count || 0;

		// Insert images
		const newImages = await db
			.insert(listingImages)
			.values(
				images.map((img, index) => ({
					listingId: listingId,
					imageUrl: img.imageUrl,
					thumbnailUrl: img.thumbnailUrl || img.imageUrl,
					displayOrder: existingCount + index,
					isPrimary: img.isPrimary === true && index === 0
				}))
			)
			.returning();

		// If this is the first image, ensure it's marked as primary
		if (existingCount === 0 && newImages.length > 0) {
			await db
				.update(listingImages)
				.set({ isPrimary: true })
				.where(eq(listingImages.id, newImages[0].id));
		}

		return json({ success: true, images: newImages });
	} catch (err) {
		console.error('Error uploading images:', err);
		return json({ error: 'Failed to upload images' }, { status: 500 });
	}
}

