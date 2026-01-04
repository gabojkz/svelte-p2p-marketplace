import { get, post, del } from './api.js';

/**
 * Favorites service - handles all favorites-related API calls
 */

/**
 * Checks if a listing is favorited by the current user
 * @param {string|number} listingId - The listing ID
 * @returns {Promise<Object>} - Object with isFavorite boolean
 */
export async function checkFavorite(listingId) {
  try {
    const data = await get(`/api/favorites/${listingId}`);
    return { isFavorite: data.isFavorite || false };
  } catch (error) {
    // If not found or error, return false
    return { isFavorite: false };
  }
}

/**
 * Adds a listing to favorites
 * @param {string|number} listingId - The listing ID
 * @returns {Promise<Object>} - The favorite object
 */
export async function addFavorite(listingId) {
  const data = await post(`/api/favorites/${listingId}`, {});
  return data;
}

/**
 * Removes a listing from favorites
 * @param {string|number} listingId - The listing ID
 * @returns {Promise<Object>} - The deletion result
 */
export async function removeFavorite(listingId) {
  const data = await del(`/api/favorites/${listingId}`);
  return data;
}

/**
 * Toggles favorite status
 * @param {string|number} listingId - The listing ID
 * @param {boolean} currentStatus - Current favorite status
 * @returns {Promise<boolean>} - New favorite status
 */
export async function toggleFavorite(listingId, currentStatus) {
  if (currentStatus) {
    await removeFavorite(listingId);
    return false;
  } else {
    await addFavorite(listingId);
    return true;
  }
}

