/**
 * API Validation Helper
 * Provides a middleware-like function to validate request bodies
 */

import { json, error } from '@sveltejs/kit';
import { validateWithSchema } from './security.js';

/**
 * Validate request body against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {any} body - Request body to validate
 * @returns {Object} Validated and sanitized data
 * @throws {Response} Returns error response if validation fails
 */
export function validateRequestBody(schema, body) {
  const result = validateWithSchema(schema, body);
  
  if (!result.success) {
    throw error(400, {
      message: result.error || 'Invalid request data',
      fieldErrors: { _general: result.error }
    });
  }
  
  return result.data;
}

/**
 * Validate and sanitize request body, returning errors in API format
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {any} body - Request body to validate
 * @returns {{valid: boolean, data?: any, errors?: Object}}
 */
export function validateRequestBodySafe(schema, body) {
  const result = validateWithSchema(schema, body);
  
  if (!result.success) {
    return {
      valid: false,
      errors: {
        error: result.error || 'Invalid request data',
        fieldErrors: { _general: result.error }
      }
    };
  }
  
  return {
    valid: true,
    data: result.data
  };
}

