import { json, error } from '@sveltejs/kit';
import { listings, users, listingImages } from '$lib/server/schema.js';
import { eq, sql } from 'drizzle-orm';
import { getR2Bucket, generateImagePath, uploadToR2, getR2PublicUrl, isLocalDevelopment } from '$lib/server/r2.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request, locals, platform }) {
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

	// Get R2 bucket (null in local development)
	const bucket = getR2Bucket(platform);
	const isLocal = isLocalDevelopment(platform);

	try {
		// Parse FormData
		const formData = await request.formData();
		const files = formData.getAll('images');

		if (!files || files.length === 0) {
			return json({ error: 'No images provided' }, { status: 400 });
		}

		// Get current image count to set display order
		const [currentCount] = await db
			.select({ count: sql`count(*)::int` })
			.from(listingImages)
			.where(eq(listingImages.listingId, listingId));

		const existingCount = currentCount?.count || 0;

		// Upload images to R2 and create database records
		const uploadedImages = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			
			if (!(file instanceof File)) {
				continue;
			}

			// Validate file type
			const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
			if (!validTypes.includes(file.type)) {
				console.error(`Invalid file type: ${file.type}`);
				continue;
			}

			// Validate file size (max 5MB)
			const maxSize = 5 * 1024 * 1024; // 5MB
			if (file.size > maxSize) {
				console.error(`File too large: ${file.size} bytes`);
				continue;
			}

			// Generate paths
			const fullImagePath = generateImagePath(listingId.toString(), file.name, false);
			const thumbnailPath = generateImagePath(listingId.toString(), file.name, true);

			// Read file as ArrayBuffer
			const arrayBuffer = await file.arrayBuffer();

			// Upload full image to R2 or local storage
			const fullImageUrl = await uploadToR2(
				bucket,
				fullImagePath,
				arrayBuffer,
				file.type,
				{
					originalName: file.name,
					listingId: listingId.toString(),
					uploadedBy: marketplaceUser.id.toString()
				},
				platform
			);

			// For thumbnails, we'll use the same image for now
			// In production, you might want to generate actual thumbnails
			// You could use Cloudflare Images API or process on the client side
			const thumbnailUrl = fullImageUrl; // Placeholder - replace with actual thumbnail URL

			// Create database record
			const [newImage] = await db
				.insert(listingImages)
				.values({
					listingId: listingId,
					imageUrl: fullImageUrl,
					thumbnailUrl: thumbnailUrl,
					displayOrder: existingCount + uploadedImages.length,
					isPrimary: existingCount === 0 && uploadedImages.length === 0
				})
				.returning();

			uploadedImages.push(newImage);
		}

		if (uploadedImages.length === 0) {
			return json({ error: 'No valid images were uploaded' }, { status: 400 });
		}

		// If this is the first image, ensure it's marked as primary
		if (existingCount === 0 && uploadedImages.length > 0) {
			await db
				.update(listingImages)
				.set({ isPrimary: true })
				.where(eq(listingImages.id, uploadedImages[0].id));
		}

		return json({ success: true, images: uploadedImages });
	} catch (err) {
		console.error('Error uploading images:', err);
		return json({ error: 'Failed to upload images' }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, request, locals, platform }) {
	if (!locals.session || !locals.user) {
		throw error(401, 'Unauthorized');
	}

	const db = locals.db;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const listingId = Number(params.id);
	const { imageId } = await request.json();

	if (!imageId) {
		return json({ error: 'Image ID required' }, { status: 400 });
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

	// Verify listing belongs to user
	const [listing] = await db
		.select()
		.from(listings)
		.where(eq(listings.id, listingId))
		.limit(1);

	if (!listing || listing.userId !== marketplaceUser.id) {
		throw error(403, 'Access denied');
	}

	// Get image record
	const [image] = await db
		.select()
		.from(listingImages)
		.where(eq(listingImages.id, imageId))
		.limit(1);

	if (!image || image.listingId !== listingId) {
		throw error(404, 'Image not found');
	}

	try {
		// Delete from R2 or local storage
		const bucket = getR2Bucket(platform);
		const isLocal = isLocalDevelopment(platform);
		
		if (bucket || isLocal) {
			// Extract key from URL
			const imageUrl = image.imageUrl;
			const customDomain = process.env.R2_PUBLIC_URL || '';
			
			let key = imageUrl;
			if (isLocal) {
				// Local: extract from /uploads/listings/...
				if (imageUrl.startsWith('/uploads/')) {
					key = imageUrl.replace('/uploads/', '');
				}
			} else if (customDomain && imageUrl.startsWith(customDomain)) {
				key = imageUrl.replace(customDomain + '/', '');
			} else {
				// Extract key from R2 URL format
				const urlParts = imageUrl.split('/');
				const listingsIndex = urlParts.indexOf('listings');
				if (listingsIndex !== -1) {
					key = urlParts.slice(listingsIndex).join('/');
				}
			}

			try {
				if (bucket) {
					await bucket.delete(key);
				} else {
					// Local development: use deleteFromR2 which handles local deletion
					const { deleteFromR2 } = await import('$lib/server/r2.js');
					await deleteFromR2(null, key);
				}
				
				// Also delete thumbnail if different
				if (image.thumbnailUrl && image.thumbnailUrl !== image.imageUrl) {
					let thumbKey = image.thumbnailUrl;
					if (isLocal && image.thumbnailUrl.startsWith('/uploads/')) {
						thumbKey = image.thumbnailUrl.replace('/uploads/', '');
					} else if (customDomain && image.thumbnailUrl.startsWith(customDomain)) {
						thumbKey = image.thumbnailUrl.replace(customDomain + '/', '');
					}
					if (bucket) {
						await bucket.delete(thumbKey);
					} else {
						const { deleteFromR2 } = await import('$lib/server/r2.js');
						await deleteFromR2(null, thumbKey);
					}
				}
			} catch (r2Error) {
				console.error('Error deleting from R2:', r2Error);
				// Continue with database deletion even if R2 deletion fails
			}
		}

		// Delete from database
		await db
			.delete(listingImages)
			.where(eq(listingImages.id, imageId));

		return json({ success: true });
	} catch (err) {
		console.error('Error deleting image:', err);
		return json({ error: 'Failed to delete image' }, { status: 500 });
	}
}
