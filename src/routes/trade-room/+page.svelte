<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  const { data } = $props();

  const listing = $derived(data?.listing);
  const seller = $derived(listing?.seller);
  const marketplaceUser = $derived(data?.marketplaceUser);
  const conversation = $derived(data?.conversation);
  const messages = $derived(data?.messages || []);
  const trade = $derived(data?.trade);

  // State
  let sidebarOpen = $state(false);
  let messageInput = $state("");
  let sending = $state(false);
  /** @type {HTMLElement | null} */
  let messagesContainer = $state(null);

  // Check if current user is buyer
  const isBuyer = $derived(marketplaceUser?.id === conversation?.buyerId);
  const otherUser = $derived(isBuyer ? seller : null); // For now, only handle buyer case

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
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
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
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

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
        <div style="font-weight: var(--font-semibold); font-size: var(--text-sm);">
          {listing?.title || "Trade Room"}
        </div>
        {#if trade}
          <span class="badge badge--warning" style="font-size: 10px;">In Progress</span>
        {:else}
          <span class="badge badge--info" style="font-size: 10px;">New Trade</span>
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
      {#if seller}
        <div class="chat-header">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="avatar avatar--sm">{getSellerInitials()}</div>
              <div>
                <div style="font-weight: var(--font-semibold); font-size: var(--text-sm);">
                  {seller.firstName || seller.username}
                </div>
                <div class="flex items-center gap-1" style="font-size: var(--text-xs); color: var(--color-gray-500);">
                  <span class="status-dot status-dot--online"></span>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2 desktop-actions">
              <button class="btn btn--ghost btn--sm" type="button">📎</button>
              <button
                class="btn btn--ghost btn--sm"
                onclick={() => alert("Report feature coming soon")}
                type="button"
              >
                ⚠️
              </button>
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
              <span class="chat-message__time">{formatTime(message.createdAt)}</span>
            </div>
          </div>
        {/each}
      </div>

      <!-- Chat Input -->
      {#if conversation}
        <div class="chat-input">
          <form onsubmit={handleSendMessage}>
            <button type="button" class="btn btn--ghost btn--sm" style="padding: var(--space-2);">
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
            <button type="submit" class="btn btn--primary btn--sm" disabled={sending || !messageInput.trim()}>
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
        <button onclick={() => alert("Help feature coming soon")} type="button">⚠️ Help</button>
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
      <div class="card">
        <div class="card__body">
          <h4 style="margin-bottom: var(--space-4); font-size: var(--text-base);">Trade Status</h4>

          <!-- Progress Steps -->
          <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4);">
            <div class="flex items-center gap-2">
              <div
                style="width: 24px; height: 24px; background: var(--color-primary); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;"
              >
                ✓
              </div>
              <div style="flex: 1;">
                <div style="font-size: var(--text-xs); font-weight: var(--font-medium);">Trade Started</div>
              </div>
            </div>
            <div style="width: 2px; height: 16px; background: var(--color-primary); margin-left: 11px;"></div>
            <div class="flex items-center gap-2">
              <div
                style="width: 24px; height: 24px; background: var(--color-primary); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;"
              >
                ✓
              </div>
              <div style="flex: 1;">
                <div style="font-size: var(--text-xs); font-weight: var(--font-medium);">Item Reserved</div>
              </div>
            </div>
            <div style="width: 2px; height: 16px; background: var(--color-accent-yellow); margin-left: 11px;"></div>
            <div class="flex items-center gap-2">
              <div
                style="width: 24px; height: 24px; background: var(--color-accent-yellow); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 10px;"
              >
                3
              </div>
              <div style="flex: 1;">
                <div style="font-size: var(--text-xs); font-weight: var(--font-medium); color: var(--color-accent-yellow);">
                  Meeting Scheduled
                </div>
              </div>
            </div>
            <div style="width: 2px; height: 16px; background: var(--color-gray-200); margin-left: 11px;"></div>
            <div class="flex items-center gap-2">
              <div
                style="width: 24px; height: 24px; background: var(--color-gray-200); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--color-gray-500); font-size: 10px;"
              >
                4
              </div>
              <div style="flex: 1;">
                <div style="font-size: var(--text-xs); color: var(--color-gray-500);">Complete Trade</div>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <button
            class="btn btn--primary btn--full btn--sm mb-2"
            onclick={() => alert("Complete trade feature coming soon")}
            type="button"
          >
            ✓ Mark as Complete
          </button>
          <button
            class="btn btn--outline btn--full btn--sm"
            onclick={() => alert("Cancel trade feature coming soon")}
            type="button"
          >
            Cancel Trade
          </button>
        </div>
      </div>

      <!-- Trade Details Card -->
      {#if listing}
        <div class="card">
          <div class="card__body">
            <h4 style="margin-bottom: var(--space-3); font-size: var(--text-base);">Trade Details</h4>

            <div style="display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--text-xs);">
              {#if trade}
                <div class="flex justify-between">
                  <span class="text-muted">Trade ID</span>
                  <span style="font-family: var(--font-mono);">#{trade.id}</span>
                </div>
              {/if}
              <div class="flex justify-between">
                <span class="text-muted">Item</span>
                <span style="font-weight: var(--font-medium);">{listing.title}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Price</span>
                <span style="font-weight: var(--font-semibold); color: var(--color-primary);">
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
          </div>
        </div>
      {/if}

      <!-- Seller Info Card -->
      {#if seller}
        <div class="card">
          <div class="card__body">
            <h4 style="margin-bottom: var(--space-3); font-size: var(--text-base);">Seller</h4>

            <div class="flex items-center gap-3 mb-3">
              <div class="avatar">{getSellerInitials()}</div>
              <div>
                <div style="font-weight: var(--font-semibold); font-size: var(--text-sm);">
                  {seller.firstName || seller.username}
                </div>
                <div style="font-size: var(--text-xs); color: var(--color-gray-500);">
                  {#if seller && /** @type {any} */ (seller).emailVerified}✓ Verified{/if}
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

      <!-- Escrow Info -->
      <div style="padding: var(--space-3); background: var(--color-primary-subtle); border-radius: var(--radius-md); text-align: center;">
        <span style="font-size: var(--text-lg);">🛡️</span>
        <p style="font-size: var(--text-xs); margin-top: var(--space-1);">Protected by LocalMarket Escrow</p>
      </div>
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
</style>
