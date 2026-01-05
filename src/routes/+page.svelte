<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import Footer from "$lib/components/Footer.svelte";

  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  const appName = "Marketto";

  const session = useSession();

  // Get data from server load
  const { data, userLanguage = "en" } = $props();

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
</script>

<div class="page-wrapper">
  <!-- ============================================
             HEADER / NAVIGATION
      ============================================ -->
  <NavigationBar {userLanguage} />
  <!-- ============================================
             MAIN CONTENT
             ============================================ -->
  <main class="main-content main-content--no-padding">
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
            Local <span style="color: var(--color-primary);">P2P Trading</span> &
            Barter
          </h1>
          <p
            class="hero__description text-muted"
            style="font-size: var(--text-lg); margin-bottom: var(--space-4); max-width: 600px; margin-left: auto; margin-right: auto;"
          >
            {#if userLanguage === 'es'}
              Conecta con personas en tu ciudad para comercio y trueque local seguro entre pares. Intercambia usando cualquier moneda en efectivo, oro, plata, bienes o servicios. Todos los métodos de pago son bienvenidos.
            {:else}
              Connect with people in your city for safe, local peer-to-peer
              trading and bartering. Trade using any currency cash, gold, silver,
              goods, or services. All payment methods are welcome.
            {/if}
          </p>
          <div
            style="display: flex; align-items: center; justify-content: center; gap: var(--space-2); margin-bottom: var(--space-8); flex-wrap: wrap;"
          >
            <span
              class="badge badge--success"
              style="font-size: var(--text-sm);">100% Free to Use</span
            >
            <span class="badge badge--info" style="font-size: var(--text-sm);"
              >No Hidden Fees</span
            >
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
                Pay with any currency, gold, silver, products, or services. All
                payment methods are welcome and encouraged.
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
    <section class="section trust-safety-section">
      <div class="container">
        <div class="trust-safety-section__grid">
          <!-- Visual -->
          <div class="trust-safety-section__visual">
            <div class="trust-safety-section__cards-wrapper">
              <div class="card trust-safety-section__card">
                <div class="card__body trust-safety-section__card-body">
                  <div class="trust-safety-section__icon trust-safety-section__icon--tertiary">
                    ✅
                  </div>
                  <div class="trust-safety-section__card-content">
                    <div class="trust-safety-section__card-title">
                      Verified Sellers
                    </div>
                    <div class="text-muted trust-safety-section__card-description">
                      ID verification for trusted trading
                    </div>
                  </div>
                  <span class="trust-safety-section__check">✓</span>
                </div>
              </div>
              <div class="card trust-safety-section__card">
                <div class="card__body trust-safety-section__card-body">
                  <div class="trust-safety-section__icon trust-safety-section__icon--secondary">
                    ⚖️
                  </div>
                  <div class="trust-safety-section__card-content">
                    <div class="trust-safety-section__card-title">
                      Dispute Resolution
                    </div>
                    <div class="text-muted trust-safety-section__card-description">
                      Fair mediation if issues arise
                    </div>
                  </div>
                  <span class="trust-safety-section__check">✓</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Text -->
          <div class="trust-safety-section__content">
            <span class="badge badge--info">Trust & Safety</span>
            <h2 class="section__title mt-4">Safe Local P2P Trading & Barter</h2>
            <p class="text-muted trust-safety-section__description">
              {appName} is a local peer-to-peer marketplace for city barter and trades. 
              We track meetings to keep everyone safe, and
              <strong>reputation matters</strong> — users who abuse or scam will
              lose access forever.
            </p>
            <ul class="trust-safety-section__features">
              <li class="trust-safety-section__feature">
                <span class="trust-safety-section__feature-icon">✓</span>
                <span
                  ><strong>100% Free</strong> - No fees, no commissions, no hidden
                  costs</span
                >
              </li>
              <li class="trust-safety-section__feature">
                <span class="trust-safety-section__feature-icon">✓</span>
                <span
                  ><strong>Flexible Payment Methods</strong> - Trade with any currency,
                  gold, silver, products, or services — all methods welcome and encouraged</span
                >
              </li>
              <li class="trust-safety-section__feature">
                <span class="trust-safety-section__feature-icon">✓</span>
                <span
                  ><strong>Meeting Tracking</strong> - We track all meetings to keep
                  you safe during local trades</span
                >
              </li>
              <li class="trust-safety-section__feature">
                <span class="trust-safety-section__feature-icon">✓</span>
                <span
                  ><strong>Zero Tolerance Policy</strong> - Users caught abusing
                  or scamming lose access forever</span
                >
              </li>
              <li class="trust-safety-section__feature">
                <span class="trust-safety-section__feature-icon">✓</span>
                <span
                  ><strong>Reputation Matters</strong> - Your trading history and
                  reviews build your reputation in the community</span
                >
              </li>
              <li class="trust-safety-section__feature">
                <span class="trust-safety-section__feature-icon">✓</span>
                <span
                  ><strong>Prohibited Items</strong> - No drugs, weapons, or illegal
                  products allowed</span
                >
              </li>
              <li class="trust-safety-section__feature">
                <span class="trust-safety-section__feature-icon">✓</span>
                <span>24/7 support for dispute resolution</span>
              </li>
              <li class="trust-safety-section__feature">
                <span class="trust-safety-section__feature-icon">✓</span>
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
    <section class="section section--primary cta-section">
      <!-- Decorative elements -->
      <div class="cta-section__blob cta-section__blob--top"></div>
      <div class="cta-section__blob cta-section__blob--bottom"></div>

      <div class="container cta-section__container">
        <div class="cta-section__content">
          <h2 class="cta-section__title">
            Ready to Start Selling?
          </h2>
          <p class="cta-section__description">
            Join your local P2P trading community. List items for barter or sale <strong
              >completely free</strong
            >. Build your reputation through honest trades. No fees, no
            commissions, ever.
          </p>
          <div class="cta-section__actions">
            <a href="/my-listings" class="btn btn--secondary btn--xl">
              Create Free Listing
            </a>
            <a href="/marketplace" class="btn btn--xl cta-section__btn-secondary">
              Browse Marketplace
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <Footer {appName} />
</div>

<style>
  /* ============================================
     COMPONENT-SPECIFIC STYLES
     ============================================ */

  /* Category Chip */
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

  /* ============================================
     MOBILE-FIRST STYLES
     ============================================ */

  /* Hero Section */
  .section--hero {
    position: relative;
    overflow: hidden;
  }

  .blob {
    display: none;
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

  /* Search Form */
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

  /* Quick Categories */
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

  /* Grid Layouts */
  .grid-cols-4 {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  /* Trust & Safety Section */
  .trust-safety-section__grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .trust-safety-section__visual {
    position: relative;
  }

  .trust-safety-section__cards-wrapper {
    background: linear-gradient(135deg, var(--color-primary-subtle), rgba(78, 205, 196, 0.1));
    border-radius: var(--radius-2xl);
    padding: var(--space-6);
    position: relative;
  }

  .trust-safety-section__card {
    margin-bottom: var(--space-4);
  }

  .trust-safety-section__card:last-child {
    margin-bottom: 0;
  }

  .trust-safety-section__card-body {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .trust-safety-section__icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xl);
    flex-shrink: 0;
  }

  .trust-safety-section__icon--tertiary {
    background: var(--color-tertiary);
  }

  .trust-safety-section__icon--secondary {
    background: var(--color-secondary);
  }

  .trust-safety-section__card-content {
    flex: 1;
    min-width: 0;
  }

  .trust-safety-section__card-title {
    font-weight: var(--font-semibold);
    margin-bottom: var(--space-1);
  }

  .trust-safety-section__card-description {
    font-size: var(--text-sm);
  }

  .trust-safety-section__check {
    color: var(--color-primary);
    font-size: var(--text-xl);
    margin-left: auto;
    flex-shrink: 0;
  }

  .trust-safety-section__description {
    font-size: var(--text-base);
    margin-bottom: var(--space-6);
    line-height: var(--leading-relaxed);
  }

  .trust-safety-section__features {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--space-6) 0;
  }

  .trust-safety-section__feature {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .trust-safety-section__feature:last-child {
    margin-bottom: 0;
  }

  .trust-safety-section__feature-icon {
    color: var(--color-primary);
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* CTA Section */
  .cta-section {
    position: relative;
    overflow: hidden;
  }

  .cta-section__blob {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
    display: none;
  }

  .cta-section__blob--top {
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
  }

  .cta-section__blob--bottom {
    bottom: -80px;
    left: -80px;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.05);
  }

  .cta-section__container {
    position: relative;
    z-index: 1;
  }

  .cta-section__content {
    max-width: 700px;
    margin: 0 auto;
    text-align: center;
  }

  .cta-section__title {
    color: white;
    margin-bottom: var(--space-4);
    font-size: var(--text-2xl);
    line-height: 1.2;
  }

  .cta-section__description {
    color: rgba(255, 255, 255, 0.9);
    font-size: var(--text-base);
    margin-bottom: var(--space-6);
    line-height: var(--leading-relaxed);
  }

  .cta-section__actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    width: 100%;
  }

  .cta-section__actions .btn {
    width: 100%;
  }

  .cta-section__btn-secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .cta-section__btn-secondary:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  /* ============================================
     TABLET STYLES (768px and up)
     ============================================ */
  @media (min-width: 768px) {
    .blob {
      display: block;
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

    .trust-safety-section__grid {
      grid-template-columns: 1fr 1fr;
      display: grid;
      gap: var(--space-12);
      align-items: center;
    }

    .trust-safety-section__cards-wrapper {
      padding: var(--space-10);
    }

    .trust-safety-section__description {
      font-size: var(--text-lg);
    }

    .cta-section__blob {
      display: block;
    }

    .cta-section__title {
      font-size: var(--text-3xl);
    }

    .cta-section__description {
      font-size: var(--text-lg);
      margin-bottom: var(--space-8);
    }

    .cta-section__actions {
      flex-direction: row;
    justify-content: center;
      gap: var(--space-4);
    }

    .cta-section__actions .btn {
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
</style>
