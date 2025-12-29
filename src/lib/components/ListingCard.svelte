<script>
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";

  const { listing, marketplaceUser } = $props();
  
  const session = useSession();
  const user = $derived($session.data?.user);

  // Check if current user is the seller
  const isSeller = $derived(marketplaceUser?.id === listing?.userId);
  const canChat = $derived(user && listing?.userId && !isSeller);

  /** @param {Event} e */
  async function handleChatClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      await goto("/login");
      return;
    }

    if (isSeller) {
      return; // Don't allow sellers to message themselves
    }

    try {
      // Create or get conversation
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          sellerId: listing.userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create conversation");
      }
      
      const data = await response.json();
      await goto(`/messages?conversation=${data.conversation.id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert(error.message || "Failed to start conversation. Please try again.");
    }
  }
</script>

<a href="/marketplace?id={listing?.id || '#'}" class="listing-card listing-card--list">
  <div class="listing-card__image">
    <div
      class="listing-card__placeholder"
      style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
    >
      🚗
    </div>
    <span class="listing-card__badge listing-card__badge--featured"
      >Featured</span
    >
    <button class="listing-card__favorite" aria-label="Save listing">♡</button>
  </div>
  <div class="listing-card__body">
    <div class="listing-card__header">
      <div>
        <div class="listing-card__category">{listing?.category?.name || 'Category'}</div>
        <h4 class="listing-card__title">{listing?.title || 'Listing Title'}</h4>
      </div>
      <div class="listing-card__price">£{listing?.price || '0'}</div>
    </div>
    {#if listing?.description}
      <div
        class="listing-card__details"
        style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-2);"
      >
        {listing.description.substring(0, 100)}{listing.description.length > 100 ? '...' : ''}
      </div>
    {/if}
    <div class="listing-card__footer">
      <div class="listing-card__meta">
        <span class="listing-card__location">📍 {listing?.locationCity || 'Location'} • {listing?.locationPostcode || ''}</span>
        <span class="listing-card__time">{listing?.createdAt ? new Date(listing.createdAt).toLocaleDateString() : ''}</span>
      </div>
      <div class="listing-card__actions">
        {#if canChat}
          <button
            class="btn btn--primary btn--sm chat-button"
            onclick={handleChatClick}
            type="button"
            aria-label="Start chat with seller"
          >
            💬 Message Seller
          </button>
        {:else if !user}
          <a
            href="/login"
            class="btn btn--primary btn--sm chat-button"
            onclick={(e) => e.stopPropagation()}
          >
            💬 Message Seller
          </a>
        {/if}
      </div>
    </div>
  </div>
</a>

<style>
  .chat-button {
    white-space: nowrap;
    font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .chat-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .listing-card__actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }
</style>
