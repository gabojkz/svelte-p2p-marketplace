<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import { t } from "$lib/utils/translations.js";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data } = $props();
  const userLanguage = $derived(data?.userLanguage || 'en');

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

  // Report state
  let showReportModal = $state(false);
  let reportIssueType = $state("");
  let reportTitle = $state("");
  let reportDescription = $state("");
  let submittingReport = $state(false);

  // Report issue types for user reports
  const reportIssueTypes = [
    { value: "scam", label: "Scam / Fraud", description: "Suspicious or fraudulent behavior" },
    { value: "harassment", label: "Harassment", description: "Inappropriate or abusive behavior" },
    { value: "spam", label: "Spam Account", description: "Fake or spam account" },
    { value: "fake", label: "Fake Profile", description: "Misleading or fake profile information" },
    { value: "other", label: "Other", description: "Other issue not listed above" }
  ];

  // Handle report submission
  async function handleReportSubmit() {
    if (!reportIssueType) {
      alert("Please select a reason for reporting this user");
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

    if (!profileUser?.id) {
      alert("Unable to submit report. User information not available.");
      return;
    }

    submittingReport = true;

    try {
      const { reportUser } = await import("$lib/services/user.js");
      await reportUser({
        userId: profileUser.id,
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
</script>

<div class="page-wrapper">
  <!-- Header -->
  <NavigationBar {userLanguage} />

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Profile Header -->
      <div class="profile-header">
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
                <span class="badge badge--success badge--sm">{t('settings.verified', userLanguage)}</span>
              {/if}
            </div>

            <!-- Key Data Points -->
            <div class="profile-info__data">
              <div class="profile-info__data-item">
                <span class="profile-info__data-label">{t('settings.username', userLanguage)}</span>
                <span class="profile-info__data-value">@{profileUser?.username}</span>
              </div>
              
              {#if profileUser?.locationCity}
                <div class="profile-info__data-item">
                  <span class="profile-info__data-label">{t('common.location', userLanguage)}</span>
                  <span class="profile-info__data-value">
                    {profileUser.locationCity}
                    {#if profileUser.locationPostcode}
                      , {profileUser.locationPostcode}
                    {/if}
                  </span>
                </div>
              {/if}

              <div class="profile-info__data-item">
                <span class="profile-info__data-label">{t('profile.memberSince', userLanguage)}</span>
                <span class="profile-info__data-value">{formatDate(profileUser?.createdAt)}</span>
              </div>

              <div class="profile-info__data-item">
                <span class="profile-info__data-label">{t('profile.lastActive', userLanguage)}</span>
                <span class="profile-info__data-value">
                  {profileUser?.lastLoginAt ? formatLastLogin(profileUser.lastLoginAt) : t('profile.never', userLanguage)}
                </span>
              </div>

              {#if averageRating > 0}
                <div class="profile-info__data-item">
                  <span class="profile-info__data-label">{t('profile.rating', userLanguage)}</span>
                  <span class="profile-info__data-value">
                    <span style="color: var(--color-accent-yellow); font-weight: var(--font-semibold);">
                      ⭐ {averageRating.toFixed(1)}
                    </span>
                    <span style="color: var(--color-gray-500); margin-left: var(--space-1);">
                      ({totalReviews} {totalReviews === 1 ? t('profile.review', userLanguage) : t('profile.reviews', userLanguage)})
                    </span>
                  </span>
                </div>
              {/if}
            </div>

            {#if profileUser?.bio}
              <p class="profile-info__bio">{profileUser.bio}</p>
            {/if}
          </div>

          <!-- Action Buttons -->
          <div class="profile-actions">
            {#if isOwnProfile}
              <a href="/settings" class="btn btn--primary btn--sm">
                {t('common.edit', userLanguage)} {t('settings.profile', userLanguage)}
              </a>
            {:else if user}
              <button
                class="btn btn--primary btn--sm"
                onclick={startConversation}
                type="button"
              >
                {t('common.message', userLanguage)}
              </button>
              {#if profileUser?.email || profileUser?.phone}
                <button
                  class="btn btn--outline btn--sm"
                  onclick={() => {
                    if (profileUser?.email) {
                      window.location.href = `mailto:${profileUser.email}`;
                    } else if (profileUser?.phone) {
                      window.location.href = `tel:${profileUser.phone}`;
                    }
                  }}
                  type="button"
                >
                  {t('profile.contact', userLanguage)}
                </button>
              {/if}
              <button
                class="btn btn--outline btn--sm btn--danger"
                onclick={() => showReportModal = true}
                type="button"
              >
                {t('listingDetails.report', userLanguage)}
              </button>
            {:else}
              <a href="/login" class="btn btn--primary btn--sm">
                {t('common.message', userLanguage)}
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
            Reporting <strong>{profileUser?.firstName || profileUser?.username || 'this user'}</strong> for inappropriate behavior or violation of platform rules.
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
        </div>
        <div class="modal-footer">
          <button
            class="btn btn--ghost"
            onclick={closeReportModal}
            type="button"
            disabled={submittingReport}
          >
            Cancel
          </button>
          <button
            class="btn btn--primary btn--danger"
            onclick={handleReportSubmit}
            type="button"
            disabled={submittingReport || !reportIssueType || !reportTitle.trim() || reportDescription.trim().length < 20}
          >
            {submittingReport ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .profile-header {
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-6);
  }

  .profile-header__content {
    padding: var(--space-6);
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--space-6);
    align-items: start;
  }

  .profile-avatar {
    position: relative;
    flex-shrink: 0;
  }

  .profile-avatar img,
  .profile-avatar__initials {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-gray-200);
    object-fit: cover;
  }

  .profile-avatar__initials {
    background: var(--color-gray-100);
    color: var(--color-gray-700);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-2xl);
    font-weight: var(--font-semibold);
  }

  .profile-avatar__badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 24px;
    height: 24px;
    background: var(--color-success);
    color: white;
    border-radius: 50%;
    border: 2px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-bold);
    font-size: var(--text-xs);
  }

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  .profile-info__header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  .profile-info__name {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    margin: 0;
    color: var(--color-gray-900);
  }

  .profile-info__data {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-3) var(--space-6);
    margin-bottom: var(--space-4);
  }

  .profile-info__data-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .profile-info__data-label {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--color-gray-500);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .profile-info__data-value {
    font-size: var(--text-sm);
    color: var(--color-gray-900);
    font-weight: var(--font-medium);
  }

  .profile-info__bio {
    max-width: 600px;
    color: var(--color-gray-700);
    line-height: 1.6;
    font-size: var(--text-sm);
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-gray-100);
  }

  .profile-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    align-items: stretch;
    min-width: 120px;
  }

  .btn--sm {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
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
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }

    .profile-avatar {
      justify-self: center;
    }

    .profile-info__header {
      justify-content: center;
      text-align: center;
    }

    .profile-info__data {
      grid-template-columns: 1fr;
      gap: var(--space-3);
      text-align: center;
    }

    .profile-info__data-item {
      align-items: center;
    }

    .profile-actions {
      width: 100%;
      flex-direction: row;
      justify-content: stretch;
    }

    .profile-actions .btn {
      flex: 1;
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
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-xl);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-5);
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
    border-radius: var(--radius-sm);
    transition: background-color 0.2s, color 0.2s;
  }

  .modal-close:hover {
    background: var(--color-gray-100);
    color: var(--color-gray-700);
  }

  .modal-body {
    padding: var(--space-5);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-5);
    border-top: 1px solid var(--color-gray-200);
  }

  .btn--danger {
    background: var(--color-error);
    color: white;
    border-color: var(--color-error);
  }

  .btn--danger:hover:not(:disabled) {
    background: var(--color-error-dark);
    border-color: var(--color-error-dark);
  }

  .btn--danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

