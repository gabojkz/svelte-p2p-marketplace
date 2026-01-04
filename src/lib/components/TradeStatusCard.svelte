<script>
  import { onMount } from "svelte";
  import { fetchTrade, createTrade, confirmTrade, rejectTrade, completeTrade } from "$lib/services/trade.js";

  const { listingId, buyerId, sellerId, currentUserId, onReviewClick, trade: tradeProp } = $props();

  let tradeStatus = null;
  /** @type {any} */
  let trade = $state(tradeProp || null);
  let tradeExists = $derived(trade && trade.id);

  // Update trade when prop changes
  $effect(() => {
    if (tradeProp) {
      trade = tradeProp;
    }
  });

  // Determine if current user is buyer or seller
  const isBuyer = $derived(currentUserId === buyerId);
  const isSeller = $derived(currentUserId === sellerId);
  
  // Check if trade needs confirmation (status is "initiated")
  const tradeNeedsConfirmation = $derived(trade && trade.status === "initiated");
  
  // Check if current user is the one who needs to confirm (opposite of initiator)
  // Buyer always initiates, so seller needs to confirm
  const needsToConfirm = $derived(tradeNeedsConfirmation && isSeller);
  const waitingForConfirmation = $derived(tradeNeedsConfirmation && isBuyer);
  
  // Check if trade is in progress (confirmed by both parties)
  const tradeInProgress = $derived(trade && trade.status === "in_progress");
  
  // Check if trade is completed
  const tradeCompleted = $derived(trade && trade.status === "completed");
  
  // Check if trade is cancelled/rejected
  const tradeCancelled = $derived(trade && trade.status === "cancelled");

  async function loadTrade() {
    try {
      const fetchedTrade = await fetchTrade(listingId, buyerId, sellerId);
      console.log("Fetched trade:", fetchedTrade);
      // check if object exists
      if (fetchedTrade && /** @type {any} */ (fetchedTrade).id) {
        console.log("Trade exists:", fetchedTrade);
        trade = fetchedTrade;
      } else {
        console.log("No trade found");
        trade = null;
      }
    } catch (error) {
      console.error("Error loading trade:", error);
      trade = null;
    }
  }

  onMount(async () => {
    console.log("TradeStatusCard mounted");
    // Only load trade if not provided as prop
    if (!tradeProp) {
      await loadTrade();
    } else {
      trade = tradeProp;
    }
  });

  let processing = $state(false);

  async function startTrade() {
    if (!listingId || !buyerId || !sellerId) {
      alert("Unable to start trade. Missing required information.");
      return;
    }

    // Don't allow users to trade with themselves
    if (sellerId === buyerId) {
      alert("You cannot start a trade for your own listing.");
      return;
    }

    const confirmStart = confirm("Do you want to start this trade?");
    if (!confirmStart) {
      return;
    }

    // Create a new trade
    const newTrade = {
      listingId,
      buyerId,
      sellerId,
    };

    try {
      trade = await createTrade(newTrade);
      console.log(trade);
      
      if (trade && trade.id) {
        tradeExists = true;
        // Reload to show confirmation buttons to the other party
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating trade:", error);
      alert("Failed to create trade. Please try again.");
    }
  }

  // Handle trade confirmation
  async function handleConfirmTrade() {
    if (!trade?.id) {
      alert("Unable to confirm trade. Trade not found.");
      return;
    }

    if (!confirm("Are you sure you want to confirm this trade?")) {
      return;
    }

    processing = true;
    try {
      await confirmTrade(trade.id);
      alert("Trade confirmed successfully!");
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to confirm trade";
      alert(message);
      console.error("Error confirming trade:", err);
    } finally {
      processing = false;
    }
  }

  // Handle trade rejection
  async function handleRejectTrade() {
    if (!trade?.id) {
      alert("Unable to reject trade. Trade not found.");
      return;
    }

    if (!confirm("Are you sure you want to reject this trade? This action cannot be undone.")) {
      return;
    }

    processing = true;
    try {
      await rejectTrade(trade.id);
      alert("Trade rejected. A message has been sent to both parties.");
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reject trade";
      alert(message);
      console.error("Error rejecting trade:", err);
    } finally {
      processing = false;
    }
  }

  // Handle mark trade as complete
  async function handleMarkComplete() {
    if (!trade?.id) {
      alert("Unable to complete trade. Trade not found.");
      return;
    }

    if (!confirm("Are you sure you want to mark this trade as complete?")) {
      return;
    }

    processing = true;
    try {
      await completeTrade(trade.id);
      alert("Trade marked as complete! You can now leave a review.");
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete trade";
      alert(message);
      console.error("Error completing trade:", err);
    } finally {
      processing = false;
    }
  }
</script>

<!-- Trade Status Card -->
<div class="card">
  <div class="card__body">
    <h4 style="margin-bottom: var(--space-4); font-size: var(--text-base);">
      Trade Status
    </h4>

    {#if tradeExists}
      <!-- Progress Steps - Only show when trade exists -->
      <div
        style="display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4);"
      >
        <div class="flex items-center gap-2">
          <div
            style="width: 24px; height: 24px; background: var(--color-primary); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;"
          >
            ✓
          </div>
          <div style="flex: 1;">
            <div
              style="font-size: var(--text-xs); font-weight: var(--font-medium);"
            >
              Trade Started
            </div>
          </div>
        </div>
        <div
          style="width: 2px; height: 16px; background: {tradeNeedsConfirmation ? 'var(--color-accent-yellow)' : 'var(--color-primary)'}; margin-left: 11px;"
        ></div>
        <div class="flex items-center gap-2">
          <div
            style="width: 24px; height: 24px; background: {tradeNeedsConfirmation ? 'var(--color-accent-yellow)' : 'var(--color-primary)'}; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;"
          >
            {tradeNeedsConfirmation ? "3" : "✓"}
          </div>
          <div style="flex: 1;">
            <div
              style="font-size: var(--text-xs); font-weight: var(--font-medium); color: {tradeNeedsConfirmation ? 'var(--color-accent-yellow)' : 'var(--color-primary)'};"
            >
              Confirm Trade
            </div>
          </div>
        </div>
        <div
          style="width: 2px; height: 16px; background: {tradeInProgress || tradeCompleted
            ? 'var(--color-primary)'
            : 'var(--color-gray-200)'}; margin-left: 11px;"
        ></div>
        <div class="flex items-center gap-2">
          <div
            style="width: 24px; height: 24px; background: {tradeInProgress || tradeCompleted
              ? 'var(--color-primary)'
              : 'var(--color-gray-200)'}; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: {tradeInProgress || tradeCompleted
              ? 'white'
              : 'var(--color-gray-500)'}; font-size: 10px;"
          >
            {tradeInProgress || tradeCompleted ? "✓" : "4"}
          </div>
          <div style="flex: 1;">
            <div
              style="font-size: var(--text-xs); {tradeInProgress || tradeCompleted
                ? 'font-weight: var(--font-medium); color: var(--color-primary);'
                : 'color: var(--color-gray-500);'}"
            >
              {tradeCompleted ? "Trade Completed" : "Confirm Details"}
            </div>
          </div>
        </div>
        <div
          style="width: 2px; height: 16px; background: {tradeCompleted
            ? 'var(--color-primary)'
            : 'var(--color-gray-200)'}; margin-left: 11px;"
        ></div>
        <div class="flex items-center gap-2">
          <div
            style="width: 24px; height: 24px; background: {tradeCompleted
              ? 'var(--color-primary)'
              : 'var(--color-gray-200)'}; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: {tradeCompleted
              ? 'white'
              : 'var(--color-gray-500)'}; font-size: 10px;"
          >
            {tradeCompleted ? "✓" : "5"}
          </div>
          <div style="flex: 1;">
            <div
              style="font-size: var(--text-xs); {tradeCompleted
                ? 'font-weight: var(--font-medium); color: var(--color-primary);'
                : 'color: var(--color-gray-500);'}"
            >
              Complete Trade
            </div>
          </div>
        </div>
      </div>

      <!-- Trade Action Buttons - Only show when trade exists -->
      {#if tradeCancelled}
        <!-- Show cancelled message -->
        <div style="padding: var(--space-3); background: var(--color-gray-100); border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: var(--text-lg);">❌</span>
          <p style="font-size: var(--text-xs); margin-top: var(--space-1); font-weight: var(--font-semibold);">Trade Rejected</p>
          <p style="font-size: var(--text-xs); margin-top: var(--space-1); color: var(--color-gray-600);">This trade has been rejected</p>
        </div>
      {:else if tradeCompleted}
        <!-- Show Add Review button when trade is completed -->
        <button
          class="btn btn--primary btn--full btn--sm mb-2"
          onclick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Add Review button clicked", { onReviewClick, tradeCompleted, trade });
            if (onReviewClick) {
              onReviewClick();
            } else {
              alert("Review feature will be available soon");
            }
          }}
          type="button"
        >
          ⭐ Add Review
        </button>
      {:else if needsToConfirm}
        <!-- Show Confirm/Reject buttons when seller needs to confirm buyer's trade -->
        <div style="margin-bottom: var(--space-3);">
          <p style="font-size: var(--text-xs); color: var(--color-gray-600); margin-bottom: var(--space-2); text-align: center;">
            Buyer has initiated a trade. Please confirm or reject.
          </p>
          <button
            class="btn btn--primary btn--full btn--sm mb-2"
            onclick={handleConfirmTrade}
            disabled={processing}
            type="button"
          >
            {processing ? "Processing..." : "✓ Confirm Trade"}
          </button>
          <button
            class="btn btn--outline btn--full btn--sm"
            onclick={handleRejectTrade}
            disabled={processing}
            type="button"
          >
            {processing ? "Processing..." : "❌ Reject Trade"}
          </button>
        </div>
      {:else if waitingForConfirmation}
        <!-- Show waiting message when buyer is waiting for seller to confirm -->
        <div style="padding: var(--space-3); background: var(--color-accent-yellow); border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: var(--text-lg);">⏳</span>
          <p style="font-size: var(--text-xs); margin-top: var(--space-1); font-weight: var(--font-semibold);">Waiting for Confirmation</p>
          <p style="font-size: var(--text-xs); margin-top: var(--space-1);">Waiting for seller to confirm the trade</p>
        </div>
      {:else if tradeInProgress}
        <!-- Show reminder to confirm details when trade is in progress -->
        <div style="padding: var(--space-3); background: var(--color-primary-subtle); border-radius: var(--radius-md); margin-bottom: var(--space-3);">
          <div style="display: flex; align-items: start; gap: var(--space-2);">
            <span style="font-size: var(--text-lg); flex-shrink: 0;">📋</span>
            <div style="flex: 1;">
              <p style="font-size: var(--text-xs); font-weight: var(--font-semibold); margin-bottom: var(--space-1);">
                Next Step: Confirm Trade Details
              </p>
              <p style="font-size: var(--text-xs); color: var(--color-gray-700); line-height: 1.5;">
                Please confirm the final price and arrange the meeting location with the other party. 
                Discuss these details in the chat before proceeding.
              </p>
              <ul style="font-size: var(--text-xs); color: var(--color-gray-700); margin-top: var(--space-2); padding-left: var(--space-4); line-height: 1.6;">
                <li>Confirm the final sale price</li>
                <li>Agree on meeting location</li>
                <li>Schedule meeting date and time</li>
              </ul>
            </div>
          </div>
        </div>
        <!-- Show Mark as Complete and Cancel buttons when trade is active (in_progress) -->
        <button
          class="btn btn--primary btn--full btn--sm mb-2"
          onclick={handleMarkComplete}
          disabled={processing}
          type="button"
        >
          {processing ? "Processing..." : "✓ Mark as Complete"}
        </button>
        <button
          class="btn btn--outline btn--full btn--sm"
          onclick={() => alert("Cancel trade feature coming soon")}
          type="button"
        >
          Cancel Trade
        </button>
      {:else}
        <!-- Show Mark as Complete and Cancel buttons when trade is active (in_progress) -->
        <button
          class="btn btn--primary btn--full btn--sm mb-2"
          onclick={handleMarkComplete}
          disabled={processing}
          type="button"
        >
          {processing ? "Processing..." : "✓ Mark as Complete"}
        </button>
        <button
          class="btn btn--outline btn--full btn--sm"
          onclick={() => alert("Cancel trade feature coming soon")}
          type="button"
        >
          Cancel Trade
        </button>
      {/if}
    {:else}
      <!-- Start Trade Button - Only show when no trade exists -->
      <button
        class="btn btn--primary btn--full btn--sm"
        onclick={startTrade}
        type="button"
      >
        Start Trade
      </button>
    {/if}
  </div>
</div>
