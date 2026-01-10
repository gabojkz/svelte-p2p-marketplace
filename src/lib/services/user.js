import { get, post } from './api.js';

/**
 * User service - handles user profile and reporting API calls
 */

/**
 * Gets user profile data
 * @returns {Promise<Object>} - The user profile
 */
export async function getUserProfile() {
  const data = await get('/api/user/profile');
  // API returns { marketplaceUser: {...} }
  return data.marketplaceUser || data.user || data;
}

/**
 * Reports a user
 * @param {Object} reportData - The report data
 * @param {string|number} reportData.userId - The user ID to report
 * @param {string} reportData.issueType - The issue type
 * @param {string} reportData.title - The report title
 * @param {string} reportData.description - The report description
 * @returns {Promise<Object>} - The created report
 */
export async function reportUser(reportData) {
  const data = await post('/api/user/report', reportData);
  return data.report || data;
}

