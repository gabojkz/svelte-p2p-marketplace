# P2P Marketplace - Database Schema

## Overview
This document outlines all database models, table names, and relationships for the P2P Marketplace application.

---

## Core Tables

### 1. **users**
User accounts and authentication

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | User ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| username | VARCHAR(100) | UNIQUE, NOT NULL | Display username |
| first_name | VARCHAR(100) | | First name |
| last_name | VARCHAR(100) | | Last name |
| phone | VARCHAR(20) | | Phone number |
| phone_verified | BOOLEAN | DEFAULT FALSE | Phone verification status |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| avatar_url | VARCHAR(500) | | Profile picture URL |
| bio | TEXT | | User biography |
| location_city | VARCHAR(100) | | City |
| location_postcode | VARCHAR(20) | | Postcode |
| location_latitude | DECIMAL(10,8) | | GPS latitude |
| location_longitude | DECIMAL(11,8) | | GPS longitude |
| kyc_status | ENUM | DEFAULT 'pending' | KYC status: pending, verified, rejected |
| kyc_verified_at | TIMESTAMP | NULL | KYC verification timestamp |
| two_factor_enabled | BOOLEAN | DEFAULT FALSE | 2FA status |
| is_active | BOOLEAN | DEFAULT TRUE | Account active status |
| is_banned | BOOLEAN | DEFAULT FALSE | Account ban status |
| last_login_at | TIMESTAMP | NULL | Last login timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Indexes:**
- `idx_email` on `email`
- `idx_username` on `username`
- `idx_location` on `location_latitude`, `location_longitude`

---

### 2. **categories**
Product and service categories

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Category ID |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Category name |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly slug |
| type | ENUM | NOT NULL | 'product' or 'service' |
| icon | VARCHAR(50) | | Emoji or icon identifier |
| parent_id | BIGINT | FOREIGN KEY | Parent category (for subcategories) |
| display_order | INT | DEFAULT 0 | Display order |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Update date |

**Relationships:**
- `parent_id` → `categories.id` (self-referential)

**Indexes:**
- `idx_type` on `type`
- `idx_parent` on `parent_id`

---

### 3. **listings**
Product/service listings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Listing ID |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | Seller ID |
| category_id | BIGINT | FOREIGN KEY, NOT NULL | Category ID |
| subcategory_id | BIGINT | FOREIGN KEY, NULL | Subcategory ID |
| type | ENUM | NOT NULL | 'product' or 'service' |
| title | VARCHAR(200) | NOT NULL | Listing title |
| description | TEXT | NOT NULL | Full description |
| condition | ENUM | | Condition: new, like-new, good, fair, parts |
| brand | VARCHAR(100) | | Brand name |
| price | DECIMAL(12,2) | NOT NULL | Price |
| price_type | ENUM | DEFAULT 'fixed' | fixed, negotiable, free, swap |
| accepts_offers | BOOLEAN | DEFAULT FALSE | Accept offers below asking |
| location_city | VARCHAR(100) | NOT NULL | City |
| location_postcode | VARCHAR(20) | NOT NULL | Postcode |
| location_latitude | DECIMAL(10,8) | | GPS latitude |
| location_longitude | DECIMAL(11,8) | | GPS longitude |
| delivery_collection | BOOLEAN | DEFAULT TRUE | Collection only |
| delivery_local | BOOLEAN | DEFAULT FALSE | Local delivery available |
| delivery_shipping | BOOLEAN | DEFAULT FALSE | Nationwide shipping |
| status | ENUM | DEFAULT 'draft' | draft, active, paused, sold, deleted |
| featured | BOOLEAN | DEFAULT FALSE | Featured listing |
| urgent | BOOLEAN | DEFAULT FALSE | Quick sale badge |
| view_count | INT | DEFAULT 0 | View counter |
| favorite_count | INT | DEFAULT 0 | Favorite counter |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Update date |
| published_at | TIMESTAMP | NULL | Publication date |
| sold_at | TIMESTAMP | NULL | Sale date |

**Relationships:**
- `user_id` → `users.id`
- `category_id` → `categories.id`
- `subcategory_id` → `categories.id`

**Indexes:**
- `idx_user` on `user_id`
- `idx_category` on `category_id`
- `idx_status` on `status`
- `idx_location` on `location_latitude`, `location_longitude`
- `idx_price` on `price`
- `idx_created` on `created_at`
- Full-text index on `title`, `description`

