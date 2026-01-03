# Unused Database Tables and Columns

This document lists database tables, columns, and enum values that are defined in the schema but not actually used in the application code.

## Unused Tables

These tables are defined in `src/lib/server/schema.js` but are never queried, inserted into, or updated in the application code:

1. **`trade_messages`** - Trade-specific messages table
   - Defined in schema but never used
   - Messages are stored in the `messages` table linked to `conversations` instead

2. **`trade_status_history`** - History of trade status changes
   - Defined in schema but never queried or inserted into
   - No API endpoints or queries use this table

3. **`listing_attributes`** - Key-value attributes for listings
   - Defined in schema but never queried or inserted into
   - No functionality uses custom listing attributes

4. **`wallets`** - User cryptocurrency wallets
   - Defined in schema but never queried or inserted into
   - Crypto wallet functionality not implemented

5. **`transactions`** - Cryptocurrency transactions
   - Defined in schema but never queried or inserted into
   - Crypto transaction tracking not implemented

6. **`payment_methods`** - User payment methods (bank, venmo, etc.)
   - Defined in schema but never queried or inserted into
   - Payment method management not implemented

7. **`listing_payment_methods`** - Payment methods accepted per listing
   - Defined in schema but never queried or inserted into
   - Listing payment method selection not implemented

8. **`kyc_documents`** - KYC document uploads
   - Defined in schema but never queried or inserted into
   - KYC document functionality not implemented

9. **`notifications`** - User notifications table
   - Defined in schema but never queried or inserted into
   - Notification settings exist in `user_settings`, but notifications table is unused
   - No notification system implemented

10. **`search_history`** - User search history
    - Defined in schema but never queried or inserted into
    - Search history tracking not implemented

11. **`dispute_evidence`** - Evidence files for disputes
    - Defined in schema but never queried or inserted into
    - Dispute evidence upload functionality not implemented

## Unused Columns

### `trades` Table

1. **`escrowStatus`** (`escrow_status`)
   - Column exists in schema with enum type `escrow_status`
   - Default value: `'reserved'`
   - **Never queried, updated, or used in any logic**
   - Only referenced in one text message in `trade-room/+page.svelte` (display text only)
   - Escrow functionality was removed from the app

## Unused Enum Values

### `trade_status` Enum

The following values are defined but may not be actively used:
- `payment_pending` - Not used in current flow
- `paid` - Not used in current flow  
- `disputed` - Not used in current flow

**Currently Used Values:**
- `initiated` ✅
- `in_progress` ✅
- `completed` ✅
- `cancelled` ✅

### `escrow_status` Enum

**Entire enum is unused** - The `escrowStatus` column is never queried or updated:
- `reserved`
- `released`
- `refunded`

## Missing Fields (Mentioned in Code but Not in Schema)

Based on the summary, these fields were mentioned but may not exist in the current schema:
- `trades.completionInitiatedBy`
- `trades.completionConfirmedBy`
- `trades.completionInitiatedAt`
- `trades.closedAt`
- `trades.finalPrice`
- `trades.tradeInitiatorId`
- `trades.conversationId`

**Note:** These may have been planned but not implemented, or they may exist in a migration that hasn't been run.

## Tables That ARE Used

These tables are actively used and should be kept:

✅ `user` (Better Auth)
✅ `session` (Better Auth)
✅ `account` (Better Auth)
✅ `verification` (Better Auth - password reset)
✅ `users` (marketplace user profiles)
✅ `categories`
✅ `listings`
✅ `listing_images`
✅ `trades`
✅ `conversations`
✅ `messages`
✅ `reviews`
✅ `disputes`
✅ `favorites`
✅ `user_settings`
✅ `allowed_email_domains`

## Recommendations

### Safe to Remove (After Data Backup)

1. **Empty/unused tables** - Can be dropped if you're sure they won't be needed:
   - `trade_messages`
   - `trade_status_history`
   - `listing_attributes`
   - `wallets`
   - `transactions`
   - `payment_methods`
   - `listing_payment_methods`
   - `kyc_documents`
   - `notifications`
   - `search_history`
   - `dispute_evidence`

2. **Unused columns**:
   - `trades.escrowStatus`

3. **Unused enum types**:
   - `escrow_status` enum type (if removing `escrowStatus` column)

### Keep for Future Use

If you plan to implement these features, keep the tables:
- `wallets` & `transactions` - For crypto functionality
- `payment_methods` & `listing_payment_methods` - For payment method management
- `notifications` - For notification system
- `kyc_documents` - For KYC verification
- `search_history` - For search analytics

### Migration Script

To remove unused tables and columns, you would need to create a migration:

```sql
-- Remove unused column
ALTER TABLE trades DROP COLUMN escrow_status;

-- Drop unused enum type
DROP TYPE escrow_status;

-- Drop unused tables (example - be careful!)
-- DROP TABLE IF EXISTS trade_messages CASCADE;
-- DROP TABLE IF EXISTS trade_status_history CASCADE;
-- DROP TABLE IF EXISTS listing_attributes CASCADE;
-- ... etc
```

**⚠️ WARNING:** Always backup your database before dropping tables or columns!



