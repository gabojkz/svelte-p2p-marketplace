<script>
  import Logo from "$lib/components/Logo.svelte";
  import { useSession } from "$lib/auth-client.js";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data } = $props();

  const marketplaceUser = $derived(data?.marketplaceUser);
  const conversationId = $derived(data?.conversationId);

  // State
  let conversations = $state([]);
  let selectedConversation = $state(null);
  let messages = $state([]);
  let messageInput = $state("");
  let loading = $state(false);
  let sending = $state(false);
  let pollingInterval = $state(null);

  // Load conversations
  async function loadConversations() {
    if (!marketplaceUser) return;

    loading = true;
    try {
      const response = await fetch("/api/conversations");
      if (!response.ok) throw new Error("Failed to load conversations");
      const data = await response.json();
      conversations = data.conversations || [];

      // If conversationId is in URL, select that conversation
      if (conversationId && !selectedConversation) {
        const conv = conversations.find((c) => c.id === conversationId);
        if (conv) {
          selectConversation(conv);
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      loading = false;
    }
  }

  // Select a conversation
  async function selectConversation(conversation) {
    selectedConversation = conversation;
    messageInput = "";

    // Update URL
    await goto(`/messages?conversation=${conversation.id}`, {
      replaceState: true,
      noScroll: true,
    });

    // Load messages
    await loadMessages(conversation.id);

    // Start polling for new messages
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    pollingInterval = setInterval(() => {
      if (selectedConversation) {
        loadMessages(selectedConversation.id);
      }
    }, 3000); // Poll every 3 seconds
  }

  // Load messages for a conversation
  async function loadMessages(convId) {
    try {
      const response = await fetch(`/api/conversations/${convId}/messages`);
      if (!response.ok) throw new Error("Failed to load messages");
      const data = await response.json();
      messages = data.messages || [];

      // Scroll to bottom
      setTimeout(() => {
        const messagesContainer = document.getElementById("messages-container");
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }

  // Send a message
  async function sendMessage() {
    if (!messageInput.trim() || !selectedConversation || sending) return;

    sending = true;
    try {
      const response = await fetch(
        `/api/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: messageInput.trim() }),
        },
      );

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      messages = [...messages, data.message];
      messageInput = "";

      // Reload conversations to update last message preview
      await loadConversations();

      // Scroll to bottom
      setTimeout(() => {
        const messagesContainer = document.getElementById("messages-container");
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      sending = false;
    }
  }

  // Format time
  function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  // Get other user from conversation
  function getOtherUser(conversation) {
    if (!conversation.otherUser) return null;
    return conversation.otherUser;
  }

  // Get unread count for current user
  function getUnreadCount(conversation) {
    if (!marketplaceUser) return 0;
    if (conversation.buyerId === marketplaceUser.id) {
      return conversation.buyerUnreadCount || 0;
    }
    return conversation.sellerUnreadCount || 0;
  }

  onMount(() => {
    loadConversations();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  });

  // Auto-select conversation from URL
  $effect(() => {
    if (conversationId && conversations.length > 0 && !selectedConversation) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        selectConversation(conv);
      }
    }
  });
</script>

<div class="page-wrapper">
  <!-- Header -->
  <header class="header">
    <div class="container">
      <div class="header__inner">
        <Logo />

        <nav class="nav" aria-label="Main navigation">
          <a href="/marketplace" class="nav__link">Browse</a>
          <a href="/my-listings" class="nav__link">My Listings</a>
        </nav>

        <div class="header__actions">
          <a href="/my-listings" class="btn btn--ghost">Dashboard</a>
          <button class="menu-toggle" aria-label="Toggle menu">
            <span class="menu-toggle__bar"></span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <div class="chat-container">
        <!-- Conversations Sidebar -->
        <aside class="chat-sidebar">
          <div class="chat-sidebar__header">
            <h2>Messages</h2>
          </div>

          {#if loading && conversations.length === 0}
            <div class="chat-sidebar__loading">Loading conversations...</div>
          {:else if conversations.length === 0}
            <div class="chat-sidebar__empty">
              <p>No conversations yet</p>
              <p class="text-muted">Start a conversation from a listing page</p>
            </div>
          {:else}
            <div class="chat-sidebar__list">
              {#each conversations as conversation}
                {@const otherUser = getOtherUser(conversation)}
                {@const unreadCount = getUnreadCount(conversation)}
                <button
                  class="chat-sidebar__item"
                  class:chat-sidebar__item--active={selectedConversation?.id ===
                    conversation.id}
                  onclick={() => selectConversation(conversation)}
                  type="button"
                >
                  <div class="chat-sidebar__item-avatar">
                    {otherUser?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div class="chat-sidebar__item-content">
                    <div class="chat-sidebar__item-header">
                      <span class="chat-sidebar__item-name">
                        {otherUser?.username || "Unknown User"}
                      </span>
                      {#if conversation.lastMessageAt}
                        <span class="chat-sidebar__item-time">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      {/if}
                    </div>
                    <div class="chat-sidebar__item-preview">
                      {#if conversation.listing}
                        <span class="chat-sidebar__item-listing"
                          >{conversation.listing.title}</span
                        >
                      {/if}
                      <span class="chat-sidebar__item-message">
                        {conversation.lastMessagePreview || "No messages yet"}
                      </span>
                    </div>
                  </div>
                  {#if unreadCount > 0}
                    <span class="chat-sidebar__item-badge">{unreadCount}</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </aside>

        <!-- Chat Area -->
        <div class="chat-main">
          {#if !selectedConversation}
            <div class="chat-empty">
              <div class="chat-empty__icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          {:else}
            {@const otherUser = getOtherUser(selectedConversation)}
            <!-- Chat Header -->
            <div class="chat-header">
              <div class="chat-header__user">
                <div class="chat-header__avatar">
                  {otherUser?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div class="chat-header__info">
                  <h3>{otherUser?.username || "Unknown User"}</h3>
                  {#if selectedConversation.listing}
                    <p class="chat-header__listing">
                      {selectedConversation.listing.title}
                    </p>
                  {/if}
                </div>
              </div>
              {#if selectedConversation.listing}
                <a
                  href="/marketplace?id={selectedConversation.listing.id}"
                  class="btn btn--ghost btn--sm"
                >
                  View Listing
                </a>
              {/if}
            </div>

            <!-- Messages -->
            <div id="messages-container" class="chat-messages">
              {#each messages as message}
                {@const isOwn = message.senderId === marketplaceUser?.id}
                <div class="chat-message" class:chat-message--own={isOwn}>
                  {#if !isOwn}
                    <div class="chat-message__avatar">
                      {message.sender?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  {/if}
                  <div class="chat-message__content">
                    <div class="chat-message__bubble">
                      {message.content}
                    </div>
                    <div class="chat-message__time">
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              {/each}
            </div>

            <!-- Message Input -->
            <div class="chat-input">
              <form
                onsubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <input
                  type="text"
                  class="chat-input__field"
                  placeholder="Type a message..."
                  bind:value={messageInput}
                  disabled={sending}
                />
                <button
                  type="submit"
                  class="btn btn--primary"
                  disabled={!messageInput.trim() || sending}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </main>
</div>

<style>
  .chat-container {
    display: grid;
    grid-template-columns: 320px 1fr;
    height: calc(100vh - 200px);
    max-height: 800px;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: white;
  }

  /* Sidebar */
  .chat-sidebar {
    border-right: 1px solid var(--color-gray-200);
    display: flex;
    flex-direction: column;
    background: var(--color-gray-50);
  }

  .chat-sidebar__header {
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-gray-200);
    background: white;
  }

  .chat-sidebar__header h2 {
    font-size: var(--text-xl);
    font-weight: 600;
    margin: 0;
  }

  .chat-sidebar__loading,
  .chat-sidebar__empty {
    padding: var(--space-8);
    text-align: center;
    color: var(--color-gray-500);
  }

  .chat-sidebar__list {
    flex: 1;
    overflow-y: auto;
  }

  .chat-sidebar__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    border: none;
    background: transparent;
    cursor: pointer;
    width: 100%;
    text-align: left;
    border-bottom: 1px solid var(--color-gray-100);
    transition: background 0.2s;
  }

  .chat-sidebar__item:hover {
    background: var(--color-gray-100);
  }

  .chat-sidebar__item--active {
    background: var(--color-primary-subtle);
    border-left: 3px solid var(--color-primary);
  }

  .chat-sidebar__item-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
  }

  .chat-sidebar__item-content {
    flex: 1;
    min-width: 0;
  }

  .chat-sidebar__item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-1);
  }

  .chat-sidebar__item-name {
    font-weight: 600;
    font-size: var(--text-sm);
  }

  .chat-sidebar__item-time {
    font-size: var(--text-xs);
    color: var(--color-gray-500);
  }

  .chat-sidebar__item-preview {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-size: var(--text-sm);
    color: var(--color-gray-600);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-sidebar__item-listing {
    font-weight: 500;
    color: var(--color-primary);
  }

  .chat-sidebar__item-message {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-sidebar__item-badge {
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xs);
    font-weight: 600;
    flex-shrink: 0;
  }

  /* Main Chat Area */
  .chat-main {
    display: flex;
    flex-direction: column;
    background: white;
  }

  .chat-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-gray-500);
  }

  .chat-empty__icon {
    font-size: 4rem;
    margin-bottom: var(--space-4);
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-gray-200);
  }

  .chat-header__user {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .chat-header__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }

  .chat-header__info h3 {
    margin: 0;
    font-size: var(--text-base);
    font-weight: 600;
  }

  .chat-header__listing {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-gray-500);
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .chat-message {
    display: flex;
    gap: var(--space-2);
    align-items: flex-end;
  }

  .chat-message--own {
    flex-direction: row-reverse;
  }

  .chat-message__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--color-gray-300);
    color: var(--color-gray-700);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: var(--text-sm);
    flex-shrink: 0;
  }

  .chat-message__content {
    max-width: 70%;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .chat-message--own .chat-message__content {
    align-items: flex-end;
  }

  .chat-message__bubble {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    background: var(--color-gray-100);
    color: var(--color-gray-900);
    word-wrap: break-word;
  }

  .chat-message--own .chat-message__bubble {
    background: var(--color-primary);
    color: white;
  }

  .chat-message__time {
    font-size: var(--text-xs);
    color: var(--color-gray-500);
    padding: 0 var(--space-2);
  }

  .chat-input {
    padding: var(--space-4);
    border-top: 1px solid var(--color-gray-200);
  }

  .chat-input form {
    display: flex;
    gap: var(--space-2);
  }

  .chat-input__field {
    flex: 1;
    padding: var(--space-3) var(--space-4);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
  }

  .chat-input__field:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  @media (max-width: 768px) {
    .chat-container {
      grid-template-columns: 1fr;
      height: calc(100vh - 150px);
    }

    .chat-sidebar {
      display: none;
    }
  }
</style>
