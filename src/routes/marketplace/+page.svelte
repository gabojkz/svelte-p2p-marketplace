<script>
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import CategorySelect from "$lib/components/CategorySelect.svelte";
  import ListingCard from "$lib/components/ListingCard.svelte";
  const appName = "Marketto";
  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data } = $props();

  // Access listings and categories from page data
  const listings = $derived(data?.listings || []);
  const categories = $derived(data?.categories || []);
  const totalCount = $derived(data?.totalCount || 0);
  const currentPage = $derived(data?.currentPage || 1);
  const totalPages = $derived(data?.totalPages || 0);
  const filters = $derived(
    data?.filters || {
      searchQuery: "",
      categorySlug: "",
      location: "",
      sortBy: "newest",
    },
  );

  // Handle category change
  /** @param {string} categorySlug */
  function handleCategoryChange(categorySlug) {
    const url = new URL(window.location.href);
    if (categorySlug === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", categorySlug);
    }
    goto(url.pathname + url.search);
  }

  // Mobile filter state
  let mobileFilterOpen = $state(false);

  // Toggle mobile filter sidebar
  function toggleMobileFilters() {
    mobileFilterOpen = !mobileFilterOpen;
  }

  // Close mobile filters
  function closeMobileFilters() {
    mobileFilterOpen = false;
  }
</script>

