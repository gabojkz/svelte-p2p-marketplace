<script>
  const { 
    tradeId, 
    reportedUserId, 
    reportedUserName, 
    onCancel, 
    onSubmit 
  } = $props();

  let issueType = $state("");
  let title = $state("");
  let description = $state("");
  let submitting = $state(false);

  const issueTypes = [
    { value: "scam", label: "Scam / Fraud", description: "User attempted to scam or defraud" },
    { value: "no_response", label: "No Response", description: "User is not responding to messages" },
    { value: "no_show", label: "No Show", description: "User did not show up for the meeting" },
    { value: "wrong_item", label: "Wrong Item", description: "Item received does not match description" },
    { value: "other", label: "Other", description: "Other issue not listed above" }
  ];

  function handleSubmit() {
    if (!issueType) {
      alert("Please select a reason for reporting this user");
      return;
    }

    if (!title.trim()) {
      alert("Please provide a title for your report");
      return;
    }

    if (!description.trim()) {
      alert("Please provide a detailed description of the issue");
      return;
    }

    if (description.trim().length < 20) {
      alert("Please provide a more detailed description (at least 20 characters)");
      return;
    }

    submitting = true;
    onSubmit({
      tradeId,
      reportedUserId,
      issueType,
      title: title.trim(),
      description: description.trim(),
    });
  }
</script>

<div class="report-user-form">
  <h3 id="report-form-title" style="margin-bottom: var(--space-4);">
    Report User
  </h3>
  <p style="font-size: var(--text-sm); color: var(--color-gray-600); margin-bottom: var(--space-4);">
    {#if reportedUserName}
      Reporting <strong>{reportedUserName}</strong> for inappropriate behavior or violation of platform rules.
    {:else}
      Report this user for inappropriate behavior or violation of platform rules.
    {/if}
  </p>

  <!-- Issue Type Selection -->
  <div style="margin-bottom: var(--space-4);">
    <label style="display: block; font-size: var(--text-sm); font-weight: var(--font-medium); margin-bottom: var(--space-2);">
      Reason for Report <span style="color: var(--color-error);">*</span>
    </label>
    <select
      bind:value={issueType}
      class="form-select"
      style="width: 100%;"
    >
      <option value="">Select a reason...</option>
      {#each issueTypes as type}
        <option value={type.value}>{type.label}</option>
      {/each}
    </select>
    {#if issueType}
      <p style="font-size: var(--text-xs); color: var(--color-gray-600); margin-top: var(--space-1);">
        {issueTypes.find(t => t.value === issueType)?.description}
      </p>
    {/if}
  </div>

  <!-- Title -->
  <div style="margin-bottom: var(--space-4);">
    <label style="display: block; font-size: var(--text-sm); font-weight: var(--font-medium); margin-bottom: var(--space-2);">
      Title <span style="color: var(--color-error);">*</span>
    </label>
    <input
      type="text"
      bind:value={title}
      placeholder="Brief summary of the issue"
      maxlength="200"
      class="form-input"
      style="width: 100%;"
    />
    <p style="font-size: var(--text-xs); color: var(--color-gray-600); margin-top: var(--space-1);">
      {title.length}/200 characters
    </p>
  </div>

  <!-- Description -->
  <div style="margin-bottom: var(--space-4);">
    <label style="display: block; font-size: var(--text-sm); font-weight: var(--font-medium); margin-bottom: var(--space-2);">
      Detailed Description <span style="color: var(--color-error);">*</span>
    </label>
    <textarea
      bind:value={description}
      placeholder="Please provide as much detail as possible about what happened. Include dates, times, and any relevant information that will help us investigate."
      rows="6"
      class="form-input"
      style="width: 100%; resize: vertical;"
    ></textarea>
    <p style="font-size: var(--text-xs); color: var(--color-gray-600); margin-top: var(--space-1);">
      Minimum 20 characters. {description.length} characters entered.
    </p>
  </div>

  <!-- Warning Message -->
  <div style="padding: var(--space-3); background: var(--color-error-subtle); border-radius: var(--radius-md); margin-bottom: var(--space-4);">
    <p style="font-size: var(--text-xs); color: var(--color-error); line-height: 1.5;">
      <strong>⚠️ Important:</strong> False reports may result in action against your account. 
      Please only report genuine violations of our platform rules.
    </p>
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
      disabled={submitting || !issueType || !title.trim() || description.trim().length < 20}
    >
      {submitting ? 'Submitting...' : 'Submit Report'}
    </button>
  </div>
</div>

<style>
  .report-user-form {
    padding: var(--space-4);
  }
</style>

