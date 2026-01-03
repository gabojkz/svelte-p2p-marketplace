<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import TradeStatusCard from "$lib/components/TradeStatusCard.svelte";
  import ReviewForm from "$lib/components/ReviewForm.svelte";
  import ReportUser from "$lib/components/ReportUser.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { useSession, signOut } from "$lib/auth-client.js";

  const { data } = $props();

  const listing = $derived(data?.listing);
  const seller = $derived(listing?.seller);
  if (!seller) {
    goto("/marketplace");
  }
  const marketplaceUser = $derived(data?.marketplaceUser);
  const conversation = $derived(data?.conversation);
  const messages = $derived(data?.messages || []);
  const trade = $derived(data?.trade);
  // @ts-ignore - TypeScript doesn't know about these fields yet
  const otherParty = $derived(data?.otherParty);
  // @ts-ignore - TypeScript doesn't know about these fields yet
  const isCurrentUserBuyer = $derived(data?.isCurrentUserBuyer ?? true);
  const session = useSession();
  const user = $derived($session.data?.user);

  // State
  let sidebarOpen = $state(false);
  let messageInput = $state("");
  let sending = $state(false);
  let showReviewForm = $state(false);
  let showReportForm = $state(false);
  /** @type {HTMLElement | null} */
  let messagesContainer = $state(null);

  // Check if current user is buyer
  const isBuyer = $derived(marketplaceUser?.id === conversation?.buyerId);

  // Get the other party for review (reviewee)
  // Use conversation data as fallback if trade doesn't have the IDs
  const revieweeId = $derived.by(() => {
    if (trade) {
      // Try to get from trade first
      const id = isBuyer ? trade.sellerId : trade.buyerId;
      if (id) return id;
    }
    // Fallback to conversation data
    if (conversation) {
      return isBuyer ? conversation.sellerId : conversation.buyerId;
    }
    return null;
  });

  const revieweeName = $derived(
    otherParty?.firstName || otherParty?.username || (isBuyer ? "Seller" : "Buyer"),
  );

  // Get other party's initials
  function getOtherPartyInitials() {
    if (!otherParty) return "?";
    const firstName = otherParty.firstName || "";
    const lastName = otherParty.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return (otherParty.username || "?").substring(0, 2).toUpperCase();
  }

  // Check if other party is online (last login within last 5 minutes)
  const isOtherPartyOnline = $derived.by(() => {
    if (!otherParty?.lastLoginAt) return false;
    const lastLogin = new Date(otherParty.lastLoginAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastLogin.getTime()) / (1000 * 60);
    return diffMinutes < 5; // Consider online if last login was within 5 minutes
  });

  // Get seller initials
  function getSellerInitials() {
    if (!seller) return "?";
    const firstName = seller.firstName || "";
    const lastName = seller.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return (seller.username || "?").substring(0, 2).toUpperCase();
  }

  // Get user initials
  function getUserInitials() {
    if (!marketplaceUser) return "?";
    const firstName = marketplaceUser.firstName || "";
    const lastName = marketplaceUser.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return (marketplaceUser.username || "?").substring(0, 2).toUpperCase();
  }

  // Format time
  /** @param {string | Date | null} date */
  function formatTime(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Format price
  /** @param {string | number} price */
  function formatPrice(price) {
    return `£${parseFloat(String(price || "0")).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Toggle sidebar
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  // Close sidebar
  function closeSidebar() {
    sidebarOpen = false;
  }

  // Send message
  /** @param {Event} e */
  async function handleSendMessage(e) {
    e.preventDefault();
    if (!messageInput.trim() || sending || !conversation?.id) return;

    sending = true;
    const content = messageInput.trim();
    messageInput = "";

    try {
      const response = await fetch(
        `/api/conversations/${conversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Reload page to show new message
      window.location.reload();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
      messageInput = content; // Restore message
    } finally {
      sending = false;
    }
  }

  // Scroll to bottom of messages
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Scroll on mount and when messages change
  onMount(() => {
    scrollToBottom();
  });

  $effect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  });

  // Handle mark trade as complete
  async function handleMarkComplete() {
    if (!trade?.id) {
      alert("Unable to complete trade. Trade not found.");
      return;
    }

    const confirmComplete = confirm(
      "Are you sure you want to mark this trade as complete?",
    );
    if (!confirmComplete) {
      return;
    }

    try {
      const response = await fetch(`/api/trades/${trade.id}/complete`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to complete trade");
      }

      const data = await response.json();
      alert("Trade marked as complete! You can now leave a review.");

      // Reload the page to show the updated trade status
      window.location.reload();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to complete trade";
      alert(message);
      console.error("Error completing trade:", err);
    }
  }

  // Handle review submission
  /** @param {any} reviewData */
  async function handleReviewSubmit(reviewData) {
    if (!trade?.id) {
      alert("Unable to submit review. Trade not found.");
      return;
    }

    try {
      const response = await fetch(`/api/trades/${trade.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      alert("Review submitted successfully! Thank you for your feedback.");
      showReviewForm = false;

      // Reload the page to refresh the UI
      window.location.reload();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit review";
      alert(message);
      console.error("Error submitting review:", err);
    }
  }

  // Handle user report submission
  /** @param {any} reportData */
  async function handleReportSubmit(reportData) {
    if (!trade?.id) {
      alert("Unable to submit report. Trade not found.");
      return;
    }

    try {
      const response = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reportData,
          tradeId: trade.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit report");
      }

      alert("Report submitted successfully. Our team will review it shortly.");
      showReportForm = false;

      // Reload the page to refresh the UI
      window.location.reload();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit report";
      alert(message);
      console.error("Error submitting report:", err);
    }
  }

  // Get the other party for reporting
  const reportedUserId = $derived(
    trade ? (isBuyer ? trade.sellerId : trade.buyerId) : seller?.id || null,
  );
  const reportedUserName = $derived(
    isBuyer ? seller?.firstName || seller?.username || "Seller" : "Buyer",
  );

  console.log({ seller, marketplaceUser });
</script>

<div class="trade-room-page">
  <!-- Trade Room Header -->
  <header class="trade-room-header">
    <div class="trade-room-header__inner">
      <button
        onclick={() => goto(`/listing-details?id=${listing?.id}`)}
        style="display: flex; align-items: center; gap: var(--space-2); text-decoration: none; color: inherit; background: none; border: none; cursor: pointer;"
        type="button"
      >
        <span style="font-size: var(--text-xl);">←</span>
        <span style="font-weight: var(--font-medium);">Back</span>
      </button>

      <div style="flex: 1; text-align: center;">
        <div
          style="font-weight: var(--font-semibold); font-size: var(--text-sm);"
        >
          {listing?.title || "Trade Room"}
        </div>
        {#if trade}
          <span class="badge badge--warning" style="font-size: 10px;"
            >In Progress</span
          >
        {:else}
          <span class="badge badge--info" style="font-size: 10px;"
            >New Trade</span
          >
        {/if}
      </div>

      <button
        class="btn btn--ghost btn--sm trade-sidebar-toggle"
        onclick={toggleSidebar}
        type="button"
      >
        <span>Details</span>
      </button>
    </div>
  </header>

  <!-- Main Trade Room Content -->
  <div class="trade-room-content">
    <!-- Chat Panel -->
    <div class="chat-panel">
      <!-- Chat Header -->
      {#if otherParty}
        <div class="chat-header">
          {#if trade && reportedUserId}
            <button
              class="btn btn--ghost btn--sm"
              onclick={() => showReportForm = true}
              type="button"
              style="margin-left: auto;"
              title="Report User"
            >
              🚨 Report
            </button>
          {/if}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="avatar avatar--sm">{getOtherPartyInitials()}</div>
              <div>
                <div
                  style="font-weight: var(--font-semibold); font-size: var(--text-sm);"
                >
                  {otherParty.firstName || otherParty.username}
                </div>
                <div
                  class="flex items-center gap-1"
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  <span class="status-dot status-dot--{isOtherPartyOnline ? 'online' : 'offline'}"></span>
                  <span>{isOtherPartyOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2 desktop-actions">
              <button class="btn btn--ghost btn--sm" type="button">📎</button>
              {#if trade && reportedUserId}
                <button
                  class="btn btn--ghost btn--sm"
                  onclick={() => showReportForm = true}
                  type="button"
                  title="Report User"
                >
                  🚨
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      <!-- Chat Messages -->
      <div class="chat-messages" bind:this={messagesContainer}>
        {#if conversation}
          <!-- System Message -->
          <div class="chat-system-message">
            🔒 Trade started. Item reserved in escrow.
          </div>
        {/if}

        {#each messages as message}
          {@const isOwnMessage = message.senderId === marketplaceUser?.id}
          <div class="chat-message" class:chat-message--own={isOwnMessage}>
            {#if !isOwnMessage}
              <div class="avatar avatar--sm">{getSellerInitials()}</div>
            {/if}
            <div>
              <div class="chat-message__bubble">{message.content}</div>
              <span class="chat-message__time"
                >{formatTime(message.createdAt)}</span
              >
            </div>
          </div>
        {/each}
      </div>

      <!-- Chat Input -->
      {#if conversation}
        <div class="chat-input">
          <form onsubmit={handleSendMessage}>
            <button
              type="button"
              class="btn btn--ghost btn--sm"
              style="padding: var(--space-2);"
            >
              📎
            </button>
            <input
              type="text"
              class="form-input"
              placeholder="Type a message..."
              style="font-size: 16px;"
              bind:value={messageInput}
              disabled={sending}
            />
            <button
              type="submit"
              class="btn btn--primary btn--sm"
              disabled={sending || !messageInput.trim()}
            >
              <span style="display: none;">Send</span>
              <span>➤</span>
            </button>
          </form>
        </div>
      {/if}

      <!-- Mobile Tab Bar -->
      <div class="mobile-tab-bar">
        <button class="is-active">💬 Chat</button>
        <button onclick={toggleSidebar} type="button">📋 Trade Details</button>
        <button onclick={() => alert("Help feature coming soon")} type="button"
          >⚠️ Help</button
        >
      </div>
    </div>

    <!-- Trade Sidebar -->
    <aside class="trade-sidebar" class:is-open={sidebarOpen}>
      <!-- Close button for mobile -->
      <button
        class="btn btn--ghost btn--sm"
        onclick={closeSidebar}
        style="align-self: flex-end; display: none;"
        type="button"
      >
        ✕ Close
      </button>

      <!-- Trade Status Card -->
      {#if listing && seller && marketplaceUser && conversation}
        <TradeStatusCard
          listingId={listing.id}
          buyerId={conversation.buyerId}
          sellerId={seller.id}
          currentUserId={marketplaceUser.id}
          {trade}
          onReviewClick={() => {
            showReviewForm = true;
          }}
        ></TradeStatusCard>
      {/if}

      <!-- Trade Details Card -->
      {#if listing}
        <div class="card">
          <div class="card__body">
            <h4
              style="margin-bottom: var(--space-3); font-size: var(--text-base);"
            >
              Trade Details
            </h4>

            <div
              style="display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--text-xs);"
            >
              {#if trade}
                <div class="flex justify-between">
                  <span class="text-muted">Trade ID</span>
                  <span style="font-family: var(--font-mono);">#{trade.id}</span
                  >
                </div>
              {/if}
              <div class="flex justify-between">
                <span class="text-muted">Item</span>
                <span style="font-weight: var(--font-medium);"
                  >{listing.title}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Price</span>
                <span
                  style="font-weight: var(--font-semibold); color: var(--color-primary);"
                >
                  {formatPrice(listing.price)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Location</span>
                <span>
                  {listing.locationCity}
                  {#if listing.locationPostcode}, {listing.locationPostcode}{/if}
                </span>
              </div>
            </div>

            <div style="margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--color-gray-200);">
              <a
                href="/listing-details?id={listing.id}"
                class="btn btn--outline btn--full btn--sm"
                style="text-decoration: none; display: block; text-align: center;"
              >
                View Listing
              </a>
            </div>
          </div>
        </div>
      {/if}

      <!-- Seller Info Card -->
      {#if seller}
        <div class="card">
          <div class="card__body">
            <h4
              style="margin-bottom: var(--space-3); font-size: var(--text-base);"
            >
              Seller
            </h4>

            <div class="flex items-center gap-3 mb-3">
              <div class="avatar">{getSellerInitials()}</div>
              <div>
                <div
                  style="font-weight: var(--font-semibold); font-size: var(--text-sm);"
                >
                  {seller.firstName || seller.username}
                </div>
                <div
                  style="font-size: var(--text-xs); color: var(--color-gray-500);"
                >
                  {#if seller && /** @type {any} */ (seller).emailVerified}✓
                    Verified{/if}
                </div>
              </div>
            </div>

            <a
              href="/profile/{seller.username}"
              class="btn btn--ghost btn--full btn--sm"
              onclick={closeSidebar}
            >
              View Profile
            </a>
          </div>
        </div>
      {/if}
    </aside>

    <!-- Sidebar Overlay for mobile -->
    <div
      class="trade-sidebar-overlay"
      class:is-visible={sidebarOpen}
      onclick={closeSidebar}
      onkeydown={(e) => e.key === "Enter" && closeSidebar()}
      role="button"
      tabindex="0"
      aria-label="Close sidebar"
    ></div>
  </div>

  <!-- Report User Modal -->
  {#if showReportForm && trade && marketplaceUser && reportedUserId}
    <div
      class="modal-overlay"
      onclick={() => (showReportForm = false)}
      onkeydown={(e) => e.key === "Escape" && (showReportForm = false)}
      role="button"
      tabindex="-1"
      aria-label="Close report form"
    >
      <div
        class="modal-content"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-form-title"
        tabindex="-1"
      >
        <ReportUser
          tradeId={trade.id}
          reportedUserId={reportedUserId}
          reportedUserName={reportedUserName}
          onSubmit={handleReportSubmit}
          onCancel={() => (showReportForm = false)}
        />
      </div>
    </div>
  {/if}

  <!-- Review Form Modal -->
  {#if showReviewForm && trade && marketplaceUser && revieweeId}
    <div
      class="modal-overlay"
      onclick={() => (showReviewForm = false)}
      onkeydown={(e) => e.key === "Escape" && (showReviewForm = false)}
      role="button"
      tabindex="-1"
      aria-label="Close review form"
    >
      <div
        class="modal-content"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-form-title"
        tabindex="-1"
      >
        <ReviewForm
          tradeId={trade.id}
          reviewerId={marketplaceUser.id}
          {revieweeId}
          {revieweeName}
          onSubmit={handleReviewSubmit}
          onCancel={() => (showReviewForm = false)}
        />
      </div>
    </div>
  {/if}
</div>

<style>
  /* Trade Room Mobile Styles */
  .trade-room-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .trade-room-header {
    background: var(--color-white);
    border-bottom: 1px solid var(--color-gray-200);
    padding: var(--space-3) var(--space-4);
    flex-shrink: 0;
  }

  .trade-room-header__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .trade-room-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    background: var(--color-gray-100);
  }

  .chat-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--color-white);
    min-width: 0;
  }

  .trade-sidebar {
    width: 360px;
    flex-shrink: 0;
    overflow-y: auto;
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    background: var(--color-gray-50);
    border-left: 1px solid var(--color-gray-200);
  }

  .chat-header {
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-gray-200);
    background: var(--color-white);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    display: inline-block;
    flex-shrink: 0;
  }

  .status-dot--online {
    background: #22c55e;
  }

  .status-dot--offline {
    background: var(--color-gray-400);
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    background: var(--color-gray-50);
  }

  .chat-input {
    padding: var(--space-3) var(--space-4);
    border-top: 1px solid var(--color-gray-200);
    background: var(--color-white);
  }

  .chat-input form {
    display: flex;
    gap: var(--space-2);
  }

  .chat-input input {
    flex: 1;
  }

  /* Chat Message Styles */
  .chat-message {
    display: flex;
    gap: var(--space-2);
    max-width: 80%;
  }

  .chat-message--own {
    margin-left: auto;
    flex-direction: row-reverse;
  }

  .chat-message__bubble {
    padding: var(--space-3) var(--space-4);
    background: var(--color-gray-100);
    border-radius: var(--radius-lg);
    border-top-left-radius: var(--radius-sm);
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
  }

  .chat-message--own .chat-message__bubble {
    background: var(--color-primary);
    color: white;
    border-top-left-radius: var(--radius-lg);
    border-top-right-radius: var(--radius-sm);
  }

  .chat-message__time {
    font-size: var(--text-xs);
    color: var(--color-gray-400);
    margin-top: var(--space-1);
    display: block;
  }

  .chat-message--own .chat-message__time {
    text-align: right;
  }

  /* System Message */
  .chat-system-message {
    text-align: center;
    padding: var(--space-2) var(--space-4);
    background: var(--color-primary-subtle);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    color: var(--color-gray-600);
    margin: var(--space-2) auto;
    max-width: fit-content;
  }

  /* Mobile toggle buttons */
  .mobile-tab-bar {
    display: none;
    background: var(--color-white);
    border-top: 1px solid var(--color-gray-200);
    padding: var(--space-2);
  }

  .mobile-tab-bar button {
    flex: 1;
    padding: var(--space-3);
    border: none;
    background: transparent;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-gray-500);
    cursor: pointer;
    border-radius: var(--radius-md);
  }

  .mobile-tab-bar button.is-active {
    background: var(--color-primary-subtle);
    color: var(--color-primary);
  }

  .trade-sidebar-toggle {
    display: none;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .trade-sidebar {
      position: fixed;
      top: 0;
      right: -100%;
      width: 100%;
      max-width: 320px;
      height: 100vh;
      z-index: 100;
      transition: right 0.3s ease;
      box-shadow: var(--shadow-xl);
    }

    .trade-sidebar.is-open {
      right: 0;
    }

    .trade-sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .trade-sidebar-overlay.is-visible {
      opacity: 1;
      visibility: visible;
    }

    .trade-sidebar-toggle {
      display: flex;
    }

    .mobile-tab-bar {
      display: flex;
    }

    .chat-message {
      max-width: 90%;
    }

    .chat-header .desktop-actions {
      display: none;
    }
  }

  /* Very small mobile */
  @media (max-width: 480px) {
    .trade-room-header__inner {
      flex-wrap: wrap;
    }

    .chat-header {
      padding: var(--space-2) var(--space-3);
    }

    .chat-messages {
      padding: var(--space-3);
    }

    .chat-input {
      padding: var(--space-2) var(--space-3);
    }
  }

  /* Modal Styles */
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
    background: var(--color-white);
    border-radius: var(--radius-lg);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
</style>
