<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";

  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  const appName = "Marketto";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load
  const { data } = $props();
  const featuredListings = $derived(data?.featuredListings || []);
  const popularCategories = $derived(data?.popularCategories || []);

  // Search form state
  let searchQuery = $state("");
  let location = $state("");
  let radius = $state("20");

  // Handle search form submission
  /** @param {SubmitEvent} e */
  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (location) params.set("location", location);
    if (radius && radius !== "any") params.set("radius", radius);

    goto(`/marketplace?${params.toString()}`);
  }

  // Navigate to marketplace with category
  /** @param {string} category */
  function navigateToCategory(category) {
    goto(`/marketplace?category=${category}`);
  }

  // Navigate to marketplace
  function navigateToMarketplace() {
    goto("/marketplace");
  }

  // Navigate to login
  function navigateToLogin() {
    goto("/login");
  }

  // Format number with K suffix
  /** @param {number} num */
  function formatNumber(num) {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K+`;
    }
    return num.toString();
  }

  // Format price
  /** @param {string | number | null | undefined} price */
  function formatPrice(price) {
    if (!price) return "£0";
    return `£${Number(price).toLocaleString("en-GB")}`;
  }

  // Get time ago
  /** @param {string | Date | null | undefined} date */
  function getTimeAgo(date) {
    if (!date) return "Recently";
    const now = new Date();
    const then = new Date(date);
    const diffMs = Number(now) - Number(then);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }
</script>

<div class="page-wrapper">
  <!-- ============================================
             HEADER / NAVIGATION
      ============================================ -->
  <NavigationBar />
  <!-- ============================================
             MAIN CONTENT
             ============================================ -->
  <main class="main-content">
    <!-- ============================================
                 HERO SECTION WITH SEARCH
                 ============================================ -->
    <section class="section section--hero">
      <!-- Decorative blobs (Corporate Memphis style) -->
      <div
        class="blob blob--primary"
        style="width: 400px; height: 400px; top: -100px; right: -100px;"
      ></div>
      <div
        class="blob blob--secondary"
        style="width: 300px; height: 300px; bottom: -50px; left: -50px;"
      ></div>

      <div class="container">
        <div
          class="hero__content"
          style="max-width: 900px; margin: 0 auto; text-align: center;"
        >
          <!-- Hero Text -->
          <h1 class="hero__title mb-6">
            Local <span style="color: var(--color-primary);">P2P Trading</span> & Barter
          </h1>
          <p
            class="hero__description text-muted"
            style="font-size: var(--text-lg); margin-bottom: var(--space-4); max-width: 600px; margin-left: auto; margin-right: auto;"
          >
            Connect with your city community for safe, local peer-to-peer trades and barter. 
            Trade with any currency, gold, silver, products, or services — all payment methods welcome. 
            Trade directly with neighbors in your area — reputation matters here.
          </p>
          <div style="display: flex; align-items: center; justify-content: center; gap: var(--space-2); margin-bottom: var(--space-8); flex-wrap: wrap;">
            <span class="badge badge--success" style="font-size: var(--text-sm);">100% Free to Use</span>
            <span class="badge badge--info" style="font-size: var(--text-sm);">No Hidden Fees</span>
          </div>

          <!-- Hero Search Box -->
          <div class="hero-search">
            <form class="search-form" onsubmit={handleSearch}>
              <div class="search-form__grid">
                <!-- What are you looking for? -->
                <div class="form-group">
                  <label for="search-query" class="form-label"
                    >What are you looking for?</label
                  >
                  <div class="input-icon">
                    <span class="input-icon__icon">🔍</span>
                    <input
                      id="search-query"
                      type="text"
                      bind:value={searchQuery}
                      class="form-input"
                      placeholder="e.g., BMW, iPhone, Sofa..."
                    />
                  </div>
                </div>

                <!-- Location -->
                <div class="form-group">
                  <label for="location-input" class="form-label">Location</label
                  >
                  <div class="input-icon">
                    <span class="input-icon__icon">📍</span>
                    <input
                      id="location-input"
                      type="text"
                      bind:value={location}
                      class="form-input"
                      placeholder="City, postcode, or area..."
                    />
                  </div>
                </div>

                <!-- Radius -->
                <div class="form-group search-form__radius">
                  <label for="radius-select" class="form-label">Radius</label>
                  <select
                    id="radius-select"
                    bind:value={radius}
                    class="form-select"
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="20">20 km</option>
                    <option value="50">50 km</option>
                    <option value="100">100 km</option>
                    <option value="any">Any</option>
                  </select>
                </div>

                <!-- Search Button -->
                <button
                  type="submit"
                  class="btn btn--primary btn--lg search-form__btn"
                >
                  Search
                </button>
              </div>
            </form>

            <!-- Quick Category Links -->
            <div class="quick-categories">
              <span class="text-muted" style="font-size: var(--text-sm);"
                >Popular:</span
              >
              <button
                type="button"
                class="category-chip"
                onclick={() => navigateToCategory("electronics")}
              >
                📱 Electronics
              </button>
              <button
                type="button"
                class="category-chip"
                onclick={() => navigateToCategory("motors")}
              >
                🚗 Motors
              </button>
              <button
                type="button"
                class="category-chip"
                onclick={() => navigateToCategory("fashion")}
              >
                👕 Fashion
              </button>
              <button
                type="button"
                class="category-chip"
                onclick={() => navigateToCategory("home")}
              >
                🏠 Home
              </button>
              <button
                type="button"
                class="category-chip"
                onclick={() => navigateToCategory("services")}
              >
                🔧 Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
                 DISCOVER POPULAR CATEGORIES SECTION
                 ============================================ -->
    {#if popularCategories.length > 0}
      <section class="section">
        <div class="container">
          <div class="section__header">
            <h2 class="section__title">Discover popular categories</h2>
          </div>
          <div class="categories-grid">
            {#each popularCategories as category}
              <a
                href="/marketplace?category={category.slug}"
                class="category-card"
              >
                <div class="category-card__image">
                  {#if category.icon}
                    <div class="category-card__icon">{category.icon}</div>
                  {:else}
                    <div class="category-card__placeholder">
                      {category.name.charAt(0)}
                    </div>
                  {/if}
                </div>
                <div class="category-card__body">
                  <h3 class="category-card__title">{category.name}</h3>
                  {#if category.listingCount > 0}
                    <p class="category-card__count">
                      {category.listingCount} {category.listingCount === 1 ? 'listing' : 'listings'}
                    </p>
                  {/if}
                </div>
              </a>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    <!-- ============================================
                 HOW IT WORKS SECTION
                 ============================================ -->
    <section class="section section--gray" id="how-it-works">
      <div class="container">
        <div class="section__header">
          <span class="badge badge--primary">Simple & Secure</span>
          <h2 class="section__title mt-4">How {appName} Works</h2>
          <p class="section__subtitle">
            Buy and sell with confidence in your local community
          </p>
        </div>

        <div class="grid grid-cols-4 gap-6">
          <!-- Step 1 -->
          <div class="card card--clickable">
            <div class="card__body text-center">
              <div
                style="width: 80px; height: 80px; margin: 0 auto var(--space-4); background: var(--color-primary-subtle); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-3xl);"
              >
                🔍
              </div>
              <div
                style="width: 32px; height: 32px; margin: 0 auto var(--space-4); background: var(--color-primary); border-radius: var(--radius-full); color: white; display: flex; align-items: center; justify-content: center; font-weight: var(--font-bold); font-size: var(--text-sm);"
              >
                1
              </div>
              <h4 class="card__title">Search Nearby</h4>
              <p class="card__content">
                Find items near you by category, location, and price. Set your
                radius to discover local deals.
              </p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="card card--clickable">
            <div class="card__body text-center">
              <div
                style="width: 80px; height: 80px; margin: 0 auto var(--space-4); background: rgba(255, 107, 107, 0.1); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-3xl);"
              >
                💬
              </div>
              <div
                style="width: 32px; height: 32px; margin: 0 auto var(--space-4); background: var(--color-primary); border-radius: var(--radius-full); color: white; display: flex; align-items: center; justify-content: center; font-weight: var(--font-bold); font-size: var(--text-sm);"
              >
                2
              </div>
              <h4 class="card__title">Chat & Agree</h4>
              <p class="card__content">
                Message the seller, ask questions, negotiate price, and arrange
                viewing or delivery.
              </p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="card card--clickable">
            <div class="card__body text-center">
              <div
                style="width: 80px; height: 80px; margin: 0 auto var(--space-4); background: rgba(78, 205, 196, 0.1); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-3xl);"
              >
                💳
              </div>
              <div
                style="width: 32px; height: 32px; margin: 0 auto var(--space-4); background: var(--color-primary); border-radius: var(--radius-full); color: white; display: flex; align-items: center; justify-content: center; font-weight: var(--font-bold); font-size: var(--text-sm);"
              >
                3
              </div>
              <h4 class="card__title">Complete Payment</h4>
              <p class="card__content">
                Pay with any currency, gold, silver, products, or services. 
                All payment methods are welcome and encouraged.
              </p>
            </div>
          </div>

          <!-- Step 4 -->
          <div class="card card--clickable">
            <div class="card__body text-center">
              <div
                style="width: 80px; height: 80px; margin: 0 auto var(--space-4); background: rgba(255, 230, 109, 0.2); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-3xl);"
              >
                ✅
              </div>
              <div
                style="width: 32px; height: 32px; margin: 0 auto var(--space-4); background: var(--color-primary); border-radius: var(--radius-full); color: white; display: flex; align-items: center; justify-content: center; font-weight: var(--font-bold); font-size: var(--text-sm);"
              >
                4
              </div>
              <h4 class="card__title">Complete & Rate</h4>
              <p class="card__content">
                Confirm receipt, release payment to seller, and leave a review
                for future buyers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
                 TRUST & SAFETY SECTION
                 ============================================ -->
    <section class="section">
      <div class="container">
        <div
          class="grid"
          style="grid-template-columns: 1fr 1fr; gap: var(--space-12); align-items: center;"
        >
          <!-- Visual -->
          <div style="position: relative;">
            <div
              style="background: linear-gradient(135deg, var(--color-primary-subtle), rgba(78, 205, 196, 0.1)); border-radius: var(--radius-2xl); padding: var(--space-10); position: relative;"
            >
              <div class="card" style="margin-bottom: var(--space-4);">
                <div class="card__body flex items-center gap-4">
                  <div
                    style="width: 48px; height: 48px; background: var(--color-tertiary); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: var(--text-xl);"
                  >
                    ✅
                  </div>
                  <div>
                    <div style="font-weight: var(--font-semibold);">
                      Verified Sellers
                    </div>
                    <div class="text-muted" style="font-size: var(--text-sm);">
                      ID verification for trusted trading
                    </div>
                  </div>
                  <span
                    style="color: var(--color-primary); font-size: var(--text-xl); margin-left: auto;"
                    >✓</span
                  >
                </div>
              </div>
              <div class="card">
                <div class="card__body flex items-center gap-4">
                  <div
                    style="width: 48px; height: 48px; background: var(--color-secondary); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: var(--text-xl);"
                  >
                    ⚖️
                  </div>
                  <div>
                    <div style="font-weight: var(--font-semibold);">
                      Dispute Resolution
                    </div>
                    <div class="text-muted" style="font-size: var(--text-sm);">
                      Fair mediation if issues arise
                    </div>
                  </div>
                  <span
                    style="color: var(--color-primary); font-size: var(--text-xl); margin-left: auto;"
                    >✓</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Text -->
          <div>
            <span class="badge badge--info">Trust & Safety</span>
            <h2 class="section__title mt-4">Safe Local P2P Trading & Barter</h2>
            <p
              class="text-muted"
              style="font-size: var(--text-lg); margin-bottom: var(--space-6);"
            >
              {appName} is a local peer-to-peer marketplace for city barter and trades. 
              We track meetings to keep everyone safe, and <strong>reputation matters</strong> — 
              users who abuse or scam will lose access forever.
            </p>
            <ul style="list-style: none; padding: 0;">
              <li class="flex items-center gap-3 mb-4">
                <span style="color: var(--color-primary);">✓</span>
                <span><strong>100% Free</strong> - No fees, no commissions, no hidden costs</span>
              </li>
              <li class="flex items-center gap-3 mb-4">
                <span style="color: var(--color-primary);">✓</span>
                <span><strong>Flexible Payment Methods</strong> - Trade with any currency, gold, silver, products, or services — all methods welcome and encouraged</span>
              </li>
              <li class="flex items-center gap-3 mb-4">
                <span style="color: var(--color-primary);">✓</span>
                <span><strong>Meeting Tracking</strong> - We track all meetings to keep you safe during local trades</span>
              </li>
              <li class="flex items-center gap-3 mb-4">
                <span style="color: var(--color-primary);">✓</span>
                <span><strong>Zero Tolerance Policy</strong> - Users caught abusing or scamming lose access forever</span>
              </li>
              <li class="flex items-center gap-3 mb-4">
                <span style="color: var(--color-primary);">✓</span>
                <span><strong>Reputation Matters</strong> - Your trading history and reviews build your reputation in the community</span>
              </li>
              <li class="flex items-center gap-3 mb-4">
                <span style="color: var(--color-primary);">✓</span>
                <span><strong>Prohibited Items</strong> - No drugs, weapons, or illegal products allowed</span>
              </li>
              <li class="flex items-center gap-3 mb-4">
                <span style="color: var(--color-primary);">✓</span>
                <span>24/7 support for dispute resolution</span>
              </li>
              <li class="flex items-center gap-3">
                <span style="color: var(--color-primary);">✓</span>
                <span>Secure messaging with no personal info shared</span>
              </li>
            </ul>
            <a href="/marketplace" class="btn btn--primary btn--lg mt-6"
              >Start Browsing</a
            >
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
                 CTA SECTION
                 ============================================ -->
    <section
      class="section section--primary"
      style="position: relative; overflow: hidden;"
    >
      <!-- Decorative elements -->
      <div
        style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: var(--radius-full);"
      ></div>
      <div
        style="position: absolute; bottom: -80px; left: -80px; width: 300px; height: 300px; background: rgba(255,255,255,0.05); border-radius: var(--radius-full);"
      ></div>

      <div class="container" style="position: relative; z-index: 1;">
        <div class="text-center" style="max-width: 700px; margin: 0 auto;">
          <h2 style="color: white; margin-bottom: var(--space-4);">
            Ready to Start Selling?
          </h2>
          <p
            style="color: rgba(255,255,255,0.9); font-size: var(--text-lg); margin-bottom: var(--space-8);"
          >
            Join your local P2P trading community. List items for barter or sale <strong>completely free</strong>. 
            Build your reputation through honest trades. No fees, no commissions, ever.
          </p>
          <div class="flex justify-center gap-4">
            <a href="/my-listings" class="btn btn--secondary btn--xl">
              Create Free Listing
            </a>
            <a
              href="/marketplace"
              class="btn btn--xl"
              style="background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3);"
            >
              Browse Marketplace
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- ============================================
             FOOTER
             ============================================ -->
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <!-- Brand Column -->
        <div class="footer__brand">
          <a href="/" class="logo footer__logo">
            <span class="logo__icon">🏪</span>
            <span>LocalMarket</span>
          </a>
          <p class="footer__description">
            The best way to buy and sell locally. Connect with your community.
          </p>
          <div class="footer__social">
            <button
              type="button"
              class="footer__social-link"
              aria-label="Twitter">𝕏</button
            >
            <button
              type="button"
              class="footer__social-link"
              aria-label="Facebook">📘</button
            >
            <button
              type="button"
              class="footer__social-link"
              aria-label="Instagram">📷</button
            >
            <button
              type="button"
              class="footer__social-link"
              aria-label="YouTube">▶️</button
            >
          </div>
        </div>

        <!-- Categories Column -->
        <div class="footer__column">
          <h4 class="footer__column-title">Categories</h4>
          <nav class="footer__links">
            <a href="/marketplace?category=vehicles" class="footer__link"
              >Vehicles</a
            >
            <a href="/marketplace?category=electronics" class="footer__link"
              >Electronics</a
            >
            <a href="/marketplace?category=property" class="footer__link"
              >Property</a
            >
            <a href="/marketplace?category=fashion" class="footer__link"
              >Fashion</a
            >
          </nav>
        </div>

        <!-- Resources Column -->
        <div class="footer__column">
          <h4 class="footer__column-title">Resources</h4>
          <nav class="footer__links">
            <button type="button" class="footer__link">Help Center</button>
            <button type="button" class="footer__link">Safety Tips</button>
            <button type="button" class="footer__link">Seller Guide</button>
            <button type="button" class="footer__link">Buyer Guide</button>
          </nav>
        </div>

        <!-- Company Column -->
        <div class="footer__column">
          <h4 class="footer__column-title">Company</h4>
          <nav class="footer__links">
            <button type="button" class="footer__link">About Us</button>
            <button type="button" class="footer__link">Careers</button>
            <button type="button" class="footer__link">Blog</button>
            <button type="button" class="footer__link">Contact</button>
          </nav>
        </div>
      </div>

      <div class="footer__bottom">
        <p>&copy; 2025 {appName}. All rights reserved.</p>
        <nav class="footer__legal-links">
          <a href="/privacy" class="footer__link">Privacy Policy</a>
          <a href="/terms" class="footer__link">Terms of Service</a>
          <a href="/cookie-policy" class="footer__link">Cookie Policy</a>
        </nav>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Mobile menu styles */
  .nav-overlay.active {
    display: block;
  }

  .nav.active {
    transform: translateX(0);
  }

  .menu-toggle.active .menu-toggle__bar {
    transform: rotate(45deg);
  }

  .menu-toggle.active .menu-toggle__bar::before {
    transform: rotate(-90deg);
    top: 0;
  }

  .menu-toggle.active .menu-toggle__bar::after {
    opacity: 0;
  }

  /* Category card button styles */
  .category-card {
    cursor: pointer;
    border: none;
    background: none;
    text-align: left;
    padding: 0;
    width: 100%;
  }

  .category-chip {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    text-decoration: none;
  }

  .category-chip:hover {
    text-decoration: underline;
  }

  /* Footer button styles */
  .footer__social-link,
  .footer__link {
    cursor: pointer;
  }

  .footer__social-link:focus,
  .footer__link:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* ============================================
     MOBILE-FIRST RESPONSIVE STYLES
     ============================================ */

  /* Hero Section - Mobile */
  .section--hero {
    position: relative;
    overflow: hidden;
  }

  .blob {
    display: none; /* Hide decorative blobs on mobile */
  }

  .hero__content {
    padding: var(--space-4) 0;
  }

  .hero__title {
    font-size: var(--text-2xl);
    line-height: 1.2;
  }

  .hero__description {
    font-size: var(--text-base);
  }

  /* Search Form - Mobile */
  .search-form__grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .search-form__radius {
    width: 100%;
  }

  .search-form__btn {
    width: 100%;
    margin-top: var(--space-2);
  }

  /* Quick Categories - Mobile */
  .quick-categories {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
    justify-content: center;
    margin-top: var(--space-4);
    font-size: var(--text-sm);
  }

  .quick-categories .category-chip {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-2);
  }

  /* How It Works Section - Mobile */
  .grid-cols-4 {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  /* Trust & Safety Section - Mobile */
  .section > .grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* CTA Section - Mobile */
  .flex.justify-center.gap-4 {
    flex-direction: column;
    width: 100%;
  }

  .flex.justify-center.gap-4 .btn {
    width: 100%;
  }

  /* ============================================
     TABLET STYLES (768px and up)
     ============================================ */
  @media (min-width: 768px) {
    .blob {
      display: block; /* Show blobs on tablet+ */
    }

    .hero__title {
      font-size: var(--text-4xl);
    }

    .hero__description {
      font-size: var(--text-lg);
    }

    .search-form__grid {
      display: grid;
      grid-template-columns: 2fr 2fr 1fr auto;
      gap: var(--space-3);
      align-items: end;
    }

    .search-form__btn {
      width: auto;
      margin-top: 0;
    }

    .quick-categories {
      justify-content: flex-start;
      margin-top: var(--space-6);
    }

    .grid-cols-4 {
      grid-template-columns: repeat(2, 1fr);
    }

    .section > .grid {
      grid-template-columns: 1fr 1fr;
      display: grid;
    }

    .flex.justify-center.gap-4 {
      flex-direction: row;
    }

    .flex.justify-center.gap-4 .btn {
      width: auto;
    }
  }

  /* ============================================
     DESKTOP STYLES (1024px and up)
     ============================================ */
  @media (min-width: 1024px) {
    .hero__title {
      font-size: var(--text-5xl);
    }

    .grid-cols-4 {
      grid-template-columns: repeat(4, 1fr);
    }

    .search-form__grid {
      grid-template-columns: 3fr 2fr 1.5fr auto;
    }
  }

  /* ============================================
     LARGE DESKTOP STYLES (1280px and up)
     ============================================ */
  @media (min-width: 1280px) {
    .hero__content {
      max-width: 900px;
    }
  }

  /* ============================================
     CATEGORIES GRID SECTION
     ============================================ */
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .category-card {
    display: flex;
    flex-direction: column;
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: all var(--transition-base);
    cursor: pointer;
  }

  .category-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary);
  }

  .category-card__image {
    width: 100%;
    height: 200px;
    background: var(--color-gray-50);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .category-card__icon {
    font-size: 4rem;
    line-height: 1;
  }

  .category-card__placeholder {
    width: 80px;
    height: 80px;
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
  }

  .category-card__body {
    padding: var(--space-4);
    text-align: center;
  }

  .category-card__title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--color-gray-900);
    margin: 0 0 var(--space-2) 0;
  }

  .category-card__count {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
    margin: 0;
  }

  @media (min-width: 768px) {
    .categories-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-6);
    }

    .category-card__image {
      height: 220px;
    }

    .category-card__icon {
      font-size: 5rem;
    }
  }

  @media (min-width: 1024px) {
    .category-card__image {
      height: 240px;
    }
  }
</style>
