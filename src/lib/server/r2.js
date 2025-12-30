/**
 * Cloudflare R2 Storage Utility
 * Handles file uploads to R2 buckets
 */

/**
 * Get R2 bucket from platform environment
 * @param {any} platform - Platform environment (Cloudflare Workers/Pages)
 * @returns {R2Bucket | null}
 */
export function getR2Bucket(platform) {
	if (!platform?.env?.R2_BUCKET) {
		return null;
	}
	return platform.env.R2_BUCKET;
}

/**
 * Generate a unique file path for an image
 * @param {string} listingId - Listing ID
 * @param {string} filename - Original filename
 * @param {boolean} isThumbnail - Whether this is a thumbnail
 * @returns {string}
 */
export function generateImagePath(listingId, filename, isThumbnail = false) {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 9);
	const ext = filename.split('.').pop() || 'jpg';
	const prefix = isThumbnail ? 'thumb' : 'full';
	return `listings/${listingId}/${prefix}-${timestamp}-${random}.${ext}`;
}

/**
 * Upload a file to R2
 * @param {R2Bucket} bucket - R2 bucket instance
 * @param {string} key - Object key (path)
 * @param {ArrayBuffer | Uint8Array | ReadableStream} body - File content
 * @param {string} contentType - MIME type
 * @param {Record<string, string>} metadata - Optional metadata
 * @returns {Promise<string>} Public URL
 */
export async function uploadToR2(bucket, key, body, contentType, metadata = {}) {
	await bucket.put(key, body, {
		httpMetadata: {
			contentType: contentType,
			cacheControl: 'public, max-age=31536000' // Cache for 1 year
		},
		customMetadata: metadata
	});

	// Return public URL (assuming R2 public bucket or custom domain)
	// You'll need to configure this based on your R2 setup
	const publicUrl = getR2PublicUrl(key);
	return publicUrl;
}

/**
 * Get public URL for an R2 object
 * @param {string} key - Object key
 * @returns {string}
 */
export function getR2PublicUrl(key) {
	// Option 1: Use R2 public bucket URL
	// Format: https://<account-id>.r2.cloudflarestorage.com/<bucket-name>/<key>
	const accountId = process.env.R2_ACCOUNT_ID || '';
	const bucketName = process.env.R2_BUCKET_NAME || 'marketplace-images';
	
	// Option 2: Use custom domain (recommended)
	// Format: https://<custom-domain>/<key>
	const customDomain = process.env.R2_PUBLIC_URL || '';
	
	if (customDomain) {
		return `${customDomain}/${key}`;
	}
	
	// Fallback to R2 public URL
	if (accountId) {
		return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;
	}
	
	// If no public URL configured, return the key (you'll need to set up public access)
	return key;
}

/**
 * Delete a file from R2
 * @param {R2Bucket} bucket - R2 bucket instance
 * @param {string} key - Object key
 * @returns {Promise<void>}
 */
export async function deleteFromR2(bucket, key) {
	await bucket.delete(key);
}

/**
 * Create a thumbnail from an image
 * Note: This is a placeholder - you may want to use a service like Cloudflare Images
 * or process thumbnails client-side before uploading
 * @param {File} file - Image file
 * @param {number} maxSize - Maximum dimension in pixels
 * @returns {Promise<File>}
 */
export async function createThumbnail(file, maxSize = 300) {
	// This is a simplified version - you might want to use a proper image processing library
	// For now, we'll return the original file and handle thumbnails client-side
	return file;
}

