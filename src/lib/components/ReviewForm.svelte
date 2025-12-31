<script>
  const { tradeId, reviewerId, revieweeId, revieweeName, onSubmit, onCancel } = $props();

  let rating = $state(0);
  let title = $state("");
  let comment = $state("");
  let submitting = $state(false);

  function handleSubmit() {
    if (rating === 0) {
      alert("Please select a rating (1-5 stars)");
      return;
    }

    submitting = true;
    onSubmit({
      tradeId,
      reviewerId,
      revieweeId,
      rating,
      title: title.trim() || null,
      comment: comment.trim() || null,
    });
  }

  function setRating(value) {
    rating = value;
  }
</script>

<div class="review-form">
  <h3 id="review-form-title" style="margin-bottom: var(--space-4);">Leave a Review</h3>
  <p style="font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-4);">
    How was your experience with {revieweeName}?
  </p>

  <!-- Rating Selection -->
  <div style="margin-bottom: var(--space-4);">
    <label style="display: block; font-size: var(--text-sm); font-weight: var(--font-medium); margin-bottom: var(--space-2);">
      Rating <span style="color: var(--color-error);">*</span>
    </label>
    <div style="display: flex; gap: var(--space-2); align-items: center;">
      {#each [1, 2, 3, 4, 5] as star}
        <button
          type="button"
          onclick={() => setRating(star)}
          style="
            background: none;
            border: none;
            cursor: pointer;
            padding: var(--space-1);
            font-size: 32px;
            line-height: 1;
            transition: transform 0.2s;
          "
          onmouseenter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onmouseleave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {rating >= star ? '⭐' : '☆'}
        </button>
      {/each}
      {#if rating > 0}
        <span style="font-size: var(--text-sm); color: var(--color-gray-600); margin-left: var(--space-2);">
          {rating} {rating === 1 ? 'star' : 'stars'}
        </span>
      {/if}
    </div>
  </div>

  <!-- Title (Optional) -->
  <div style="margin-bottom: var(--space-4);">
    <label style="display: block; font-size: var(--text-sm); font-weight: var(--font-medium); margin-bottom: var(--space-2);">
      Title (Optional)
    </label>
    <input
      type="text"
      bind:value={title}
      placeholder="Brief summary of your experience"
      maxlength="200"
      class="form-input"
      style="width: 100%;"
    />
  </div>

  <!-- Comment (Optional) -->
  <div style="margin-bottom: var(--space-4);">
    <label style="display: block; font-size: var(--text-sm); font-weight: var(--font-medium); margin-bottom: var(--space-2);">
      Comment (Optional)
    </label>
    <textarea
      bind:value={comment}
      placeholder="Share more details about your experience..."
      rows="4"
      class="form-input"
      style="width: 100%; resize: vertical;"
    ></textarea>
  </div>

  <!-- Actions -->
  <div style="display: flex; gap: var(--space-2); justify-content: flex-end;">
    <button
      type="button"
      class="btn btn--outline"
      onclick={onCancel}
      disabled={submitting}
    >
      Cancel
    </button>
    <button
      type="button"
      class="btn btn--primary"
      onclick={handleSubmit}
      disabled={submitting || rating === 0}
    >
      {submitting ? 'Submitting...' : 'Submit Review'}
    </button>
  </div>
</div>

<style>
  .review-form {
    padding: var(--space-4);
  }
</style>

