<script>
  import Logo from "$lib/components/Logo.svelte";
  import CategorySelect from "$lib/components/CategorySelect.svelte";
  import { useSession } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import { enhance } from "$app/forms";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data, form } = $props();

  const categories = $derived(data?.categories || []);
  const marketplaceUser = $derived(data?.marketplaceUser);

  // Form state
  let step = $state(1);
  let listingType = $state("product");
  let categoryId = $state("");
  let subcategoryId = $state("");
  let title = $state("");
  let description = $state("");
  let condition = $state("");
  let brand = $state("");
  let price = $state("");
  let priceType = $state("fixed");
  let acceptsOffers = $state(false);
  let locationCity = $state("");
  let locationPostcode = $state("");
  let deliveryCollection = $state(true);
  let deliveryLocal = $state(false);
  let deliveryShipping = $state(false);
  let status = $state("draft");

  // Photo upload state (placeholder for now)
  /** @type {File[]} */
  let photos = $state([]);

  // Filter categories by type
  const filteredCategories = $derived(
    categories.filter((/** @type {any} */ cat) => cat.type === listingType)
  );

  // Validation
  const step1Valid = $derived(categoryId !== "");
  const step2Valid = $derived(
    title.trim() !== "" && description.trim() !== "" && (listingType === "service" || condition !== "")
  );
  const step3Valid = $derived(true); // Photos optional for now
  const step4Valid = $derived(
    price !== "" && parseFloat(price) >= 0 && locationCity.trim() !== "" && locationPostcode.trim() !== ""
  );

  // Form submission is handled by redirect in server action
  
  // Get field-specific errors from form
  const fieldErrors = $derived.by(() => {
    if (form && typeof form === 'object' && 'fieldErrors' in form && form.fieldErrors) {
      return /** @type {Record<string, string>} */ (form.fieldErrors);
    }
    return /** @type {Record<string, string>} */ ({});
  });
  
  // Helper function to get error for a field
  /** @param {string} fieldName */
  function getFieldError(fieldName) {
    return fieldErrors[fieldName] || null;
  }
  
  // Helper function to check if field has error
  /** @param {string} fieldName */
  function hasFieldError(fieldName) {
    return !!fieldErrors[fieldName];
  }

  function nextStep() {
    // Validate current step before proceeding
    if (step === 1 && !step1Valid) {
      alert("Please select a category");
      return;
    }
    if (step === 2 && !step2Valid) {
      alert("Please fill in all required fields");
      return;
    }
    if (step === 4 && !step4Valid) {
      alert("Please fill in all required fields");
      return;
    }

    if (step < 4) {
      step++;
    }
  }

  function prevStep() {
    if (step > 1) {
      step--;
    }
  }

  /** @param {string} value */
  function handleListingTypeChange(value) {
    listingType = value;
    categoryId = ""; // Reset category when type changes
    subcategoryId = "";
  }

  // Auto-populate location from user profile
  $effect(() => {
    if (marketplaceUser && !locationCity && !locationPostcode) {
      locationCity = marketplaceUser.locationCity || "";
      locationPostcode = marketplaceUser.locationPostcode || "";
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
          <a href="/dashboard" class="nav__link">My Listings</a>
        </nav>

        <div class="header__actions">
          <a href="/dashboard" class="btn btn--ghost">Dashboard</a>
          <button class="menu-toggle" aria-label="Toggle menu">
            <span class="menu-toggle__bar"></span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container container--narrow">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 style="font-size: var(--text-3xl); margin-bottom: var(--space-2);">
          Create New Listing
        </h1>
        <p class="text-muted">
          List your item for free and reach thousands of local buyers
        </p>
      </div>

      <!-- Progress Steps -->
      <div class="steps mb-8">
        {#each [1, 2, 3, 4] as stepNum}
          <div class="step" class:step--active={step >= stepNum} class:step--completed={step > stepNum}>
            <div class="step__number">{stepNum}</div>
            <div class="step__label">
              {stepNum === 1 && "Category"}
              {stepNum === 2 && "Details"}
              {stepNum === 3 && "Photos"}
              {stepNum === 4 && "Location & Price"}
            </div>
          </div>
        {/each}
      </div>

      <!-- Error Message -->
      {#if form?.error}
        <div class="alert alert--error mb-6">
          <strong>⚠️ {form.error}</strong>
          {#if Object.keys(fieldErrors).length > 0}
            <ul style="margin-top: var(--space-3); margin-left: var(--space-5); list-style: disc;">
              {#each Object.entries(fieldErrors) as [field, message]}
                <li>{message}</li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}

      <!-- Form Card -->
      <form method="POST" use:enhance>
        <div class="card">
          <div class="card__body" style="padding: var(--space-8);">
            <!-- Step 1: Category Selection -->
            {#if step === 1}
              <div class="form-step" id="step1">
                <h3 style="margin-bottom: var(--space-6);">
                  What are you listing?
                </h3>

                <!-- Listing Type Toggle -->
                <div
                  class="listing-type-toggle"
                  style="display: flex; gap: var(--space-4); margin-bottom: var(--space-6);"
                >
                  <label class="listing-type-option" style="flex: 1;">
                    <input
                      type="radio"
                      name="type"
                      value="product"
                      bind:group={listingType}
                      onchange={() => handleListingTypeChange("product")}
                      class="sr-only"
                    />
                    <div
                      class="listing-type-card"
                      class:listing-type-card--selected={listingType === "product"}
                      style="padding: var(--space-4); border: 2px solid var(--color-gray-200); border-radius: var(--radius-lg); text-align: center; cursor: pointer; transition: all 0.2s;"
                    >
                      <span style="font-size: var(--text-2xl);">📦</span>
                      <span
                        style="display: block; font-weight: var(--font-semibold); margin-top: var(--space-2);"
                        >Product</span
                      >
                      <span
                        style="font-size: var(--text-xs); color: var(--color-gray-500);"
                        >Physical item for sale</span
                      >
                    </div>
                  </label>
                  <label class="listing-type-option" style="flex: 1;">
                    <input
                      type="radio"
                      name="type"
                      value="service"
                      bind:group={listingType}
                      onchange={() => handleListingTypeChange("service")}
                      class="sr-only"
                    />
                    <div
                      class="listing-type-card"
                      class:listing-type-card--selected={listingType === "service"}
                      style="padding: var(--space-4); border: 2px solid var(--color-gray-200); border-radius: var(--radius-lg); text-align: center; cursor: pointer; transition: all 0.2s;"
                    >
                      <span style="font-size: var(--text-2xl);">🔧</span>
                      <span
                        style="display: block; font-weight: var(--font-semibold); margin-top: var(--space-2);"
                        >Service</span
                      >
                      <span
                        style="font-size: var(--text-xs); color: var(--color-gray-500);"
                        >Work or expertise offered</span
                      >
                    </div>
                  </label>
                </div>

                <!-- Category Selection -->
                <div class="form-group mt-6">
                  <label for="categoryId" class="form-label form-label--required">Category</label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    class="form-select"
                    class:form-select--error={hasFieldError('categoryId')}
                    bind:value={categoryId}
                    required
                  >
                    <option value="">Select a category...</option>
                    {#if filteredCategories.length > 0}
                      {#each filteredCategories.filter((/** @type {any} */ c) => !c.parentId) as category}
                        <option value={category.id}>
                          {category.icon || '📦'} {category.name}
                        </option>
                      {/each}
                    {/if}
                  </select>
                  {#if hasFieldError('categoryId')}
                    <p class="form-error">{getFieldError('categoryId')}</p>
                  {/if}
                  {#if categoryId && filteredCategories.some((/** @type {any} */ c) => c.parentId === Number(categoryId))}
                    <div class="form-group mt-4">
                      <label for="subcategoryId" class="form-label">Subcategory (optional)</label>
                      <select
                        id="subcategoryId"
                        name="subcategoryId"
                        class="form-select"
                        bind:value={subcategoryId}
                      >
                        <option value="">None</option>
                        {#each filteredCategories.filter((/** @type {any} */ c) => c.parentId === Number(categoryId)) as subcategory}
                          <option value={subcategory.id}>
                            {subcategory.icon || '📦'} {subcategory.name}
                          </option>
                        {/each}
                      </select>
                    </div>
                  {/if}
                </div>

                <!-- Hidden form fields -->
                <input type="hidden" name="type" value={listingType} />
                <input type="hidden" name="categoryId" value={categoryId} />
                {#if subcategoryId}
                  <input type="hidden" name="subcategoryId" value={subcategoryId} />
                {/if}
              </div>
            {/if}

            <!-- Step 2: Item Details -->
            {#if step === 2}
              <div class="form-step" id="step2">
                <h3 style="margin-bottom: var(--space-6);">Item Details</h3>

                <div class="form-group">
                  <label for="title" class="form-label form-label--required">Title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    class="form-input"
                    class:form-input--error={hasFieldError('title')}
                    placeholder="e.g., 2019 BMW 3 Series 320i M Sport"
                    maxlength="200"
                    bind:value={title}
                    required
                  />
                  {#if hasFieldError('title')}
                    <p class="form-error">{getFieldError('title')}</p>
                  {:else}
                    <p class="form-helper">
                      Be specific - include brand, model, size, or colour
                    </p>
                  {/if}
                </div>

                <div class="form-group">
                  <label for="description" class="form-label form-label--required"
                    >Description</label
                  >
                  <textarea
                    id="description"
                    name="description"
                    class="form-textarea"
                    class:form-textarea--error={hasFieldError('description')}
                    rows="6"
                    placeholder="Describe your item in detail. Include condition, features, history, and any flaws..."
                    bind:value={description}
                    required
                  ></textarea>
                  {#if hasFieldError('description')}
                    <p class="form-error">{getFieldError('description')}</p>
                  {:else}
                    <p class="form-helper">
                      Detailed descriptions help buyers make decisions faster
                    </p>
                  {/if}
                </div>

                {#if listingType === "product"}
                  <div
                    style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);"
                  >
                    <div class="form-group">
                      <label for="condition" class="form-label form-label--required"
                        >Condition</label
                      >
                      <select 
                        id="condition" 
                        name="condition" 
                        class="form-select"
                        class:form-select--error={hasFieldError('condition')}
                        bind:value={condition} 
                        required
                      >
                        <option value="">Select condition...</option>
                        <option value="new">New (Unused, with tags)</option>
                        <option value="like-new">Like New (Excellent)</option>
                        <option value="good">Good (Minor wear)</option>
                        <option value="fair">Fair (Visible wear)</option>
                        <option value="parts">For Parts / Not Working</option>
                      </select>
                      {#if hasFieldError('condition')}
                        <p class="form-error">{getFieldError('condition')}</p>
                      {/if}
                    </div>

                    <div class="form-group">
                      <label for="brand" class="form-label">Brand (if applicable)</label>
                      <input
                        id="brand"
                        name="brand"
                        type="text"
                        class="form-input"
                        placeholder="e.g., BMW, Apple, IKEA"
                        bind:value={brand}
                      />
                    </div>
                  </div>
                {/if}
              </div>
            {/if}

            <!-- Step 3: Photos -->
            {#if step === 3}
              <div class="form-step" id="step3">
                <h3 style="margin-bottom: var(--space-6);">Add Photos</h3>

                <div
                  class="photo-upload-area"
                  style="border: 2px dashed var(--color-gray-300); border-radius: var(--radius-lg); padding: var(--space-10); text-align: center; background: var(--color-gray-50);"
                >
                  <div
                    style="font-size: var(--text-4xl); margin-bottom: var(--space-4);"
                  >
                    📷
                  </div>
                  <h4 style="margin-bottom: var(--space-2);">
                    Drag & drop your photos here
                  </h4>
                  <p class="text-muted" style="margin-bottom: var(--space-4);">
                    or click to browse. Add up to 10 photos.
                  </p>
                  <button type="button" class="btn btn--outline"
                    >Choose Files</button
                  >
                  <input type="file" accept="image/*" multiple class="hidden" />
                </div>

                <p class="form-helper mt-4">
                  <strong>Note:</strong> Photo upload will be implemented in a future update. You can still create your listing without photos.
                </p>
              </div>
            {/if}

            <!-- Step 4: Location & Price -->
            {#if step === 4}
              <div class="form-step" id="step4">
                <h3 style="margin-bottom: var(--space-6);">Location & Price</h3>

                <!-- Location -->
                <div class="form-section" style="margin-bottom: var(--space-8);">
                  <h4
                    style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);"
                  >
                    <span>📍</span> Item Location
                  </h4>

                  <div
                    style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-4);"
                  >
                    <div class="form-group">
                      <label for="locationCity" class="form-label form-label--required"
                        >City or Town</label
                      >
                      <input
                        id="locationCity"
                        name="locationCity"
                        type="text"
                        class="form-input"
                        class:form-input--error={hasFieldError('locationCity')}
                        placeholder="e.g., Newcastle upon Tyne"
                        bind:value={locationCity}
                        required
                      />
                      {#if hasFieldError('locationCity')}
                        <p class="form-error">{getFieldError('locationCity')}</p>
                      {/if}
                    </div>
                    <div class="form-group">
                      <label for="locationPostcode" class="form-label form-label--required"
                        >Postcode</label
                      >
                      <input
                        id="locationPostcode"
                        name="locationPostcode"
                        type="text"
                        class="form-input"
                        class:form-input--error={hasFieldError('locationPostcode')}
                        placeholder="e.g., NE1 4ST"
                        bind:value={locationPostcode}
                        required
                      />
                      {#if hasFieldError('locationPostcode')}
                        <p class="form-error">{getFieldError('locationPostcode')}</p>
                      {/if}
                    </div>
                  </div>
                </div>

                <!-- Pricing -->
                <div class="form-section">
                  <h4
                    style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);"
                  >
                    <span>💷</span> Pricing
                  </h4>

                  <div
                    style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);"
                  >
                    <div class="form-group">
                      <label for="price" class="form-label form-label--required">Price</label>
                      <div class="input-group">
                        <span
                          style="padding: var(--space-3) var(--space-4); background: var(--color-gray-100); border: 2px solid var(--color-gray-200); border-right: none; border-radius: var(--radius-md) 0 0 var(--radius-md);"
                          >£</span
                        >
                        <input
                          id="price"
                          name="price"
                          type="number"
                          class="form-input"
                          class:form-input--error={hasFieldError('price')}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          style="border-radius: 0 var(--radius-md) var(--radius-md) 0;"
                          bind:value={price}
                          required
                        />
                      </div>
                      {#if hasFieldError('price')}
                        <p class="form-error">{getFieldError('price')}</p>
                      {/if}
                    </div>
                    <div class="form-group">
                      <label for="priceType" class="form-label">Price Type</label>
                      <select id="priceType" name="priceType" class="form-select" bind:value={priceType}>
                        <option value="fixed">Fixed Price</option>
                        <option value="negotiable">Negotiable</option>
                        <option value="free">Free</option>
                        <option value="swap">Swap / Trade</option>
                      </select>
                    </div>
                  </div>

                  {#if listingType === "product"}
                    <div class="form-group mt-4">
                      <label class="form-check">
                        <input
                          type="checkbox"
                          name="acceptsOffers"
                          class="form-check-input"
                          bind:checked={acceptsOffers}
                          value="true"
                        />
                        <span class="form-check-label"
                          >Accept offers below asking price</span
                        >
                      </label>
                    </div>
                  {/if}
                </div>

                <!-- Delivery Options -->
                {#if listingType === "product"}
                  <div class="form-section" style="margin-top: var(--space-8);">
                    <h4
                      style="margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);"
                    >
                      <span>📦</span> Delivery Options
                    </h4>

                    <div class="form-group">
                      <div
                        style="display: flex; flex-direction: column; gap: var(--space-3);"
                      >
                        <label class="form-check">
                          <input
                            type="checkbox"
                            name="deliveryCollection"
                            class="form-check-input"
                            bind:checked={deliveryCollection}
                            value="true"
                          />
                          <span class="form-check-label"
                            >Collection only (Buyer picks up)</span
                          >
                        </label>
                        <label class="form-check">
                          <input
                            type="checkbox"
                            name="deliveryLocal"
                            class="form-check-input"
                            bind:checked={deliveryLocal}
                            value="true"
                          />
                          <span class="form-check-label"
                            >Local delivery available</span
                          >
                        </label>
                        <label class="form-check">
                          <input
                            type="checkbox"
                            name="deliveryShipping"
                            class="form-check-input"
                            bind:checked={deliveryShipping}
                            value="true"
                          />
                          <span class="form-check-label">Nationwide shipping</span>
                        </label>
                      </div>
                    </div>
                  </div>
                {/if}

                <!-- Hidden fields for form submission -->
                <input type="hidden" name="type" value={listingType} />
                <input type="hidden" name="categoryId" value={categoryId} />
                {#if subcategoryId}
                  <input type="hidden" name="subcategoryId" value={subcategoryId} />
                {/if}
                <input type="hidden" name="status" value={status} />
              </div>
            {/if}

            <!-- Form Actions -->
            <div
              class="form-actions"
              style="display: flex; justify-content: space-between; margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid var(--color-gray-200);"
            >
              <button
                type="button"
                class="btn btn--ghost"
                onclick={prevStep}
                style={step === 1 ? "visibility: hidden;" : ""}
              >
                ← Back
              </button>
              <div style="display: flex; gap: var(--space-3);">
                {#if step === 4}
                  <button
                    type="button"
                    class="btn btn--outline"
                    onclick={() => { status = "draft"; }}
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    class="btn btn--primary"
                    disabled={!step4Valid}
                    onclick={() => { status = "active"; }}
                  >
                    Publish Listing
                  </button>
                {:else}
                  <button
                    type="button"
                    class="btn btn--primary"
                    onclick={nextStep}
                  >
                    Continue →
                  </button>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Tips Card -->
      <div
        class="card mt-6"
        style="background: var(--color-primary-subtle); border: none;"
      >
        <div class="card__body">
          <h4
            style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);"
          >
            <span>💡</span> Tips for a Great Listing
          </h4>
          <ul
            style="font-size: var(--text-sm); color: var(--color-gray-700); display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2);"
          >
            <li
              style="display: flex; align-items: center; gap: var(--space-2);"
            >
              <span style="color: var(--color-primary);">✓</span> Use clear, high-quality
              photos
            </li>
            <li
              style="display: flex; align-items: center; gap: var(--space-2);"
            >
              <span style="color: var(--color-primary);">✓</span> Be honest about
              condition
            </li>
            <li
              style="display: flex; align-items: center; gap: var(--space-2);"
            >
              <span style="color: var(--color-primary);">✓</span> Set a competitive
              price
            </li>
            <li
              style="display: flex; align-items: center; gap: var(--space-2);"
            >
              <span style="color: var(--color-primary);">✓</span> Respond quickly
              to messages
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer footer--compact">
    <div class="container">
      <div class="footer__bottom">
        <div class="flex items-center gap-3">
          <span class="logo__icon">🏪</span>
          <span>&copy; 2025 LocalMarket. All rights reserved.</span>
        </div>
        <nav class="footer__legal-links">
          <a href="/privacy" class="footer__link">Privacy</a>
          <a href="/terms" class="footer__link">Terms</a>
        </nav>
      </div>
    </div>
  </footer>
</div>

<style>
  .listing-type-card--selected {
    border-color: var(--color-primary) !important;
    background: var(--color-primary-subtle) !important;
  }

  .step--active .step__number {
    background: var(--color-primary);
    color: white;
  }

  .step--completed .step__number {
    background: var(--color-success);
    color: white;
  }

  .alert {
    padding: var(--space-4);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
  }

  .alert--error {
    background: rgba(255, 107, 107, 0.1);
    color: var(--color-error);
    border: 1px solid rgba(255, 107, 107, 0.3);
    padding: var(--space-4);
    border-radius: var(--radius-md);
  }

  .form-error {
    font-size: var(--text-sm);
    color: var(--color-error);
    margin-top: var(--space-2);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .form-error::before {
    content: "⚠️";
    font-size: var(--text-base);
  }

  .form-input--error,
  .form-select--error,
  .form-textarea--error {
    border-color: var(--color-error) !important;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1) !important;
  }
</style>
