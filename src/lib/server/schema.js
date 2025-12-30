import {
	pgTable,
	text,
	timestamp,
	boolean,
	bigint,
	varchar,
	pgEnum,
	decimal,
	integer,
	jsonb,
	index,
	unique
} from 'drizzle-orm/pg-core';
import { relations, and, or, desc, eq } from 'drizzle-orm';

// ============================================
// Better Auth required tables
// ============================================
export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// ============================================
// P2P Marketplace Tables
// ============================================

// Enums
export const kycStatusEnum = pgEnum('kyc_status', ['pending', 'verified', 'rejected']);
export const listingTypeEnum = pgEnum('listing_type', ['product', 'service']);
export const conditionEnum = pgEnum('condition', ['new', 'like-new', 'good', 'fair', 'parts']);
export const priceTypeEnum = pgEnum('price_type', ['fixed', 'negotiable', 'free', 'swap']);
export const listingStatusEnum = pgEnum('listing_status', ['draft', 'active', 'paused', 'sold', 'deleted']);
export const tradeStatusEnum = pgEnum('trade_status', [
	'initiated',
	'payment_pending',
	'paid',
	'in_progress',
	'completed',
	'cancelled',
	'disputed'
]);
export const escrowStatusEnum = pgEnum('escrow_status', ['reserved', 'released', 'refunded']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'system', 'location', 'attachment']);
export const disputeIssueTypeEnum = pgEnum('dispute_issue_type', [
	'no_response',
	'no_show',
	'wrong_item',
	'scam',
	'other'
]);
export const disputeStatusEnum = pgEnum('dispute_status', ['open', 'investigating', 'resolved', 'closed']);
export const kycDocumentTypeEnum = pgEnum('kyc_document_type', [
	'passport',
	'driver_license',
	'national_id',
	'utility_bill'
]);
export const kycDocumentStatusEnum = pgEnum('kyc_document_status', ['pending', 'approved', 'rejected']);
export const transactionTypeEnum = pgEnum('transaction_type', [
	'deposit',
	'withdrawal',
	'trade_payment',
	'trade_receipt',
	'refund'
]);
export const cryptoTypeEnum = pgEnum('crypto_type', ['BTC', 'ETH', 'USDT']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'cancelled']);
export const paymentMethodTypeEnum = pgEnum('payment_method_type', [
	'bank_transfer',
	'venmo',
	'zelle',
	'paypal',
	'cash_app',
	'other'
]);
export const notificationTypeEnum = pgEnum('notification_type', [
	'trade_started',
	'trade_message',
	'trade_completed',
	'review_received',
	'dispute_opened',
	'listing_sold'
]);

// 1. users (extended user profile - marketplace-specific data only)
// Note: email, password, and emailVerified are stored in 'user' and 'account' tables (Better Auth)
export const users = pgTable(
	'users',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		authUserId: text('auth_user_id')
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: 'cascade' }),
		username: varchar('username', { length: 100 }).notNull().unique(),
		firstName: varchar('first_name', { length: 100 }),
		lastName: varchar('last_name', { length: 100 }),
		phone: varchar('phone', { length: 20 }),
		phoneVerified: boolean('phone_verified').default(false),
		avatarUrl: varchar('avatar_url', { length: 500 }),
		bio: text('bio'),
		locationCity: varchar('location_city', { length: 100 }),
		locationPostcode: varchar('location_postcode', { length: 20 }),
		locationLatitude: decimal('location_latitude', { precision: 10, scale: 8 }),
		locationLongitude: decimal('location_longitude', { precision: 11, scale: 8 }),
		kycStatus: kycStatusEnum('kyc_status').default('pending'),
		kycVerifiedAt: timestamp('kyc_verified_at'),
		twoFactorEnabled: boolean('two_factor_enabled').default(false),
		isActive: boolean('is_active').default(true),
		isBanned: boolean('is_banned').default(false),
		lastLoginAt: timestamp('last_login_at'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		usernameIdx: index('idx_username').on(table.username),
		locationIdx: index('idx_location').on(table.locationLatitude, table.locationLongitude)
	})
);

