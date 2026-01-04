# Unused Files and Dead Code

This document lists files, directories, and code that are not currently used in the application.

## Empty API Route Directories

These directories were created but never implemented. They can be safely deleted:

1. **`src/routes/api/trades/[id]/cancel-completion/`** - Empty directory
   - Was intended for canceling trade completion, but this functionality was removed

2. **`src/routes/api/trades/[id]/close/`** - Empty directory
   - Was intended for closing trades, but this functionality was removed

3. **`src/routes/api/trades/[id]/price/`** - Empty directory
   - Was intended for price confirmation, but this functionality was removed

4. **`src/routes/api/trades/[id]/reviews/status/`** - Empty directory
   - Was intended for checking review status, but this functionality was removed

## Unused Routes

### `src/routes/trade-initiation/`

**Status:** Unused/Legacy

**Files:**
- `src/routes/trade-initiation/+page.server.js`
- `src/routes/trade-initiation/+page.svelte`

**Reason:**
- The trade initiation flow now goes directly to `/trade-room`
- Only referenced in `src/routes/profile/+page.svelte` with a hardcoded `.html` link (which is a mockup page)
- The button in `trade-initiation/+page.svelte` itself navigates to `/trade-room`, making this route redundant
- This appears to be legacy code from an earlier implementation

**Recommendation:** Delete this route entirely.

## Mockup/Static Pages

### `src/routes/profile/+page.svelte`

**Status:** Static Mockup (Not Functional)

**Reason:**
- Contains hardcoded data (JohnDoe_BTC, static stats, etc.)
- Has hardcoded HTML links (marketplace.html, trade-initiation.html, offer-detail.html)
- Not actually functional - the real profile page is at `src/routes/profile/[username]/+page.svelte`
- This appears to be a design mockup that was never removed

**Recommendation:** Delete this file if it's not needed for reference, or move it to a `/design` or `/mockups` directory if you want to keep it for reference.

## Notes

- `src/lib/services/trade.js` - **IS USED** by `TradeStatusCard.svelte`, so it should be kept
- All other routes and components appear to be in active use

## Cleanup Commands

To remove the unused files:

```bash
# Remove empty API directories
rm -rf src/routes/api/trades/\[id\]/cancel-completion
rm -rf src/routes/api/trades/\[id\]/close
rm -rf src/routes/api/trades/\[id\]/price
rm -rf src/routes/api/trades/\[id\]/reviews/status

# Remove unused trade-initiation route
rm -rf src/routes/trade-initiation

# Remove mockup profile page (optional)
rm src/routes/profile/+page.svelte
```




