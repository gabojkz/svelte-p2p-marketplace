/**
 * Pre-defined Zod schemas for common API endpoints
 * These schemas can be used to validate request bodies
 */

import { z } from 'zod';
import { validationSchemas } from './security.js';

// ============================================
// LISTING SCHEMAS
// ============================================

export const createListingSchema = z.object({
  categoryId: validationSchemas.id,
  subcategoryId: validationSchemas.id.optional().nullable(),
  type: z.enum(['product', 'service'], {
    errorMap: () => ({ message: 'Type must be either "product" or "service"' })
  }),
  title: validationSchemas.text(200),
  description: validationSchemas.html(5000),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'parts']).optional().nullable(),
  brand: validationSchemas.text(100).optional().nullable(),
  price: validationSchemas.price,
  priceType: z.enum(['fixed', 'negotiable', 'free', 'swap']).default('fixed'),
  acceptsOffers: z.boolean().default(false),
  locationCity: validationSchemas.location,
  locationPostcode: validationSchemas.postcode,
  locationLatitude: z.number().optional().nullable(),
  locationLongitude: z.number().optional().nullable(),
  deliveryCollection: z.boolean().default(true),
  deliveryLocal: z.boolean().default(false),
  deliveryShipping: z.boolean().default(false),
  status: z.enum(['draft', 'active', 'paused', 'sold', 'deleted']).default('draft'),
  featured: z.boolean().default(false),
  urgent: z.boolean().default(false),
});

export const updateListingSchema = createListingSchema.partial();

// ============================================
// USER PROFILE SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  firstName: validationSchemas.text(50).optional().nullable(),
  lastName: validationSchemas.text(50).optional().nullable(),
  bio: validationSchemas.html(500).optional().nullable(),
  phone: validationSchemas.phone.optional().nullable(),
  locationCity: validationSchemas.location.optional().nullable(),
  locationPostcode: validationSchemas.postcode.optional().nullable(),
  tiktok: validationSchemas.url.optional().nullable(),
  instagram: validationSchemas.url.optional().nullable(),
  whatsapp: validationSchemas.text(20).optional().nullable(),
  telegram: validationSchemas.text(50).optional().nullable(),
});

// ============================================
// REPORT/DISPUTE SCHEMAS
// ============================================

export const createReportSchema = z.object({
  reportedUserId: validationSchemas.id,
  issueType: z.enum(['spam', 'fraud', 'harassment', 'inappropriate', 'other']),
  title: validationSchemas.text(200),
  description: validationSchemas.text(2000).refine(
    (val) => val.length >= 20,
    { message: 'Description must be at least 20 characters' }
  ),
  listingId: validationSchemas.id.optional().nullable(),
  context: z.enum(['listing', 'trade', 'profile']).default('listing'),
});

export const createDisputeSchema = z.object({
  tradeId: validationSchemas.id,
  reportedUserId: validationSchemas.id,
  issueType: z.enum(['no_response', 'no_show', 'item_not_as_described', 'payment_issue', 'other']),
  title: validationSchemas.text(200),
  description: validationSchemas.text(2000).refine(
    (val) => val.length >= 20,
    { message: 'Description must be at least 20 characters' }
  ),
});

// ============================================
// MESSAGE/CONVERSATION SCHEMAS
// ============================================

export const createMessageSchema = z.object({
  content: validationSchemas.text(2000),
  type: z.enum(['text', 'system', 'location', 'attachment']).default('text'),
});

export const createConversationSchema = z.object({
  listingId: validationSchemas.id,
  sellerId: validationSchemas.id,
});

// ============================================
// TRADE SCHEMAS
// ============================================

export const createTradeSchema = z.object({
  listingId: validationSchemas.id,
  sellerId: validationSchemas.id,
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: validationSchemas.text(1000).optional().nullable(),
  wouldRecommend: z.boolean().optional(),
});

// ============================================
// AUTH SCHEMAS
// ============================================

export const validateEmailSchema = z.object({
  email: validationSchemas.email,
});

export const forgotPasswordSchema = z.object({
  email: validationSchemas.email,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: validationSchemas.email,
  password: validationSchemas.password,
});

// ============================================
// EXPORT ALL SCHEMAS
// ============================================

export const schemas = {
  listing: {
    create: createListingSchema,
    update: updateListingSchema,
  },
  profile: {
    update: updateProfileSchema,
  },
  report: {
    create: createReportSchema,
  },
  dispute: {
    create: createDisputeSchema,
  },
  message: {
    create: createMessageSchema,
  },
  conversation: {
    create: createConversationSchema,
  },
  trade: {
    create: createTradeSchema,
    review: createReviewSchema,
  },
  auth: {
    validateEmail: validateEmailSchema,
    forgotPassword: forgotPasswordSchema,
    resetPassword: resetPasswordSchema,
  },
};

