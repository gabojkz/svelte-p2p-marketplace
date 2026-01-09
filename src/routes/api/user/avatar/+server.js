import { json, error } from '@sveltejs/kit';
import { users } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { getR2Bucket, generateImagePath, uploadToR2, getR2PublicUrl, isLocalDevelopment } from '$lib/server/r2.js';

/**
 * Generate a unique file path for a user avatar
 * @param {string} userId - User ID
 * @param {string} filename - Original filename
 * @returns {string}
 */
function generateAvatarPath(userId, filename) {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 9);
	const ext = filename.split('.').pop() || 'jpg';
	return `avatars/${userId}/avatar-${timestamp}-${random}.${ext}`;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals, platform }) {
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

	const bucket = getR2Bucket(platform);
	const isLocal = isLocalDevelopment(platform);

	try {
		// Parse FormData
		const formData = await request.formData();
		const file = formData.get('avatar');

		if (!file || !(file instanceof File)) {
			return json({ error: 'No avatar file provided' }, { status: 400 });
		}

		// Validate file type
		const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
		if (!validTypes.includes(file.type)) {
			return json({ error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.' }, { status: 400 });
		}

		// Validate file size (max 2MB for avatars)
		const maxSize = 2 * 1024 * 1024; // 2MB
		if (file.size > maxSize) {
			return json({ error: 'File size must be less than 2MB' }, { status: 400 });
		}

		// Generate path
		const avatarPath = generateAvatarPath(marketplaceUser.id.toString(), file.name);

		// Read file as ArrayBuffer
		const arrayBuffer = await file.arrayBuffer();

		// Upload to R2 or local storage
		const avatarUrl = await uploadToR2(
			bucket,
			avatarPath,
			arrayBuffer,
			file.type,
			{
				originalName: file.name,
				userId: marketplaceUser.id.toString(),
				uploadedBy: marketplaceUser.id.toString()
			},
			platform
		);

		// Delete old avatar if it exists
		if (marketplaceUser.avatarUrl) {
			try {
				// Extract path from URL for deletion
				// URL format: /uploads/avatars/userId/avatar-timestamp-random.ext
				// or: https://domain.com/avatars/userId/avatar-timestamp-random.ext
				let oldPath = marketplaceUser.avatarUrl;
				if (oldPath.startsWith('/uploads/')) {
					// Local path: /uploads/avatars/userId/avatar-timestamp-random.ext
					oldPath = oldPath.replace('/uploads/', '');
				} else if (oldPath.includes('/avatars/')) {
					// Remote URL: extract path after domain
					const parts = oldPath.split('/avatars/');
					if (parts.length > 1) {
						oldPath = `avatars/${parts[1]}`;
					}
				}
				
				if (bucket && !isLocal) {
					await bucket.delete(oldPath);
				} else {
					// Local file deletion
					const { unlink } = await import('fs/promises');
					const { join } = await import('path');
					const LOCAL_STORAGE_DIR = join(process.cwd(), 'static', 'uploads');
					const oldFilePath = join(LOCAL_STORAGE_DIR, oldPath);
					try {
						await unlink(oldFilePath);
					} catch (unlinkErr) {
						// File might not exist, ignore error
						console.warn('Could not delete old avatar:', unlinkErr);
					}
				}
			} catch (deleteErr) {
				console.warn('Error deleting old avatar:', deleteErr);
				// Continue with update even if deletion fails
			}
		}

		// Update user avatar URL in database
		await db
			.update(users)
			.set({
				avatarUrl: avatarUrl,
				updatedAt: new Date()
			})
			.where(eq(users.id, marketplaceUser.id));

		return json({ success: true, avatarUrl: avatarUrl });
	} catch (err) {
		console.error('Error uploading avatar:', err);
		return json({ error: 'Failed to upload avatar' }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ request, locals, platform }) {
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

	if (!marketplaceUser.avatarUrl) {
		return json({ error: 'No avatar to delete' }, { status: 400 });
	}

	try {
		const bucket = getR2Bucket(platform);
		const isLocal = isLocalDevelopment(platform);

		// Extract path from URL for deletion
		// URL format: /uploads/avatars/userId/avatar-timestamp-random.ext
		// or: https://domain.com/avatars/userId/avatar-timestamp-random.ext
		let avatarPath = marketplaceUser.avatarUrl;
		if (avatarPath.startsWith('/uploads/')) {
			// Local path: /uploads/avatars/userId/avatar-timestamp-random.ext
			avatarPath = avatarPath.replace('/uploads/', '');
		} else if (avatarPath.includes('/avatars/')) {
			// Remote URL: extract path after domain
			const parts = avatarPath.split('/avatars/');
			if (parts.length > 1) {
				avatarPath = `avatars/${parts[1]}`;
			}
		}

		// Delete from R2 or local storage
		try {
			if (bucket && !isLocal) {
				await bucket.delete(avatarPath);
			} else {
				// Local file deletion
				const { deleteFromR2 } = await import('$lib/server/r2.js');
				await deleteFromR2(null, avatarPath);
			}
		} catch (deleteErr) {
			console.warn('Error deleting avatar file:', deleteErr);
			// Continue with database update even if file deletion fails
		}

		// Update user to remove avatar URL
		await db
			.update(users)
			.set({
				avatarUrl: null,
				updatedAt: new Date()
			})
			.where(eq(users.id, marketplaceUser.id));

		return json({ success: true, message: 'Avatar deleted successfully' });
	} catch (err) {
		console.error('Error deleting avatar:', err);
		return json({ error: 'Failed to delete avatar' }, { status: 500 });
	}
}

