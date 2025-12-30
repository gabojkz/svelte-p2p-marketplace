<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import { goto } from "$app/navigation";

  const { data } = $props();

  const listing = $derived(data?.listing);
  const seller = $derived(listing?.seller);
  const marketplaceUser = $derived(data?.marketplaceUser);

  // Form state
  let fiatAmount = $state("500");
  let currency = $state("GBP");
  let paymentMethod = $state("bank");
  
  // Exchange rate (placeholder - would come from API)
  const exchangeRate = 67450; // 1 BTC = $67,450
  const rateMargin = 0.005; // 0.5% above market

  // Calculate crypto amount
  const cryptoAmount = $derived.by(() => {
    const amount = parseFloat(fiatAmount) || 0;
    const adjustedRate = exchangeRate * (1 + rateMargin);
    return (amount / adjustedRate).toFixed(8);
  });

  // Set min amount (10% of listing price or 100, whichever is higher)
  function setMinAmount() {
    const currentListing = listing;
    const listingPrice = parseFloat(currentListing?.price || "0");
    const min = Math.max(100, Math.floor(listingPrice * 0.1));
    fiatAmount = min.toString();
  }

  // Set max amount (listing price or 5000, whichever is lower)
  function setMaxAmount() {
    const currentListing = listing;
    const listingPrice = parseFloat(currentListing?.price || "0");
    const max = listingPrice > 0 ? Math.min(listingPrice, 5000) : 5000;
    fiatAmount = max.toString();
  }

  // Get seller initials
  function getSellerInitials() {
    const currentSeller = seller;
    if (!currentSeller) return "?";
    const firstName = currentSeller.firstName || "";
    const lastName = currentSeller.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return (currentSeller.username || "?").substring(0, 2).toUpperCase();
  }

  // Get star rating
  /** @param {number} rating */
  function getStarRating(rating) {
    return "⭐".repeat(Math.floor(rating));
  }

  // Format price
  /** @param {string | number} price */
  function formatPrice(price) {
    return `£${parseFloat(String(price || "0")).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Update fiat amount when listing changes
  $effect(() => {
    const currentListing = listing;
    if (currentListing?.price) {
      fiatAmount = parseFloat(currentListing.price).toString();
    }
  });
</script>

<div class="page-wrapper">
  <!-- Header -->
  <NavigationBar />

  <!-- Main Content -->
  <main class="main-content" style="background: var(--color-gray-100);">
    <div class="container" style="max-width: 700px;">
      <!-- Step Indicator -->
      <div class="steps mb-8">
        <div class="step step--active">
          <div class="step__number">1</div>
          <div class="step__label">Enter Amount</div>
        </div>
        <div class="step">
          <div class="step__number">2</div>
          <div class="step__label">Confirm Trade</div>
        </div>
        <div class="step">
          <div class="step__number">3</div>
          <div class="step__label">Make Payment</div>
        </div>
        <div class="step">
          <div class="step__number">4</div>
          <div class="step__label">Receive Crypto</div>
        </div>
      </div>

      <!-- Trade Form Card -->
      <div class="card" style="box-shadow: var(--shadow-lg);">
        <div class="card__body" style="padding: var(--space-8);">
          <!-- Seller Info -->
          {#if seller}
            <div
              class="flex items-center justify-between mb-6"
              style="padding-bottom: var(--space-6); border-bottom: 1px solid var(--color-gray-100);"
            >
              <div class="flex items-center gap-4">
                <div class="avatar avatar--lg">{getSellerInitials()}</div>
                <div>
                  <h3 style="font-size: var(--text-lg);">
                    Buying {listing?.title || "item"} from {seller.firstName || seller.username}
                  </h3>
                  <div
                    class="flex items-center gap-3 text-muted"
                    style="font-size: var(--text-sm);"
                  >
                    {#if seller?.stats && typeof seller.stats.avgRating === 'number' && seller.stats.avgRating > 0}
                      <span>{getStarRating(seller.stats.avgRating)} {seller.stats.avgRating.toFixed(1)} ({seller.stats.reviewsCount || 0} reviews)</span>
                    {/if}
                    {#if seller?.stats && typeof seller.stats.completedTrades === 'number' && seller.stats.completedTrades > 0}
                      <span>• {seller.stats.completedTrades} trades</span>
                    {/if}
                    <span class="status-dot status-dot--online"></span>
                    <span>Online</span>
                  </div>
                </div>
              </div>
              {#if seller && /** @type {any} */ (seller).emailVerified}
                <span class="badge badge--success">Verified</span>
              {/if}
            </div>
          {/if}

          <!-- Amount Section -->
          <div class="mb-6">
            <h4 style="margin-bottom: var(--space-4);">
              How much do you want to buy?
            </h4>

            <!-- Fiat Input -->
            <div class="form-group">
              <label for="fiat-amount" class="form-label">I will pay</label>
              <div class="flex gap-3">
                <div style="flex: 1; position: relative;">
                  <input
                    type="number"
                    class="form-input form-input--lg"
                    id="fiat-amount"
                    placeholder="0.00"
                    bind:value={fiatAmount}
                    style="font-size: var(--text-2xl); padding: var(--space-5);"
                  />
                </div>
                <select
                  class="form-select"
                  style="width: 100px; font-size: var(--text-lg);"
                  bind:value={currency}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div
                class="flex justify-between mt-2"
                style="font-size: var(--text-sm);"
              >
                {#if listing?.price}
                  <span class="text-muted">Listing price: {formatPrice(listing.price)}</span>
                {:else}
                  <span class="text-muted">Limit: £100 - £5,000</span>
                {/if}
                <div class="flex gap-2">
                  <button
                    class="btn btn--ghost btn--sm"
                    onclick={setMinAmount}
                    type="button"
                  >
                    Min
                  </button>
                  <button
                    class="btn btn--ghost btn--sm"
                    onclick={setMaxAmount}
                    type="button"
                  >
                    Max
                  </button>
                </div>
              </div>
            </div>

            <!-- Exchange Arrow -->
            <div style="text-align: center; padding: var(--space-4) 0;">
              <div
                style="width: 40px; height: 40px; margin: 0 auto; background: var(--color-gray-100); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-lg);"
              >
                ↓
              </div>
            </div>

            <!-- Crypto Output -->
            <div class="form-group">
              <label for="crypto-amount" class="form-label">I will receive</label>
              <div
                style="padding: var(--space-5); background: var(--color-primary-subtle); border-radius: var(--radius-lg); border: 2px solid var(--color-primary);"
              >
                <div class="flex items-center justify-between">
                  <div
                    id="crypto-amount"
                    style="font-family: var(--font-display); font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--color-gray-900);"
                  >
                    <span>{cryptoAmount}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="crypto-icon crypto-icon--btc">₿</div>
                    <span style="font-weight: var(--font-semibold);">BTC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Exchange Rate Info -->
          <div
            style="padding: var(--space-4); background: var(--color-gray-50); border-radius: var(--radius-md); margin-bottom: var(--space-6);"
          >
            <div
              class="flex justify-between items-center"
              style="font-size: var(--text-sm);"
            >
              <span class="text-muted">Exchange Rate</span>
              <span style="font-weight: var(--font-medium);">
                1 BTC = ${exchangeRate.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div
              class="flex justify-between items-center mt-2"
              style="font-size: var(--text-sm);"
            >
              <span class="text-muted">Rate Margin</span>
              <span style="color: var(--color-gray-700);"
                >+0.5% above market</span
              >
            </div>
            <div
              class="flex justify-between items-center mt-2"
              style="font-size: var(--text-sm);"
            >
              <span class="text-muted">Network Fee</span>
              <span style="color: var(--color-primary);">Included</span>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="form-group mb-6">
            <div class="form-label">Payment Method</div>
            <div
              style="display: flex; flex-direction: column; gap: var(--space-3);"
            >
              <label
                style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4); border: 2px solid var(--color-primary); border-radius: var(--radius-md); cursor: pointer; background: var(--color-primary-subtle);"
              >
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  bind:group={paymentMethod}
                  style="accent-color: var(--color-primary); width: 20px; height: 20px;"
                />
                <span style="font-size: var(--text-xl);">🏦</span>
                <div style="flex: 1;">
                  <div style="font-weight: var(--font-semibold);">
                    Bank Transfer
                  </div>
                  <div
                    style="font-size: var(--text-sm); color: var(--color-gray-500);"
                  >
                    ACH or Wire transfer
                  </div>
                </div>
              </label>
              <label
                style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4); border: 2px solid var(--color-gray-200); border-radius: var(--radius-md); cursor: pointer;"
                class:payment-selected={paymentMethod === "venmo"}
              >
                <input
                  type="radio"
                  name="payment"
                  value="venmo"
                  bind:group={paymentMethod}
                  style="accent-color: var(--color-primary); width: 20px; height: 20px;"
                />
                <span style="font-size: var(--text-xl);">💵</span>
                <div style="flex: 1;">
                  <div style="font-weight: var(--font-semibold);">Venmo</div>
                  <div
                    style="font-size: var(--text-sm); color: var(--color-gray-500);"
                  >
                    Friends & Family only
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Terms Agreement -->
          <div class="alert alert--info mb-6">
            <span class="alert__icon">ℹ️</span>
            <div class="alert__content">
              <p class="alert__message">
                By starting this trade, you agree to complete payment within <strong
                  >30 minutes</strong
                >. The seller's BTC will be locked in escrow until you confirm
                payment.
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4">
            <button
              onclick={() => goto(`/listing-details?id=${listing?.id}`)}
              class="btn btn--outline btn--lg"
              style="flex: 1;"
              type="button"
            >
              ← Back
            </button>
            <button
              onclick={() => goto("/trade-room")}
              class="btn btn--primary btn--lg"
              style="flex: 2;"
              type="button"
            >
              Start Trade 🔒
            </button>
          </div>
        </div>
      </div>

      <!-- Security Notice -->
      <div
        style="text-align: center; padding: var(--space-6); font-size: var(--text-sm); color: var(--color-gray-500);"
      >
        <p>🛡️ This trade is protected by CryptoTrade's secure escrow system</p>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer__bottom" style="padding-top: 0; border-top: none;">
        <p>&copy; 2025 CryptoTrade. All rights reserved.</p>
        <nav class="footer__legal-links">
          <button type="button" class="footer__link">Privacy</button>
          <button type="button" class="footer__link">Terms</button>
        </nav>
      </div>
    </div>
  </footer>
</div>
