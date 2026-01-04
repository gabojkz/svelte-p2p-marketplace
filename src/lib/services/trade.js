import { get, post, patch } from './api.js';

/**
 * Trade service - handles all trade-related API calls
 */

/**
 * Fetches a trade by listing ID, buyer ID, and seller ID
 * @param {string|number} listingId - The listing ID
 * @param {string|number} buyerId - The buyer ID
 * @param {string|number} sellerId - The seller ID
 * @returns {Promise<Object|null>} - The trade object or null if not found
 */
export async function fetchTrade(listingId, buyerId, sellerId) {
  try {
    const data = await get(
      `/api/trades?listingId=${listingId}&buyerId=${buyerId}&sellerId=${sellerId}`
    );

    const { trade } = data;
    if (trade && trade.length > 0) {
      return trade[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching trade:", error);
    throw error;
  }
}

/**
 * Creates a new trade
 * @param {Object} tradeData - The trade data
 * @returns {Promise<Object>} - The created trade object
 */
export async function createTrade(tradeData) {
  const data = await post('/api/trades', tradeData);
  return data.trade || data;
}

/**
 * Confirms a trade
 * @param {string|number} tradeId - The trade ID
 * @returns {Promise<Object>} - The updated trade
 */
export async function confirmTrade(tradeId) {
  const data = await patch(`/api/trades/${tradeId}/confirm`);
  return data.trade || data;
}

/**
 * Rejects a trade
 * @param {string|number} tradeId - The trade ID
 * @returns {Promise<Object>} - The updated trade
 */
export async function rejectTrade(tradeId) {
  const data = await patch(`/api/trades/${tradeId}/reject`);
  return data.trade || data;
}

/**
 * Marks a trade as complete
 * @param {string|number} tradeId - The trade ID
 * @returns {Promise<Object>} - The updated trade
 */
export async function completeTrade(tradeId) {
  const data = await patch(`/api/trades/${tradeId}/complete`);
  return data.trade || data;
}

/**
 * Submits a review for a trade
 * @param {string|number} tradeId - The trade ID
 * @param {Object} reviewData - The review data
 * @returns {Promise<Object>} - The created review
 */
export async function submitReview(tradeId, reviewData) {
  const data = await post(`/api/trades/${tradeId}/reviews`, reviewData);
  return data.review || data;
}
