<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data } = $props();

  const marketplaceUser = $derived(data?.marketplaceUser);
  const trades = $derived(data?.trades || []);
  const stats = $derived(data?.stats || {});
  const filters = $derived(data?.filters || {});

  // Local state for search and filters
  let searchQuery = $state("");
  let statusFilter = $state("all");
  let roleFilter = $state("all");
  let sortBy = $state("newest");
  let sortOrder = $state("desc");

  // Initialize from data on mount
  $effect(() => {
    if (data?.filters) {
      searchQuery = data.filters.searchQuery || "";
      statusFilter = data.filters.statusFilter || "all";
      roleFilter = data.filters.roleFilter || "all";
      sortBy = data.filters.sortBy || "newest";
      sortOrder = data.filters.sortOrder || "desc";
    }
  });

  // Filtered and sorted trades
  const filteredTrades = $derived.by(() => {
    let result = [...trades];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (trade) =>
          trade.tradeNumber.toLowerCase().includes(query) ||
          trade.listing?.title?.toLowerCase().includes(query) ||
          trade.otherParty?.firstName?.toLowerCase().includes(query) ||
          trade.otherParty?.username?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((trade) => trade.status === statusFilter);
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((trade) => trade.userRole === roleFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "amount":
          aVal = parseFloat(a.amount || "0");
          bVal = parseFloat(b.amount || "0");
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "tradeNumber":
          aVal = a.tradeNumber;
          bVal = b.tradeNumber;
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

  // Format price
  /** @param {string | number | null | undefined} price */
  function formatPrice(price) {
    if (!price) return "£0";
    return `£${Number(price).toLocaleString("en-GB")}`;
  }

  // Format date
  /** @param {string | Date | null | undefined} date */
  function formatDate(date) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // Get status badge class
  /** @param {string} status */
  function getStatusBadgeClass(status) {
    switch (status) {
      case "completed":
        return "badge--success";
      case "cancelled":
        return "badge--error";
      case "in_progress":
        return "badge--warning";
      case "initiated":
        return "badge--info";
      default:
        return "badge--secondary";
    }
  }

  // Get status label
  /** @param {string} status */
  function getStatusLabel(status) {
    switch (status) {
      case "initiated":
        return "Initiated";
      case "payment_pending":
        return "Payment Pending";
      case "paid":
        return "Paid";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "disputed":
        return "Disputed";
      default:
        return status;
    }
  }

  // Handle filter changes
  function applyFilters() {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (roleFilter !== "all") params.set("role", roleFilter);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (sortOrder !== "desc") params.set("order", sortOrder);

    goto(`/my-trades?${params.toString()}`);
  }

  // Handle search
  /** @param {SubmitEvent} e */
  function handleSearch(e) {
    e.preventDefault();
    applyFilters();
  }

  // Navigate to trade room
  /** @param {number} tradeId */
  /** @param {number} listingId */
  /** @param {number | null} conversationId */
  function goToTradeRoom(tradeId, listingId, conversationId) {
    if (conversationId) {
      goto(`/trade-room?conversationId=${conversationId}`);
    } else {
      // Fallback to listingId if conversationId is not available
      goto(`/trade-room?listingId=${listingId}`);
    }
  }
</script>

<svelte:head>
  <title>My Trades — Marketto</title>
</svelte:head>

<div class="page-wrapper">
  <NavigationBar />

  <main class="main-content">
    <div class="container">
      <!-- Page Header -->
      <div style="margin-bottom: var(--space-8);">
        <h1 style="font-size: var(--text-3xl); font-weight: var(--font-bold); margin-bottom: var(--space-2);">
          My Trades
        </h1>
        <p class="text-muted">
          View and manage all your trades as a buyer or seller
        </p>
      </div>

      <!-- Statistics Cards -->
      <div
        class="grid"
        style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);"
      >
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <div style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-primary);">
              {stats.total || 0}
            </div>
            <div style="font-size: var(--text-sm); color: var(--color-gray-600); margin-top: var(--space-1);">
              Total Trades
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <div style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-accent-yellow);">
              {stats.active || 0}
            </div>
            <div style="font-size: var(--text-sm); color: var(--color-gray-600); margin-top: var(--space-1);">
              Active
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <div style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-success);">
              {stats.completed || 0}
            </div>
            <div style="font-size: var(--text-sm); color: var(--color-gray-600); margin-top: var(--space-1);">
              Completed
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <div style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-primary);">
              {stats.asBuyer || 0}
            </div>
            <div style="font-size: var(--text-sm); color: var(--color-gray-600); margin-top: var(--space-1);">
              As Buyer
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card__body" style="text-align: center;">
            <div style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-secondary);">
              {stats.asSeller || 0}
            </div>
            <div style="font-size: var(--text-sm); color: var(--color-gray-600); margin-top: var(--space-1);">
              As Seller
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="card" style="margin-bottom: var(--space-6);">
        <div class="card__body">
          <form onsubmit={handleSearch} style="display: flex; flex-direction: column; gap: var(--space-4);">
            <!-- Search Bar -->
            <div>
              <label for="search-input" class="form-label">Search Trades</label>
              <div class="input-icon">
                <span class="input-icon__icon">🔍</span>
                <input
                  id="search-input"
                  type="text"
                  bind:value={searchQuery}
                  class="form-input"
                  placeholder="Search by trade number, listing title, or other party..."
                />
              </div>
            </div>

            <!-- Filters Row -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-3);">
              <!-- Status Filter -->
              <div>
                <label for="status-filter" class="form-label">Status</label>
                <select id="status-filter" bind:value={statusFilter} class="form-select" onchange={applyFilters}>
                  <option value="all">All Statuses</option>
                  <option value="initiated">Initiated</option>
                  <option value="payment_pending">Payment Pending</option>
                  <option value="paid">Paid</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>

              <!-- Role Filter -->
              <div>
                <label for="role-filter" class="form-label">My Role</label>
                <select id="role-filter" bind:value={roleFilter} class="form-select" onchange={applyFilters}>
                  <option value="all">All Roles</option>
                  <option value="buyer">As Buyer</option>
                  <option value="seller">As Seller</option>
                </select>
              </div>

              <!-- Sort By -->
              <div>
                <label for="sort-by" class="form-label">Sort By</label>
                <select id="sort-by" bind:value={sortBy} class="form-select" onchange={applyFilters}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                  <option value="tradeNumber">Trade Number</option>
                </select>
              </div>
            </div>

            <!-- Search Button -->
            <button type="submit" class="btn btn--primary">
              Search
            </button>
          </form>
        </div>
      </div>

      <!-- Trades Table -->
      <div class="card">
        <div class="card__body" style="padding: 0; overflow-x: auto;">
          {#if filteredTrades.length === 0}
            <div style="padding: var(--space-8); text-align: center;">
              <p style="font-size: var(--text-lg); color: var(--color-gray-600); margin-bottom: var(--space-4);">
                {searchQuery || statusFilter !== "all" || roleFilter !== "all"
                  ? "No trades found matching your filters"
                  : "You haven't made any trades yet"}
              </p>
              {#if !searchQuery && statusFilter === "all" && roleFilter === "all"}
                <a href="/marketplace" class="btn btn--primary">
                  Browse Marketplace
                </a>
              {/if}
            </div>
          {:else}
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid var(--color-gray-200); background: var(--color-gray-50);">
                  <th style="padding: var(--space-3); text-align: left; font-size: var(--text-sm); font-weight: var(--font-semibold);">
                    Trade #
                  </th>
                  <th style="padding: var(--space-3); text-align: left; font-size: var(--text-sm); font-weight: var(--font-semibold);">
                    Listing
                  </th>
                  <th style="padding: var(--space-3); text-align: left; font-size: var(--text-sm); font-weight: var(--font-semibold);">
                    Other Party
                  </th>
                  <th style="padding: var(--space-3); text-align: left; font-size: var(--text-sm); font-weight: var(--font-semibold);">
                    My Role
                  </th>
                  <th style="padding: var(--space-3); text-align: left; font-size: var(--text-sm); font-weight: var(--font-semibold);">
                    Amount
                  </th>
                  <th style="padding: var(--space-3); text-align: left; font-size: var(--text-sm); font-weight: var(--font-semibold);">
                    Status
                  </th>
                  <th style="padding: var(--space-3); text-align: left; font-size: var(--text-sm); font-weight: var(--font-semibold);">
                    Created
                  </th>
                  <th style="padding: var(--space-3); text-align: center; font-size: var(--text-sm); font-weight: var(--font-semibold);">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {#each filteredTrades as trade}
                  <tr
                    style="border-bottom: 1px solid var(--color-gray-200); cursor: pointer;"
                    onmouseenter={(e) => e.currentTarget.style.background = "var(--color-gray-50)"}
                    onmouseleave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style="padding: var(--space-3);">
                      <span style="font-family: var(--font-mono); font-size: var(--text-xs);">
                        {trade.tradeNumber}
                      </span>
                    </td>
                    <td style="padding: var(--space-3);">
                      <div style="font-weight: var(--font-medium); font-size: var(--text-sm);">
                        {trade.listing?.title || "N/A"}
                      </div>
                      {#if trade.category}
                        <div style="font-size: var(--text-xs); color: var(--color-gray-600);">
                          {trade.category.name}
                        </div>
                      {/if}
                    </td>
                    <td style="padding: var(--space-3);">
                      {#if trade.otherParty}
                        <div style="font-weight: var(--font-medium); font-size: var(--text-sm);">
                          {trade.otherParty.firstName || trade.otherParty.username || "Unknown"}
                        </div>
                        <div style="font-size: var(--text-xs); color: var(--color-gray-600);">
                          @{trade.otherParty.username}
                        </div>
                      {:else}
                        <span style="color: var(--color-gray-500);">N/A</span>
                      {/if}
                    </td>
                    <td style="padding: var(--space-3);">
                      <span class="badge badge--{trade.userRole === 'buyer' ? 'info' : 'secondary'}" style="font-size: var(--text-xs);">
                        {trade.userRole === "buyer" ? "Buyer" : "Seller"}
                      </span>
                    </td>
                    <td style="padding: var(--space-3);">
                      <div style="font-weight: var(--font-semibold);">
                        {formatPrice(trade.amount)}
                      </div>
                      <div style="font-size: var(--text-xs); color: var(--color-gray-600);">
                        {trade.currency || "USDT"}
                      </div>
                    </td>
                    <td style="padding: var(--space-3);">
                      <span class="badge {getStatusBadgeClass(trade.status)}" style="font-size: var(--text-xs);">
                        {getStatusLabel(trade.status)}
                      </span>
                    </td>
                    <td style="padding: var(--space-3);">
                      <div style="font-size: var(--text-xs);">
                        {formatDate(trade.createdAt)}
                      </div>
                    </td>
                    <td style="padding: var(--space-3); text-align: center;">
                      <button
                        class="btn btn--ghost btn--sm"
                        onclick={() => goToTradeRoom(trade.id, trade.listingId, trade.conversationId)}
                        type="button"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </div>
      </div>
    </div>
  </main>
</div>

<style>
  @media (max-width: 768px) {
    table {
      font-size: var(--text-xs);
    }

    th,
    td {
      padding: var(--space-2) !important;
    }

    th:nth-child(5),
    td:nth-child(5),
    th:nth-child(7),
    td:nth-child(7) {
      display: none;
    }
  }
</style>

