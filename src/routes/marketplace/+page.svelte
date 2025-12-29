<script>
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import CategorySelect from "$lib/components/CategorySelect.svelte";


  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data } = $props();
  console.log(data);
  // Access listings and categories from page data
  const listings = $derived(data?.listings || []);
  const categories = $derived(data?.categories || []);
  const totalCount = $derived(data?.totalCount || 0);
  const currentPage = $derived(data?.currentPage || 1);
  const totalPages = $derived(data?.totalPages || 0);
  const filters = $derived(data?.filters || {
    searchQuery: '',
    categorySlug: '',
    location: '',
    sortBy: 'newest'
  });

  // Handle category change
  /** @param {string} categorySlug */
  function handleCategoryChange(categorySlug) {
    const url = new URL(window.location.href);
    if (categorySlug === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', categorySlug);
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
        <a href="../index.html" class="logo">
          <span class="logo__icon">🏪</span>
          <span class="logo__text">LocalMarket</span>
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
          <a href="create-listing.html" class="btn btn--primary">+ Sell Item</a>
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
          onkeydown={(e) => e.key === 'Enter' && closeMobileFilters()}
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
              href="create-listing.html"
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
              categories={categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                type: cat.type,
                icon: cat.icon,
                parentId: cat.parentId
              }))}
              selectedValue={filters.categorySlug || 'all'}
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
              aria-label="Close filters"
            >✕</button>
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
            <!-- Listing Card 1 - Featured Vehicle -->
            <a href="offer-detail.html" class="listing-card listing-card--list">
              <div class="listing-card__image">
                <div
                  class="listing-card__placeholder"
                  style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
                >
                  🚗
                </div>
                <span class="listing-card__badge listing-card__badge--featured"
                  >Featured</span
                >
                <button class="listing-card__favorite" aria-label="Save listing"
                  >♡</button
                >
              </div>
              <div class="listing-card__body">
                <div class="listing-card__header">
                  <div>
                    <div class="listing-card__category">Vehicles • Cars</div>
                    <h4 class="listing-card__title">
                      2019 BMW 3 Series 320i M Sport
                    </h4>
                  </div>
                  <div class="listing-card__price">£18,500</div>
                </div>
                <div
                  class="listing-card__details"
                  style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-2);"
                >
                  <span>45,000 mi</span>
                  <span>•</span>
                  <span>Automatic</span>
                  <span>•</span>
                  <span>Petrol</span>
                </div>
                <div class="listing-card__footer">
                  <div class="listing-card__meta">
                    <span class="listing-card__location"
                      >📍 Newcastle • 5 km</span
                    >
                    <span class="listing-card__time">2h ago</span>
                  </div>
                  <div class="listing-card__seller">
                    <span class="avatar avatar--sm">JD</span>
                    <span>John D.</span>
                    <span class="seller-badge seller-badge--verified"
                      >✓ Verified</span
                    >
                    <span class="seller-rating">⭐ 4.9</span>
                  </div>
                </div>
              </div>
            </a>

            <!-- Listing Card 2 - Electronics -->
            <a href="offer-detail.html" class="listing-card listing-card--list">
              <div class="listing-card__image">
                <div
                  class="listing-card__placeholder"
                  style="background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);"
                >
                  📱
                </div>
                <button class="listing-card__favorite" aria-label="Save listing"
                  >♡</button
                >
              </div>
              <div class="listing-card__body">
                <div class="listing-card__header">
                  <div>
                    <div class="listing-card__category">
                      Electronics • Phones
                    </div>
                    <h4 class="listing-card__title">
                      iPhone 15 Pro Max 256GB - Natural Titanium
                    </h4>
                  </div>
                  <div class="listing-card__price">£899</div>
                </div>
                <div
                  class="listing-card__details"
                  style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-2);"
                >
                  <span>Like New</span>
                  <span>•</span>
                  <span>Unlocked</span>
                </div>
                <div class="listing-card__footer">
                  <div class="listing-card__meta">
                    <span class="listing-card__location"
                      >📍 Gateshead • 8 km</span
                    >
                    <span class="listing-card__time">5h ago</span>
                  </div>
                  <div class="listing-card__seller">
                    <span class="avatar avatar--sm">SM</span>
                    <span>Sarah M.</span>
                    <span class="seller-badge seller-badge--verified"
                      >✓ Verified</span
                    >
                    <span class="seller-rating">⭐ 5.0</span>
                  </div>
                </div>
              </div>
            </a>

            <!-- Listing Card 3 - Furniture -->
            <a href="offer-detail.html" class="listing-card listing-card--list">
              <div class="listing-card__image">
                <div
                  class="listing-card__placeholder"
                  style="background: linear-gradient(135deg, #45D98E 0%, #38b2ac 100%);"
                >
                  🛋️
                </div>
                <span class="listing-card__badge listing-card__badge--urgent"
                  >Quick Sale</span
                >
                <button class="listing-card__favorite" aria-label="Save listing"
                  >♡</button
                >
              </div>
              <div class="listing-card__body">
                <div class="listing-card__header">
                  <div>
                    <div class="listing-card__category">Furniture • Sofas</div>
                    <h4 class="listing-card__title">
                      IKEA Kivik 3-Seater Corner Sofa - Grey
                    </h4>
                  </div>
                  <div class="listing-card__price">£350</div>
                </div>
                <div
                  class="listing-card__details"
                  style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-2);"
                >
                  <span>Good Condition</span>
                  <span>•</span>
                  <span>Collection Only</span>
                </div>
                <div class="listing-card__footer">
                  <div class="listing-card__meta">
                    <span class="listing-card__location">📍 Durham • 18 km</span
                    >
                    <span class="listing-card__time">1d ago</span>
                  </div>
                  <div class="listing-card__seller">
                    <span class="avatar avatar--sm">MR</span>
                    <span>Mike R.</span>
                    <span class="seller-rating">⭐ 4.7</span>
                  </div>
                </div>
              </div>
            </a>

            <!-- Listing Card 4 - Fashion -->
            <a href="offer-detail.html" class="listing-card listing-card--list">
              <div class="listing-card__image">
                <div
                  class="listing-card__placeholder"
                  style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"
                >
                  👟
                </div>
                <button class="listing-card__favorite" aria-label="Save listing"
                  >♡</button
                >
              </div>
              <div class="listing-card__body">
                <div class="listing-card__header">
                  <div>
                    <div class="listing-card__category">Fashion • Shoes</div>
                    <h4 class="listing-card__title">
                      Nike Air Jordan 1 Retro High OG - Size 10
                    </h4>
                  </div>
                  <div class="listing-card__price">£180</div>
                </div>
                <div
                  class="listing-card__details"
                  style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-2);"
                >
                  <span>New with Box</span>
                  <span>•</span>
                  <span>UK 10 / EU 45</span>
                </div>
                <div class="listing-card__footer">
                  <div class="listing-card__meta">
                    <span class="listing-card__location"
                      >📍 Sunderland • 15 km</span
                    >
                    <span class="listing-card__time">3h ago</span>
                  </div>
                  <div class="listing-card__seller">
                    <span class="avatar avatar--sm">AK</span>
                    <span>Alex K.</span>
                    <span class="seller-rating">⭐ 4.8</span>
                  </div>
                </div>
              </div>
            </a>

            <!-- Listing Card 5 - Vehicle -->
            <a href="offer-detail.html" class="listing-card listing-card--list">
              <div class="listing-card__image">
                <div
                  class="listing-card__placeholder"
                  style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);"
                >
                  🏍️
                </div>
                <button class="listing-card__favorite" aria-label="Save listing"
                  >♡</button
                >
              </div>
              <div class="listing-card__body">
                <div class="listing-card__header">
                  <div>
                    <div class="listing-card__category">
                      Vehicles • Motorcycles
                    </div>
                    <h4 class="listing-card__title">
                      2021 Yamaha MT-07 ABS - Low Mileage
                    </h4>
                  </div>
                  <div class="listing-card__price">£5,995</div>
                </div>
                <div
                  class="listing-card__details"
                  style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-2);"
                >
                  <span>3,200 mi</span>
                  <span>•</span>
                  <span>689cc</span>
                </div>
                <div class="listing-card__footer">
                  <div class="listing-card__meta">
                    <span class="listing-card__location">📍 Hexham • 32 km</span
                    >
                    <span class="listing-card__time">6h ago</span>
                  </div>
                  <div class="listing-card__seller">
                    <span class="avatar avatar--sm">TW</span>
                    <span>Tom W.</span>
                    <span class="seller-badge seller-badge--verified"
                      >✓ Verified</span
                    >
                    <span class="seller-rating">⭐ 4.9</span>
                  </div>
                </div>
              </div>
            </a>

            <!-- Listing Card 6 - Electronics -->
            <a href="offer-detail.html" class="listing-card listing-card--list">
              <div class="listing-card__image">
                <div
                  class="listing-card__placeholder"
                  style="background: linear-gradient(135deg, #3498DB 0%, #2c3e50 100%);"
                >
                  💻
                </div>
                <button class="listing-card__favorite" aria-label="Save listing"
                  >♡</button
                >
              </div>
              <div class="listing-card__body">
                <div class="listing-card__header">
                  <div>
                    <div class="listing-card__category">
                      Electronics • Laptops
                    </div>
                    <h4 class="listing-card__title">
                      MacBook Pro 14" M3 Pro - 512GB
                    </h4>
                  </div>
                  <div class="listing-card__price">£1,650</div>
                </div>
                <div
                  class="listing-card__details"
                  style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-2);"
                >
                  <span>Excellent</span>
                  <span>•</span>
                  <span>18GB RAM</span>
                </div>
                <div class="listing-card__footer">
                  <div class="listing-card__meta">
                    <span class="listing-card__location"
                      >📍 Newcastle • 2 km</span
                    >
                    <span class="listing-card__time">1h ago</span>
                  </div>
                  <div class="listing-card__seller">
                    <span class="avatar avatar--sm">EB</span>
                    <span>Emma B.</span>
                    <span class="seller-badge seller-badge--verified"
                      >✓ Verified</span
                    >
                    <span class="seller-rating">⭐ 5.0</span>
                  </div>
                </div>
              </div>
            </a>

            <!-- Listing Card 7 - Property -->
            <a href="offer-detail.html" class="listing-card listing-card--list">
              <div class="listing-card__image">
                <div
                  class="listing-card__placeholder"
                  style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
                >
                  🏠
                </div>
                <span class="listing-card__badge listing-card__badge--featured"
                  >Premium</span
                >
                <button class="listing-card__favorite" aria-label="Save listing"
                  >♡</button
                >
              </div>
              <div class="listing-card__body">
                <div class="listing-card__header">
                  <div>
                    <div class="listing-card__category">Property • Rent</div>
                    <h4 class="listing-card__title">
                      2 Bed Apartment - City Centre Views
                    </h4>
                  </div>
                  <div class="listing-card__price">
                    £1,200 <span
                      style="font-size: var(--text-sm); color: var(--color-gray-600);"
                      >/month</span
                    >
                  </div>
                </div>
                <div
                  class="listing-card__details"
                  style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-2);"
                >
                  <span>2 Bed</span>
                  <span>•</span>
                  <span>1 Bath</span>
                  <span>•</span>
                  <span>Furnished</span>
                </div>
                <div class="listing-card__footer">
                  <div class="listing-card__meta">
                    <span class="listing-card__location"
                      >📍 Newcastle • 1 km</span
                    >
                    <span class="listing-card__time">4h ago</span>
                  </div>
                  <div class="listing-card__seller">
                    <span class="avatar avatar--sm">RE</span>
                    <span>RE Agency</span>
                    <span class="seller-badge seller-badge--business"
                      >Business</span
                    >
                    <span class="seller-rating">⭐ 4.6</span>
                  </div>
                </div>
              </div>
            </a>

            <!-- Listing Card 8 - Sports -->
            <a href="offer-detail.html" class="listing-card listing-card--list">
              <div class="listing-card__image">
                <div
                  class="listing-card__placeholder"
                  style="background: linear-gradient(135deg, #FFE66D 0%, #f5af19 100%);"
                >
                  🚴
                </div>
                <button class="listing-card__favorite" aria-label="Save listing"
                  >♡</button
                >
              </div>
              <div class="listing-card__body">
                <div class="listing-card__header">
                  <div>
                    <div class="listing-card__category">Sports • Cycling</div>
                    <h4 class="listing-card__title">
                      Specialized Roubaix Carbon Road Bike
                    </h4>
                  </div>
                  <div class="listing-card__price">£1,850</div>
                </div>
                <div
                  class="listing-card__details"
                  style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-2);"
                >
                  <span>56cm Frame</span>
                  <span>•</span>
                  <span>Shimano 105</span>
                </div>
                <div class="listing-card__footer">
                  <div class="listing-card__meta">
                    <span class="listing-card__location"
                      >📍 Tynemouth • 12 km</span
                    >
                    <span class="listing-card__time">8h ago</span>
                  </div>
                  <div class="listing-card__seller">
                    <span class="avatar avatar--sm">DL</span>
                    <span>David L.</span>
                    <span class="seller-rating">⭐ 4.8</span>
                  </div>
                </div>
              </div>
            </a>

            <!-- Listing Card 9 - Baby -->
            <a href="offer-detail.html" class="listing-card listing-card--list">
              <div class="listing-card__image">
                <div
                  class="listing-card__placeholder"
                  style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);"
                >
                  👶
                </div>
                <button class="listing-card__favorite" aria-label="Save listing"
                  >♡</button
                >
              </div>
              <div class="listing-card__body">
                <div class="listing-card__header">
                  <div>
                    <div class="listing-card__category">
                      Baby & Kids • Prams
                    </div>
                    <h4 class="listing-card__title">
                      Silver Cross Wave Double Pram
                    </h4>
                  </div>
                  <div class="listing-card__price">£450</div>
                </div>
                <div
                  class="listing-card__details"
                  style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-2);"
                >
                  <span>Good Condition</span>
                  <span>•</span>
                  <span>Inc. Accessories</span>
                </div>
                <div class="listing-card__footer">
                  <div class="listing-card__meta">
                    <span class="listing-card__location">📍 Jesmond • 4 km</span
                    >
                    <span class="listing-card__time">12h ago</span>
                  </div>
                  <div class="listing-card__seller">
                    <span class="avatar avatar--sm">LC</span>
                    <span>Laura C.</span>
                    <span class="seller-rating">⭐ 4.9</span>
                  </div>
                </div>
              </div>
            </a>
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
    transition: opacity 0.3s ease, visibility 0.3s ease;
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
          <span>&copy; 2025 LocalMarket. All rights reserved.</span>
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