---

### 4. **listing_images**
Listing photos

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Image ID |
| listing_id | BIGINT | FOREIGN KEY, NOT NULL | Listing ID |
| image_url | VARCHAR(500) | NOT NULL | Image URL |
| thumbnail_url | VARCHAR(500) | | Thumbnail URL |
| display_order | INT | DEFAULT 0 | Display order |
| is_primary | BOOLEAN | DEFAULT FALSE | Primary image |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload date |

**Relationships:**
- `listing_id` → `listings.id` ON DELETE CASCADE

**Indexes:**
- `idx_listing` on `listing_id`
- `idx_order` on `listing_id`, `display_order`

---

### 5. **listing_attributes**
Dynamic attributes (e.g., vehicle details, electronics specs)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Attribute ID |
| listing_id | BIGINT | FOREIGN KEY, NOT NULL | Listing ID |
| attribute_key | VARCHAR(100) | NOT NULL | Attribute name (e.g., 'year', 'mileage') |
| attribute_value | VARCHAR(255) | NOT NULL | Attribute value |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |

**Relationships:**
- `listing_id` → `listings.id` ON DELETE CASCADE

**Indexes:**
- `idx_listing` on `listing_id`
- `idx_key` on `listing_id`, `attribute_key`

---

### 6. **trades**
Trading transactions between users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Trade ID |
| trade_number | VARCHAR(20) | UNIQUE, NOT NULL | Trade reference (e.g., TR-78234) |
| listing_id | BIGINT | FOREIGN KEY, NOT NULL | Listing ID |
| seller_id | BIGINT | FOREIGN KEY, NOT NULL | Seller user ID |
| buyer_id | BIGINT | FOREIGN KEY, NOT NULL | Buyer user ID |
| amount | DECIMAL(12,2) | NOT NULL | Trade amount |
| currency | VARCHAR(10) | DEFAULT 'GBP' | Currency code |
| status | ENUM | DEFAULT 'initiated' | initiated, payment_pending, paid, in_progress, completed, cancelled, disputed |
| escrow_status | ENUM | DEFAULT 'reserved' | reserved, released, refunded |
| meeting_scheduled_at | TIMESTAMP | NULL | Scheduled meeting time |
| meeting_location | VARCHAR(255) | | Meeting address |
| completed_at | TIMESTAMP | NULL | Completion timestamp |
| cancelled_at | TIMESTAMP | NULL | Cancellation timestamp |
| cancellation_reason | TEXT | | Cancellation reason |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Trade start date |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update |

**Relationships:**
- `listing_id` → `listings.id`
- `seller_id` → `users.id`
- `buyer_id` → `users.id`

**Indexes:**
- `idx_trade_number` on `trade_number`
- `idx_listing` on `listing_id`
- `idx_seller` on `seller_id`
- `idx_buyer` on `buyer_id`
- `idx_status` on `status`
- `idx_created` on `created_at`

---

### 7. **trade_messages**
Chat messages in trade rooms

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Message ID |
| trade_id | BIGINT | FOREIGN KEY, NOT NULL | Trade ID |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | Sender user ID |
| message_type | ENUM | DEFAULT 'text' | text, system, location, attachment |
| content | TEXT | | Message content |
| attachment_url | VARCHAR(500) | | Attachment URL |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| read_at | TIMESTAMP | NULL | Read timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

**Relationships:**
- `trade_id` → `trades.id` ON DELETE CASCADE
- `user_id` → `users.id`

**Indexes:**
- `idx_trade` on `trade_id`
- `idx_user` on `user_id`
- `idx_created` on `trade_id`, `created_at`

---

### 8. **trade_status_history**
Trade status change history

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | History ID |
| trade_id | BIGINT | FOREIGN KEY, NOT NULL | Trade ID |
| old_status | VARCHAR(50) | | Previous status |
| new_status | VARCHAR(50) | NOT NULL | New status |
| changed_by_user_id | BIGINT | FOREIGN KEY, NULL | User who changed status |
| notes | TEXT | | Change notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Change timestamp |

**Relationships:**
- `trade_id` → `trades.id` ON DELETE CASCADE
- `changed_by_user_id` → `users.id`

**Indexes:**
- `idx_trade` on `trade_id`
- `idx_created` on `created_at`

---