// 2. categories
export const categories = pgTable(
	'categories',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		name: varchar('name', { length: 100 }).notNull().unique(),
		slug: varchar('slug', { length: 100 }).notNull().unique(),
		type: listingTypeEnum('type').notNull(),
		icon: varchar('icon', { length: 50 }),
		parentId: bigint('parent_id', { mode: 'number' }).references(() => categories.id),
		displayOrder: integer('display_order').default(0),
		isActive: boolean('is_active').default(true),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		typeIdx: index('idx_categories_type').on(table.type),
		parentIdx: index('idx_categories_parent').on(table.parentId)
	})
);

// 3. listings
export const listings = pgTable(
	'listings',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		userId: bigint('user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		categoryId: bigint('category_id', { mode: 'number' })
			.notNull()
			.references(() => categories.id),
		subcategoryId: bigint('subcategory_id', { mode: 'number' }).references(() => categories.id),
		type: listingTypeEnum('type').notNull(),
		title: varchar('title', { length: 200 }).notNull(),
		description: text('description').notNull(),
		condition: conditionEnum('condition'),
		brand: varchar('brand', { length: 100 }),
		price: decimal('price', { precision: 12, scale: 2 }).notNull(),
		priceType: priceTypeEnum('price_type').default('fixed'),
		acceptsOffers: boolean('accepts_offers').default(false),
		locationCity: varchar('location_city', { length: 100 }).notNull(),
		locationPostcode: varchar('location_postcode', { length: 20 }).notNull(),
		locationLatitude: decimal('location_latitude', { precision: 10, scale: 8 }),
		locationLongitude: decimal('location_longitude', { precision: 11, scale: 8 }),
		deliveryCollection: boolean('delivery_collection').default(true),
		deliveryLocal: boolean('delivery_local').default(false),
		deliveryShipping: boolean('delivery_shipping').default(false),
		status: listingStatusEnum('status').default('draft'),
		featured: boolean('featured').default(false),
		urgent: boolean('urgent').default(false),
		viewCount: integer('view_count').default(0),
		favoriteCount: integer('favorite_count').default(0),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
		publishedAt: timestamp('published_at'),
		soldAt: timestamp('sold_at')
	},
	(table) => ({
		userIdx: index('idx_listings_user').on(table.userId),
		categoryIdx: index('idx_listings_category').on(table.categoryId),
		statusIdx: index('idx_listings_status').on(table.status),
		locationIdx: index('idx_listings_location').on(table.locationLatitude, table.locationLongitude),
		priceIdx: index('idx_listings_price').on(table.price),
		createdIdx: index('idx_listings_created').on(table.createdAt)
		// Full-text search would be handled via PostgreSQL full-text search functions
	})
);

// 4. listing_images
export const listingImages = pgTable(
	'listing_images',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		listingId: bigint('listing_id', { mode: 'number' })
			.notNull()
			.references(() => listings.id, { onDelete: 'cascade' }),
		imageUrl: varchar('image_url', { length: 500 }).notNull(),
		thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
		displayOrder: integer('display_order').default(0),
		isPrimary: boolean('is_primary').default(false),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		listingIdx: index('idx_listing_images_listing').on(table.listingId),
		orderIdx: index('idx_listing_images_order').on(table.listingId, table.displayOrder)
	})
);

// 5. listing_attributes
export const listingAttributes = pgTable(
	'listing_attributes',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		listingId: bigint('listing_id', { mode: 'number' })
			.notNull()
			.references(() => listings.id, { onDelete: 'cascade' }),
		attributeKey: varchar('attribute_key', { length: 100 }).notNull(),
		attributeValue: varchar('attribute_value', { length: 255 }).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		listingIdx: index('idx_listing_attributes_listing').on(table.listingId),
		keyIdx: index('idx_listing_attributes_key').on(table.listingId, table.attributeKey)
	})
);

