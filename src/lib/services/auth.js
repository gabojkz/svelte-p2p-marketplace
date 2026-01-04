import { post } from './api.js';

/**
 * Auth service - handles authentication-related API calls
 */

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {Promise<Object>} - Validation result
 */
export async function validateEmail(email) {
  const data = await post('/api/auth/validate-email', { email });
  return data;
}

/**
 * Sends a forgot password email
 * @param {string} email - The email address
 * @returns {Promise<Object>} - The response
 */
export async function forgotPassword(email) {
  const data = await post('/api/auth/forgot-password', { email });
  return data;
}

/**
 * Resets a password using a token
 * @param {string} token - The reset token
 * @param {string} password - The new password
 * @returns {Promise<Object>} - The response
 */
export async function resetPassword(token, password) {
  const data = await post('/api/auth/reset-password', { token, password });
  return data;
}

