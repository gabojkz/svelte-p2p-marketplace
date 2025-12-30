<script>
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import CategorySelect from "$lib/components/CategorySelect.svelte";
  import ListingCard from "$lib/components/ListingCard.svelte";
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  
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
      type: "all",
      minPrice: "",
      maxPrice: "",
      condition: "",
    },
  );

  // Local filter state - initialize from URL params
  let searchQuery = $state("");
  let listingType = $state("all");
  let categorySlug = $state("");
  let minPrice = $state("");
  let maxPrice = $state("");
  let location = $state("");
  let radius = $state("20");
  let condition = $state("");
  let sortBy = $state("newest");

  // Update local state when filters change from server
  $effect(() => {
    const currentFilters = data?.filters;
    if (currentFilters) {
      searchQuery = currentFilters.searchQuery || "";
      listingType = currentFilters.type || "all";
      categorySlug = currentFilters.categorySlug || "";
      minPrice = currentFilters.minPrice || "";
      maxPrice = currentFilters.maxPrice || "";
      location = currentFilters.location || "";
      radius = currentFilters.radius || "20";
      condition = currentFilters.condition || "";
      sortBy = currentFilters.sortBy || "newest";
    }
  });

  // Mobile filter state
  let mobileFilterOpen = $state(false);
  
  // Search debounce timeout
  /** @type {ReturnType<typeof setTimeout> | null} */
  let searchTimeout = $state(null);

  // Toggle mobile filter sidebar
  function toggleMobileFilters() {
    mobileFilterOpen = !mobileFilterOpen;
  }

  // Close mobile filters
  function closeMobileFilters() {
    mobileFilterOpen = false;
  }

  // Update URL with current filters
  function applyFilters() {
    const url = new URL(window.location.href);
    
    // Search query
    if (searchQuery.trim()) {
      url.searchParams.set("q", searchQuery.trim());
    } else {
      url.searchParams.delete("q");
    }

    // Type
    if (listingType && listingType !== "all") {
      url.searchParams.set("type", listingType);
    } else {
      url.searchParams.delete("type");
    }

    // Category
    if (categorySlug && categorySlug !== "all") {
      url.searchParams.set("category", categorySlug);
    } else {
      url.searchParams.delete("category");
    }

    // Price range
    if (minPrice) {
      url.searchParams.set("minPrice", minPrice);
    } else {
      url.searchParams.delete("minPrice");
    }
    if (maxPrice) {
      url.searchParams.set("maxPrice", maxPrice);
    } else {
      url.searchParams.delete("maxPrice");
    }

    // Location
    if (location.trim()) {
      url.searchParams.set("location", location.trim());
    } else {
      url.searchParams.delete("location");
    }

    // Radius
    if (radius && radius !== "any") {
      url.searchParams.set("radius", radius);
    } else {
      url.searchParams.delete("radius");
    }

    // Condition
    if (condition) {
      url.searchParams.set("condition", condition);
    } else {
      url.searchParams.delete("condition");
    }

    // Sort
    if (sortBy && sortBy !== "newest") {
      url.searchParams.set("sort", sortBy);
    } else {
      url.searchParams.delete("sort");
    }

    // Reset to page 1 when filters change
    url.searchParams.delete("page");

    goto(url.pathname + url.search, { replaceState: false });
    closeMobileFilters();
  }

  // Clear all filters
  function clearAllFilters() {
    searchQuery = "";
    listingType = "all";
    categorySlug = "";
    minPrice = "";
    maxPrice = "";
    location = "";
    radius = "20";
    condition = "";
    sortBy = "newest";
    applyFilters();
  }

  // Handle category change - already applies automatically via onChange
  /** @param {string} newCategorySlug */
  function handleCategoryChange(newCategorySlug) {
    categorySlug = newCategorySlug;
    // Apply filters immediately when category changes
    applyFilters();
  }

  // Handle search on Enter key
  /** @param {KeyboardEvent} e */
  function handleSearchKeydown(e) {
    if (e.key === "Enter") {
      applyFilters();
    }
  }

  // Handle pagination
  /** @param {number} pageNum */
  function goToPage(pageNum) {
    const url = new URL(window.location.href);
    if (pageNum === 1) {
      url.searchParams.delete("page");
    } else {
      url.searchParams.set("page", pageNum.toString());
    }
    goto(url.pathname + url.search);
  }

  // Format pagination range
  function getPaginationRange() {
    const range = [];
    const maxPages = 5;
    let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let end = Math.min(totalPages, start + maxPages - 1);
    
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }
</script>