### 9. **reviews**
User reviews and ratings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Review ID |
| trade_id | BIGINT | FOREIGN KEY, NOT NULL | Trade ID |
| reviewer_id | BIGINT | FOREIGN KEY, NOT NULL | Reviewer user ID |
| reviewee_id | BIGINT | FOREIGN KEY, NOT NULL | Reviewed user ID |
| rating | TINYINT | NOT NULL | Rating (1-5 stars) |
| title | VARCHAR(200) | | Review title |
| comment | TEXT | | Review text |
| is_public | BOOLEAN | DEFAULT TRUE | Public visibility |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Review date |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Update date |

**Relationships:**
- `trade_id` → `trades.id`
- `reviewer_id` → `users.id`
- `reviewee_id` → `users.id`

**Indexes:**
- `idx_trade` on `trade_id`
- `idx_reviewer` on `reviewer_id`
- `idx_reviewee` on `reviewee_id`
- `idx_rating` on `rating`

---

### 10. **disputes**
Dispute resolution cases

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Dispute ID |
| trade_id | BIGINT | FOREIGN KEY, NOT NULL | Trade ID |
| reported_by_user_id | BIGINT | FOREIGN KEY, NOT NULL | Reporter user ID |
| reported_against_user_id | BIGINT | FOREIGN KEY, NOT NULL | Reported user ID |
| issue_type | ENUM | NOT NULL | no_response, no_show, wrong_item, scam, other |
| title | VARCHAR(200) | NOT NULL | Dispute title |
| description | TEXT | NOT NULL | Dispute description |
| status | ENUM | DEFAULT 'open' | open, investigating, resolved, closed |
| resolution | TEXT | | Resolution notes |
| resolved_by_admin_id | BIGINT | FOREIGN KEY, NULL | Admin who resolved |
| resolved_at | TIMESTAMP | NULL | Resolution timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Report date |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Update date |

**Relationships:**
- `trade_id` → `trades.id`
- `reported_by_user_id` → `users.id`
- `reported_against_user_id` → `users.id`
- `resolved_by_admin_id` → `users.id`

**Indexes:**
- `idx_trade` on `trade_id`
- `idx_reported_by` on `reported_by_user_id`
- `idx_status` on `status`

---

### 11. **dispute_evidence**
Evidence files for disputes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Evidence ID |
| dispute_id | BIGINT | FOREIGN KEY, NOT NULL | Dispute ID |
| uploaded_by_user_id | BIGINT | FOREIGN KEY, NOT NULL | Uploader user ID |
| file_url | VARCHAR(500) | NOT NULL | File URL |
| file_type | VARCHAR(50) | | File type (image, document, etc.) |
| description | TEXT | | Evidence description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload date |

**Relationships:**
- `dispute_id` → `disputes.id` ON DELETE CASCADE
- `uploaded_by_user_id` → `users.id`

**Indexes:**
- `idx_dispute` on `dispute_id`

---

### 12. **wallets**
User cryptocurrency wallets

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Wallet ID |
| user_id | BIGINT | FOREIGN KEY, NOT NULL, UNIQUE | User ID |
| btc_balance | DECIMAL(18,8) | DEFAULT 0 | Bitcoin balance |
| eth_balance | DECIMAL(18,8) | DEFAULT 0 | Ethereum balance |
| usdt_balance | DECIMAL(18,8) | DEFAULT 0 | USDT balance |
| total_balance_usd | DECIMAL(12,2) | DEFAULT 0 | Total balance in USD |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Update date |

**Relationships:**
- `user_id` → `users.id` ON DELETE CASCADE

**Indexes:**
- `idx_user` on `user_id`

---

### 13. **transactions**
Wallet transactions (deposits, withdrawals, trades)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Transaction ID |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | User ID |
| trade_id | BIGINT | FOREIGN KEY, NULL | Related trade ID |
| type | ENUM | NOT NULL | deposit, withdrawal, trade_payment, trade_receipt, refund |
| crypto_type | ENUM | NOT NULL | BTC, ETH, USDT |
| amount | DECIMAL(18,8) | NOT NULL | Crypto amount |
| amount_usd | DECIMAL(12,2) | | USD equivalent |
| status | ENUM | DEFAULT 'pending' | pending, completed, failed, cancelled |
| transaction_hash | VARCHAR(255) | | Blockchain transaction hash |
| from_address | VARCHAR(255) | | Source address |
| to_address | VARCHAR(255) | | Destination address |
| notes | TEXT | | Transaction notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Transaction date |
| completed_at | TIMESTAMP | NULL | Completion timestamp |

