<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import { goto } from "$app/navigation";

  const { data } = $props();

  const marketplaceUser = $derived(data?.marketplaceUser);
  const accountStatus = $derived(data?.accountStatus || {});
  const listings = $derived(data?.listings || {});
  const trades = $derived(data?.trades || {});
  const stats = $derived(data?.stats || {});

  // Format price
  function formatPrice(price) {
    if (!price) return "£0";
    return `£${Number(price).toLocaleString("en-GB")}`;
  }

  // Format date
  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  // Get status badge class
  function getStatusClass(status) {
    switch (status) {
      case "active": return "badge--success";
      case "paused": return "badge--warning";
      case "draft": return "badge--neutral";
      case "sold": return "badge--info";
      case "initiated": return "badge--info";
      case "payment_pending": return "badge--warning";
      case "paid": return "badge--info";
      case "in_progress": return "badge--info";
      case "completed": return "badge--success";
      case "cancelled": return "badge--neutral";
      case "disputed": return "badge--error";
      default: return "badge--neutral";
    }
  }

  // Get status label
  function getStatusLabel(status) {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  // Get user display name
  function getUserDisplayName(user) {
    if (!user) return "Unknown User";
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
    }
    return user.username;
  }
</script>

<div class="page-wrapper">
  <!-- Header -->
  <NavigationBar />

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Page Header -->
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p class="text-muted">Welcome back, {marketplaceUser?.username || 'User'}!</p>
        </div>
        <a href="/create-listing" class="btn btn--primary">
          + Create New Listing
        </a>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__value">{stats.activeListings || 0}</div>
          <div class="stat-card__label">Active Listings</div>
          <a href="/my-listings" class="stat-card__link">View all →</a>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{stats.totalListings || 0}</div>
          <div class="stat-card__label">Total Listings</div>
          <a href="/my-listings" class="stat-card__link">Manage →</a>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{stats.completedTrades || 0}</div>
          <div class="stat-card__label">Completed Trades</div>
        </div>
        {#if stats.averageRating > 0}
        <div class="stat-card">
          <div class="stat-card__value" style="color: var(--color-primary);">
              ⭐ {stats.averageRating.toFixed(1)}
          </div>
            <div class="stat-card__label">Average Rating</div>
            <div class="stat-card__subtext">{stats.totalReviews} reviews</div>
          </div>
        {:else}
          <div class="stat-card">
            <div class="stat-card__value">—</div>
            <div class="stat-card__label">No Ratings Yet</div>
          </div>
        {/if}
      </div>

      <div class="dashboard-layout">
        <!-- Main Column -->
        <div class="dashboard-main">
          <!-- My Listings -->
          <div class="dashboard-card">
            <div class="dashboard-card__header">
              <h3>My Listings</h3>
              <a href="/my-listings" class="dashboard-card__link">View all →</a>
              </div>
            <div class="dashboard-card__body">
              {#if listings.recent && listings.recent.length > 0}
                <div class="listings-list">
                  {#each listings.recent as listing}
                    <div class="listing-item">
                      <div class="listing-item__content">
                        <a href="/listing-details?id={listing.id}" class="listing-item__title">
                          {listing.title}
                        </a>
                        <div class="listing-item__meta">
                          <span class="listing-item__price">{formatPrice(listing.price)}</span>
                          <span class="listing-item__separator">•</span>
                          <span class="listing-item__views">{listing.viewCount || 0} views</span>
                          <span class="listing-item__separator">•</span>
                          <span class="listing-item__favorites">{listing.favoriteCount || 0} favorites</span>
                      </div>
                      </div>
                      <div class="listing-item__actions">
                        <span class="badge badge--{getStatusClass(listing.status)}">
                          {getStatusLabel(listing.status)}
                        </span>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="empty-state">
                  <p>You haven't created any listings yet.</p>
                  <a href="/create-listing" class="btn btn--primary btn--sm">Create Your First Listing</a>
                </div>
              {/if}
            </div>
          </div>

          <!-- Completed Trades -->
          <div class="dashboard-card">
            <div class="dashboard-card__header">
              <h3>Completed Trades</h3>
              {#if trades.totalCompleted > 0}
                <span class="dashboard-card__count">{trades.totalCompleted} total</span>
              {/if}
              </div>
            <div class="dashboard-card__body">
              {#if trades.completed && trades.completed.length > 0}
                <div class="trades-list">
                  {#each trades.completed as trade}
                    <div class="trade-item">
                      <div class="trade-item__content">
                        <div class="trade-item__header">
                          <span class="trade-item__number">#{trade.tradeNumber}</span>
                          <span class="trade-item__title">{trade.listingTitle}</span>
                  </div>
                        <div class="trade-item__meta">
                          <span>
                            {trade.isSeller ? 'Sold to' : 'Bought from'}: 
                            <strong>{getUserDisplayName(trade.otherUser)}</strong>
                          </span>
                          <span class="trade-item__separator">•</span>
                          <span class="trade-item__amount">{formatPrice(trade.amount)}</span>
                    </div>
                        <div class="trade-item__date">
                          Completed {formatDate(trade.completedAt || trade.createdAt)}
                    </div>
                  </div>
                      <div class="trade-item__status">
                        <span class="badge badge--success">Completed</span>
                    </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="empty-state">
                  <p>You haven't completed any trades yet.</p>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="dashboard-sidebar">
          <!-- Account Status -->
          <div class="dashboard-card dashboard-card--highlighted">
            <div class="dashboard-card__header">
              <h4>Account Status</h4>
              </div>
            <div class="dashboard-card__body">
              <div class="status-list">
                <div class="status-item">
                  <span class="status-item__icon" class:status-item__icon--verified={accountStatus.emailVerified}>
                    {accountStatus.emailVerified ? "✓" : "✗"}
                  </span>
                  <span class="status-item__label">Email Verified</span>
                      </div>
                <div class="status-item">
                  <span class="status-item__icon" class:status-item__icon--verified={accountStatus.phoneVerified}>
                    {accountStatus.phoneVerified ? "✓" : "✗"}
                  </span>
                  <span class="status-item__label">Phone Verified</span>
                </div>
                <div class="status-item">
                  <span class="status-item__icon" class:status-item__icon--verified={accountStatus.kycStatus === 'verified'}>
                    {accountStatus.kycStatus === 'verified' ? "✓" : accountStatus.kycStatus === 'pending' ? "⏳" : "✗"}
                  </span>
                  <span class="status-item__label">
                    KYC {accountStatus.kycStatus === 'verified' ? 'Verified' : accountStatus.kycStatus === 'pending' ? 'Pending' : 'Not Verified'}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-item__icon" class:status-item__icon--verified={accountStatus.twoFactorEnabled}>
                    {accountStatus.twoFactorEnabled ? "✓" : "✗"}
                  </span>
                  <span class="status-item__label">2FA Enabled</span>
                </div>
              </div>
              <a href="/settings" class="btn btn--ghost btn--full mt-4">
                ⚙️ Security Settings
              </a>
            </div>
          </div>

          <!-- Listing Stats -->
          <div class="dashboard-card">
            <div class="dashboard-card__header">
              <h4>Listing Statistics</h4>
            </div>
            <div class="dashboard-card__body">
              <div class="stats-list">
                <div class="stat-row">
                  <span class="stat-row__label">Active</span>
                  <span class="stat-row__value">{listings.active || 0}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-row__label">Paused</span>
                  <span class="stat-row__value">{listings.paused || 0}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-row__label">Draft</span>
                  <span class="stat-row__value">{listings.draft || 0}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-row__label">Sold</span>
                  <span class="stat-row__value">{listings.sold || 0}</span>
                </div>
              </div>
              <a href="/my-listings" class="btn btn--outline btn--full mt-4">
                Manage Listings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

<style>
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .dashboard-header h1 {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .stat-card {
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    text-align: center;
  }

  .stat-card__value {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
    color: var(--color-primary);
    margin-bottom: var(--space-1);
  }

  .stat-card__label {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
    margin-bottom: var(--space-2);
  }

  .stat-card__subtext {
    font-size: var(--text-xs);
    color: var(--color-gray-500);
    margin-top: var(--space-1);
  }

  .stat-card__link {
    font-size: var(--text-sm);
    color: var(--color-primary);
    text-decoration: none;
  }

  .stat-card__link:hover {
    text-decoration: underline;
  }

  .dashboard-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: var(--space-6);
  }

  .dashboard-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .dashboard-sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .dashboard-card {
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .dashboard-card--highlighted {
    background: linear-gradient(135deg, var(--color-primary-subtle), rgba(78, 205, 196, 0.1));
  }

  .dashboard-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-gray-200);
  }

  .dashboard-card__header h3,
  .dashboard-card__header h4 {
    font-size: var(--text-lg);
    margin: 0;
  }

  .dashboard-card__link {
    font-size: var(--text-sm);
    color: var(--color-primary);
    text-decoration: none;
  }

  .dashboard-card__link:hover {
    text-decoration: underline;
  }

  .dashboard-card__count {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
  }

  .dashboard-card__body {
    padding: var(--space-4);
  }

  .listings-list,
  .trades-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .listing-item,
  .trade-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    transition: all 0.2s;
  }

  .listing-item:hover,
  .trade-item:hover {
    border-color: var(--color-primary);
    background: var(--color-gray-50);
  }

  .listing-item__content,
  .trade-item__content {
    flex: 1;
    min-width: 0;
  }

  .listing-item__title {
    display: block;
    font-weight: var(--font-semibold);
    color: var(--color-gray-900);
    text-decoration: none;
    margin-bottom: var(--space-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .listing-item__title:hover {
    color: var(--color-primary);
    text-decoration: underline;
  }

  .listing-item__meta,
  .trade-item__meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-gray-600);
    flex-wrap: wrap;
  }

  .listing-item__price {
    font-weight: var(--font-semibold);
    color: var(--color-primary);
  }

  .listing-item__separator,
  .trade-item__separator {
    color: var(--color-gray-400);
  }

  .trade-item__header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-1);
  }

  .trade-item__number {
    font-size: var(--text-xs);
    color: var(--color-gray-500);
    font-family: monospace;
  }

  .trade-item__title {
    font-weight: var(--font-semibold);
    color: var(--color-gray-900);
  }

  .trade-item__amount {
    font-weight: var(--font-semibold);
    color: var(--color-primary);
  }

  .trade-item__date {
    font-size: var(--text-xs);
    color: var(--color-gray-500);
    margin-top: var(--space-1);
  }

  .status-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
  }

  .status-item__icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    background: var(--color-gray-200);
    color: var(--color-gray-600);
    font-weight: var(--font-bold);
  }

  .status-item__icon--verified {
    background: var(--color-primary);
    color: white;
  }

  .stats-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-gray-100);
  }

  .stat-row:last-child {
    border-bottom: none;
  }

  .stat-row__label {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
  }

  .stat-row__value {
    font-weight: var(--font-semibold);
    color: var(--color-gray-900);
  }

  .empty-state {
    text-align: center;
    padding: var(--space-8);
    color: var(--color-gray-500);
  }

  .empty-state p {
    margin-bottom: var(--space-4);
  }

  @media (max-width: 1024px) {
    .dashboard-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