<div class="page-wrapper">
  <!-- Header -->
  <NavigationBar></NavigationBar>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Main Layout (Sidebar + Listings) -->
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

        <!-- Unified Sidebar (Search + Filters) -->
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
              <button class="btn btn--ghost btn--xs" onclick={clearAllFilters}>
                Clear all
              </button>
            </div>

            <!-- Search Input -->
            <div class="filter-group">
              <label class="filter-group__label">Search</label>
              <input
                type="text"
                id="searchQuery"
                class="form-input"
                placeholder="What are you looking for?"
                bind:value={searchQuery}
                onkeydown={handleSearchKeydown}
                oninput={() => {
                  // Debounce search to avoid too many requests
                  if (searchTimeout) clearTimeout(searchTimeout);
                  searchTimeout = setTimeout(() => applyFilters(), 500);
                }}
              />
            </div>

            <!-- Type Dropdown -->
            <div class="filter-group">
              <label class="filter-group__label">Type</label>
              <select 
                id="listingType" 
                class="form-select" 
                bind:value={listingType}
                onchange={applyFilters}
              >
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
              selectedValue={categorySlug || "all"}
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
                    bind:value={minPrice}
                    min="0"
                    step="0.01"
                    onchange={applyFilters}
                  />
                </div>
                <div class="filter-input-half">
                  <label class="form-label--sm">Max price</label>
                  <input
                    type="number"
                    id="maxPrice"
                    class="form-input"
                    placeholder="Max"
                    bind:value={maxPrice}
                    min="0"
                    step="0.01"
                    onchange={applyFilters}
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
                bind:value={location}
                oninput={() => {
                  if (searchTimeout) clearTimeout(searchTimeout);
                  searchTimeout = setTimeout(() => applyFilters(), 500);
                }}
              />
            </div>

            <!-- Radius -->
            <div class="filter-group">
              <label class="filter-group__label">Radius (km)</label>
              <select 
                id="radiusSelect" 
                class="form-select" 
                bind:value={radius}
                onchange={applyFilters}
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
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
                  <input 
                    type="radio" 
                    name="condition" 
                    value="new"
                    bind:group={condition}
                    onchange={applyFilters}
                  /> New
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="condition" 
                    value="like-new"
                    bind:group={condition}
                    onchange={applyFilters}
                  /> Like New
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="condition" 
                    value="good"
                    bind:group={condition}
                    onchange={applyFilters}
                  /> Good
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="condition" 
                    value="fair"
                    bind:group={condition}
                    onchange={applyFilters}
                  /> Fair
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="condition" 
                    value="parts"
                    bind:group={condition}
                    onchange={applyFilters}
                  /> For Parts
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    name="condition" 
                    value=""
                    bind:group={condition}
                    onchange={applyFilters}
                  /> Any
                </label>
              </div>
            </div>

            <!-- Sort -->
            <div class="filter-group">
              <label class="filter-group__label">Sort</label>
              <select 
                id="sortSelect" 
                class="form-select" 
                bind:value={sortBy}
                onchange={applyFilters}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                {#if data?.marketplaceUser?.locationLatitude && data?.marketplaceUser?.locationLongitude}
                  <option value="distance">Nearest First</option>
                {/if}
              </select>
            </div>

            <!-- Close Button (mobile only) -->
            <button
              class="filter-close-btn"
              id="filterCloseBtn"
              onclick={closeMobileFilters}
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>
        </aside>

        <!-- Listings Grid -->
        <div class="listings-section">
          <!-- Results Header -->
          <div class="results-header">
            <div class="results-count">
              <!-- Mobile Filter Button (hidden on desktop) -->
              <button
                class="mobile-filter-btn"
                id="mobileFilterBtn"
                onclick={toggleMobileFilters}
                aria-label="Open filters"
              >
                <span>⚙️</span>
                <span>Filters</span>
              </button>
              <span>
                Showing <strong>{totalCount}</strong> {totalCount === 1 ? 'listing' : 'listings'}
                {#if location}
                  near {location}
                {/if}
              </span>
            </div>
            <div class="results-sort">
              <label class="text-muted">Sort by:</label>
              <select 
                class="form-select form-select--sm" 
                bind:value={sortBy}
                onchange={applyFilters}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <!-- Listings List -->
          {#if listings.length === 0}
            <div class="empty-state">
              <p>No listings found matching your filters.</p>
              <button class="btn btn--outline" onclick={clearAllFilters}>
                Clear Filters
              </button>
            </div>
          {:else}
          <div class="listings-list">
            {#each listings as listing}
              <ListingCard {listing} marketplaceUser={data?.marketplaceUser} />
            {/each}
          </div>
          {/if}

          <!-- Pagination -->
          {#if totalPages > 1}
            <div class="pagination">
              <button 
                class="pagination__btn" 
                disabled={currentPage === 1}
                onclick={() => goToPage(currentPage - 1)}
              >
                ←
              </button>
              {#each getPaginationRange() as pageNum}
                <button 
                  class="pagination__btn"
                  class:pagination__btn--active={pageNum === currentPage}
                  onclick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </button>
              {/each}
              {#if totalPages > getPaginationRange()[getPaginationRange().length - 1]}
            <span class="pagination__dots">...</span>
                <button 
                  class="pagination__btn"
                  onclick={() => goToPage(totalPages)}
                >
                  {totalPages}
                </button>
              {/if}
              <button 
                class="pagination__btn" 
                disabled={currentPage === totalPages}
                onclick={() => goToPage(currentPage + 1)}
              >
                →
              </button>
          </div>
          {/if}
        </div>
      </div>
    </div>
  </main>

  <style>
    /* Mobile Filter Overlay */
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

    .filters-sidebar.active {
      z-index: 1000;
    }

    @media screen and (max-width: 1024px) {
      .filters-overlay.active {
        display: block;
      }
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .results-count {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .mobile-filter-btn {
      display: none;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: white;
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--text-sm);
    }

    .results-sort {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-8);
      color: var(--color-gray-500);
    }

    .empty-state p {
      margin-bottom: var(--space-4);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-8);
    }

    .pagination__btn {
      padding: var(--space-2) var(--space-3);
      background: white;
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-md);
      cursor: pointer;
      min-width: 40px;
      text-align: center;
    }

    .pagination__btn:hover:not(:disabled) {
      background: var(--color-gray-50);
      border-color: var(--color-primary);
    }

    .pagination__btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination__btn--active {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .pagination__dots {
      padding: var(--space-2);
      color: var(--color-gray-500);
    }

    @media (max-width: 768px) {
      .mobile-filter-btn {
        display: flex;
      }
    }
  </style>

  <!-- Footer -->
  <footer class="footer footer--compact">
    <div class="container">
      <div class="footer__bottom">
        <div class="flex items-center gap-3">
          <span class="logo__icon">🏪</span>
          <span>&copy; 2025 {appName}. All rights reserved.</span>
        </div>
        <nav class="footer__legal-links">
          <span class="footer__link">Privacy</span>
          <span class="footer__link">Terms</span>
          <span class="footer__link">Contact</span>
        </nav>
      </div>
    </div>
  </footer>
</div>