// 6. trades
export const trades = pgTable(
	'trades',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		tradeNumber: varchar('trade_number', { length: 20 }).notNull().unique(),
		listingId: bigint('listing_id', { mode: 'number' })
			.notNull()
			.references(() => listings.id),
		sellerId: bigint('seller_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		buyerId: bigint('buyer_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
		currency: varchar('currency', { length: 10 }).default('GBP'),
		status: tradeStatusEnum('status').default('initiated'),
		escrowStatus: escrowStatusEnum('escrow_status').default('reserved'),
		meetingScheduledAt: timestamp('meeting_scheduled_at'),
		meetingLocation: varchar('meeting_location', { length: 255 }),
		completedAt: timestamp('completed_at'),
		cancelledAt: timestamp('cancelled_at'),
		cancellationReason: text('cancellation_reason'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		tradeNumberIdx: index('idx_trades_trade_number').on(table.tradeNumber),
		listingIdx: index('idx_trades_listing').on(table.listingId),
		sellerIdx: index('idx_trades_seller').on(table.sellerId),
		buyerIdx: index('idx_trades_buyer').on(table.buyerId),
		statusIdx: index('idx_trades_status').on(table.status),
		createdIdx: index('idx_trades_created').on(table.createdAt)
	})
);

// 7. conversations (for buyer-seller chat about listings)
export const conversations = pgTable(
	'conversations',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		listingId: bigint('listing_id', { mode: 'number' })
			.references(() => listings.id, { onDelete: 'cascade' }),
		buyerId: bigint('buyer_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		sellerId: bigint('seller_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		lastMessageAt: timestamp('last_message_at'),
		lastMessagePreview: varchar('last_message_preview', { length: 200 }),
		buyerUnreadCount: integer('buyer_unread_count').default(0),
		sellerUnreadCount: integer('seller_unread_count').default(0),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		listingIdx: index('idx_conversations_listing').on(table.listingId),
		buyerIdx: index('idx_conversations_buyer').on(table.buyerId),
		sellerIdx: index('idx_conversations_seller').on(table.sellerId),
		lastMessageIdx: index('idx_conversations_last_message').on(table.lastMessageAt)
	})
);

// 8. messages (messages in conversations)
export const messages = pgTable(
	'messages',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		conversationId: bigint('conversation_id', { mode: 'number' })
			.notNull()
			.references(() => conversations.id, { onDelete: 'cascade' }),
		senderId: bigint('sender_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		content: text('content').notNull(),
		isRead: boolean('is_read').default(false),
		readAt: timestamp('read_at'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		conversationIdx: index('idx_messages_conversation').on(table.conversationId),
		senderIdx: index('idx_messages_sender').on(table.senderId),
		createdIdx: index('idx_messages_created').on(table.conversationId, table.createdAt)
	})
);

// 9. trade_messages
export const tradeMessages = pgTable(
	'trade_messages',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		tradeId: bigint('trade_id', { mode: 'number' })
			.notNull()
			.references(() => trades.id, { onDelete: 'cascade' }),
		userId: bigint('user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		messageType: messageTypeEnum('message_type').default('text'),
		content: text('content'),
		attachmentUrl: varchar('attachment_url', { length: 500 }),
		isRead: boolean('is_read').default(false),
		readAt: timestamp('read_at'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		tradeIdx: index('idx_trade_messages_trade').on(table.tradeId),
		userIdx: index('idx_trade_messages_user').on(table.userId),
		createdIdx: index('idx_trade_messages_created').on(table.tradeId, table.createdAt)
	})
);

