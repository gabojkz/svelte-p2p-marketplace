<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data, userLanguage = "en" } = $props();

  const profileUser = $derived(data?.profileUser);
  const listingsCount = $derived(data?.listingsCount || 0);
  const recentListings = $derived(data?.recentListings || []);
  const isOwnProfile = $derived(data?.isOwnProfile || false);
  const totalTrades = $derived(data?.totalTrades || 0);
  const completedTrades = $derived(data?.completedTrades || 0);
  const averageRating = $derived(data?.averageRating || 0);
  const totalReviews = $derived(data?.totalReviews || 0);
  const reviews = $derived(data?.reviews || []);

  // Get user initials for avatar
  function getUserInitials() {
    if (!profileUser) return "?";
    const firstName = profileUser.firstName || "";
    const lastName = profileUser.lastName || "";
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (profileUser.username) {
      return profileUser.username[0].toUpperCase();
    }
    return "?";
  }

  // Format date
  function formatDate(dateString) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { 
      year: "numeric", 
      month: "long" 
    });
  }

  // Format review date (more detailed)
  function formatReviewDate(dateString) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString("en-GB", { 
      year: "numeric", 
      month: "long",
      day: "numeric"
    });
  }

  // Get reviewer initials
  function getReviewerInitials(reviewer) {
    if (!reviewer) return "?";
    if (reviewer.firstName && reviewer.lastName) {
      return (reviewer.firstName[0] + reviewer.lastName[0]).toUpperCase();
    }
    if (reviewer.username) {
      return reviewer.username[0].toUpperCase();
    }
    return "?";
  }

  // Format last login time
  function formatLastLogin(dateString) {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-GB", { 
      year: "numeric", 
      month: "short",
      day: "numeric"
    });
  }

  // Get reputation badge color
  function getReputationColor(rating) {
    if (rating >= 4.5) return "success";
    if (rating >= 3.5) return "info";
    if (rating >= 2.5) return "warning";
    return "error";
  }

  // Render stars
  function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = "";
    for (let i = 0; i < fullStars; i++) stars += "★";
    if (hasHalfStar) stars += "½";
    for (let i = 0; i < emptyStars; i++) stars += "☆";
    return stars;
  }

  // Format price
  function formatPrice(price) {
    if (!price) return "£0";
    return `£${Number(price).toLocaleString("en-GB")}`;
  }

  // Start conversation with user
  async function startConversation() {
    if (!user) {
      await goto("/login");
      return;
    }

    // Navigate to marketplace to find their listings
    await goto("/marketplace");
  }
</script>

