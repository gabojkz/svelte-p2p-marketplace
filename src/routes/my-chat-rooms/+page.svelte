<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  const { data } = $props();

  const conversations = $derived(data?.conversations || []);
  const totalUnread = $derived(data?.totalUnread || 0);
  const searchQuery = $derived(data?.searchQuery || "");

  // Local state for search
  let localSearchQuery = $state(searchQuery);

  // Update search in URL
  function updateSearch() {
    const params = new URLSearchParams();
    if (localSearchQuery.trim()) {
      params.set("search", localSearchQuery.trim());
    }
    const newUrl = params.toString() 
      ? `/my-chat-rooms?${params.toString()}`
      : "/my-chat-rooms";
    goto(newUrl, { replaceState: true, noScroll: true });
  }

  // Handle search input
  function handleSearchInput(e) {
    localSearchQuery = e.target.value;
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(updateSearch, 300);
  }

  // Handle search submit
  function handleSearchSubmit(e) {
    e.preventDefault();
    updateSearch();
  }

  // Clear search
  function clearSearch() {
    localSearchQuery = "";
    goto("/my-chat-rooms", { replaceState: true, noScroll: true });
  }

  // Format date
  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  // Navigate to chat room
  function goToChatRoom(conversationId) {
    if (!conversationId) {
      console.error("No conversation ID provided");
      alert("Unable to open conversation. Missing conversation ID.");
      return;
    }
    console.log("Navigating to conversation:", conversationId);
    goto(`/trade-room?conversationId=${conversationId}`);
  }

  // Get other user initials
  function getOtherUserInitials(otherUser) {
    if (!otherUser) return "?";
    const firstName = otherUser.firstName || "";
    const lastName = otherUser.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return (otherUser.username || "?").substring(0, 2).toUpperCase();
  }
</script>

<svelte:head>
  <title>My Chat Rooms — Marketto</title>
</svelte:head>

<NavigationBar />

