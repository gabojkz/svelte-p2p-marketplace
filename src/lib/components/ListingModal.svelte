<script>
  import CategorySelect from "$lib/components/CategorySelect.svelte";
  import ImageUpload from "$lib/components/ImageUpload.svelte";
  import { onMount } from "svelte";

  // Props
  let { 
    open = $bindable(false),
    listingId = $bindable(null),
    categories = [],
    marketplaceUser = null,
    onSave = null
  } = $props();

  // Debug: Track open prop changes
  $effect(() => {
    console.log("🎯 ListingModal - open prop changed to:", open);
    console.log("🎯 ListingModal - listingId prop:", listingId);
  });

  // Form state
  let loading = $state(false);
  let saving = $state(false);
  let error = $state(null);
  let fieldErrors = $state({});

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
  let featured = $state(false);
  let urgent = $state(false);
  let images = $state([]);

  // Filter categories by type
  const filteredCategories = $derived(
    categories.filter((/** @type {any} */ cat) => cat.type === listingType)
  );

  // Check if editing
  const isEditing = $derived(!!listingId);

  // Load listing data when editing
  async function loadListing() {
    console.log("📋 loadListing called with listingId:", listingId);
    if (!listingId) {
      console.log("📋 No listingId, resetting form");
      resetForm();
      return;
    }

    console.log("📋 Loading listing data...");
    loading = true;
    error = null;
    fieldErrors = {};

    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load listing");
      }

      const data = await response.json();
      const listing = data.listing;
      console.log("📋 Listing loaded:", listing);

      // Populate form with listing data
      listingType = listing.type || "product";
      categoryId = listing.categoryId?.toString() || "";
      subcategoryId = listing.subcategoryId?.toString() || "";
      title = listing.title || "";
      description = listing.description || "";
      condition = listing.condition || "";
      brand = listing.brand || "";
      price = listing.price || "";
      priceType = listing.priceType || "fixed";
      acceptsOffers = listing.acceptsOffers || false;
      locationCity = listing.locationCity || "";
      locationPostcode = listing.locationPostcode || "";
      deliveryCollection = listing.deliveryCollection !== false;
      deliveryLocal = listing.deliveryLocal === true;
      deliveryShipping = listing.deliveryShipping === true;
      status = listing.status || "draft";
      featured = listing.featured || false;
      urgent = listing.urgent || false;

      // Load existing images if available
      if (listing.images && Array.isArray(listing.images)) {
        images = listing.images.map(img => ({
          id: img.id,
          imageUrl: img.imageUrl,
          thumbnailUrl: img.thumbnailUrl || img.imageUrl,
          displayOrder: img.displayOrder || 0,
          isPrimary: img.isPrimary || false
        }));
      } else {
        images = [];
      }
    } catch (err) {
      error = err.message || "Failed to load listing";
      console.error("Error loading listing:", err);
    } finally {
      loading = false;
    }
  }

  // Reset form to defaults
  function resetForm() {
    listingType = "product";
    categoryId = "";
    subcategoryId = "";
    title = "";
    description = "";
    condition = "";
    brand = "";
    price = "";
    priceType = "fixed";
    acceptsOffers = false;
    locationCity = marketplaceUser?.locationCity || "";
    locationPostcode = marketplaceUser?.locationPostcode || "";
    deliveryCollection = true;
    deliveryLocal = false;
    deliveryShipping = false;
    status = "draft";
    featured = false;
    urgent = false;
    images = [];
    error = null;
    fieldErrors = {};
  }

  // Close modal
  function closeModal() {
    console.log("🔴 closeModal called");
    open = false;
    listingId = null;
    resetForm();
    console.log("🔴 Modal closed, open =", open);
  }

  // Handle form submission
  async function handleSubmit() {
    saving = true;
    error = null;
    fieldErrors = {};

    try {
      const listingData = {
        categoryId: Number(categoryId),
        subcategoryId: subcategoryId ? Number(subcategoryId) : null,
        type: listingType,
        title: title.trim(),
        description: description.trim(),
        condition: condition || null,
        brand: brand.trim() || null,
        price: price,
        priceType: priceType,
        acceptsOffers: acceptsOffers,
        locationCity: locationCity.trim(),
        locationPostcode: locationPostcode.trim(),
        deliveryCollection: deliveryCollection,
        deliveryLocal: deliveryLocal,
        deliveryShipping: deliveryShipping,
        status: status,
        featured: featured,
        urgent: urgent
      };

      let response;
      if (isEditing) {
        response = await fetch(`/api/listings/${listingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(listingData)
        });
      } else {
        response = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(listingData)
        });
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error("Failed to parse server response");
      }

      if (!response.ok) {
        // Handle error response
        if (result.fieldErrors) {
          fieldErrors = result.fieldErrors;
        }
        throw new Error(result.error || "Failed to save listing");
      }

      const savedListing = result.listing || result;
      const newListingId = savedListing.id || listingId;

      // Upload images if any
      if (images.length > 0 && newListingId) {
        try {
          // Create FormData for file uploads
          const formData = new FormData();
          
          // Add files to FormData
          images.forEach(img => {
            if (img.file instanceof File) {
              formData.append('images', img.file);
            }
          });

          if (formData.has('images')) {
            const imageResponse = await fetch(`/api/listings/${newListingId}/images`, {
              method: "POST",
              // Don't set Content-Type header - browser will set it with boundary for FormData
              body: formData
            });

          if (!imageResponse.ok) {
            console.warn("Failed to upload images, but listing was saved");
          }
        } catch (imgErr) {
          console.error("Error uploading images:", imgErr);
          // Don't fail the whole operation if images fail
        }
      }

      // Success - close modal and call callback
      closeModal();
      if (onSave) {
        onSave(savedListing);
      }
    } catch (err) {
      error = err.message || "Failed to save listing";
      console.error("Error saving listing:", err);
    } finally {
      saving = false;
    }
  }

  // Helper functions
  function getFieldError(fieldName) {
    return fieldErrors[fieldName] || null;
  }

  function hasFieldError(fieldName) {
    return !!fieldErrors[fieldName];
  }

  // Load listing when modal opens with ID
  $effect(() => {
    console.log("⚡ Modal effect triggered - open:", open, "listingId:", listingId);
    if (open) {
      console.log("⚡ Modal is open, loading data...");
      if (listingId) {
        loadListing();
      } else {
        console.log("⚡ No listingId, resetting form");
        resetForm();
      }
    } else {
      console.log("⚡ Modal is closed");
    }
  });

  // Auto-populate location from user profile
  $effect(() => {
    if (marketplaceUser && !locationCity && !locationPostcode && !isEditing) {
      locationCity = marketplaceUser.locationCity || "";
      locationPostcode = marketplaceUser.locationPostcode || "";
    }
  });
</script>

{#if open}
  <!-- Modal Backdrop -->
  <div 
    class="modal-backdrop is-active" 
    onclick={closeModal} 
    onkeydown={(e) => e.key === "Escape" && closeModal()} 
    role="button" 
    tabindex="0" 
    aria-label="Close modal"
    style="display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 1000 !important;"
  ></div>

  <!-- Modal -->
  <div 
    class="modal is-active" 
    role="dialog" 
    aria-labelledby="modal-title" 
    aria-modal="true" 
    onclick={(e) => e.stopPropagation()}
    style="display: flex !important; visibility: visible !important; opacity: 1 !important; z-index: 1001 !important;"
  >
    <div class="modal__header">
      <h2 id="modal-title">{isEditing ? "Edit Listing" : "Create New Listing"}</h2>
      <button class="modal__close" onclick={closeModal} type="button" aria-label="Close">
        ×
      </button>
    </div>

    <div class="modal__body">
      {#if loading}
        <div class="modal-loading">
          <p>Loading listing...</p>
        </div>
      {:else}
        <!-- Error Message -->
        {#if error}
          <div class="alert alert--error mb-4">
            <strong>⚠️ {error}</strong>
            {#if Object.keys(fieldErrors).length > 0}
              <ul style="margin-top: var(--space-2); margin-left: var(--space-5); list-style: disc;">
                {#each Object.entries(fieldErrors) as [field, message]}
                  <li>{message}</li>
                {/each}
              </ul>
            {/if}
          </div>
        {/if}

        <!-- Form -->
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <!-- Listing Type -->
          <div class="form-group">
            <label class="form-label form-label--required">Listing Type</label>
            <div class="listing-type-toggle">
              <label class="listing-type-option">
                <input
                  type="radio"
                  name="type"
                  value="product"
                  bind:group={listingType}
                />
                <div class="listing-type-card" class:listing-type-card--selected={listingType === "product"}>
                  <span class="listing-type-icon">📦</span>
                  <span>Product</span>
                </div>
              </label>
              <label class="listing-type-option">
                <input
                  type="radio"
                  name="type"
                  value="service"
                  bind:group={listingType}
                />
                <div class="listing-type-card" class:listing-type-card--selected={listingType === "service"}>
                  <span class="listing-type-icon">🔧</span>
                  <span>Service</span>
                </div>
              </label>
            </div>
            {#if hasFieldError('type')}
              <p class="form-error">{getFieldError('type')}</p>
            {/if}
          </div>

          <!-- Category -->
          <div class="form-group">
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
              <div class="form-group mt-3">
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

          <!-- Title -->
          <div class="form-group">
            <label for="title" class="form-label form-label--required">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              class="form-input"
              class:form-input--error={hasFieldError('title')}
              placeholder="e.g., 2019 BMW 3 Series 320i M Sport"
              maxlength="200"
              bind:value={title}
              required
            />
            {#if hasFieldError('title')}
              <p class="form-error">{getFieldError('title')}</p>
            {/if}
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description" class="form-label form-label--required">Description</label>
            <textarea
              id="description"
              name="description"
              class="form-textarea"
              class:form-textarea--error={hasFieldError('description')}
              rows="4"
              placeholder="Describe your item in detail..."
              bind:value={description}
              required
            ></textarea>
            {#if hasFieldError('description')}
              <p class="form-error">{getFieldError('description')}</p>
            {/if}
          </div>

          <!-- Images -->
          <div class="form-group">
            <label class="form-label">Images</label>
            <ImageUpload bind:images={images} maxImages={10} maxSizeMB={5} />
            <p style="font-size: var(--text-sm); color: var(--color-gray-600); margin-top: var(--space-2);">Add up to 10 images. The first image will be set as the primary image.</p>
          </div>

          <!-- Condition (for products) -->
          {#if listingType === "product"}
            <div class="form-group">
              <label for="condition" class="form-label form-label--required">Condition</label>
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
          {/if}

          <!-- Brand (optional) -->
          <div class="form-group">
            <label for="brand" class="form-label">Brand (optional)</label>
            <input
              type="text"
              id="brand"
              name="brand"
              class="form-input"
              placeholder="e.g., Apple, Samsung, BMW"
              bind:value={brand}
            />
          </div>

          <!-- Price -->
          <div class="form-group">
            <label for="price" class="form-label form-label--required">Price</label>
            <div class="input-group">
              <span class="input-group__prefix">£</span>
              <input
                type="number"
                id="price"
                name="price"
                class="form-input"
                class:form-input--error={hasFieldError('price')}
                placeholder="0.00"
                min="0"
                step="0.01"
                bind:value={price}
                required
              />
            </div>
            {#if hasFieldError('price')}
              <p class="form-error">{getFieldError('price')}</p>
            {/if}
          </div>

          <!-- Location -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
            <div class="form-group">
              <label for="locationCity" class="form-label form-label--required">City</label>
              <input
                type="text"
                id="locationCity"
                name="locationCity"
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
              <label for="locationPostcode" class="form-label form-label--required">Postcode</label>
              <input
                type="text"
                id="locationPostcode"
                name="locationPostcode"
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

          <!-- Status -->
          <div class="form-group">
            <label for="status" class="form-label">Status</label>
            <select id="status" name="status" class="form-select" bind:value={status}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <!-- Options -->
          <div class="form-group">
            <label class="form-label">Options</label>
            <div class="checkbox-group">
              <label class="checkbox">
                <input type="checkbox" bind:checked={acceptsOffers} />
                <span>Accept offers</span>
              </label>
              <label class="checkbox">
                <input type="checkbox" bind:checked={featured} />
                <span>Featured</span>
              </label>
              <label class="checkbox">
                <input type="checkbox" bind:checked={urgent} />
                <span>Urgent</span>
              </label>
            </div>
          </div>

          <!-- Delivery Options -->
          <div class="form-group">
            <label class="form-label">Delivery Options</label>
            <div class="checkbox-group">
              <label class="checkbox">
                <input type="checkbox" bind:checked={deliveryCollection} />
                <span>Collection</span>
              </label>
              <label class="checkbox">
                <input type="checkbox" bind:checked={deliveryLocal} />
                <span>Local Delivery</span>
              </label>
              <label class="checkbox">
                <input type="checkbox" bind:checked={deliveryShipping} />
                <span>Shipping</span>
              </label>
            </div>
          </div>
        </form>
      {/if}
    </div>

    <div class="modal__footer">
      <button class="btn btn--ghost" onclick={closeModal} type="button" disabled={saving}>
        Cancel
      </button>
      <button
        class="btn btn--primary"
        onclick={handleSubmit}
        type="button"
        disabled={loading || saving}
      >
        {saving ? "Saving..." : isEditing ? "Update Listing" : "Create Listing"}
      </button>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: var(--z-modal-backdrop, 1000);
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: var(--z-modal, 1001);
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-6);
    border-bottom: 1px solid var(--color-gray-200);
  }

  .modal__header h2 {
    font-size: var(--text-xl);
    margin: 0;
  }

  .modal__close {
    background: transparent;
    border: none;
    font-size: var(--text-3xl);
    color: var(--color-gray-500);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    transition: all 0.2s;
  }

  .modal__close:hover {
    background: var(--color-gray-100);
    color: var(--color-gray-900);
  }

  .modal__body {
    padding: var(--space-6);
    overflow-y: auto;
    flex: 1;
  }

  .modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-6);
    border-top: 1px solid var(--color-gray-200);
  }

  .modal-loading {
    text-align: center;
    padding: var(--space-8);
    color: var(--color-gray-500);
  }

  .listing-type-toggle {
    display: flex;
    gap: var(--space-4);
  }

  .listing-type-option {
    flex: 1;
    cursor: pointer;
  }

  .listing-type-option input {
    display: none;
  }

  .listing-type-card {
    padding: var(--space-4);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    text-align: center;
    transition: all 0.2s;
    cursor: pointer;
  }

  .listing-type-card:hover {
    border-color: var(--color-primary);
  }

  .listing-type-card--selected {
    border-color: var(--color-primary);
    background: var(--color-primary-subtle);
  }

  .listing-type-icon {
    font-size: var(--text-2xl);
    display: block;
    margin-bottom: var(--space-2);
  }

  .input-group {
    display: flex;
  }

  .input-group__prefix {
    padding: var(--space-3) var(--space-4);
    background: var(--color-gray-100);
    border: 2px solid var(--color-gray-200);
    border-right: none;
    border-radius: var(--radius-md) 0 0 var(--radius-md);
    font-weight: var(--font-medium);
  }

  .input-group .form-input {
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
  }

  .checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .form-error {
    font-size: var(--text-sm);
    color: var(--color-error);
    margin-top: var(--space-2);
  }

  .form-input--error,
  .form-select--error,
  .form-textarea--error {
    border-color: var(--color-error) !important;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1) !important;
  }

  @media (max-width: 768px) {
    .modal {
      width: 95%;
      max-height: 95vh;
    }

    .modal__body {
      padding: var(--space-4);
    }
  }
</style>

