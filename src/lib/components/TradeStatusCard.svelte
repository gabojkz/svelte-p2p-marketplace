<script>
  import { onMount } from "svelte";
  import { fetchTrade, createTrade } from "$lib/services/trade";

  const { listingId, buyerId, sellerId } = $props();

  let tradeStatus = null;
  let tradeExists = $derived(false);
  let trade;

  onMount(async () => {
    console.log("TradeStatusCard mounted");
    // check if the strade was already started?
    trade = await fetchTrade(listingId, buyerId, sellerId);
    console.log(trade);
    // check if object exists
    if (trade && trade.id) {
      console.log("Trade exists");
      tradeExists = true;
    }
  });

  let tradeCompleted = false;
  let showReviewForm = false;
  let handleMarkComplete = false;

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

    trade = await createTrade(newTrade);

    console.log(trade);
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
          style="width: 2px; height: 16px; background: var(--color-accent-yellow); margin-left: 11px;"
        ></div>
        <div class="flex items-center gap-2">
          <div
            style="width: 24px; height: 24px; background: var(--color-accent-yellow); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 10px;"
          >
            3
          </div>
          <div style="flex: 1;">
            <div
              style="font-size: var(--text-xs); font-weight: var(--font-medium); color: var(--color-accent-yellow);"
            >
              Confirm Trade
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
            {tradeCompleted ? "✓" : "4"}
          </div>
          <div style="flex: 1;">
            <div
              style="font-size: var(--text-xs); {tradeCompleted
                ? 'font-weight: var(--font-medium); color: var(--color-primary);'
                : 'color: var(--color-gray-500);'}"
            >
              {tradeCompleted ? "Trade Completed" : "Complete Trade"}
            </div>
          </div>
        </div>
      </div>

      <!-- Trade Action Buttons - Only show when trade exists -->
      {#if tradeCompleted}
        <!-- Show Add Review button when trade is completed -->
        <button
          class="btn btn--primary btn--full btn--sm mb-2"
          onclick={() => (showReviewForm = true)}
          type="button"
        >
          ⭐ Add Review
        </button>
      {:else}
        <!-- Show Mark as Complete and Cancel buttons when trade is active -->
        <button
          class="btn btn--primary btn--full btn--sm mb-2"
          onclick={handleMarkComplete}
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