// 8. trade_status_history
export const tradeStatusHistory = pgTable(
	'trade_status_history',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		tradeId: bigint('trade_id', { mode: 'number' })
			.notNull()
			.references(() => trades.id, { onDelete: 'cascade' }),
		oldStatus: varchar('old_status', { length: 50 }),
		newStatus: varchar('new_status', { length: 50 }).notNull(),
		changedByUserId: bigint('changed_by_user_id', { mode: 'number' }).references(() => users.id),
		notes: text('notes'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		tradeIdx: index('idx_trade_status_history_trade').on(table.tradeId),
		createdIdx: index('idx_trade_status_history_created').on(table.createdAt)
	})
);

// 9. reviews
export const reviews = pgTable(
	'reviews',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		tradeId: bigint('trade_id', { mode: 'number' })
			.notNull()
			.references(() => trades.id),
		reviewerId: bigint('reviewer_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		revieweeId: bigint('reviewee_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		rating: integer('rating').notNull(), // 1-5 stars
		title: varchar('title', { length: 200 }),
		comment: text('comment'),
		isPublic: boolean('is_public').default(true),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		tradeIdx: index('idx_reviews_trade').on(table.tradeId),
		reviewerIdx: index('idx_reviews_reviewer').on(table.reviewerId),
		revieweeIdx: index('idx_reviews_reviewee').on(table.revieweeId),
		ratingIdx: index('idx_reviews_rating').on(table.rating)
	})
);

// 10. disputes
export const disputes = pgTable(
	'disputes',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		tradeId: bigint('trade_id', { mode: 'number' })
			.notNull()
			.references(() => trades.id),
		reportedByUserId: bigint('reported_by_user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		reportedAgainstUserId: bigint('reported_against_user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		issueType: disputeIssueTypeEnum('issue_type').notNull(),
		title: varchar('title', { length: 200 }).notNull(),
		description: text('description').notNull(),
		status: disputeStatusEnum('status').default('open'),
		resolution: text('resolution'),
		resolvedByAdminId: bigint('resolved_by_admin_id', { mode: 'number' }).references(() => users.id),
		resolvedAt: timestamp('resolved_at'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		tradeIdx: index('idx_disputes_trade').on(table.tradeId),
		reportedByIdx: index('idx_disputes_reported_by').on(table.reportedByUserId),
		statusIdx: index('idx_disputes_status').on(table.status)
	})
);

// 11. dispute_evidence
export const disputeEvidence = pgTable(
	'dispute_evidence',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		disputeId: bigint('dispute_id', { mode: 'number' })
			.notNull()
			.references(() => disputes.id, { onDelete: 'cascade' }),
		uploadedByUserId: bigint('uploaded_by_user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		fileUrl: varchar('file_url', { length: 500 }).notNull(),
		fileType: varchar('file_type', { length: 50 }),
		description: text('description'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		disputeIdx: index('idx_dispute_evidence_dispute').on(table.disputeId)
	})
);

// 12. wallets
export const wallets = pgTable(
	'wallets',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		userId: bigint('user_id', { mode: 'number' })
			.notNull()
			.unique()
			.references(() => users.id, { onDelete: 'cascade' }),
		btcBalance: decimal('btc_balance', { precision: 18, scale: 8 }).default('0'),
		ethBalance: decimal('eth_balance', { precision: 18, scale: 8 }).default('0'),
		usdtBalance: decimal('usdt_balance', { precision: 18, scale: 8 }).default('0'),
		totalBalanceUsd: decimal('total_balance_usd', { precision: 12, scale: 2 }).default('0'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		userIdx: index('idx_wallets_user').on(table.userId)
	})
);

