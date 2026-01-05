/**
 * Security Utilities for Input Validation and Sanitization
 * 
 * This module provides comprehensive input validation and sanitization
 * to prevent SQL injection, XSS attacks, and other security vulnerabilities.
 * 
 * Libraries used:
 * - zod: Schema validation (TypeScript-friendly)
 * - validator: String validation and sanitization
 * - DOMPurify: HTML sanitization (XSS prevention)
 */

import { z } from 'zod';
import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

// ============================================
// VALIDATION SCHEMAS (Zod)
// ============================================

/**
 * Common validation schemas
 */
export const validationSchemas = {
  // Email validation
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  
  // Username validation (alphanumeric, underscore, hyphen, 3-30 chars)
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  // Password validation (min 8 chars, at least one letter and one number)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  // Text input (sanitized, max length)
  text: (maxLength = 500) => z.string()
    .max(maxLength, `Text must be less than ${maxLength} characters`)
    .transform(val => sanitizeText(val)),
  
  // HTML content (sanitized)
  html: (maxLength = 5000) => z.string()
    .max(maxLength, `Content must be less than ${maxLength} characters`)
    .transform(val => sanitizeHTML(val)),
  
  // URL validation
  url: z.string().url('Invalid URL format').max(2048, 'URL too long'),
  
  // Phone number (basic validation)
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number too short')
    .max(20, 'Phone number too long'),
  
  // Price (positive number)
  price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format')
    .transform(val => parseFloat(val))
    .refine(val => val >= 0, 'Price cannot be negative'),
  
  // Integer ID
  id: z.string().regex(/^\d+$/, 'Invalid ID format').transform(val => parseInt(val, 10)),
  
  // Location (city/postcode)
  location: z.string()
    .min(2, 'Location too short')
    .max(100, 'Location too long')
    .regex(/^[a-zA-Z0-9\s\-\'\.]+$/, 'Invalid location format'),
  
  // Postcode (UK format)
  postcode: z.string()
    .regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, 'Invalid postcode format')
    .max(10, 'Postcode too long'),
};

// ============================================
// SANITIZATION FUNCTIONS
// ============================================

/**
 * Sanitize plain text input
 * Removes HTML tags and dangerous characters
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeText(input) {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>'"&]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitize HTML content (allows safe HTML)
 * Uses DOMPurify to prevent XSS attacks
 * @param {string} input - HTML string to sanitize
 * @param {Object} options - DOMPurify options
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(input, options = {}) {
  if (!input || typeof input !== 'string') return '';
  
  const defaultOptions = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
    ...options
  };
  
  return DOMPurify.sanitize(input, defaultOptions);
}

/**
 * Sanitize and escape SQL special characters
 * Note: Drizzle ORM uses parameterized queries, but this adds extra safety
 * @param {string} input - Input string
 * @returns {string} Escaped string
 */
export function sanitizeSQL(input) {
  if (!input || typeof input !== 'string') return '';
  
  // Remove SQL injection patterns
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /('|(\\')|(;)|(\\)|(\/\*)|(\*\/)|(--))/g
  ];
  
  let sanitized = input;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
}

/**
 * Sanitize filename to prevent path traversal
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return 'file';
  
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[\/\\]/g, '_');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');
  
  // Limit length
  sanitized = sanitized.substring(0, 255);
  
  return sanitized || 'file';
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  return validator.isEmail(email);
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export function isValidURL(url) {
  return validator.isURL(url, { require_protocol: false });
}

/**
 * Validate and sanitize input using a Zod schema
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @returns {{success: boolean, data?: any, error?: string}}
 */
export function validateWithSchema(schema, data) {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        success: false, 
        error: firstError?.message || 'Validation failed' 
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

/**
 * Validate input length
 * @param {string} input - Input string
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} True if valid
 */
export function validateLength(input, min = 0, max = Infinity) {
  if (typeof input !== 'string') return false;
  const length = input.trim().length;
  return length >= min && length <= max;
}

/**
 * Check if string contains only safe characters
 * @param {string} input - Input string
 * @param {RegExp} allowedPattern - Pattern of allowed characters
 * @returns {boolean} True if safe
 */
export function isSafeString(input, allowedPattern = /^[a-zA-Z0-9\s\-_.,!?@#$%&*()+=\[\]{}:;"'<>\/\\|`~]*$/) {
  if (typeof input !== 'string') return false;
  return allowedPattern.test(input);
}

// ============================================
// INPUT PROCESSING
// ============================================

/**
 * Process and sanitize user input for database storage
 * @param {string} input - Raw input
 * @param {Object} options - Processing options
 * @returns {string} Processed input
 */
export function processInput(input, options = {}) {
  const {
    type = 'text', // 'text', 'html', 'sql', 'filename'
    maxLength = 1000,
    allowHTML = false,
    trim = true
  } = options;
  
  if (!input || typeof input !== 'string') return '';
  
  let processed = input;
  
  // Trim if requested
  if (trim) {
    processed = processed.trim();
  }
  
  // Apply type-specific sanitization
  switch (type) {
    case 'html':
      processed = sanitizeHTML(processed);
      break;
    case 'sql':
      processed = sanitizeSQL(processed);
      break;
    case 'filename':
      processed = sanitizeFilename(processed);
      break;
    case 'text':
    default:
      processed = sanitizeText(processed);
      break;
  }
  
  // Enforce max length
  if (maxLength && processed.length > maxLength) {
    processed = processed.substring(0, maxLength);
  }
  
  return processed;
}

/**
 * Validate and sanitize form data
 * @param {Object} data - Form data object
 * @param {Object} rules - Validation rules
 * @returns {{valid: boolean, data?: Object, errors?: Object}}
 */
export function validateFormData(data, rules) {
  const errors = {};
  const sanitized = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    // Check required
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    // Skip if not required and empty
    if (!rule.required && (!value || value.trim() === '')) {
      sanitized[field] = null;
      continue;
    }
    
    // Sanitize
    const processed = processInput(value, {
      type: rule.type || 'text',
      maxLength: rule.maxLength
    });
    
    // Validate length
    if (rule.minLength && processed.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
      continue;
    }
    
    if (rule.maxLength && processed.length > rule.maxLength) {
      errors[field] = `${field} must be less than ${rule.maxLength} characters`;
      continue;
    }
    
    // Type-specific validation
    if (rule.type === 'email' && !isValidEmail(processed)) {
      errors[field] = 'Invalid email format';
      continue;
    }
    
    if (rule.type === 'url' && !isValidURL(processed)) {
      errors[field] = 'Invalid URL format';
      continue;
    }
    
    if (rule.pattern && !rule.pattern.test(processed)) {
      errors[field] = rule.errorMessage || `Invalid ${field} format`;
      continue;
    }
    
    sanitized[field] = processed;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    data: sanitized,
    errors
  };
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // Sanitization
  sanitizeText,
  sanitizeHTML,
  sanitizeSQL,
  sanitizeFilename,
  processInput,
  
  // Validation
  isValidEmail,
  isValidURL,
  validateWithSchema,
  validateLength,
  isSafeString,
  validateFormData,
  
  // Schemas
  schemas: validationSchemas
};

