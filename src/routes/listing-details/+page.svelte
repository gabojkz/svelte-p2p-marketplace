<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import ListingMap from "$lib/components/ListingMap.svelte";
  import ListingImageGallery from "$lib/components/ListingImageGallery.svelte";
  import SEOHead from "$lib/components/SEOHead.svelte";
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { getProductSchema } from "$lib/utils/seo.js";
  import { APP_NAME } from "$lib/utils/constants.js";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data } = $props();
  const userLanguage = $derived(data?.userLanguage || 'en');

  const listing = $derived(data?.listing);
  const similarListings = $derived(data?.similarListings || []);
  const marketplaceUser = $derived(data?.marketplaceUser);
  const initialIsFavorite = $derived(data?.isFavorite || false);
  const listingImages = $derived(listing?.images || []);
  const sellerContactInfo = $derived(data?.sellerContactInfo || null);

  // Local state
  let favoriteState = $state(false);
  let showReportModal = $state(false);
  let reportIssueType = $state("");
  let reportTitle = $state("");
  let reportDescription = $state("");
  let submittingReport = $state(false);

  // Initialize favorite state
  $effect(() => {
    favoriteState = initialIsFavorite;
  });

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
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      const { toggleFavorite } = await import("$lib/services/favorites.js");
      favoriteState = await toggleFavorite(listing.id, favoriteState);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert("Failed to update favorite. Please try again.");
    }
  }

  // Navigate to trade room
  async function startConversation() {
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

    try {
      const { createOrGetConversation } = await import("$lib/services/conversations.js");
      const conversation = await createOrGetConversation({
        listingId: listing.id,
        sellerId: listing.userId
      });
      
      // Navigate to trade room with the conversation ID
      if (conversation?.id) {
        await goto(`/trade-room?conversationId=${conversation.id}`);
      } else {
        alert("Failed to create conversation. Please try again.");
      }
    } catch (err) {
      console.error("Error starting conversation:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to start conversation. Please try again.";
      alert(errorMessage);
    }
  }

  // Check if current user is the seller
  const isSeller = $derived(marketplaceUser?.id === listing?.userId);

  // Report issue types for listing reports
  const reportIssueTypes = [
    { value: "scam", label: "Scam / Fraud", description: "Suspicious or fraudulent listing" },
    { value: "spam", label: "Spam Listing", description: "Duplicate or spam listing" },
    { value: "prohibited", label: "Prohibited Item", description: "Item violates platform rules" },
    { value: "misleading", label: "Misleading Information", description: "Listing contains false or misleading information" },
    { value: "other", label: "Other", description: "Other issue not listed above" }
  ];

  // Handle report submission
  async function handleReportSubmit() {
    if (!reportIssueType) {
      alert("Please select a reason for reporting this seller");
      return;
    }

    if (!reportTitle.trim()) {
      alert("Please provide a title for your report");
      return;
    }

    if (!reportDescription.trim() || reportDescription.trim().length < 20) {
      alert("Please provide a detailed description (at least 20 characters)");
      return;
    }

    if (!listing?.seller?.id) {
      alert("Unable to submit report. Seller information not available.");
      return;
    }

    submittingReport = true;

    try {
      // For listing reports, we'll send to a general report endpoint
      // Since disputes require a trade, we'll create a simpler report mechanism
      const { reportUser } = await import("$lib/services/user.js");
      await reportUser({
        userId: listing.seller.id,
        issueType: reportIssueType,
        title: reportTitle.trim(),
        description: reportDescription.trim()
      });

      alert("Report submitted successfully. Our team will review it shortly.");
      showReportModal = false;
      reportIssueType = "";
      reportTitle = "";
      reportDescription = "";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit report. Please try again.";
      alert(message);
      console.error("Error submitting report:", err);
    } finally {
      submittingReport = false;
    }
  }

  function closeReportModal() {
    showReportModal = false;
    reportIssueType = "";
    reportTitle = "";
    reportDescription = "";
  }

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
      path.push({
        name: listing.subcategory.name,
        slug: listing.subcategory.slug,
      });
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
      parts: "For Parts / Not Working",
    });
    return labels[condition] || condition;
  }

  // Generate SEO data for listing
  const listingTitle = $derived(listing?.title || "Listing");
  const listingDescription = $derived(
    listing?.description?.substring(0, 160) || 
    `View ${listingTitle} on ${APP_NAME} - Local P2P Marketplace`
  );
  const listingImage = $derived(
    listing?.images?.[0]?.imageUrl || "/favicon.svg"
  );
  const productSchema = $derived(getProductSchema(listing));
