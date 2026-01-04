<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data, userLanguage = "en" } = $props();

  const marketplaceUser = $derived(data?.marketplaceUser);
  const favorites = $derived(data?.favorites || []);
  const filters = $derived(data?.filters || {});

  // Local state for search and filters - initialize from URL params
  let searchQuery = $state("");
  let sortBy = $state("newest");
  let sortOrder = $state("desc");

  // Initialize from data on mount
  $effect(() => {
    if (data?.filters) {
      searchQuery = data.filters.searchQuery || "";
      sortBy = data.filters.sortBy || "newest";
      sortOrder = data.filters.sortOrder || "desc";
    }
  });

  // Filtered and sorted favorites
  const filteredFavorites = $derived.by(() => {
    let result = [...favorites];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(fav => 
        fav.listing.title.toLowerCase().includes(query) ||
        fav.listing.description?.toLowerCase().includes(query) ||
        fav.listing.category?.name.toLowerCase().includes(query) ||
        fav.listing.locationCity?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case "title":
          aVal = a.listing.title.toLowerCase();
          bVal = b.listing.title.toLowerCase();
          break;
        case "price":
          aVal = parseFloat(a.listing.price || "0");
          bVal = parseFloat(b.listing.price || "0");
          break;
        case "category":
          aVal = a.listing.category?.name || "";
          bVal = b.listing.category?.name || "";
          break;
        case "location":
          aVal = a.listing.locationCity || "";
          bVal = b.listing.locationCity || "";
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
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (sortOrder !== "desc") params.set("order", sortOrder);
    
    goto(`/favorites?${params.toString()}`, { replaceState: true, noScroll: true });
  }

  // Handle search
  function handleSearch() {
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

  // Remove favorite
  async function removeFavorite(listingId) {
    if (!confirm("Are you sure you want to remove this listing from your favorites?")) {
      return;
    }

    try {
      const { removeFavorite } = await import("$lib/services/favorites.js");
      await removeFavorite(listingId);
      // Reload page to refresh data
      window.location.reload();
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove favorite. Please try again.");
    }
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
</script>

<div class="page-wrapper">
  <!-- Header -->
  <NavigationBar {userLanguage} />

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>My Favorites</h1>
          <p class="text-muted">All your saved listings in one place</p>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__value">{favorites.length}</div>
          <div class="stat-card__label">Total Favorites</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{filteredFavorites.length}</div>
          <div class="stat-card__label">Showing</div>
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
              placeholder="Search favorites by title, description, category, or location..."
              bind:value={searchQuery}
              onkeydown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button class="search-button" onclick={handleSearch} type="button">
              🔍
            </button>
          </div>
        </div>
      </div>

      <!-- Favorites Table -->
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
              <th>
                <button
                  class="table-header-button"
                  onclick={() => handleSort("category")}
                  type="button"
                >
                  Category
                  {#if sortBy === "category"}
                    <span class="sort-indicator">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  {/if}
                </button>
              </th>
              <th>
                <button
                  class="table-header-button"
                  onclick={() => handleSort("location")}
                  type="button"
                >
                  Location
                  {#if sortBy === "location"}
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
                  Saved On
                  {#if sortBy === "newest"}
                    <span class="sort-indicator">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  {/if}
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if filteredFavorites.length === 0}
              <tr>
                <td colspan="6" class="table-empty">
                  {searchQuery
                    ? "No favorites match your search"
                    : favorites.length === 0
                    ? "You haven't saved any listings yet. Start browsing and save your favorites!"
                    : "No favorites match your filters"}
                </td>
              </tr>
            {:else}
              {#each filteredFavorites as favorite}
                <tr class="table-row">
                  <td>
                    <div class="table-cell-title">
                      <a href="/listing-details?id={favorite.listingId}" class="table-link">
                        {favorite.listing.title}
                      </a>
                      {#if favorite.listing.featured}
                        <span class="badge badge--primary badge--sm">Featured</span>
                      {/if}
                      {#if favorite.listing.urgent}
                        <span class="badge badge--error badge--sm">Urgent</span>
                      {/if}
                    </div>
                  </td>
                  <td>
                    <div class="table-cell-price">{formatPrice(favorite.listing.price)}</div>
                    <div class="table-cell-meta">{favorite.listing.type}</div>
                  </td>
                  <td>
                    <div class="table-cell-category">
                      {favorite.listing.category?.name || "N/A"}
                    </div>
                  </td>
                  <td>
                    <div class="table-cell-location">
                      {favorite.listing.locationCity || "N/A"}
                      {#if favorite.listing.locationPostcode}
                        <span class="table-cell-meta"> • {favorite.listing.locationPostcode}</span>
                      {/if}
                    </div>
                  </td>
                  <td>
                    <div class="table-cell-date">{formatDate(favorite.createdAt)}</div>
                  </td>
                  <td>
                    <div class="table-actions">
                      <a
                        href="/listing-details?id={favorite.listingId}"
                        class="table-action-button"
                        title="View Listing"
                      >
                        👁️
                      </a>
                      <button
                        class="table-action-button table-action-button--danger"
                        onclick={() => removeFavorite(favorite.listingId)}
                        type="button"
                        title="Remove from Favorites"
                      >
                        ❌
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

