<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import ListingCard from "$lib/components/ListingCard.svelte";
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data } = $props();

  const listing = $derived(data?.listing);
  const similarListings = $derived(data?.similarListings || []);
  const marketplaceUser = $derived(data?.marketplaceUser);
  const initialIsFavorite = $derived(data?.isFavorite || false);

  // Local state
  let favoriteState = $state(false);

  // Initialize favorite state
  $effect(() => {
    favoriteState = initialIsFavorite;
  });
  let selectedImageIndex = $state(0);

  // Format price
  /** @param {string | number | null | undefined} price */
  function formatPrice(price) {
    if (!price) return "£0";
    return `£${Number(price).toLocaleString("en-GB")}`;
  }

  // Format date
  /** @param {string | Date | null | undefined} dateString */
  function formatDate(dateString) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = Number(now) - Number(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
  }

  // Get time ago
  /** @param {string | Date | null | undefined} dateString */
  function getTimeAgo(dateString) {
    return formatDate(dateString);
  }

  // Toggle favorite
  async function toggleFavorite() {
    if (!user) {
      await goto("/login");
      return;
    }

    if (!listing?.id) return;

    try {
      const method = favoriteState ? "DELETE" : "POST";
      const response = await fetch(`/api/favorites/${listing.id}`, {
        method
      });

      if (response.ok) {
      favoriteState = !favoriteState;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error toggling favorite:", errorData.error);
        alert(errorData.error || "Failed to update favorite. Please try again.");
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert("Failed to update favorite. Please try again.");
    }
  }

  // Navigate to trade room
  function startConversation() {
    if (!user) {
      goto("/login");
      return;
    }

    if (!listing?.id) {
      alert("Listing information not available");
      return;
    }

    // Don't allow sellers to message themselves
    if (marketplaceUser?.id === listing.userId) {
      alert("You cannot message yourself");
      return;
    }

    // Navigate to trade room page with listing ID
    goto(`/trade-room?listingId=${listing.id}`);
  }

  // Check if current user is the seller
  const isSeller = $derived(marketplaceUser?.id === listing?.userId);

  // Get breadcrumb path
  const breadcrumbPath = $derived.by(() => {
    if (!listing?.category) return [];
    const path = [];
    if (listing.category.parentId) {
      // Would need to fetch parent category
      path.push({ name: "Category", slug: listing.category.slug });
    }
    path.push({ name: listing.category.name, slug: listing.category.slug });
    if (listing.subcategory) {
      path.push({ name: listing.subcategory.name, slug: listing.subcategory.slug });
    }
    return path;
  });

  // Get seller initials
  /** @param {any} seller */
  function getSellerInitials(seller) {
    if (!seller) return "?";
    if (seller.firstName && seller.lastName) {
      return `${seller.firstName[0]}${seller.lastName[0]}`.toUpperCase();
    }
    if (seller.username) {
      return seller.username.substring(0, 2).toUpperCase();
    }
    return "?";
  }

  // Get condition label
  /** @param {string | null | undefined} condition */
  function getConditionLabel(condition) {
    if (!condition) return "Not specified";
    const labels = /** @type {Record<string, string>} */ ({
      new: "New (Unused, with tags)",
      "like-new": "Like New (Excellent)",
      good: "Good (Minor wear)",
      fair: "Fair (Visible wear)",
      parts: "For Parts / Not Working"
    });
    return labels[condition] || condition;
  }
</script>

<div class="page-wrapper">
  <NavigationBar />

  <main class="main-content">
    <div class="container">
      {#if !listing}
        <div class="error-state">
          <h1>Listing not found</h1>
          <p>The listing you're looking for doesn't exist or has been removed.</p>
          <a href="/marketplace" class="btn btn--primary">Browse Marketplace</a>
        </div>
      {:else}
        <!-- Breadcrumb -->
        <nav class="breadcrumb" style="margin-bottom: var(--space-6); font-size: var(--text-sm);">
          <a href="/marketplace" style="color: var(--color-gray-500);">Marketplace</a>
          {#each breadcrumbPath as crumb}
            <span style="color: var(--color-gray-400); margin: 0 var(--space-2);">›</span>
            <a
              href="/marketplace?category={crumb.slug}"
              style="color: var(--color-gray-500);"
            >
              {crumb.name}
            </a>
          {/each}
          <span style="color: var(--color-gray-400); margin: 0 var(--space-2);">›</span>
          <span style="color: var(--color-gray-700);">{listing.title}</span>
        </nav>

        <!-- Main Layout -->
        <div class="listing-detail" style="display: grid; grid-template-columns: 1fr 400px; gap: var(--space-8);">
          <!-- Left Column - Images & Details -->
          <div class="listing-detail__main">
            <!-- Image Gallery -->
            <div class="listing-gallery" style="margin-bottom: var(--space-6);">
              <div
                class="listing-gallery__main"
                style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: var(--radius-xl); height: 450px; display: flex; align-items: center; justify-content: center; font-size: 6rem; margin-bottom: var(--space-3); position: relative;"
              >
                {#if listing.type === "product"}
                  📦
                {:else}
                  🔧
                {/if}
                {#if listing.featured}
                  <span
                    class="listing-card__badge listing-card__badge--featured"
                    style="position: absolute; top: var(--space-4); left: var(--space-4);"
                  >
                    Featured
                  </span>
                {/if}
                {#if listing.urgent}
                  <span
                    class="listing-card__badge listing-card__badge--urgent"
                    style="position: absolute; top: var(--space-4); {listing.featured ? 'left: calc(var(--space-4) + 100px);' : 'left: var(--space-4);'}"
                  >
                    Urgent
                  </span>
                {/if}
                {#if user && !isSeller}
                  <button
                    style="position: absolute; top: var(--space-4); right: var(--space-4); background: rgba(255,255,255,0.9); border: none; padding: var(--space-2) var(--space-4); border-radius: var(--radius-full); cursor: pointer; font-size: var(--text-lg);"
                    onclick={toggleFavorite}
                    type="button"
                  >
                    {favoriteState ? "❤️" : "♡"} {favoriteState ? "Saved" : "Save"}
                  </button>
                {/if}
              </div>
              <!-- Placeholder for thumbnail gallery -->
              <div
                class="listing-gallery__thumbs"
                style="display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-2);"
              >
                <div
                  style="background: linear-gradient(135deg, #667eea, #764ba2); border-radius: var(--radius-md); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: var(--text-2xl); cursor: pointer; border: 2px solid var(--color-primary);"
                >
                  {listing.type === "product" ? "📦" : "🔧"}
                </div>
              </div>
            </div>

            <!-- Title & Quick Info -->
            <div class="listing-header" style="margin-bottom: var(--space-6);">
              <div
                class="listing-category"
                style="font-size: var(--text-sm); color: var(--color-gray-500); margin-bottom: var(--space-2);"
              >
                {listing.category?.name || "Category"}
                {#if listing.subcategory}
                  • {listing.subcategory.name}
                {/if}
                {#if listing.brand}
                  • {listing.brand}
                {/if}
              </div>
              <h1 style="font-size: var(--text-3xl); margin-bottom: var(--space-3);">
                {listing.title}
              </h1>
              <div
                class="listing-meta"
                style="display: flex; align-items: center; gap: var(--space-4); font-size: var(--text-sm); color: var(--color-gray-600); flex-wrap: wrap;"
              >
                <span>📍 {listing.locationCity}{listing.locationPostcode ? `, ${listing.locationPostcode}` : ""}</span>
                <span>•</span>
                <span>Listed {getTimeAgo(listing.createdAt)}</span>
                <span>•</span>
                <span>👁 {listing.viewCount || 0} views</span>
              </div>
            </div>

            <!-- Key Specs (if product with condition) -->
            {#if listing.type === "product" && listing.condition}
              <div class="card" style="margin-bottom: var(--space-6);">
                <div class="card__body">
                  <h3 style="margin-bottom: var(--space-4);">Key Specifications</h3>
                  <div
                    style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-4);"
                  >
                    <div
                      class="spec-item"
                      style="text-align: center; padding: var(--space-4); background: var(--color-gray-50); border-radius: var(--radius-md);"
                    >
                      <div style="font-size: var(--text-xl); margin-bottom: var(--space-2);">
                        📦
                      </div>
                      <div style="font-size: var(--text-sm); color: var(--color-gray-500);">
                        Condition
                      </div>
                      <div style="font-weight: var(--font-semibold); font-size: var(--text-sm);">
                        {getConditionLabel(listing.condition)}
                      </div>
                    </div>
                    {#if listing.brand}
                      <div
                        class="spec-item"
                        style="text-align: center; padding: var(--space-4); background: var(--color-gray-50); border-radius: var(--radius-md);"
                      >
                        <div style="font-size: var(--text-xl); margin-bottom: var(--space-2);">
                          🏷️
                        </div>
                        <div style="font-size: var(--text-sm); color: var(--color-gray-500);">
                          Brand
                        </div>
                        <div style="font-weight: var(--font-semibold); font-size: var(--text-sm);">
                          {listing.brand}
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}

            <!-- Description -->
            <div class="card" style="margin-bottom: var(--space-6);">
              <div class="card__body">
                <h3 style="margin-bottom: var(--space-4);">Description</h3>
                <div
                  style="color: var(--color-gray-700); line-height: var(--leading-relaxed); white-space: pre-wrap;"
                >
                  {listing.description}
                </div>
              </div>
            </div>

            <!-- Delivery Options -->
            {#if listing.deliveryCollection || listing.deliveryLocal || listing.deliveryShipping}
              <div class="card" style="margin-bottom: var(--space-6);">
                <div class="card__body">
                  <h3 style="margin-bottom: var(--space-4);">Delivery Options</h3>
                  <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                    {#if listing.deliveryCollection}
                      <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <span>✓</span>
                        <span>Collection available</span>
                      </div>
                    {/if}
                    {#if listing.deliveryLocal}
                      <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <span>✓</span>
                        <span>Local delivery available</span>
                      </div>
                    {/if}
                    {#if listing.deliveryShipping}
                      <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <span>✓</span>
                        <span>Nationwide shipping available</span>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}

            <!-- Location Map -->
            <div class="card">
              <div class="card__body">
                <h3 style="margin-bottom: var(--space-4);">Location</h3>
                <div
                  style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border-radius: var(--radius-lg); padding: var(--space-8); text-align: center;"
                >
                  <div style="font-size: var(--text-4xl); margin-bottom: var(--space-2);">
                    🗺️
                  </div>
                  <p style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);">
                    {listing.locationCity}
                  </p>
                  <p class="text-muted">
                    {listing.locationPostcode || "Location information"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Price & Seller -->
          <div class="listing-detail__sidebar">
            <!-- Price Card (Sticky) -->
            <div style="position: sticky; top: 80px;">
              <div class="card" style="margin-bottom: var(--space-4);">
                <div class="card__body">
                  <div class="listing-price" style="margin-bottom: var(--space-4);">
                    <div
                      style="font-family: var(--font-display); font-size: var(--text-4xl); font-weight: var(--font-bold); color: var(--color-primary-dark);"
                    >
                      {formatPrice(listing.price)}
                    </div>
                    {#if listing.acceptsOffers}
                      <span class="badge badge--primary" style="margin-top: var(--space-2);">
                        Price Negotiable
                      </span>
                    {/if}
                    {#if listing.priceType === "free"}
                      <span class="badge badge--success" style="margin-top: var(--space-2);">
                        Free
                      </span>
                    {/if}
                  </div>

                  <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                    {#if !isSeller}
                      <button
                        class="btn btn--primary btn--lg btn--full"
                        onclick={startConversation}
                        type="button"
                      >
                        💬 Message Seller
                      </button>
                      <a
                        href="/trade-initiation?listingId={listing.id}"
                        class="btn btn--outline btn--lg btn--full"
                      >
                        🛡️ Buy with Escrow Protection
                      </a>
                    {:else}
                      <a
                        href="/my-listings"
                        class="btn btn--primary btn--lg btn--full"
                      >
                        ✏️ Edit Listing
                      </a>
                    {/if}
                  </div>

                  <div
                    class="escrow-info"
                    style="margin-top: var(--space-4); padding: var(--space-4); background: var(--color-primary-subtle); border-radius: var(--radius-md);"
                  >
                    <div
                      style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);"
                    >
                      <span>🛡️</span>
                      <strong style="color: var(--color-primary-dark);">
                        Escrow Protection
                      </strong>
                    </div>
                    <p style="font-size: var(--text-sm); color: var(--color-gray-600);">
                      Your payment is held securely until you receive and approve the item.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Seller Card -->
              {#if listing.seller}
                <div class="card" style="margin-bottom: var(--space-4);">
                  <div class="card__body">
                    <div
                      style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4);"
                    >
                      <div class="avatar avatar--lg">{getSellerInitials(listing.seller)}</div>
                      <div>
                        <a
                          href="/profile/{listing.seller.username || 'user'}"
                          style="font-weight: var(--font-semibold); font-size: var(--text-lg); color: var(--color-gray-900); text-decoration: none;"
                        >
                          {listing.seller.firstName && listing.seller.lastName
                            ? `${listing.seller.firstName} ${listing.seller.lastName}`
                            : listing.seller.username || "Seller"}
                        </a>
                        <div
                          style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); flex-wrap: wrap;"
                        >
                          {#if listing.seller && /** @type {any} */ (listing.seller).emailVerified}
                            <span class="seller-badge seller-badge--verified">✓ Verified</span>
                          {/if}
                          {#if listing.seller.stats?.avgRating > 0}
                            <span style="color: var(--color-accent-orange);">
                              ⭐ {listing.seller.stats.avgRating.toFixed(1)}
                            </span>
                            <span class="text-muted">
                              ({listing.seller.stats.reviewsCount} reviews)
                            </span>
                          {/if}
                        </div>
                      </div>
                    </div>

                    <div
                      style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); text-align: center; margin-bottom: var(--space-4); padding: var(--space-3) 0; border-top: 1px solid var(--color-gray-100); border-bottom: 1px solid var(--color-gray-100);"
                    >
                      <div>
                        <div style="font-weight: var(--font-bold); color: var(--color-gray-900);">
                          {listing.seller.stats?.listingsCount || 0}
                        </div>
                        <div style="font-size: var(--text-xs); color: var(--color-gray-500);">
                          Listings
                        </div>
                      </div>
                      <div>
                        <div style="font-weight: var(--font-bold); color: var(--color-gray-900);">
                          {listing.seller.stats?.completedTrades || 0}
                        </div>
                        <div style="font-size: var(--text-xs); color: var(--color-gray-500);">
                          Trades
                        </div>
                      </div>
                      <div>
                        <div style="font-weight: var(--font-bold); color: var(--color-gray-900);">
                          {listing.seller.stats?.avgRating > 0
                            ? `${(listing.seller.stats.avgRating * 20).toFixed(0)}%`
                            : "N/A"}
                        </div>
                        <div style="font-size: var(--text-xs); color: var(--color-gray-500);">
                          Rating
                        </div>
                      </div>
                    </div>

                    <div style="font-size: var(--text-sm); color: var(--color-gray-600);">
                      <div
                        style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);"
                      >
                        <span>📍</span>
                        {listing.seller.locationCity || "Location not specified"}
                      </div>
                      <div
                        style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);"
                      >
                        <span>📅</span>
                        Member since {listing.seller.createdAt
                          ? new Date(listing.seller.createdAt).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "short"
                            })
                          : "Recently"}
                      </div>
                    </div>

                    <a
                      href="/profile/{listing.seller.username || 'user'}"
                      class="btn btn--ghost btn--full"
                      style="margin-top: var(--space-4);"
                    >
                      View Profile →
                    </a>
                  </div>
                </div>
              {/if}

              <!-- Safety Tips -->
              <div class="card" style="background: var(--color-gray-50); border: none;">
                <div class="card__body">
                  <h4 style="font-size: var(--text-sm); margin-bottom: var(--space-3);">
                    🔒 Safety Tips
                  </h4>
                  <ul
                    style="font-size: var(--text-xs); color: var(--color-gray-600); display: flex; flex-direction: column; gap: var(--space-2);"
                  >
                    <li>• Use Escrow for secure payment</li>
                    <li>• Meet in a public place for viewings</li>
                    <li>• Check item condition before buying</li>
                    <li>• Never pay before seeing the item</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Similar Listings -->
        {#if similarListings.length > 0}
          <section style="margin-top: var(--space-12);">
            <div
              style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-4);"
            >
              <h2>Similar Listings Near You</h2>
              <a
                href="/marketplace?category={listing.category?.slug || ''}"
                class="btn btn--ghost"
              >
                View All →
              </a>
            </div>

            <div
              class="listings-grid"
              style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--space-4);"
            >
              {#each similarListings as similarListing}
                <ListingCard listing={similarListing} marketplaceUser={marketplaceUser} />
              {/each}
            </div>
          </section>
        {/if}
      {/if}
    </div>
  </main>
</div>

<style>
  .listing-detail {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .listing-detail__sidebar {
    order: -1;
  }

  .error-state {
    text-align: center;
    padding: var(--space-12);
  }

  .seller-badge {
    display: inline-block;
    padding: var(--space-1) var(--space-2);
    background: var(--color-primary-subtle);
    color: var(--color-primary-dark);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
  }

  .seller-badge--verified {
    background: var(--color-success-subtle);
    color: var(--color-success);
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-semibold);
    font-size: var(--text-lg);
  }

  .avatar--lg {
    width: 64px;
    height: 64px;
    font-size: var(--text-xl);
  }

  @media (min-width: 1024px) {
    .listing-detail {
      grid-template-columns: 1fr 400px;
      gap: var(--space-8);
    }

    .listing-detail__sidebar {
      order: 0;
    }
  }
</style>