<div class="page-wrapper">
  <!-- Header -->
  <NavigationBar {userLanguage} />

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-header__background"></div>
        <div class="profile-header__content">
          <!-- Avatar -->
          <div class="profile-avatar">
            {#if profileUser?.avatarUrl}
              <img src={profileUser.avatarUrl} alt={profileUser.username} />
            {:else}
              <div class="profile-avatar__initials">
                {getUserInitials()}
              </div>
            {/if}
            {#if profileUser?.emailVerified}
              <span class="profile-avatar__badge" title="Verified">✓</span>
            {/if}
          </div>

          <!-- Profile Info -->
          <div class="profile-info">
            <div class="profile-info__header">
              <h1 class="profile-info__name">
                {profileUser?.firstName && profileUser?.lastName
                  ? `${profileUser.firstName} ${profileUser.lastName}`
                  : profileUser?.username || "User"}
              </h1>
              {#if profileUser?.emailVerified}
                <span class="badge badge--success">Verified</span>
              {/if}
            </div>

            <div class="profile-info__meta">
              <span class="profile-info__username">@{profileUser?.username}</span>
              {#if profileUser?.locationCity}
                <span class="profile-info__location">
                  📍 {profileUser.locationCity}
                  {#if profileUser.locationPostcode}
                    , {profileUser.locationPostcode}
                  {/if}
                </span>
              {/if}
              <span class="profile-info__joined">
                🗓️ Joined {formatDate(profileUser?.createdAt)}
              </span>
              {#if profileUser?.lastLoginAt}
                <span class="profile-info__last-login">
                  🕐 Last active {formatLastLogin(profileUser.lastLoginAt)}
                </span>
              {/if}
            </div>

            <!-- Reputation/Rating -->
            {#if averageRating > 0}
              <div class="profile-info__reputation">
                <div class="reputation-badge reputation-badge--{getReputationColor(averageRating)}">
                  <span class="reputation-badge__rating">{averageRating.toFixed(1)}</span>
                  <span class="reputation-badge__stars">{renderStars(averageRating)}</span>
                  <span class="reputation-badge__count">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                </div>
              </div>
            {:else}
              <div class="profile-info__reputation">
                <span class="reputation-badge reputation-badge--neutral">
                  No reviews yet
                </span>
              </div>
            {/if}

            {#if profileUser?.bio}
              <p class="profile-info__bio">{profileUser.bio}</p>
            {/if}

            <!-- Contact Info (if privacy allows) -->
            {#if profileUser?.email || profileUser?.phone}
              <div class="profile-info__contact">
                {#if profileUser.email}
                  <div class="profile-info__contact-item">
                    <span class="profile-info__contact-label">Email:</span>
                    <span class="profile-info__contact-value">{profileUser.email}</span>
                  </div>
                {/if}
                {#if profileUser.phone}
                  <div class="profile-info__contact-item">
                    <span class="profile-info__contact-label">Phone:</span>
                    <span class="profile-info__contact-value">
                      {profileUser.phone}
                      {#if profileUser.phoneVerified}
                        <span class="badge badge--success badge--sm">Verified</span>
                      {/if}
                    </span>
                  </div>
                {/if}
              </div>
            {/if}
          </div>

          <!-- Action Buttons -->
          <div class="profile-actions">
            {#if isOwnProfile}
              <a href="/settings" class="btn btn--primary">
                ⚙️ Edit Profile
              </a>
            {:else if user}
              <button
                class="btn btn--primary"
                onclick={startConversation}
                type="button"
              >
                💬 Send Message
              </button>
              {#if profileUser?.email || profileUser?.phone}
                <button
                  class="btn btn--outline"
                  onclick={() => {
                    if (profileUser?.email) {
                      window.location.href = `mailto:${profileUser.email}`;
                    } else if (profileUser?.phone) {
                      window.location.href = `tel:${profileUser.phone}`;
                    }
                  }}
                  type="button"
                >
                  📧 Contact
                </button>
              {/if}
            {:else}
              <a href="/login" class="btn btn--primary">
                💬 Send Message
              </a>
            {/if}
          </div>
        </div>
      </div>

      <!-- Profile Stats -->
      <div class="profile-stats">
        <div class="profile-stat">
          <div class="profile-stat__value">{listingsCount}</div>
          <div class="profile-stat__label">Active Listings</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat__value">{totalTrades}</div>
          <div class="profile-stat__label">Total Trades</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat__value">{completedTrades}</div>
          <div class="profile-stat__label">Completed Trades</div>
        </div>
        {#if averageRating > 0}
          <div class="profile-stat">
            <div class="profile-stat__value">{averageRating.toFixed(1)}</div>
            <div class="profile-stat__label">
              <span style="color: var(--color-accent-yellow);">★</span> Rating
            </div>
          </div>
        {/if}
      </div>

      <!-- Recent Listings -->
      {#if recentListings.length > 0}
        <section class="profile-section">
          <div class="profile-section__header">
            <h2>Active Listings</h2>
            <a href="/marketplace?user={profileUser?.username}" class="btn btn--ghost btn--sm">
              View All
            </a>
          </div>

          <div class="listings-grid">
            {#each recentListings as listing}
              <a href="/marketplace?id={listing.id}" class="listing-card">
                <div class="listing-card__image">
                  <div
                    class="listing-card__placeholder"
                    style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
                  >
                    📦
                  </div>
                  {#if listing.featured}
                    <span class="listing-card__badge listing-card__badge--featured">Featured</span>
                  {/if}
                </div>
                <div class="listing-card__body">
                  <h4 class="listing-card__title">{listing.title}</h4>
                  <div class="listing-card__price">{formatPrice(listing.price)}</div>
                  <div class="listing-card__meta">
                    <span class="listing-card__location">
                      📍 {listing.locationCity || "Location"}
                    </span>
                  </div>
                </div>
              </a>
            {/each}
          </div>
        </section>
      {:else}
        <section class="profile-section">
          <div class="profile-section__empty">
            <p>No active listings yet</p>
          </div>
        </section>
      {/if}

      <!-- Reviews Section -->
      <section class="profile-section">
        <div class="profile-section__header">
          <h2>Reviews</h2>
          {#if totalReviews > 0}
            <div class="reviews-summary">
              <span class="reviews-summary__rating">{averageRating.toFixed(1)}</span>
              <span class="reviews-summary__stars">{renderStars(averageRating)}</span>
              <span class="reviews-summary__count">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
            </div>
          {/if}
        </div>

        {#if reviews.length > 0}
          <div class="reviews-list">
            {#each reviews as review}
              <div class="review-card">
                <div class="review-card__header">
                  <div class="review-card__reviewer">
                    {#if review.reviewer?.avatarUrl}
                      <img 
                        src={review.reviewer.avatarUrl} 
                        alt={review.reviewer.username || "Reviewer"}
                        class="review-card__avatar"
                      />
                    {:else}
                      <div class="review-card__avatar review-card__avatar--initials">
                        {getReviewerInitials(review.reviewer)}
                      </div>
                    {/if}
                    <div class="review-card__reviewer-info">
                      <div class="review-card__reviewer-name">
                        {review.reviewer?.firstName && review.reviewer?.lastName
                          ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
                          : review.reviewer?.username || "Anonymous"}
                      </div>
                      <div class="review-card__date">{formatReviewDate(review.createdAt)}</div>
                    </div>
                  </div>
                  <div class="review-card__rating">
                    <div class="review-stars">
                      {#each [1, 2, 3, 4, 5] as star}
                        <span class="review-star {review.rating >= star ? 'review-star--filled' : ''}">
                          {review.rating >= star ? '★' : '☆'}
                        </span>
                      {/each}
                    </div>
                  </div>
                </div>
                
                {#if review.title}
                  <h3 class="review-card__title">{review.title}</h3>
                {/if}
                
                {#if review.comment}
                  <p class="review-card__comment">{review.comment}</p>
                {/if}
              </div>
            {/each}
          </div>
        {:else}
          <div class="profile-section__empty">
            <p>No reviews yet</p>
            <p style="font-size: var(--text-sm); color: var(--color-gray-500); margin-top: var(--space-2);">
              Be the first to leave a review after completing a trade with this user.
            </p>
          </div>
        {/if}
      </section>
    </div>
  </main>
</div>

<style>
  .profile-header {
    position: relative;
    background: linear-gradient(135deg, var(--color-primary-subtle), rgba(78, 205, 196, 0.1));
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-6);
    overflow: hidden;
  }

  .profile-header__background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%);
    opacity: 0.1;
  }

  .profile-header__content {
    position: relative;
    padding: var(--space-8);
    display: flex;
    gap: var(--space-6);
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .profile-avatar {
    position: relative;
    flex-shrink: 0;
  }

  .profile-avatar img,
  .profile-avatar__initials {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid white;
    box-shadow: var(--shadow-lg);
    object-fit: cover;
  }

  .profile-avatar__initials {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
  }

  .profile-avatar__badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 32px;
    height: 32px;
    background: var(--color-success);
    color: white;
    border-radius: 50%;
    border: 3px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-bold);
    font-size: var(--text-sm);
  }

  .profile-info {
    flex: 1;
    min-width: 200px;
  }

  .profile-info__header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
    flex-wrap: wrap;
  }

  .profile-info__name {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    margin: 0;
  }

  .profile-info__meta {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
    font-size: var(--text-sm);
    color: var(--color-gray-600);
  }

  .profile-info__username {
    font-weight: var(--font-medium);
    color: var(--color-gray-700);
  }

  .profile-info__bio {
    max-width: 600px;
    color: var(--color-gray-700);
    line-height: 1.6;
    margin-bottom: var(--space-4);
  }

  .profile-info__contact {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-gray-200);
  }

  .profile-info__contact-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
  }

  .profile-info__contact-label {
    font-weight: var(--font-medium);
    color: var(--color-gray-600);
  }

  .profile-info__contact-value {
    color: var(--color-gray-900);
  }

  .profile-info__reputation {
    margin: var(--space-4) 0;
  }

  .reputation-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
  }

  .reputation-badge--success {
    background: rgba(34, 197, 94, 0.1);
    color: var(--color-success);
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .reputation-badge--info {
    background: rgba(59, 130, 246, 0.1);
    color: var(--color-info);
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .reputation-badge--warning {
    background: rgba(251, 191, 36, 0.1);
    color: var(--color-warning);
    border: 1px solid rgba(251, 191, 36, 0.3);
  }

  .reputation-badge--error {
    background: rgba(239, 68, 68, 0.1);
    color: var(--color-error);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .reputation-badge--neutral {
    background: var(--color-gray-100);
    color: var(--color-gray-600);
    border: 1px solid var(--color-gray-200);
  }

  .reputation-badge__rating {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
  }

  .reputation-badge__stars {
    color: var(--color-accent-yellow);
    font-size: var(--text-base);
  }

  .reputation-badge__count {
    font-size: var(--text-xs);
    font-weight: var(--font-normal);
    opacity: 0.8;
  }

  .profile-info__last-login {
    font-size: var(--text-xs);
    color: var(--color-gray-500);
  }

  .profile-actions {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .profile-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-8);
  }

  .profile-stat {
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    text-align: center;
  }

  .profile-stat__value {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--color-primary);
    margin-bottom: var(--space-1);
  }

  .profile-stat__label {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
  }

  .profile-section {
    margin-bottom: var(--space-8);
  }

  .profile-section__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  .profile-section__header h2 {
    font-size: var(--text-xl);
    margin: 0;
  }

  .profile-section__empty {
    text-align: center;
    padding: var(--space-8);
    color: var(--color-gray-500);
  }

  .listings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--space-4);
  }

  .listing-card {
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .listing-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .listing-card__image {
    position: relative;
    width: 100%;
    height: 160px;
  }

  .listing-card__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
  }

  .listing-card__badge {
    position: absolute;
    top: var(--space-2);
    left: var(--space-2);
    padding: var(--space-1) var(--space-2);
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
  }

  .listing-card__body {
    padding: var(--space-4);
  }

  .listing-card__title {
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    margin: 0 0 var(--space-2) 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .listing-card__price {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    color: var(--color-primary);
    margin-bottom: var(--space-2);
  }

  .listing-card__meta {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
  }

  /* Reviews Section */
  .reviews-summary {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
  }

  .reviews-summary__rating {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--color-primary);
  }

  .reviews-summary__stars {
    color: var(--color-accent-yellow);
    font-size: var(--text-base);
  }

  .reviews-summary__count {
    color: var(--color-gray-600);
  }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .review-card {
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    padding: var(--space-5);
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .review-card:hover {
    box-shadow: var(--shadow-sm);
    border-color: var(--color-gray-300);
  }

  .review-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-3);
    gap: var(--space-4);
  }

  .review-card__reviewer {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex: 1;
  }

  .review-card__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .review-card__avatar--initials {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
  }

  .review-card__reviewer-info {
    flex: 1;
    min-width: 0;
  }

  .review-card__reviewer-name {
    font-weight: var(--font-semibold);
    font-size: var(--text-base);
    color: var(--color-gray-900);
    margin-bottom: var(--space-1);
  }

  .review-card__date {
    font-size: var(--text-sm);
    color: var(--color-gray-500);
  }

  .review-card__rating {
    flex-shrink: 0;
  }

  .review-stars {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  .review-star {
    font-size: var(--text-lg);
    color: var(--color-gray-300);
    line-height: 1;
  }

  .review-star--filled {
    color: var(--color-accent-yellow);
  }

  .review-card__title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--color-gray-900);
    margin: 0 0 var(--space-2) 0;
  }

  .review-card__comment {
    font-size: var(--text-base);
    color: var(--color-gray-700);
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  @media (max-width: 768px) {
    .profile-header__content {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .profile-info {
      text-align: center;
    }

    .profile-info__header,
    .profile-info__meta {
      justify-content: center;
    }

    .profile-actions {
      width: 100%;
      justify-content: center;
    }

    .listings-grid {
      grid-template-columns: 1fr;
    }

    .review-card__header {
      flex-direction: column;
      align-items: flex-start;
    }

    .review-card__rating {
      align-self: flex-start;
    }

    .profile-section__header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-2);
    }

    .reviews-summary {
      width: 100%;
    }
  }
</style>