// 13. transactions
export const transactions = pgTable(
	'transactions',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		userId: bigint('user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id),
		tradeId: bigint('trade_id', { mode: 'number' }).references(() => trades.id),
		type: transactionTypeEnum('type').notNull(),
		cryptoType: cryptoTypeEnum('crypto_type').notNull(),
		amount: decimal('amount', { precision: 18, scale: 8 }).notNull(),
		amountUsd: decimal('amount_usd', { precision: 12, scale: 2 }),
		status: transactionStatusEnum('status').default('pending'),
		transactionHash: varchar('transaction_hash', { length: 255 }),
		fromAddress: varchar('from_address', { length: 255 }),
		toAddress: varchar('to_address', { length: 255 }),
		notes: text('notes'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		completedAt: timestamp('completed_at')
	},
	(table) => ({
		userIdx: index('idx_transactions_user').on(table.userId),
		tradeIdx: index('idx_transactions_trade').on(table.tradeId),
		typeIdx: index('idx_transactions_type').on(table.type),
		statusIdx: index('idx_transactions_status').on(table.status),
		createdIdx: index('idx_transactions_created').on(table.createdAt)
	})
);

// 14. payment_methods
export const paymentMethods = pgTable(
	'payment_methods',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		userId: bigint('user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: paymentMethodTypeEnum('type').notNull(),
		label: varchar('label', { length: 100 }),
		accountDetails: text('account_details'), // Encrypted
		isVerified: boolean('is_verified').default(false),
		isActive: boolean('is_active').default(true),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		userIdx: index('idx_payment_methods_user').on(table.userId),
		typeIdx: index('idx_payment_methods_type').on(table.type)
	})
);

// 15. listing_payment_methods
export const listingPaymentMethods = pgTable(
	'listing_payment_methods',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		listingId: bigint('listing_id', { mode: 'number' })
			.notNull()
			.references(() => listings.id, { onDelete: 'cascade' }),
		paymentMethodType: paymentMethodTypeEnum('payment_method_type').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		listingIdx: index('idx_listing').on(table.listingId)
	})
);

// 16. favorites
export const favorites = pgTable(
	'favorites',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		userId: bigint('user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		listingId: bigint('listing_id', { mode: 'number' })
			.notNull()
			.references(() => listings.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		userIdx: index('idx_favorites_user').on(table.userId),
		listingIdx: index('idx_favorites_listing').on(table.listingId),
		userListingUnique: unique('idx_favorites_user_listing').on(table.userId, table.listingId)
	})
);

// 17. kyc_documents
export const kycDocuments = pgTable(
	'kyc_documents',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		userId: bigint('user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		documentType: kycDocumentTypeEnum('document_type').notNull(),
		fileUrl: varchar('file_url', { length: 500 }).notNull(),
		status: kycDocumentStatusEnum('status').default('pending'),
		rejectionReason: text('rejection_reason'),
		reviewedByAdminId: bigint('reviewed_by_admin_id', { mode: 'number' }).references(() => users.id),
		reviewedAt: timestamp('reviewed_at'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		userIdx: index('idx_kyc_documents_user').on(table.userId),
		statusIdx: index('idx_kyc_documents_status').on(table.status)
	})
);

// 18. notifications
export const notifications = pgTable(
	'notifications',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		userId: bigint('user_id', { mode: 'number' })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: notificationTypeEnum('type').notNull(),
		title: varchar('title', { length: 200 }).notNull(),
		message: text('message'),
		relatedTradeId: bigint('related_trade_id', { mode: 'number' }).references(() => trades.id),
		relatedListingId: bigint('related_listing_id', { mode: 'number' }).references(() => listings.id),
		isRead: boolean('is_read').default(false),
		readAt: timestamp('read_at'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		userIdx: index('idx_notifications_user').on(table.userId),
		readIdx: index('idx_notifications_read').on(table.userId, table.isRead),
		createdIdx: index('idx_notifications_created').on(table.createdAt)
	})
);

// 19. user_settings
export const userSettings = pgTable(
	'user_settings',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		userId: bigint('user_id', { mode: 'number' })
			.notNull()
			.unique()
			.references(() => users.id, { onDelete: 'cascade' }),
		emailNotifications: boolean('email_notifications').default(true),
		pushNotifications: boolean('push_notifications').default(true),
		smsNotifications: boolean('sms_notifications').default(false),
		showEmail: boolean('show_email').default(false),
		showPhone: boolean('show_phone').default(false),
		currencyPreference: varchar('currency_preference', { length: 10 }).default('GBP'),
		language: varchar('language', { length: 10 }).default('en'),
		timezone: varchar('timezone', { length: 50 }).default('UTC'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		userIdx: index('idx_user_settings_user').on(table.userId)
	})
);

