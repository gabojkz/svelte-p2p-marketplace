import { get, post } from './api.js';

/**
 * Conversations service - handles all conversation and message-related API calls
 */

/**
 * Creates or gets a conversation for a listing
 * @param {Object} conversationData - Conversation data
 * @param {string|number} conversationData.listingId - The listing ID
 * @param {string|number} conversationData.sellerId - The seller ID
 * @returns {Promise<Object>} - The conversation object
 */
export async function createOrGetConversation(conversationData) {
  const data = await post('/api/conversations', conversationData);
  return data.conversation || data;
}

/**
 * Sends a message in a conversation
 * @param {string|number} conversationId - The conversation ID
 * @param {string} content - The message content
 * @returns {Promise<Object>} - The created message
 */
export async function sendMessage(conversationId, content) {
  const data = await post(`/api/conversations/${conversationId}/messages`, { content });
  return data.message || data;
}

