<div class="page-wrapper">
  <!-- Header -->
  <header class="header">
    <div class="container">
      <div class="header__inner">
        <a href="../index.html" class="logo">
          <span class="logo__icon">💱</span>
          <span class="logo__text">CryptoTrade</span>
        </a>

        <div class="nav-overlay"></div>

        <nav class="nav">
          <a href="marketplace.html" class="nav__link">Marketplace</a>
          <a href="search.html" class="nav__link">Buy Crypto</a>
          <a href="create-listing.html" class="nav__link">Sell Crypto</a>
          <a href="wallet.html" class="nav__link">Wallet</a>
        </nav>

        <div class="header__actions">
          <a href="dashboard.html" class="btn btn--ghost">Dashboard</a>
          <button class="menu-toggle" aria-label="Toggle menu">
            <span class="menu-toggle__bar"></span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Page Header -->
      <div
        class="flex justify-between items-center mb-8"
        style="flex-wrap: wrap; gap: var(--space-4);"
      >
        <div>
          <h1
            style="font-size: var(--text-3xl); margin-bottom: var(--space-2);"
          >
            My Listings
          </h1>
          <p class="text-muted">Manage your buy and sell offers</p>
        </div>
        <a href="create-listing.html" class="btn btn--primary"
          >+ Create New Listing</a
        >
      </div>

      <!-- Stats Summary -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="stat-card">
          <div class="stat-card__label">Active Listings</div>
          <div class="stat-card__value">3</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Paused</div>
          <div class="stat-card__value">1</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Total Trades</div>
          <div class="stat-card__value">47</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">This Week</div>
          <div class="stat-card__value">8</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs mb-6">
        <button class="tab is-active" data-tab="all-listings"
          >All Listings (4)</button
        >
        <button class="tab" data-tab="active-listings">Active (3)</button>
        <button class="tab" data-tab="paused-listings">Paused (1)</button>
      </div>

      <!-- Listings List -->
      <div class="tab-content is-active" id="all-listings">
        <div
          style="display: flex; flex-direction: column; gap: var(--space-4);"
        >
          <!-- Listing 1 -->
          <div class="card" style="padding: var(--space-5);">
            <div class="flex items-center gap-6" style="flex-wrap: wrap;">
              <!-- Toggle -->
              <div style="text-align: center;">
                <label
                  style="position: relative; display: inline-block; width: 50px; height: 28px;"
                >
                  <input
                    type="checkbox"
                    checked
                    style="opacity: 0; width: 0; height: 0;"
                  />
                  <span
                    style="position: absolute; cursor: pointer; inset: 0; background: var(--color-primary); border-radius: 28px; transition: 0.3s;"
                  >
                    <span
                      style="position: absolute; content: ''; height: 22px; width: 22px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; transform: translateX(22px);"
                    ></span>
                  </span>
                </label>
                <div
                  style="font-size: var(--text-xs); color: var(--color-primary); margin-top: var(--space-1);"
                >
                  Active
                </div>
              </div>

              <!-- Listing Info -->
              <div style="flex: 1; min-width: 200px;">
                <div class="flex items-center gap-2 mb-2">
                  <span class="badge badge--success">Selling</span>
                  <div class="flex items-center gap-2">
                    <div
                      class="crypto-icon crypto-icon--btc"
                      style="width: 24px; height: 24px; font-size: var(--text-xs);"
                    >
                      ₿
                    </div>
                    <span style="font-weight: var(--font-semibold);"
                      >Bitcoin (BTC)</span
                    >
                  </div>
                </div>
                <div
                  style="font-size: var(--text-sm); color: var(--color-gray-600);"
                >
                  Created Dec 15, 2025 • 12 trades completed
                </div>
              </div>

              <!-- Price -->
              <div style="min-width: 140px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Price
                </div>
                <div style="font-weight: var(--font-semibold);">$67,450.00</div>
                <div
                  style="font-size: var(--text-xs); color: var(--color-primary);"
                >
                  +0.5% market
                </div>
              </div>

              <!-- Available -->
              <div style="min-width: 100px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Available
                </div>
                <div style="font-weight: var(--font-semibold);">0.5 BTC</div>
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  ≈ $33,725
                </div>
              </div>

              <!-- Limits -->
              <div style="min-width: 120px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Limits
                </div>
                <div style="font-size: var(--text-sm);">$100 - $5,000</div>
              </div>

              <!-- Payment Methods -->
              <div class="flex gap-2" style="min-width: 120px;">
                <span class="offer-card__payment-tag">Bank</span>
                <span class="offer-card__payment-tag">Venmo</span>
              </div>

              <!-- Actions -->
              <div class="dropdown">
                <button class="dropdown__trigger btn btn--ghost btn--icon"
                  >⋮</button
                >
                <div class="dropdown__menu">
                  <a href="create-listing.html" class="dropdown__item"
                    >✏️ Edit</a
                  >
                  <a href="#" class="dropdown__item">📋 Duplicate</a>
                  <a href="offer-detail.html" class="dropdown__item">👁️ View</a>
                  <div class="dropdown__divider"></div>
                  <a href="#" class="dropdown__item dropdown__item--danger"
                    >🗑️ Delete</a
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Listing 2 -->
          <div class="card" style="padding: var(--space-5);">
            <div class="flex items-center gap-6" style="flex-wrap: wrap;">
              <div style="text-align: center;">
                <label
                  style="position: relative; display: inline-block; width: 50px; height: 28px;"
                >
                  <input
                    type="checkbox"
                    checked
                    style="opacity: 0; width: 0; height: 0;"
                  />
                  <span
                    style="position: absolute; cursor: pointer; inset: 0; background: var(--color-primary); border-radius: 28px; transition: 0.3s;"
                  >
                    <span
                      style="position: absolute; height: 22px; width: 22px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; transform: translateX(22px);"
                    ></span>
                  </span>
                </label>
                <div
                  style="font-size: var(--text-xs); color: var(--color-primary); margin-top: var(--space-1);"
                >
                  Active
                </div>
              </div>

              <div style="flex: 1; min-width: 200px;">
                <div class="flex items-center gap-2 mb-2">
                  <span class="badge badge--success">Selling</span>
                  <div class="flex items-center gap-2">
                    <div
                      class="crypto-icon crypto-icon--eth"
                      style="width: 24px; height: 24px; font-size: var(--text-xs);"
                    >
                      Ξ
                    </div>
                    <span style="font-weight: var(--font-semibold);"
                      >Ethereum (ETH)</span
                    >
                  </div>
                </div>
                <div
                  style="font-size: var(--text-sm); color: var(--color-gray-600);"
                >
                  Created Dec 18, 2025 • 5 trades completed
                </div>
              </div>

              <div style="min-width: 140px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Price
                </div>
                <div style="font-weight: var(--font-semibold);">$3,520.00</div>
                <div
                  style="font-size: var(--text-xs); color: var(--color-primary);"
                >
                  +0.8% market
                </div>
              </div>

              <div style="min-width: 100px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Available
                </div>
                <div style="font-weight: var(--font-semibold);">2.0 ETH</div>
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  ≈ $7,040
                </div>
              </div>

              <div style="min-width: 120px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Limits
                </div>
                <div style="font-size: var(--text-sm);">$50 - $3,000</div>
              </div>

              <div class="flex gap-2" style="min-width: 120px;">
                <span class="offer-card__payment-tag">Zelle</span>
              </div>

              <div class="dropdown">
                <button class="dropdown__trigger btn btn--ghost btn--icon"
                  >⋮</button
                >
                <div class="dropdown__menu">
                  <a href="create-listing.html" class="dropdown__item"
                    >✏️ Edit</a
                  >
                  <a href="#" class="dropdown__item">📋 Duplicate</a>
                  <a href="offer-detail.html" class="dropdown__item">👁️ View</a>
                  <div class="dropdown__divider"></div>
                  <a href="#" class="dropdown__item dropdown__item--danger"
                    >🗑️ Delete</a
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Listing 3 - Buy Listing -->
          <div class="card" style="padding: var(--space-5);">
            <div class="flex items-center gap-6" style="flex-wrap: wrap;">
              <div style="text-align: center;">
                <label
                  style="position: relative; display: inline-block; width: 50px; height: 28px;"
                >
                  <input
                    type="checkbox"
                    checked
                    style="opacity: 0; width: 0; height: 0;"
                  />
                  <span
                    style="position: absolute; cursor: pointer; inset: 0; background: var(--color-primary); border-radius: 28px; transition: 0.3s;"
                  >
                    <span
                      style="position: absolute; height: 22px; width: 22px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; transform: translateX(22px);"
                    ></span>
                  </span>
                </label>
                <div
                  style="font-size: var(--text-xs); color: var(--color-primary); margin-top: var(--space-1);"
                >
                  Active
                </div>
              </div>

              <div style="flex: 1; min-width: 200px;">
                <div class="flex items-center gap-2 mb-2">
                  <span class="badge badge--info">Buying</span>
                  <div class="flex items-center gap-2">
                    <div
                      class="crypto-icon crypto-icon--btc"
                      style="width: 24px; height: 24px; font-size: var(--text-xs);"
                    >
                      ₿
                    </div>
                    <span style="font-weight: var(--font-semibold);"
                      >Bitcoin (BTC)</span
                    >
                  </div>
                </div>
                <div
                  style="font-size: var(--text-sm); color: var(--color-gray-600);"
                >
                  Created Dec 20, 2025 • 3 trades completed
                </div>
              </div>

              <div style="min-width: 140px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Price
                </div>
                <div style="font-weight: var(--font-semibold);">$66,800.00</div>
                <div
                  style="font-size: var(--text-xs); color: var(--color-secondary);"
                >
                  -0.5% market
                </div>
              </div>

              <div style="min-width: 100px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Buying up to
                </div>
                <div style="font-weight: var(--font-semibold);">1.0 BTC</div>
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  ≈ $66,800
                </div>
              </div>

              <div style="min-width: 120px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Limits
                </div>
                <div style="font-size: var(--text-sm);">$500 - $10,000</div>
              </div>

              <div class="flex gap-2" style="min-width: 120px;">
                <span class="offer-card__payment-tag">Bank Wire</span>
              </div>

              <div class="dropdown">
                <button class="dropdown__trigger btn btn--ghost btn--icon"
                  >⋮</button
                >
                <div class="dropdown__menu">
                  <a href="create-listing.html" class="dropdown__item"
                    >✏️ Edit</a
                  >
                  <a href="#" class="dropdown__item">📋 Duplicate</a>
                  <a href="offer-detail.html" class="dropdown__item">👁️ View</a>
                  <div class="dropdown__divider"></div>
                  <a href="#" class="dropdown__item dropdown__item--danger"
                    >🗑️ Delete</a
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Listing 4 - Paused -->
          <div class="card" style="padding: var(--space-5); opacity: 0.7;">
            <div class="flex items-center gap-6" style="flex-wrap: wrap;">
              <div style="text-align: center;">
                <label
                  style="position: relative; display: inline-block; width: 50px; height: 28px;"
                >
                  <input
                    type="checkbox"
                    style="opacity: 0; width: 0; height: 0;"
                  />
                  <span
                    style="position: absolute; cursor: pointer; inset: 0; background: var(--color-gray-300); border-radius: 28px; transition: 0.3s;"
                  >
                    <span
                      style="position: absolute; height: 22px; width: 22px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s;"
                    ></span>
                  </span>
                </label>
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500); margin-top: var(--space-1);"
                >
                  Paused
                </div>
              </div>

              <div style="flex: 1; min-width: 200px;">
                <div class="flex items-center gap-2 mb-2">
                  <span class="badge badge--info">Buying</span>
                  <div class="flex items-center gap-2">
                    <div
                      class="crypto-icon crypto-icon--eth"
                      style="width: 24px; height: 24px; font-size: var(--text-xs);"
                    >
                      Ξ
                    </div>
                    <span style="font-weight: var(--font-semibold);"
                      >Ethereum (ETH)</span
                    >
                  </div>
                </div>
                <div
                  style="font-size: var(--text-sm); color: var(--color-gray-600);"
                >
                  Created Dec 10, 2025 • 8 trades completed
                </div>
              </div>

              <div style="min-width: 140px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Price
                </div>
                <div style="font-weight: var(--font-semibold);">$3,480.00</div>
                <div
                  style="font-size: var(--text-xs); color: var(--color-secondary);"
                >
                  -0.3% market
                </div>
              </div>

              <div style="min-width: 100px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Buying up to
                </div>
                <div style="font-weight: var(--font-semibold);">5.0 ETH</div>
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  ≈ $17,400
                </div>
              </div>

              <div style="min-width: 120px;">
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  Limits
                </div>
                <div style="font-size: var(--text-sm);">$100 - $5,000</div>
              </div>

              <div class="flex gap-2" style="min-width: 120px;">
                <span class="offer-card__payment-tag">Venmo</span>
              </div>

              <div class="dropdown">
                <button class="dropdown__trigger btn btn--ghost btn--icon"
                  >⋮</button
                >
                <div class="dropdown__menu">
                  <a href="create-listing.html" class="dropdown__item"
                    >✏️ Edit</a
                  >
                  <a href="#" class="dropdown__item">📋 Duplicate</a>
                  <a href="offer-detail.html" class="dropdown__item">👁️ View</a>
                  <div class="dropdown__divider"></div>
                  <a href="#" class="dropdown__item dropdown__item--danger"
                    >🗑️ Delete</a
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State for other tabs -->
      <div class="tab-content" id="active-listings">
        <p class="text-muted text-center">Showing active listings...</p>
      </div>
      <div class="tab-content" id="paused-listings">
        <p class="text-muted text-center">Showing paused listings...</p>
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