// 20. search_history
export const searchHistory = pgTable(
	'search_history',
	{
		id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
		userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }),
		searchQuery: varchar('search_query', { length: 255 }),
		categoryId: bigint('category_id', { mode: 'number' }).references(() => categories.id),
		filtersJson: jsonb('filters_json'),
		resultsCount: integer('results_count'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		userIdx: index('idx_search_history_user').on(table.userId),
		createdIdx: index('idx_search_history_created').on(table.createdAt)
	})
);

// ============================================
// Relations (for Drizzle ORM)
// ============================================

export const usersRelations = relations(users, ({ one, many }) => ({
	authUser: one(user, {
		fields: [users.authUserId],
		references: [user.id]
	}),
	listings: many(listings),
	sellerTrades: many(trades, { relationName: 'seller' }),
	buyerTrades: many(trades, { relationName: 'buyer' }),
	tradeMessages: many(tradeMessages),
	reviewsAsReviewer: many(reviews, { relationName: 'reviewer' }),
	reviewsAsReviewee: many(reviews, { relationName: 'reviewee' }),
	disputesAsReporter: many(disputes, { relationName: 'reporter' }),
	disputesAsReported: many(disputes, { relationName: 'reported' }),
	wallet: one(wallets),
	transactions: many(transactions),
	paymentMethods: many(paymentMethods),
	favorites: many(favorites),
	kycDocuments: many(kycDocuments),
	notifications: many(notifications),
	settings: one(userSettings),
	buyerConversations: many(conversations, { relationName: 'buyer' }),
	sellerConversations: many(conversations, { relationName: 'seller' }),
	sentMessages: many(messages)
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
	parent: one(categories, {
		fields: [categories.parentId],
		references: [categories.id],
		relationName: 'parent'
	}),
	children: many(categories, { relationName: 'children' }),
	listings: many(listings),
	subcategoryListings: many(listings, { relationName: 'subcategory' })
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
	user: one(users, {
		fields: [listings.userId],
		references: [users.id]
	}),
	category: one(categories, {
		fields: [listings.categoryId],
		references: [categories.id]
	}),
	subcategory: one(categories, {
		fields: [listings.subcategoryId],
		references: [categories.id],
		relationName: 'subcategory'
	}),
	images: many(listingImages),
	attributes: many(listingAttributes),
	trades: many(trades),
	paymentMethods: many(listingPaymentMethods),
	favorites: many(favorites),
	conversations: many(conversations)
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
	listing: one(listings, {
		fields: [conversations.listingId],
		references: [listings.id]
	}),
	buyer: one(users, {
		fields: [conversations.buyerId],
		references: [users.id],
		relationName: 'buyer'
	}),
	seller: one(users, {
		fields: [conversations.sellerId],
		references: [users.id],
		relationName: 'seller'
	}),
	messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ one }) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	sender: one(users, {
		fields: [messages.senderId],
		references: [users.id]
	})
}));

export const tradesRelations = relations(trades, ({ one, many }) => ({
	listing: one(listings, {
		fields: [trades.listingId],
		references: [listings.id]
	}),
	seller: one(users, {
		fields: [trades.sellerId],
		references: [users.id],
		relationName: 'seller'
	}),
	buyer: one(users, {
		fields: [trades.buyerId],
		references: [users.id],
		relationName: 'buyer'
	}),
	messages: many(tradeMessages),
	statusHistory: many(tradeStatusHistory),
	reviews: many(reviews),
	disputes: many(disputes),
	transactions: many(transactions)
}));