<div class="page-wrapper">
  <!-- ============================================
             HEADER
             ============================================ -->
  <header class="header">
    <div class="container">
      <div class="header__inner">
        <a href="/" class="logo">
          <span class="logo__icon">M</span>
          <span class="logo__text">{appName}</span>
        </a>

        <div class="nav-overlay"></div>

        <nav class="nav" aria-label="Main navigation">
          <a href="marketplace.html" class="nav__link nav__link--active"
            >Browse</a
          >
          <a href="marketplace.html?category=vehicles" class="nav__link"
            >Vehicles</a
          >
          <a href="marketplace.html?category=electronics" class="nav__link"
            >Electronics</a
          >
          <a href="wallet.html" class="nav__link">Wallet</a>
        </nav>

        <div class="header__actions">
          <a href="dashboard.html" class="btn btn--ghost">Dashboard</a>
          <a href="/create-listing" class="btn btn--primary">+ Sell Item</a>
          <button class="menu-toggle" aria-label="Toggle menu">
            <span class="menu-toggle__bar"></span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- ============================================
             MAIN CONTENT
             ============================================ -->
  <main class="main-content">
    <div class="container">
      <!-- ============================================
                     MAIN LAYOUT (SIDEBAR + LISTINGS)
                     ============================================ -->
      <div class="marketplace-layout">
        <!-- Mobile Filter Overlay -->
        <div
          class="filters-overlay"
          class:active={mobileFilterOpen}
          onclick={closeMobileFilters}
          role="button"
          tabindex="0"
          aria-label="Close filters"
          onkeydown={(e) => e.key === "Enter" && closeMobileFilters()}
        ></div>

        <!-- ============================================
                         UNIFIED SIDEBAR (SEARCH + FILTERS)
                         ============================================ -->
        <aside
          class="filters-sidebar"
          id="filtersSidebar"
          class:active={mobileFilterOpen}
        >
          <div class="filter-panel">
            <!-- Sell Button -->
            <a
              href="/create-listing"
              class="btn btn--outline btn--block sell-btn"
            >
              <span>+</span>Sell Something
            </a>

            <!-- Filters Header -->
            <div class="filter-panel__header">
              <h3 class="filter-panel__title">Filters</h3>
              <button class="btn btn--ghost btn--xs" id="clearAllFilters"
                >Clear all</button
              >
            </div>

            <!-- Search Input -->
            <div class="filter-group">
              <label class="filter-group__label">Search</label>
              <input
                type="text"
                id="searchQuery"
                class="form-input"
                placeholder="What are you looking for?"
              />
            </div>

            <!-- Type Dropdown -->
            <div class="filter-group">
              <label class="filter-group__label">Type</label>
              <select id="listingType" class="form-select">
                <option value="all">All Types</option>
                <option value="product">Products</option>
                <option value="service">Services</option>
              </select>
            </div>

            <!-- Category Dropdown -->
            <CategorySelect
              categories={categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                type: cat.type,
                icon: cat.icon,
                parentId: cat.parentId,
              }))}
              selectedValue={filters.categorySlug || "all"}
              id="categorySelect"
              onChange={handleCategoryChange}
            />

            <!-- Price Range -->
            <div class="filter-group">
              <label class="filter-group__label">Price Range</label>
              <div class="filter-group__row">
                <div class="filter-input-half">
                  <label class="form-label--sm">Min price</label>
                  <input
                    type="number"
                    id="minPrice"
                    class="form-input"
                    placeholder="Min"
                  />
                </div>
                <div class="filter-input-half">
                  <label class="form-label--sm">Max price</label>
                  <input
                    type="number"
                    id="maxPrice"
                    class="form-input"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            <!-- Location -->
            <div class="filter-group">
              <label class="filter-group__label">Location</label>
              <input
                type="text"
                id="locationInput"
                class="form-input"
                placeholder="City or address"
                value=""
              />
            </div>

            <!-- Radius -->
            <div class="filter-group">
              <label class="filter-group__label">Radius (km)</label>
              <select id="radiusSelect" class="form-select">
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20" selected>20 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
                <option value="any">Any distance</option>
              </select>
            </div>

            <!-- Condition -->
            <div class="filter-group">
              <label class="filter-group__label">Condition</label>
              <div class="filter-radios">
                <label class="radio-label">
                  <input type="radio" name="condition" value="new" /> New
                </label>
                <label class="radio-label">
                  <input type="radio" name="condition" value="like-new" /> Like New
                </label>
                <label class="radio-label">
                  <input type="radio" name="condition" value="used" checked /> Used
                </label>
                <label class="radio-label">
                  <input type="radio" name="condition" value="for-parts" /> For Parts
                </label>
              </div>
            </div>

            <!-- Sort -->
            <div class="filter-group">
              <label class="filter-group__label">Sort</label>
              <select id="sortSelect" class="form-select">
                <option value="newest">Newest First</option>
                <option value="relevant">Most Relevant</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="distance">Nearest First</option>
              </select>
            </div>

            <!-- Seller Reputation -->
            <div class="filter-group">
              <label class="filter-group__label">Seller reputation</label>
              <select id="sellerRating" class="form-select">
                <option value="any">Any rating</option>
                <option value="5">⭐⭐⭐⭐⭐ Only</option>
                <option value="4">⭐⭐⭐⭐ & up</option>
                <option value="3">⭐⭐⭐ & up</option>
              </select>
            </div>

            <!-- Verified Only Toggle -->
            <div class="filter-group">
              <label class="checkbox-label checkbox-label--bold">
                <input type="checkbox" id="verifiedOnly" /> Verified sellers only
              </label>
            </div>

            <!-- Apply Button (for mobile) -->
            <button
              class="btn btn--primary btn--block filter-apply-btn"
              id="applyFiltersBtn"
            >
              Apply Filters
            </button>

            <!-- Close Button (mobile only) -->
            <button
              class="filter-close-btn"
              id="filterCloseBtn"
              onclick={closeMobileFilters}
              aria-label="Close filters">✕</button
            >
          </div>
        </aside>

        <!-- ============================================
                         LISTINGS GRID
                         ============================================ -->
        <div class="listings-section">
          <!-- Results Header -->
          <div
            class="results-header"
            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: var(--space-3);"
          >
            <div
              class="results-count"
              style="display: flex; align-items: center; gap: var(--space-3);"
            >
              <!-- Mobile Filter Button (hidden on desktop) -->
              <button
                class="mobile-filter-btn"
                id="mobileFilterBtn"
                onclick={toggleMobileFilters}
                aria-label="Open filters"
                style="display: none;"
              >
                <span>⚙️</span>
                <span>Filters</span>
              </button>
              <span>Showing <strong>248</strong> listings near Newcastle</span>
            </div>
            <div
              class="results-sort"
              style="display: flex; align-items: center; gap: var(--space-2);"
            >
              <label class="text-muted" style="font-size: var(--text-sm);"
                >Sort by:</label
              >
              <select class="form-select form-select--sm" style="width: auto;">
                <option value="relevance">Most Relevant</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="distance">Nearest First</option>
              </select>
              <div
                class="view-toggle"
                style="display: flex; gap: var(--space-1);"
              >
                <button class="view-btn" aria-label="Grid view">⊞</button>
                <button class="view-btn view-btn--active" aria-label="List view"
                  >☰</button
                >
              </div>
            </div>
          </div>

          <!-- Listings List -->
          <div class="listings-list">
            {#each listings as listing}
              <ListingCard {listing} marketplaceUser={data?.marketplaceUser} />
            {/each}
          </div>

          <!-- Pagination -->
          <div
            class="pagination"
            style="display: flex; justify-content: center; gap: var(--space-2); margin-top: var(--space-8);"
          >
            <button class="pagination__btn" disabled>←</button>
            <button class="pagination__btn pagination__btn--active">1</button>
            <button class="pagination__btn">2</button>
            <button class="pagination__btn">3</button>
            <span class="pagination__dots">...</span>
            <button class="pagination__btn">28</button>
            <button class="pagination__btn">→</button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <style>
    /* Mobile Filter Overlay - Behind sidebar */
    .filters-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 0.3s ease,
        visibility 0.3s ease;
    }

    .filters-overlay.active {
      display: block;
      opacity: 1;
      visibility: visible;
    }

    /* Ensure sidebar is above overlay and fully interactive */
    .filters-sidebar.active {
      z-index: 1000;
    }

    /* On mobile, show overlay when sidebar is active */
    @media screen and (max-width: 1024px) {
      .filters-overlay.active {
        display: block;
      }
    }
  </style>

  <!-- ============================================
             FOOTER
             ============================================ -->
  <footer class="footer footer--compact">
    <div class="container">
      <div class="footer__bottom">
        <div class="flex items-center gap-3">
          <span class="logo__icon">🏪</span>
          <span>&copy; 2025 {appName}. All rights reserved.</span>
        </div>
        <nav class="footer__legal-links">
          <a href="#" class="footer__link">Privacy</a>
          <a href="#" class="footer__link">Terms</a>
          <a href="#" class="footer__link">Contact</a>
        </nav>
      </div>
    </div>
  </footer>
</div>
