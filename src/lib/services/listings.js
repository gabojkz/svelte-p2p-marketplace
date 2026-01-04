import { get, post, put, patch, upload } from './api.js';

/**
 * Listing service - handles all listing-related API calls
 */

/**
 * Fetches a listing by ID
 * @param {string|number} listingId - The listing ID
 * @returns {Promise<Object>} - The listing object
 */
export async function getListing(listingId) {
  const data = await get(`/api/listings/${listingId}`);
  return data.listing;
}

/**
 * Creates a new listing
 * @param {Object} listingData - The listing data
 * @returns {Promise<Object>} - The created listing
 */
export async function createListing(listingData) {
  const data = await post('/api/listings', listingData);
  return data.listing || data;
}

/**
 * Updates an existing listing
 * @param {string|number} listingId - The listing ID
 * @param {Object} listingData - The updated listing data
 * @returns {Promise<Object>} - The updated listing
 */
export async function updateListing(listingId, listingData) {
  const data = await put(`/api/listings/${listingId}`, listingData);
  return data.listing || data;
}

/**
 * Updates listing status
 * @param {string|number} listingId - The listing ID
 * @param {string} status - The new status
 * @returns {Promise<Object>} - The updated listing
 */
export async function updateListingStatus(listingId, status) {
  const data = await patch(`/api/listings/${listingId}/status`, { status });
  return data.listing || data;
}

/**
 * Uploads images for a listing
 * @param {string|number} listingId - The listing ID
 * @param {FormData} formData - FormData containing image files
 * @returns {Promise<Object>} - The upload result
 */
export async function uploadListingImages(listingId, formData) {
  return upload(`/api/listings/${listingId}/images`, formData);
}

