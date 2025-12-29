<script>
  import Logo from "$lib/components/Logo.svelte";
  import ListingModal from "$lib/components/ListingModal.svelte";
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import { enhance } from "$app/forms";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data } = $props();

  const marketplaceUser = $derived(data?.marketplaceUser);
  const listings = $derived(data?.listings || []);
  const categories = $derived(data?.categories || []);
  const stats = $derived(data?.stats || {});
  const filters = $derived(data?.filters || {});

  // Modal state
  let modalOpen = $state(false);
  let editingListingId = $state(null);

  // Local state for search and filters
  let searchQuery = $state(filters.searchQuery || "");
  let statusFilter = $state(filters.statusFilter || "all");
  let sortBy = $state(filters.sortBy || "newest");
  let sortOrder = $state(filters.sortOrder || "desc");

  // Filtered and sorted listings
  const filteredListings = $derived.by(() => {
    let result = [...listings];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(listing => listing.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "price":
          aVal = parseFloat(a.price || "0");
          bVal = parseFloat(b.price || "0");
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "views":
          aVal = a.viewCount || 0;
          bVal = b.viewCount || 0;
          break;
        case "trades":
          aVal = a.tradeCount || 0;
          bVal = b.tradeCount || 0;
          break;
        case "newest":
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return result;
  });

  // Update URL with filters
  function updateFilters() {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (sortOrder !== "desc") params.set("order", sortOrder);
    
    goto(`/my-listings?${params.toString()}`, { replaceState: true, noScroll: true });
  }

  // Handle search
  function handleSearch() {
    updateFilters();
  }

  // Handle status filter change
  function handleStatusFilter(newStatus) {
    statusFilter = newStatus;
    updateFilters();
  }

  // Handle sort change
  function handleSort(newSort) {
    if (sortBy === newSort) {
      // Toggle order if same column
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
    } else {
      sortBy = newSort;
      sortOrder = "desc";
    }
    updateFilters();
  }

  // Toggle listing status
  async function toggleListingStatus(listingId, currentStatus) {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    
    try {
      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error("Failed to update status");
      
      // Reload page to refresh data
      window.location.reload();
    } catch (error) {
      console.error("Error updating listing status:", error);
      alert("Failed to update listing status. Please try again.");
    }
  }

  // Delete listing
  async function deleteListing(listingId) {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete listing");
      
      // Reload page to refresh data
      window.location.reload();
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing. Please try again.");
    }
  }

  // Open modal for editing
  function openEditModal(listingId) {
    editingListingId = listingId;
    modalOpen = true;
  }

  // Open modal for creating
  function openCreateModal() {
    editingListingId = null;
    modalOpen = true;
  }

  // Handle modal save
  function handleModalSave() {
    // Reload page to refresh data
    window.location.reload();
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

  // Format price
  function formatPrice(price) {
    if (!price) return "£0";
    return `£${Number(price).toLocaleString("en-GB")}`;
  }

  // Get status badge class
  function getStatusClass(status) {
    switch (status) {
      case "active": return "badge--success";
      case "paused": return "badge--warning";
      case "draft": return "badge--neutral";
      case "sold": return "badge--info";
      default: return "badge--neutral";
    }
  }
</script>

<div class="page-wrapper">
  <!-- Header -->
  <header class="header">
    <div class="container">
      <div class="header__inner">
        <Logo />
        <nav class="nav" aria-label="Main navigation">
          <a href="/marketplace" class="nav__link">Browse</a>
          <a href="/dashboard" class="nav__link">Dashboard</a>
        </nav>
        <div class="header__actions">
          <a href="/create-listing" class="btn btn--primary">+ Create Listing</a>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>My Listings</h1>
          <p class="text-muted">Manage your listings</p>
        </div>
        <button class="btn btn--primary" onclick={openCreateModal} type="button">
          + Create New Listing
        </button>
      </div>

      <!-- Stats Summary -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__value">{stats.active || 0}</div>
          <div class="stat-card__label">Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{stats.paused || 0}</div>
          <div class="stat-card__label">Paused</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{stats.draft || 0}</div>
          <div class="stat-card__label">Draft</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{stats.sold || 0}</div>
          <div class="stat-card__label">Sold</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{stats.totalTrades || 0}</div>
          <div class="stat-card__label">Total Trades</div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="filters-row">
          <!-- Search -->
          <div class="search-box">
            <input
              type="text"
              class="search-input"
              placeholder="Search listings..."
              bind:value={searchQuery}
              onkeydown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button class="search-button" onclick={handleSearch} type="button">
              🔍
            </button>
          </div>

          <!-- Status Filter -->
          <div class="filter-group">
            <label class="filter-label">Status:</label>
            <select
              class="filter-select"
              bind:value={statusFilter}
              onchange={() => handleStatusFilter(statusFilter)}
            >
              <option value="all">All ({stats.total || 0})</option>
              <option value="active">Active ({stats.active || 0})</option>
              <option value="paused">Paused ({stats.paused || 0})</option>
              <option value="draft">Draft ({stats.draft || 0})</option>
              <option value="sold">Sold ({stats.sold || 0})</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Listings Table -->
      <div class="table-container">
        <table class="listings-table">
          <thead>
            <tr>
              <th>
                <button
                  class="table-header-button"
                  onclick={() => handleSort("title")}
                  type="button"
                >
                  Title
                  {#if sortBy === "title"}
                    <span class="sort-indicator">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  {/if}
                </button>
              </th>
              <th>
                <button
                  class="table-header-button"
                  onclick={() => handleSort("price")}
                  type="button"
                >
                  Price
                  {#if sortBy === "price"}
                    <span class="sort-indicator">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  {/if}
                </button>
              </th>
              <th>Category</th>
              <th>Location</th>
              <th>
                <button
                  class="table-header-button"
                  onclick={() => handleSort("status")}
                  type="button"
                >
                  Status
                  {#if sortBy === "status"}
                    <span class="sort-indicator">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  {/if}
                </button>
              </th>
              <th>
                <button
                  class="table-header-button"
                  onclick={() => handleSort("views")}
                  type="button"
                >
                  Views
                  {#if sortBy === "views"}
                    <span class="sort-indicator">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  {/if}
                </button>
              </th>
              <th>
                <button
                  class="table-header-button"
                  onclick={() => handleSort("trades")}
                  type="button"
                >
                  Trades
                  {#if sortBy === "trades"}
                    <span class="sort-indicator">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  {/if}
                </button>
              </th>
              <th>
                <button
                  class="table-header-button"
                  onclick={() => handleSort("newest")}
                  type="button"
                >
                  Created
                  {#if sortBy === "newest"}
                    <span class="sort-indicator">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  {/if}
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if filteredListings.length === 0}
              <tr>
                <td colspan="9" class="table-empty">
                  {searchQuery || statusFilter !== "all"
                    ? "No listings match your filters"
                    : "No listings yet. Create your first listing!"}
                </td>
              </tr>
            {:else}
              {#each filteredListings as listing}
                <tr class="table-row" class:table-row--paused={listing.status === "paused"}>
                  <td>
                    <div class="table-cell-title">
                      <a href="/marketplace?id={listing.id}" class="table-link">
                        {listing.title}
                      </a>
                      {#if listing.featured}
                        <span class="badge badge--primary badge--sm">Featured</span>
                      {/if}
                      {#if listing.urgent}
                        <span class="badge badge--error badge--sm">Urgent</span>
                      {/if}
                    </div>
                  </td>
                  <td>
                    <div class="table-cell-price">{formatPrice(listing.price)}</div>
                    <div class="table-cell-meta">{listing.type}</div>
                  </td>
                  <td>
                    <div class="table-cell-category">
                      {listing.category?.name || "N/A"}
                    </div>
                  </td>
                  <td>
                    <div class="table-cell-location">
                      {listing.locationCity || "N/A"}
                    </div>
                  </td>
                  <td>
                    <div class="table-cell-status">
                      <label class="status-toggle">
                        <input
                          type="checkbox"
                          checked={listing.status === "active"}
                          onchange={() => toggleListingStatus(listing.id, listing.status)}
                        />
                        <span class="status-toggle__slider"></span>
                      </label>
                      <span class="badge badge--{getStatusClass(listing.status)}">
                        {listing.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="table-cell-number">{listing.viewCount || 0}</div>
                  </td>
                  <td>
                    <div class="table-cell-number">{listing.tradeCount || 0}</div>
                  </td>
                  <td>
                    <div class="table-cell-date">{formatDate(listing.createdAt)}</div>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button
                        class="table-action-button"
                        onclick={() => openEditModal(listing.id)}
                        title="Edit"
                        type="button"
                      >
                        ✏️
                      </button>
                      <a
                        href="/marketplace?id={listing.id}"
                        class="table-action-button"
                        title="View"
                      >
                        👁️
                      </a>
                      <button
                        class="table-action-button table-action-button--danger"
                        onclick={() => deleteListing(listing.id)}
                        type="button"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Listing Modal -->
  <ListingModal
    bind:open={modalOpen}
    bind:listingId={editingListingId}
    {categories}
    marketplaceUser={marketplaceUser}
    onSave={handleModalSave}
  />
</div>

<style>
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
    gap: var(--space-4);
  }

  .page-header h1 {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--color-primary);
    margin-bottom: var(--space-1);
  }

  .stat-card__label {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
  }

  .filters-section {
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .filters-row {
    display: flex;
    gap: var(--space-4);
    align-items: center;
    flex-wrap: wrap;
  }

  .search-box {
    flex: 1;
    min-width: 250px;
    display: flex;
    gap: var(--space-2);
  }

  .search-input {
    flex: 1;
    padding: var(--space-3) var(--space-4);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .search-button {
    padding: var(--space-3) var(--space-4);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--text-lg);
  }

  .search-button:hover {
    background: var(--color-primary-dark);
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .filter-label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-gray-700);
  }

  .filter-select {
    padding: var(--space-3) var(--space-4);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    background: white;
    cursor: pointer;
  }

  .filter-select:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .table-container {
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    overflow-x: auto;
  }

  .listings-table {
    width: 100%;
    border-collapse: collapse;
  }

  .listings-table thead {
    background: var(--color-gray-50);
    border-bottom: 2px solid var(--color-gray-200);
  }

  .listings-table th {
    padding: var(--space-4);
    text-align: left;
    font-weight: var(--font-semibold);
    font-size: var(--text-sm);
    color: var(--color-gray-700);
    white-space: nowrap;
  }

  .table-header-button {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: transparent;
    border: none;
    font-family: inherit;
    font-weight: inherit;
    font-size: inherit;
    color: inherit;
    cursor: pointer;
    padding: 0;
  }

  .table-header-button:hover {
    color: var(--color-primary);
  }

  .sort-indicator {
    color: var(--color-primary);
    font-weight: var(--font-bold);
  }

  .listings-table tbody tr {
    border-bottom: 1px solid var(--color-gray-100);
    transition: background 0.2s;
  }

  .listings-table tbody tr:hover {
    background: var(--color-gray-50);
  }

  .table-row--paused {
    opacity: 0.7;
  }

  .listings-table td {
    padding: var(--space-4);
    font-size: var(--text-sm);
  }

  .table-cell-title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .table-link {
    color: var(--color-gray-900);
    text-decoration: none;
    font-weight: var(--font-medium);
  }

  .table-link:hover {
    color: var(--color-primary);
    text-decoration: underline;
  }

  .table-cell-price {
    font-weight: var(--font-semibold);
    color: var(--color-primary);
  }

  .table-cell-meta {
    font-size: var(--text-xs);
    color: var(--color-gray-500);
    margin-top: var(--space-1);
  }

  .table-cell-category,
  .table-cell-location {
    color: var(--color-gray-700);
  }

  .table-cell-status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .status-toggle {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    cursor: pointer;
  }

  .status-toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .status-toggle__slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-gray-300);
    transition: 0.3s;
    border-radius: 24px;
  }

  .status-toggle__slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  .status-toggle input:checked + .status-toggle__slider {
    background-color: var(--color-primary);
  }

  .status-toggle input:checked + .status-toggle__slider:before {
    transform: translateX(20px);
  }

  .table-cell-number {
    font-weight: var(--font-medium);
    color: var(--color-gray-700);
  }

  .table-cell-date {
    color: var(--color-gray-600);
    font-size: var(--text-xs);
  }

  .table-actions {
    display: flex;
    gap: var(--space-2);
  }

  .table-action-button {
    padding: var(--space-2);
    background: transparent;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--text-base);
    text-decoration: none;
    color: var(--color-gray-700);
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .table-action-button:hover {
    background: var(--color-gray-50);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .table-action-button--danger:hover {
    background: var(--color-error-subtle);
    border-color: var(--color-error);
    color: var(--color-error);
  }

  .table-empty {
    text-align: center;
    padding: var(--space-8);
    color: var(--color-gray-500);
  }

  @media (max-width: 768px) {
    .listings-table {
      font-size: var(--text-xs);
    }

    .listings-table th,
    .listings-table td {
      padding: var(--space-2);
    }

    .table-cell-title {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
