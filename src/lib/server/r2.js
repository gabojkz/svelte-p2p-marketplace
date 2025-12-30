/**
 * Cloudflare R2 Storage Utility
 * Handles file uploads to R2 buckets with local file system fallback for development
 */

import { writeFile, mkdir, readFile, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Local storage directory for development
const LOCAL_STORAGE_DIR = join(process.cwd(), 'static', 'uploads');

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
 * Check if we're in local development mode (no R2 bucket available)
 * @param {any} platform - Platform environment
 * @returns {boolean}
 */
export function isLocalDevelopment(platform) {
	return !platform?.env?.R2_BUCKET;
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
 * Upload a file to local file system (for development)
 * @param {string} key - Object key (path)
 * @param {ArrayBuffer} body - File content
 * @returns {Promise<string>} Public URL
 */
async function uploadToLocal(key, body) {
	const filePath = join(LOCAL_STORAGE_DIR, key);
	const fileDir = dirname(filePath);
	
	// Ensure directory exists
	await mkdir(fileDir, { recursive: true });
	
	// Write file
	await writeFile(filePath, Buffer.from(body));
	
	// Return local URL path
	return `/uploads/${key}`;
}

/**
 * Upload a file to R2 or local file system
 * @param {R2Bucket | null} bucket - R2 bucket instance (null for local dev)
 * @param {string} key - Object key (path)
 * @param {ArrayBuffer | Uint8Array | ReadableStream} body - File content
 * @param {string} contentType - MIME type
 * @param {Record<string, string>} metadata - Optional metadata
 * @returns {Promise<string>} Public URL
 */
export async function uploadToR2(bucket, key, body, contentType, metadata = {}) {
	// If no bucket, use local file system (development mode)
	if (!bucket) {
		// Convert body to ArrayBuffer if needed
		let arrayBuffer;
		if (body instanceof ArrayBuffer) {
			arrayBuffer = body;
		} else if (body instanceof Uint8Array) {
			arrayBuffer = body.buffer;
		} else if (body instanceof ReadableStream) {
			const chunks = [];
			const reader = body.getReader();
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				chunks.push(value);
			}
			const allChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
			let offset = 0;
			for (const chunk of chunks) {
				allChunks.set(chunk, offset);
				offset += chunk.length;
			}
			arrayBuffer = allChunks.buffer;
		} else {
			throw new Error('Unsupported body type');
		}
		
		return await uploadToLocal(key, arrayBuffer);
	}

	// Production: Upload to R2
	await bucket.put(key, body, {
		httpMetadata: {
			contentType: contentType,
			cacheControl: 'public, max-age=31536000' // Cache for 1 year
		},
		customMetadata: metadata
	});

	// Return public URL (assuming R2 public bucket or custom domain)
	const publicUrl = getR2PublicUrl(key);
	return publicUrl;
}

/**
 * Get public URL for an R2 object or local file
 * @param {string} key - Object key
 * @param {boolean} isLocal - Whether we're in local development mode
 * @returns {string}
 */
export function getR2PublicUrl(key, isLocal = false) {
	// Local development: return local path
	if (isLocal) {
		return `/uploads/${key}`;
	}
	
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
 * Delete a file from local file system (for development)
 * @param {string} key - Object key (path)
 * @returns {Promise<void>}
 */
async function deleteFromLocal(key) {
	const filePath = join(LOCAL_STORAGE_DIR, key);
	try {
		await unlink(filePath);
	} catch (err) {
		// File might not exist, ignore error
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}
}

/**
 * Delete a file from R2 or local file system
 * @param {R2Bucket | null} bucket - R2 bucket instance (null for local dev)
 * @param {string} key - Object key
 * @returns {Promise<void>}
 */
export async function deleteFromR2(bucket, key) {
	if (!bucket) {
		// Local development: delete from file system
		await deleteFromLocal(key);
		return;
	}
	
	// Production: delete from R2
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

