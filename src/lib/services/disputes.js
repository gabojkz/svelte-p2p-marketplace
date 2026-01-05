import { post } from './api.js';

/**
 * Disputes service - handles dispute-related API calls
 */

/**
 * Creates a new dispute
 * @param {Object} disputeData - The dispute data
 * @param {string|number} disputeData.tradeId - The trade ID
 * @param {string|number} disputeData.reportedByUserId - The user reporting
 * @param {string|number} disputeData.reportedAgainstUserId - The user being reported
 * @param {string} disputeData.issueType - The issue type
 * @param {string} disputeData.title - The dispute title
 * @param {string} disputeData.description - The dispute description
 * @returns {Promise<Object>} - The created dispute
 */
export async function createDispute(disputeData) {
  const data = await post('/api/disputes', disputeData);
  return data.dispute || data;
}