</script>

<SEOHead
  title={listingTitle}
  description={listingDescription}
  image={listingImage}
  type="product"
  keywords={listing?.category?.name ? `${listing.category.name}, marketplace, p2p, local trading` : undefined}
  publishedTime={listing?.createdAt}
  modifiedTime={listing?.updatedAt}
  structuredData={productSchema ? JSON.parse(productSchema) : undefined}
/>

<div class="page-wrapper">
  <NavigationBar {userLanguage} />

  <main class="main-content">
    <div class="container">
      {#if !listing}
        <div class="error-state">
          <h1>Listing not found</h1>
          <p>
            The listing you're looking for doesn't exist or has been removed.
          </p>
          <a href="/marketplace" class="btn btn--primary">Browse Marketplace</a>
        </div>
      {:else}
        <!-- Breadcrumb -->
        <nav
          class="breadcrumb"
          style="margin-bottom: var(--space-6); font-size: var(--text-sm);"
        >
          <a href="/marketplace" style="color: var(--color-gray-500);"
            >Marketplace</a
          >
          {#each breadcrumbPath as crumb}
            <span
              style="color: var(--color-gray-400); margin: 0 var(--space-2);"
              >›</span
            >
            <a
              href="/marketplace?category={crumb.slug}"
              style="color: var(--color-gray-500);"
            >
              {crumb.name}
            </a>
          {/each}
          <span style="color: var(--color-gray-400); margin: 0 var(--space-2);"
            >›</span
          >
          <span style="color: var(--color-gray-700);">{listing.title}</span>
        </nav>

        <!-- Main Layout -->
        <div class="listing-detail">
          <!-- Left Column - Images & Details -->
          <div class="listing-detail__main">
            <!-- Image Gallery -->
            <ListingImageGallery
              images={listingImages}
              title={listing.title}
              listingType={listing.type}
              featured={listing.featured}
              urgent={listing.urgent}
              isFavorite={favoriteState}
              showFavoriteButton={user && !isSeller}
              onFavoriteToggle={toggleFavorite}
            />

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
              <h1
                style="font-size: var(--text-3xl); margin-bottom: var(--space-3);"
              >
                {listing.title}
              </h1>
              <div
                class="listing-meta"
                style="display: flex; align-items: center; gap: var(--space-4); font-size: var(--text-sm); color: var(--color-gray-600); flex-wrap: wrap;"
              >
                <span
                  >📍 {listing.locationCity}{listing.locationPostcode
                    ? `, ${listing.locationPostcode}`
                    : ""}</span
                >
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
                  <h3 style="margin-bottom: var(--space-4);">
                    Key Specifications
                  </h3>
                  <div
                    style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-4);"
                  >
                    <div
                      class="spec-item"
                      style="text-align: center; padding: var(--space-4); background: var(--color-gray-50); border-radius: var(--radius-md);"
                    >
                      <div
                        style="font-size: var(--text-xl); margin-bottom: var(--space-2);"
                      >
                        📦
                      </div>
                      <div
                        style="font-size: var(--text-sm); color: var(--color-gray-500);"
                      >
                        Condition
                      </div>
                      <div
                        style="font-weight: var(--font-semibold); font-size: var(--text-sm);"
                      >
                        {getConditionLabel(listing.condition)}
                      </div>
                    </div>
                    {#if listing.brand}
                      <div
                        class="spec-item"
                        style="text-align: center; padding: var(--space-4); background: var(--color-gray-50); border-radius: var(--radius-md);"
                      >
                        <div
                          style="font-size: var(--text-xl); margin-bottom: var(--space-2);"
                        >
                          🏷️
                        </div>
                        <div
                          style="font-size: var(--text-sm); color: var(--color-gray-500);"
                        >
                          Brand
                        </div>
                        <div
                          style="font-weight: var(--font-semibold); font-size: var(--text-sm);"
                        >
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
                  <h3 style="margin-bottom: var(--space-4);">
                    Delivery Options
                  </h3>
                  <div
                    style="display: flex; flex-direction: column; gap: var(--space-2);"
                  >
                    {#if listing.deliveryCollection}
                      <div
                        style="display: flex; align-items: center; gap: var(--space-2);"
                      >
                        <span>✓</span>
                        <span>Collection available</span>
                      </div>
                    {/if}
                    {#if listing.deliveryLocal}
                      <div
                        style="display: flex; align-items: center; gap: var(--space-2);"
                      >
                        <span>✓</span>
                        <span>Local delivery available</span>
                      </div>
                    {/if}
                    {#if listing.deliveryShipping}
                      <div
                        style="display: flex; align-items: center; gap: var(--space-2);"
                      >
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
                <div style="margin-bottom: var(--space-3);">
                  <p
                    style="font-weight: var(--font-semibold); margin-bottom: var(--space-1);"
                  >
                    {listing.locationCity}
                    {listing.locationPostcode ? `, ${listing.locationPostcode}` : ""}
                  </p>
                  <p class="text-muted" style="font-size: var(--text-sm);">
                    Approximate location shown on map
                  </p>
                </div>
                <ListingMap
                  city={listing.locationCity}
                  postcode={listing.locationPostcode}
                  latitude={listing.locationLatitude}
                  longitude={listing.locationLongitude}
                />
              </div>
            </div>
          </div>

          <!-- Right Column - Price & Seller -->
          <div class="listing-detail__sidebar">
            <!-- Price Card (Sticky) -->
            <div style="position: sticky; top: 80px;">
              <div class="card" style="margin-bottom: var(--space-4);">
                <div class="card__body">
                  <div
                    class="listing-price"
                    style="margin-bottom: var(--space-4);"
                  >
                    <div
                      style="font-family: var(--font-display); font-size: var(--text-4xl); font-weight: var(--font-bold); color: var(--color-primary-dark);"
                    >
                      {formatPrice(listing.price)}
                    </div>
                    {#if listing.acceptsOffers}
                      <span
                        class="badge badge--primary"
                        style="margin-top: var(--space-2);"
                      >
                        Price Negotiable
                      </span>
                    {/if}
                    {#if listing.priceType === "free"}
                      <span
                        class="badge badge--success"
                        style="margin-top: var(--space-2);"
                      >
                        Free
                      </span>
                    {/if}
                  </div>

                  <div
                    style="display: flex; flex-direction: column; gap: var(--space-3);"
                  >
                    {#if !isSeller}
                      <button
                        class="btn btn--primary btn--lg btn--full"
                        onclick={startConversation}
                        type="button"
                      >
                        💬 Message Seller
                      </button>
                    {:else}
                      <a
                        href="/my-listings"
                        class="btn btn--primary btn--lg btn--full"
                      >
                        ✏️ Edit Listing
                      </a>
                    {/if}
                  </div>

                  <!-- Contact Information (only for logged-in users) -->
                  {#if user && !isSeller && sellerContactInfo}
                    <div
                      style="margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--color-gray-200);"
                    >
                      <h4
                        style="font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--color-gray-700); margin-bottom: var(--space-3);"
                      >
                        Contact Seller
                      </h4>
                      <div
                        style="display: flex; flex-direction: column; gap: var(--space-2);"
                      >
                        {#if sellerContactInfo.phone}
                          <a
                            href="tel:{sellerContactInfo.phone}"
                            style="display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-md); text-decoration: none; color: var(--color-gray-900); font-size: var(--text-sm); transition: background var(--transition-fast);"
                            onmouseover={(e) => e.currentTarget.style.background = 'var(--color-gray-100)'}
                            onmouseout={(e) => e.currentTarget.style.background = 'var(--color-gray-50)'}
                          >
                            <span style="font-size: var(--text-lg);">📞</span>
                            <span style="flex: 1;">{sellerContactInfo.phone}</span>
                          </a>
                        {/if}
                        {#if sellerContactInfo.whatsapp}
                          <a
                            href="https://wa.me/{sellerContactInfo.whatsapp.replace(/[^0-9]/g, '')}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); background: #25D366; border-radius: var(--radius-md); text-decoration: none; color: white; font-size: var(--text-sm); transition: opacity var(--transition-fast);"
                            onmouseover={(e) => e.currentTarget.style.opacity = '0.9'}
                            onmouseout={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            <span style="font-size: var(--text-lg);">💬</span>
                            <span style="flex: 1;">WhatsApp: {sellerContactInfo.whatsapp}</span>
                            <span style="font-size: var(--text-xs);">↗</span>
                          </a>
                        {/if}
                        {#if sellerContactInfo.telegram}
                          <a
                            href="https://t.me/{sellerContactInfo.telegram.replace('@', '')}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); background: #0088cc; border-radius: var(--radius-md); text-decoration: none; color: white; font-size: var(--text-sm); transition: opacity var(--transition-fast);"
                            onmouseover={(e) => e.currentTarget.style.opacity = '0.9'}
                            onmouseout={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            <span style="font-size: var(--text-lg);">✈️</span>
                            <span style="flex: 1;">Telegram: {sellerContactInfo.telegram}</span>
                            <span style="font-size: var(--text-xs);">↗</span>
                          </a>
                        {/if}
                        {#if !sellerContactInfo.phone && !sellerContactInfo.whatsapp && !sellerContactInfo.telegram}
                          <p
                            style="font-size: var(--text-xs); color: var(--color-gray-500); text-align: center; padding: var(--space-2);"
                          >
                            No contact information available
                          </p>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              </div>

              <!-- Seller Card -->
              {#if listing.seller}
                <div class="card" style="margin-bottom: var(--space-4);">
                  <div class="card__body">
                    <div
                      style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4);"
                    >
                      <div class="avatar avatar--lg">
                        {getSellerInitials(listing.seller)}
                      </div>
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
                            <span class="seller-badge seller-badge--verified"
                              >✓ Verified</span
                            >
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
                        <div
                          style="font-weight: var(--font-bold); color: var(--color-gray-900);"
                        >
                          {listing.seller.stats?.listingsCount || 0}
                        </div>
                        <div
                          style="font-size: var(--text-xs); color: var(--color-gray-500);"
                        >
                          Listings
                        </div>
                      </div>
                      <div>
                        <div
                          style="font-weight: var(--font-bold); color: var(--color-gray-900);"
                        >
                          {listing.seller.stats?.completedTrades || 0}
                        </div>
                        <div
                          style="font-size: var(--text-xs); color: var(--color-gray-500);"
                        >
                          Trades
                        </div>
                      </div>
                      <div>
                        <div
                          style="font-weight: var(--font-bold); color: var(--color-gray-900);"
                        >
                          {listing.seller.stats?.avgRating > 0
                            ? `${(listing.seller.stats.avgRating * 20).toFixed(0)}%`
                            : "N/A"}
                        </div>
                        <div
                          style="font-size: var(--text-xs); color: var(--color-gray-500);"
                        >
                          Rating
                        </div>
                      </div>
                    </div>

                    <div
                      style="font-size: var(--text-sm); color: var(--color-gray-600);"
                    >
                      <div
                        style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);"
                      >
                        <span>📍</span>
                        {listing.seller.locationCity ||
                          "Location not specified"}
                      </div>
                      <div
                        style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);"
                      >
                        <span>📅</span>
                        Member since {listing.seller.createdAt
                          ? new Date(
                              listing.seller.createdAt,
                            ).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "short",
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

                    {#if user && !isSeller}
                      <button
                        class="btn btn--outline btn--full"
                        style="margin-top: var(--space-2); color: var(--color-error); border-color: var(--color-error);"
                        onclick={() => showReportModal = true}
                        type="button"
                      >
                        🚨 Report Seller
                      </button>
                    {/if}
                  </div>
                </div>
              {/if}

              <!-- Safety Tips -->
              <div
                class="card"
                style="background: var(--color-gray-50); border: none;"
              >
                <div class="card__body">
                  <h4
                    style="font-size: var(--text-sm); margin-bottom: var(--space-3);"
                  >
                    🔒 Safety Tips
                  </h4>
                  <ul
                    style="font-size: var(--text-xs); color: var(--color-gray-600); display: flex; flex-direction: column; gap: var(--space-2);"
                  >
                    <li>• Meet in a public place for viewings</li>
                    <li>• Check item condition before buying</li>
                    <li>• Never pay before seeing the item</li>
                    <li>• Verify seller's identity and reviews</li>
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
                {@const isOwner = marketplaceUser?.id === similarListing.userId}
                {@const listingUrl = isOwner ? `/listings/edit/${similarListing.id}` : `/listing-details/${similarListing.id}`}
                <a href={listingUrl} class="listing-card listing-card--list">
                  <div class="listing-card__image">
                    <div
                      class="listing-card__placeholder"
                      style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
                    >
                      🚗
                    </div>
                    {#if similarListing.featured}
                      <span class="listing-card__badge listing-card__badge--featured">Featured</span>
                    {/if}
                  </div>
                  <div class="listing-card__body">
                    <div class="listing-card__header">
                      <div>
                        <div class="listing-card__category">{similarListing?.category?.name || 'Category'}</div>
                        <h4 class="listing-card__title">{similarListing?.title || 'Listing Title'}</h4>
                      </div>
                      <div class="listing-card__price">£{similarListing?.price || '0'}</div>
                    </div>
                    {#if similarListing?.description}
                      <div class="listing-card__details">
                        {similarListing.description.substring(0, 100)}{similarListing.description.length > 100 ? '...' : ''}
                      </div>
                    {/if}
                    <div class="listing-card__footer">
                      <div class="listing-card__meta">
                        <span class="listing-card__location">📍 {similarListing?.locationCity || 'Location'} • {similarListing?.locationPostcode || ''}</span>
                        <span class="listing-card__time">{similarListing?.createdAt ? new Date(similarListing.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      {#if isOwner}
                        <span class="listing-card__edit-badge" style="background: var(--color-primary); color: white; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: var(--font-semibold);">Edit</span>
                      {/if}
                    </div>
                  </div>
                </a>
              {/each}
            </div>
          </section>
        {/if}
      {/if}
    </div>
  </main>

  <!-- Report Modal -->
  {#if showReportModal}
    <div class="modal-overlay" onclick={closeReportModal}>
      <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h3>Report Seller</h3>
          <button
            class="modal-close"
            onclick={closeReportModal}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <p style="font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-4);">
            Reporting <strong>{listing?.seller?.firstName || listing?.seller?.username || 'this seller'}</strong> for inappropriate behavior or violation of platform rules related to this listing.
          </p>

          <!-- Issue Type Selection -->
          <div style="margin-bottom: var(--space-4);">
            <label class="form-label">
              Reason for Report <span style="color: var(--color-error);">*</span>
            </label>
            <select
              bind:value={reportIssueType}
              class="form-select"
            >
              <option value="">Select a reason...</option>
              {#each reportIssueTypes as type}
                <option value={type.value}>{type.label}</option>
              {/each}
            </select>
            {#if reportIssueType}
              <p style="font-size: var(--text-xs); color: var(--color-gray-600); margin-top: var(--space-1);">
                {reportIssueTypes.find(t => t.value === reportIssueType)?.description}
              </p>
            {/if}
          </div>

          <!-- Title -->
          <div style="margin-bottom: var(--space-4);">
            <label class="form-label">
              Title <span style="color: var(--color-error);">*</span>
            </label>
            <input
              type="text"
              bind:value={reportTitle}
              placeholder="Brief summary of the issue"
              maxlength="200"
              class="form-input"
            />
            <p style="font-size: var(--text-xs); color: var(--color-gray-600); margin-top: var(--space-1);">
              {reportTitle.length}/200 characters
            </p>
          </div>

          <!-- Description -->
          <div style="margin-bottom: var(--space-4);">
            <label class="form-label">
              Detailed Description <span style="color: var(--color-error);">*</span>
            </label>
            <textarea
              bind:value={reportDescription}
              placeholder="Please provide as much detail as possible about what happened. Include any relevant information that will help us investigate."
              rows="6"
              class="form-textarea"
            ></textarea>
            <p style="font-size: var(--text-xs); color: var(--color-gray-600); margin-top: var(--space-1);">
              Minimum 20 characters. {reportDescription.length} characters entered.
            </p>
          </div>

          <!-- Warning Message -->
          <div style="padding: var(--space-3); background: var(--color-error-subtle); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
            <p style="font-size: var(--text-xs); color: var(--color-error); line-height: 1.5;">
              <strong>⚠️ Important:</strong> False reports may result in action against your account. 
              Please only report genuine violations of our platform rules.
            </p>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: var(--space-2); justify-content: flex-end;">
            <button
              type="button"
              class="btn btn--outline"
              onclick={closeReportModal}
              disabled={submittingReport}
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn--primary"
              onclick={handleReportSubmit}
              disabled={submittingReport || !reportIssueType || !reportTitle.trim() || reportDescription.trim().length < 20}
            >
              {submittingReport ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .listing-detail {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    width: 100%;
  }

  .listing-detail__main {
    width: 100%;
  }

  .listing-detail__sidebar {
    width: 100%;
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
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: var(--space-8);
    }

    .listing-detail__main {
      width: auto;
    }

    .listing-detail__sidebar {
      width: auto;
      order: 0;
    }
  }

  /* Report Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-4);
  }

  .modal-content {
    background: white;
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-2xl);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-6);
    border-bottom: 1px solid var(--color-gray-200);
  }

  .modal-header h3 {
    margin: 0;
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
  }

  .modal-close {
    background: none;
    border: none;
    font-size: var(--text-3xl);
    color: var(--color-gray-500);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .modal-close:hover {
    background: var(--color-gray-100);
    color: var(--color-gray-900);
  }

  .modal-body {
    padding: var(--space-6);
  }
</style>