**Relationships:**
- `user_id` → `users.id`
- `trade_id` → `trades.id`

**Indexes:**
- `idx_user` on `user_id`
- `idx_trade` on `trade_id`
- `idx_type` on `type`
- `idx_status` on `status`
- `idx_created` on `created_at`

---

### 14. **payment_methods**
User payment methods (for crypto trading)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Payment method ID |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | User ID |
| type | ENUM | NOT NULL | bank_transfer, venmo, zelle, paypal, cash_app, other |
| label | VARCHAR(100) | | Display label |
| account_details | TEXT | | Encrypted account details |
| is_verified | BOOLEAN | DEFAULT FALSE | Verification status |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Update date |

**Relationships:**
- `user_id` → `users.id` ON DELETE CASCADE

**Indexes:**
- `idx_user` on `user_id`
- `idx_type` on `type`

---

### 15. **listing_payment_methods**
Payment methods accepted for listings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ID |
| listing_id | BIGINT | FOREIGN KEY, NOT NULL | Listing ID |
| payment_method_type | ENUM | NOT NULL | Payment method type |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |

**Relationships:**
- `listing_id` → `listings.id` ON DELETE CASCADE

**Indexes:**
- `idx_listing` on `listing_id`

---

### 16. **favorites**
User favorite listings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Favorite ID |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | User ID |
| listing_id | BIGINT | FOREIGN KEY, NOT NULL | Listing ID |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Favorite date |

**Relationships:**
- `user_id` → `users.id` ON DELETE CASCADE
- `listing_id` → `listings.id` ON DELETE CASCADE

**Indexes:**
- `idx_user` on `user_id`
- `idx_listing` on `listing_id`
- UNIQUE `idx_user_listing` on `user_id`, `listing_id`

---

### 17. **kyc_documents**
KYC verification documents

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Document ID |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | User ID |
| document_type | ENUM | NOT NULL | passport, driver_license, national_id, utility_bill |
| file_url | VARCHAR(500) | NOT NULL | Document file URL |
| status | ENUM | DEFAULT 'pending' | pending, approved, rejected |
| rejection_reason | TEXT | | Rejection reason |
| reviewed_by_admin_id | BIGINT | FOREIGN KEY, NULL | Reviewing admin ID |
| reviewed_at | TIMESTAMP | NULL | Review timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload date |

**Relationships:**
- `user_id` → `users.id` ON DELETE CASCADE
- `reviewed_by_admin_id` → `users.id`

**Indexes:**
- `idx_user` on `user_id`
- `idx_status` on `status`

---

### 18. **notifications**
User notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Notification ID |
| user_id | BIGINT | FOREIGN KEY, NOT NULL | User ID |
| type | ENUM | NOT NULL | trade_started, trade_message, trade_completed, review_received, dispute_opened, listing_sold |
| title | VARCHAR(200) | NOT NULL | Notification title |
| message | TEXT | | Notification message |
| related_trade_id | BIGINT | FOREIGN KEY, NULL | Related trade ID |
| related_listing_id | BIGINT | FOREIGN KEY, NULL | Related listing ID |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| read_at | TIMESTAMP | NULL | Read timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Notification date |

**Relationships:**
- `user_id` → `users.id` ON DELETE CASCADE
- `related_trade_id` → `trades.id`
- `related_listing_id` → `listings.id`

**Indexes:**
- `idx_user` on `user_id`
- `idx_read` on `user_id`, `is_read`
- `idx_created` on `created_at`

---

### 19. **user_settings**
User account settings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Setting ID |
| user_id | BIGINT | FOREIGN KEY, NOT NULL, UNIQUE | User ID |
| email_notifications | BOOLEAN | DEFAULT TRUE | Email notifications enabled |
| push_notifications | BOOLEAN | DEFAULT TRUE | Push notifications enabled |
| sms_notifications | BOOLEAN | DEFAULT FALSE | SMS notifications enabled |
| show_email | BOOLEAN | DEFAULT FALSE | Show email on profile |
| show_phone | BOOLEAN | DEFAULT FALSE | Show phone on profile |
| currency_preference | VARCHAR(10) | DEFAULT 'GBP' | Preferred currency |
| language | VARCHAR(10) | DEFAULT 'en' | Language preference |
| timezone | VARCHAR(50) | DEFAULT 'UTC' | Timezone |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Update date |