<div class="page-wrapper">
  <main class="main-content">
    <div class="container">
      <!-- Header -->
      <div class="chat-rooms-header">
        <div>
          <h1>My Chat Rooms</h1>
          <p class="text-muted">
            {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
            {#if totalUnread > 0}
              · <span style="color: var(--color-primary); font-weight: var(--font-semibold);">{totalUnread} unread</span>
            {/if}
          </p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-container">
        <form onsubmit={handleSearchSubmit} class="search-form">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="search-input"
              placeholder="Search conversations, listings, or users..."
              value={localSearchQuery}
              oninput={handleSearchInput}
            />
            {#if localSearchQuery}
              <button
                type="button"
                class="search-clear"
                onclick={clearSearch}
                aria-label="Clear search"
              >
                ✕
              </button>
            {/if}
          </div>
        </form>
      </div>

      <!-- Conversations List -->
      <div class="chat-rooms-list">
        {#if conversations.length > 0}
          {#each conversations as conversation}
            <div
              class="chat-room-card"
              role="button"
              tabindex="0"
              onclick={() => {
                if (conversation?.id) {
                  goToChatRoom(conversation.id);
                } else {
                  console.error("Conversation ID is missing:", conversation);
                  alert("Unable to open conversation. Missing conversation ID.");
                }
              }}
              onkeydown={(e) => {
                if (e.key === "Enter" && conversation?.id) {
                  goToChatRoom(conversation.id);
                }
              }}
            >
              <div class="chat-room-card__avatar">
                <div class="avatar">
                  {getOtherUserInitials(conversation.otherUser)}
                </div>
                {#if conversation.userUnreadCount > 0}
                  <span class="chat-room-card__badge">{conversation.userUnreadCount}</span>
                {/if}
              </div>

              <div class="chat-room-card__content">
                <div class="chat-room-card__header">
                  <div class="chat-room-card__name">
                    {conversation.otherUser?.firstName || conversation.otherUser?.username || "Unknown User"}
                  </div>
                  {#if conversation.lastMessageAt}
                    <div class="chat-room-card__time">
                      {formatDate(conversation.lastMessageAt)}
                    </div>
                  {/if}
                </div>

                <div class="chat-room-card__listing">
                  {#if conversation.listing}
                    <div class="chat-room-card__listing-title">
                      {conversation.listing.title}
                    </div>
                    {#if conversation.category}
                      <div class="chat-room-card__listing-category">
                        {conversation.category.name}
                      </div>
                    {/if}
                  {:else}
                    <div class="chat-room-card__listing-title">Listing unavailable</div>
                  {/if}
                </div>

                {#if conversation.lastMessagePreview || conversation.lastMessage}
                  <div class="chat-room-card__preview" class:chat-room-card__preview--unread={conversation.userUnreadCount > 0}>
                    {conversation.lastMessagePreview || conversation.lastMessage?.content || "No messages yet"}
                  </div>
                {/if}
              </div>

              <div class="chat-room-card__arrow">
                →
              </div>
            </div>
          {/each}
        {:else}
          <div class="empty-state">
            <div class="empty-state__icon">💬</div>
            <h2 class="empty-state__title">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </h2>
            <p class="empty-state__message">
              {searchQuery 
                ? "Try adjusting your search terms"
                : "Start a conversation by messaging a seller from a listing"}
            </p>
            {#if !searchQuery}
              <a href="/marketplace" class="btn btn--primary">
                Browse Listings
              </a>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>

<style>
  .main-content {
    padding: var(--space-6) 0;
    min-height: calc(100vh - 80px);
  }

  .chat-rooms-header {
    margin-bottom: var(--space-6);
  }

  .chat-rooms-header h1 {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    margin-bottom: var(--space-2);
    color: var(--color-gray-900);
  }

  /* Search Container */
  .search-container {
    margin-bottom: var(--space-6);
  }

  .search-form {
    width: 100%;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: var(--space-4);
    font-size: var(--text-lg);
    z-index: 1;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: var(--space-3) var(--space-4) var(--space-3) calc(var(--space-4) * 2 + 1.5rem);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    font-size: var(--text-base);
    transition: border-color var(--transition-fast);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .search-clear {
    position: absolute;
    right: var(--space-3);
    background: var(--color-gray-200);
    border: none;
    border-radius: var(--radius-full);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: var(--text-sm);
    color: var(--color-gray-600);
    transition: background var(--transition-fast);
  }

  .search-clear:hover {
    background: var(--color-gray-300);
  }

  /* Chat Rooms List */
  .chat-rooms-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .chat-room-card {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
    position: relative;
  }

  .chat-room-card:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  .chat-room-card:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .chat-room-card__avatar {
    position: relative;
    flex-shrink: 0;
  }

  .chat-room-card__badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-full);
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    padding: 0 var(--space-1);
    border: 2px solid white;
  }

  .chat-room-card__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .chat-room-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
  }

  .chat-room-card__name {
    font-weight: var(--font-semibold);
    font-size: var(--text-sm);
    color: var(--color-gray-900);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-room-card__time {
    font-size: var(--text-xs);
    color: var(--color-gray-500);
    flex-shrink: 0;
  }

  .chat-room-card__listing {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .chat-room-card__listing-title {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--color-gray-700);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-room-card__listing-category {
    font-size: var(--text-xs);
    color: var(--color-gray-500);
  }

  .chat-room-card__preview {
    font-size: var(--text-xs);
    color: var(--color-gray-600);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: var(--space-1);
  }

  .chat-room-card__preview--unread {
    font-weight: var(--font-semibold);
    color: var(--color-gray-900);
  }

  .chat-room-card__arrow {
    flex-shrink: 0;
    color: var(--color-gray-400);
    font-size: var(--text-lg);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--space-16) var(--space-4);
  }

  .empty-state__icon {
    font-size: 4rem;
    margin-bottom: var(--space-4);
  }

  .empty-state__title {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--color-gray-900);
    margin-bottom: var(--space-2);
  }

  .empty-state__message {
    color: var(--color-gray-600);
    margin-bottom: var(--space-6);
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .main-content {
      padding: var(--space-4) 0;
    }

    .chat-rooms-header h1 {
      font-size: var(--text-xl);
    }

    .chat-room-card {
      padding: var(--space-3);
      gap: var(--space-3);
    }

    .chat-room-card__arrow {
      display: none;
    }

    .search-input {
      font-size: 16px; /* Prevents zoom on iOS */
    }
  }
</style>

