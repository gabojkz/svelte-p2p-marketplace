<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
</script>

<div class="page-wrapper">
  <!-- Header -->
  <NavigationBar />

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Profile Header -->
      <div
        class="card mb-6"
        style="background: linear-gradient(135deg, var(--color-primary-subtle), rgba(78, 205, 196, 0.1));"
      >
        <div class="card__body" style="padding: var(--space-8);">
          <div class="flex items-center gap-6" style="flex-wrap: wrap;">
            <!-- Avatar -->
            <div
              class="avatar avatar--2xl"
              style="border: 4px solid var(--color-white); box-shadow: var(--shadow-lg);"
            >
              JD
            </div>

            <!-- Profile Info -->
            <div style="flex: 1; min-width: 200px;">
              <div class="flex items-center gap-3 mb-2">
                <h1 style="font-size: var(--text-2xl);">JohnDoe_BTC</h1>
                <span class="badge badge--success">✓ Verified</span>
                <span class="badge badge--info">Fast Trader</span>
              </div>
              <div
                class="flex items-center gap-4 text-muted mb-4"
                style="font-size: var(--text-sm);"
              >
                <span class="flex items-center gap-1">
                  <span class="status-dot status-dot--online"></span>
                  Online now
                </span>
                <span>📍 United States</span>
                <span>🗓️ Joined Jan 2023</span>
              </div>
              <p style="max-width: 500px; color: var(--color-gray-700);">
                Professional crypto trader with 2+ years experience. Fast
                releases, fair prices, and excellent customer service. Available
                9 AM - 11 PM EST.
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-2">
              <a href="marketplace.html" class="btn btn--primary"
                >View Active Offers</a
              >
              <button class="btn btn--outline">Send Message</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="stat-card">
          <div class="stat-card__label">Trust Score</div>
          <div class="stat-card__value" style="color: var(--color-primary);">
            96%
          </div>
          <div class="trust-score">
            <div class="trust-score__bar" style="width: 100%;">
              <div class="trust-score__fill" style="width: 96%;"></div>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Total Trades</div>
          <div class="stat-card__value">342</div>
          <div class="stat-card__change stat-card__change--positive">
            ↑ 12 this week
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Completion Rate</div>
          <div class="stat-card__value">99.7%</div>
          <div style="font-size: var(--text-xs); color: var(--color-gray-500);">
            1 cancelled
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Avg. Release Time</div>
          <div class="stat-card__value">5 min</div>
          <div class="stat-card__change stat-card__change--positive">
            ⚡ Very Fast
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs mb-6">
        <button class="tab is-active" data-tab="active-listings"
          >Active Listings (3)</button
        >
        <button class="tab" data-tab="reviews">Reviews (289)</button>
        <button class="tab" data-tab="trade-history">Trade History</button>
      </div>

      <!-- Tab Content: Active Listings -->
      <div class="tab-content is-active" id="active-listings">
        <div class="grid grid-cols-3 gap-6">
          <!-- Listing 1 -->
          <article class="offer-card">
            <div class="offer-card__header">
              <div class="flex items-center gap-2">
                <div class="crypto-icon crypto-icon--btc">₿</div>
                <span style="font-weight: var(--font-semibold);">Bitcoin</span>
              </div>
              <span class="offer-card__type offer-card__type--sell"
                >Selling</span
              >
            </div>

            <div class="offer-card__price">
              <div class="offer-card__price-label">Price per BTC</div>
              <div class="offer-card__price-value">$67,450.00</div>
              <div
                style="font-size: var(--text-xs); color: var(--color-primary);"
              >
                +0.5% market
              </div>
            </div>

            <div class="offer-card__details">
              <div class="offer-card__detail">
                <div class="offer-card__detail-label">Limits</div>
                <div class="offer-card__detail-value">$100 - $5,000</div>
              </div>
              <div class="offer-card__detail">
                <div class="offer-card__detail-label">Available</div>
                <div class="offer-card__detail-value">0.5 BTC</div>
              </div>
            </div>

            <div class="offer-card__payment-methods">
              <span class="offer-card__payment-tag">Bank Transfer</span>
              <span class="offer-card__payment-tag">Venmo</span>
            </div>

            <a href="offer-detail.html" class="btn btn--primary btn--full"
              >View Offer</a
            >
          </article>

          <!-- Listing 2 -->
          <article class="offer-card">
            <div class="offer-card__header">
              <div class="flex items-center gap-2">
                <div class="crypto-icon crypto-icon--eth">Ξ</div>
                <span style="font-weight: var(--font-semibold);">Ethereum</span>
              </div>
              <span class="offer-card__type offer-card__type--sell"
                >Selling</span
              >
            </div>

            <div class="offer-card__price">
              <div class="offer-card__price-label">Price per ETH</div>
              <div class="offer-card__price-value">$3,520.00</div>
              <div
                style="font-size: var(--text-xs); color: var(--color-primary);"
              >
                +0.8% market
              </div>
            </div>

            <div class="offer-card__details">
              <div class="offer-card__detail">
                <div class="offer-card__detail-label">Limits</div>
                <div class="offer-card__detail-value">$50 - $3,000</div>
              </div>
              <div class="offer-card__detail">
                <div class="offer-card__detail-label">Available</div>
                <div class="offer-card__detail-value">2.0 ETH</div>
              </div>
            </div>

            <div class="offer-card__payment-methods">
              <span class="offer-card__payment-tag">Zelle</span>
            </div>

            <a href="offer-detail.html" class="btn btn--primary btn--full"
              >View Offer</a
            >
          </article>

          <!-- Listing 3 -->
          <article class="offer-card">
            <div class="offer-card__header">
              <div class="flex items-center gap-2">
                <div class="crypto-icon crypto-icon--btc">₿</div>
                <span style="font-weight: var(--font-semibold);">Bitcoin</span>
              </div>
              <span class="offer-card__type offer-card__type--buy">Buying</span>
            </div>

            <div class="offer-card__price">
              <div class="offer-card__price-label">Price per BTC</div>
              <div class="offer-card__price-value">$66,800.00</div>
              <div
                style="font-size: var(--text-xs); color: var(--color-secondary);"
              >
                -0.5% market
              </div>
            </div>

            <div class="offer-card__details">
              <div class="offer-card__detail">
                <div class="offer-card__detail-label">Limits</div>
                <div class="offer-card__detail-value">$500 - $10,000</div>
              </div>
              <div class="offer-card__detail">
                <div class="offer-card__detail-label">Buying up to</div>
                <div class="offer-card__detail-value">1.0 BTC</div>
              </div>
            </div>

            <div class="offer-card__payment-methods">
              <span class="offer-card__payment-tag">Bank Wire</span>
            </div>

            <a href="trade-initiation.html" class="btn btn--outline btn--full"
              >Sell to Buyer</a
            >
          </article>
        </div>
      </div>

      <!-- Tab Content: Reviews -->
      <div class="tab-content" id="reviews">
        <div class="card">
          <div class="card__body">
            <!-- Rating Summary -->
            <div
              class="flex gap-8 mb-8"
              style="padding-bottom: var(--space-6); border-bottom: 1px solid var(--color-gray-100);"
            >
              <div style="text-align: center;">
                <div
                  style="font-family: var(--font-display); font-size: var(--text-5xl); font-weight: var(--font-bold); color: var(--color-accent-yellow);"
                >
                  4.9
                </div>
                <div
                  style="color: var(--color-accent-yellow); font-size: var(--text-lg);"
                >
                  ★★★★★
                </div>
                <div class="text-muted" style="font-size: var(--text-sm);">
                  289 reviews
                </div>
              </div>
              <div style="flex: 1;">
                <div
                  class="flex items-center gap-3 mb-2"
                  style="font-size: var(--text-sm);"
                >
                  <span>5 ★</span>
                  <div class="progress" style="flex: 1;">
                    <div class="progress__bar" style="width: 92%;"></div>
                  </div>
                  <span class="text-muted">92%</span>
                </div>
                <div
                  class="flex items-center gap-3 mb-2"
                  style="font-size: var(--text-sm);"
                >
                  <span>4 ★</span>
                  <div class="progress" style="flex: 1;">
                    <div class="progress__bar" style="width: 5%;"></div>
                  </div>
                  <span class="text-muted">5%</span>
                </div>
                <div
                  class="flex items-center gap-3 mb-2"
                  style="font-size: var(--text-sm);"
                >
                  <span>3 ★</span>
                  <div class="progress" style="flex: 1;">
                    <div class="progress__bar" style="width: 2%;"></div>
                  </div>
                  <span class="text-muted">2%</span>
                </div>
                <div
                  class="flex items-center gap-3 mb-2"
                  style="font-size: var(--text-sm);"
                >
                  <span>2 ★</span>
                  <div class="progress" style="flex: 1;">
                    <div class="progress__bar" style="width: 1%;"></div>
                  </div>
                  <span class="text-muted">1%</span>
                </div>
                <div
                  class="flex items-center gap-3"
                  style="font-size: var(--text-sm);"
                >
                  <span>1 ★</span>
                  <div class="progress" style="flex: 1;">
                    <div class="progress__bar" style="width: 0%;"></div>
                  </div>
                  <span class="text-muted">0%</span>
                </div>
              </div>
            </div>

            <!-- Individual Reviews -->
            <div
              style="display: flex; flex-direction: column; gap: var(--space-6);"
            >
              <div
                style="padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-gray-100);"
              >
                <div class="flex items-center gap-3 mb-2">
                  <div class="avatar avatar--sm">TK</div>
                  <div style="flex: 1;">
                    <span style="font-weight: var(--font-medium);"
                      >TraderKen</span
                    >
                    <span class="text-muted" style="font-size: var(--text-sm);">
                      • 2 days ago</span
                    >
                  </div>
                  <div style="color: var(--color-accent-yellow);">★★★★★</div>
                </div>
                <p
                  style="font-size: var(--text-sm); color: var(--color-gray-700);"
                >
                  Super fast release! Great communication throughout the trade.
                  Would definitely trade again.
                </p>
                <div class="flex gap-2 mt-2" style="font-size: var(--text-xs);">
                  <span class="badge badge--neutral">BTC</span>
                  <span class="badge badge--neutral">$1,500</span>
                </div>
              </div>

              <div
                style="padding-bottom: var(--space-4); border-bottom: 1px solid var(--color-gray-100);"
              >
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="avatar avatar--sm"
                    style="background: linear-gradient(135deg, var(--color-tertiary), var(--color-accent-blue));"
                  >
                    MR
                  </div>
                  <div style="flex: 1;">
                    <span style="font-weight: var(--font-medium);"
                      >MaxRider</span
                    >
                    <span class="text-muted" style="font-size: var(--text-sm);">
                      • 5 days ago</span
                    >
                  </div>
                  <div style="color: var(--color-accent-yellow);">★★★★★</div>
                </div>
                <p
                  style="font-size: var(--text-sm); color: var(--color-gray-700);"
                >
                  My go-to seller for BTC. Always reliable and fair prices. Have
                  done over 10 trades with John!
                </p>
                <div class="flex gap-2 mt-2" style="font-size: var(--text-xs);">
                  <span class="badge badge--neutral">BTC</span>
                  <span class="badge badge--neutral">$3,000</span>
                </div>
              </div>

              <div>
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="avatar avatar--sm"
                    style="background: linear-gradient(135deg, var(--color-secondary), var(--color-accent-orange));"
                  >
                    AL
                  </div>
                  <div style="flex: 1;">
                    <span style="font-weight: var(--font-medium);"
                      >Alex_London</span
                    >
                    <span class="text-muted" style="font-size: var(--text-sm);">
                      • 1 week ago</span
                    >
                  </div>
                  <div style="color: var(--color-accent-yellow);">★★★★☆</div>
                </div>
                <p
                  style="font-size: var(--text-sm); color: var(--color-gray-700);"
                >
                  Good trade, took a bit longer than expected but seller was
                  communicative. Overall positive experience.
                </p>
                <div class="flex gap-2 mt-2" style="font-size: var(--text-xs);">
                  <span class="badge badge--neutral">ETH</span>
                  <span class="badge badge--neutral">$800</span>
                </div>
              </div>
            </div>

            <!-- Load More -->
            <div class="text-center mt-8">
              <button class="btn btn--outline">Load More Reviews</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Trade History -->
      <div class="tab-content" id="trade-history">
        <div class="card">
          <div class="card__body" style="padding: 0;">
            <div class="table-wrapper" style="border: none;">
              <table class="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Crypto</th>
                    <th>Amount</th>
                    <th>Partner</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Dec 28, 2025</td>
                    <td><span class="badge badge--success">Sell</span></td>
                    <td>BTC</td>
                    <td>$1,500</td>
                    <td>TraderKen</td>
                    <td
                      ><span style="color: var(--color-success);"
                        >✓ Completed</span
                      ></td
                    >
                  </tr>
                  <tr>
                    <td>Dec 26, 2025</td>
                    <td><span class="badge badge--info">Buy</span></td>
                    <td>ETH</td>
                    <td>$2,800</td>
                    <td>CryptoMaster</td>
                    <td
                      ><span style="color: var(--color-success);"
                        >✓ Completed</span
                      ></td
                    >
                  </tr>
                  <tr>
                    <td>Dec 23, 2025</td>
                    <td><span class="badge badge--success">Sell</span></td>
                    <td>BTC</td>
                    <td>$3,000</td>
                    <td>MaxRider</td>
                    <td
                      ><span style="color: var(--color-success);"
                        >✓ Completed</span
                      ></td
                    >
                  </tr>
                  <tr>
                    <td>Dec 21, 2025</td>
                    <td><span class="badge badge--success">Sell</span></td>
                    <td>BTC</td>
                    <td>$800</td>
                    <td>Alex_London</td>
                    <td
                      ><span style="color: var(--color-success);"
                        >✓ Completed</span
                      ></td
                    >
                  </tr>
                  <tr>
                    <td>Dec 19, 2025</td>
                    <td><span class="badge badge--success">Sell</span></td>
                    <td>USDT</td>
                    <td>$5,000</td>
                    <td>BigWhale</td>
                    <td
                      ><span style="color: var(--color-success);"
                        >✓ Completed</span
                      ></td
                    >
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer__bottom" style="padding-top: 0; border-top: none;">
        <p>&copy; 2025 CryptoTrade. All rights reserved.</p>
        <nav class="footer__legal-links">
          <a href="#" class="footer__link">Privacy</a>
          <a href="#" class="footer__link">Terms</a>
        </nav>
      </div>
    </div>
  </footer>
</div>

<div class="modal-backdrop"></div>