**Relationships:**
- `user_id` → `users.id` ON DELETE CASCADE

**Indexes:**
- `idx_user` on `user_id`

---

### 20. **search_history**
User search history (optional)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Search ID |
| user_id | BIGINT | FOREIGN KEY, NULL | User ID (NULL for anonymous) |
| search_query | VARCHAR(255) | | Search term |
| category_id | BIGINT | FOREIGN KEY, NULL | Category filter |
| filters_json | JSON | | Applied filters |
| results_count | INT | | Number of results |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Search timestamp |

**Relationships:**
- `user_id` → `users.id` ON DELETE CASCADE
- `category_id` → `categories.id`

**Indexes:**
- `idx_user` on `user_id`
- `idx_created` on `created_at`

---

## Entity Relationship Diagram (ERD) Summary

### Core Relationships:

1. **Users** → **Listings** (One-to-Many)
   - A user can create many listings
   - A listing belongs to one user (seller)

2. **Users** → **Trades** (One-to-Many as Seller)
   - A user can be a seller in many trades

3. **Users** → **Trades** (One-to-Many as Buyer)
   - A user can be a buyer in many trades

4. **Listings** → **Trades** (One-to-Many)
   - A listing can have many trades
   - A trade belongs to one listing

5. **Trades** → **Trade Messages** (One-to-Many)
   - A trade can have many messages
   - A message belongs to one trade

6. **Trades** → **Reviews** (One-to-One)
   - A trade can have two reviews (one from buyer, one from seller)

7. **Users** → **Reviews** (One-to-Many as Reviewer)
   - A user can write many reviews

8. **Users** → **Reviews** (One-to-Many as Reviewee)
   - A user can receive many reviews

9. **Categories** → **Listings** (One-to-Many)
   - A category can have many listings
   - A listing belongs to one category

10. **Users** → **Wallets** (One-to-One)
    - A user has one wallet
    - A wallet belongs to one user

11. **Users** → **Transactions** (One-to-Many)
    - A user can have many transactions
    - A transaction belongs to one user

12. **Listings** → **Listing Images** (One-to-Many)
    - A listing can have many images
    - An image belongs to one listing

13. **Users** → **Favorites** (One-to-Many)
    - A user can favorite many listings
    - A favorite belongs to one user

14. **Listings** → **Favorites** (One-to-Many)
    - A listing can be favorited by many users

---

## Key Indexes for Performance

### High-Traffic Queries:

1. **Marketplace Listings:**
   - `listings`: `status`, `category_id`, `location_latitude`, `location_longitude`, `price`, `created_at`
   - Full-text search on `title`, `description`

2. **User Dashboard:**
   - `trades`: `buyer_id`, `seller_id`, `status`, `created_at`
   - `listings`: `user_id`, `status`

3. **Trade Room:**
   - `trade_messages`: `trade_id`, `created_at`
   - `trades`: `trade_number`, `status`

4. **Notifications:**
   - `notifications`: `user_id`, `is_read`, `created_at`

---

## Notes

- All timestamps use `TIMESTAMP` type for automatic timezone handling
- Use `DECIMAL` for monetary values to avoid floating-point precision issues
- Foreign keys should have appropriate `ON DELETE` cascades where logical
- Consider soft deletes for critical tables (add `deleted_at` column)
- Add indexes for frequently queried columns
- Use ENUM types for fixed value sets
- Consider partitioning large tables (e.g., `transactions`, `trade_messages`) by date

---

## Sample Queries

### Get active listings with seller info:
```sql
SELECT l.*, u.username, u.avatar_url, c.name as category_name
FROM listings l
JOIN users u ON l.user_id = u.id
JOIN categories c ON l.category_id = c.id
WHERE l.status = 'active'
ORDER BY l.created_at DESC;
```

### Get user's active trades:
```sql
SELECT t.*, l.title, l.price
FROM trades t
JOIN listings l ON t.listing_id = l.id
WHERE (t.buyer_id = ? OR t.seller_id = ?)
  AND t.status IN ('initiated', 'payment_pending', 'paid', 'in_progress')
ORDER BY t.created_at DESC;
```

### Get trade messages:
```sql
SELECT tm.*, u.username, u.avatar_url
FROM trade_messages tm
JOIN users u ON tm.user_id = u.id
WHERE tm.trade_id = ?
ORDER BY tm.created_at ASC;
```

