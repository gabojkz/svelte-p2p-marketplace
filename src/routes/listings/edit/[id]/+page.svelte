<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import CategorySelect from "$lib/components/CategorySelect.svelte";
  import ImageUpload from "$lib/components/ImageUpload.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { updateListing, uploadListingImages } from "$lib/services/listings.js";
  import { t } from "$lib/utils/translations.js";
  import { translateCategoryName } from "$lib/utils/category-translations.js";

  // Get data from server load function
  const { data } = $props();
  const userLanguage = $derived(data?.userLanguage || 'en');

  const marketplaceUser = $derived(data?.marketplaceUser);
  const categories = $derived(data?.categories || []);
  const listing = $derived(data?.listing);

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
  /** @type {Array<{id?: number, imageUrl: string, thumbnailUrl?: string, displayOrder?: number, isPrimary?: boolean}>} */
  let images = $state([]);

  // Filter categories by type
  const filteredCategories = $derived(
    categories.filter((cat) => cat.type === listingType)
  );

  // Load listing data
  $effect(() => {
    if (listing) {
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

      // Load existing images
      if (listing.images && Array.isArray(listing.images)) {
        images = listing.images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          thumbnailUrl: img.thumbnailUrl || img.imageUrl,
          displayOrder: img.displayOrder || 0,
          isPrimary: img.isPrimary || false,
        }));
      } else {
        images = [];
      }
    }
  });

  // Helper functions
  /** @param {string} fieldName */
  function getFieldError(fieldName) {
    return fieldErrors[fieldName] || null;
  }

  /** @param {string} fieldName */
  function hasFieldError(fieldName) {
    return !!fieldErrors[fieldName];
  }

  // Handle form submission
  async function handleSubmit() {
    if (!listing?.id) return;

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
        urgent: urgent,
      };

      await updateListing(listing.id, listingData);

      // Upload new images if any
      if (images.length > 0) {
        try {
          const formData = new FormData();
          images.forEach((img) => {
            if (img.file instanceof File) {
              formData.append("images", img.file);
            }
          });

          if (formData.has("images")) {
            await uploadListingImages(listing.id, formData);
          }
        } catch (imgErr) {
          console.warn("Failed to upload images, but listing was updated", imgErr);
        }
      }

      // Success - redirect to listing details
      await goto(`/listing-details/${listing.id}`);
    } catch (err) {
      error = (err instanceof Error ? err.message : "Failed to update listing") || "Failed to update listing";
      console.error("Error updating listing:", err);
    } finally {
      saving = false;
    }
  }
</script>

<div class="page-wrapper">
  <NavigationBar {userLanguage} />

  <main class="main-content">
    <div class="container listing-editor-container">
      {#if !listing}
        <div class="error-state">
          <h1>Listing not found</h1>
          <p>The listing you're trying to edit doesn't exist or you don't have permission to edit it.</p>
          <a href="/my-listings" class="btn btn--primary">Back to My Listings</a>
        </div>
      {:else}
        <!-- Page Header -->
        <div class="listing-editor-header">
          <div>
            <h1>{t('listings.edit.title', userLanguage)}</h1>
            <p class="text-muted">{t('listings.edit.subtitle', userLanguage)}</p>
          </div>
          <a href="/my-listings" class="btn btn--ghost">{t('common.cancel', userLanguage)}</a>
        </div>

        <!-- Error Message -->
        {#if error}
          <div class="alert alert--error mb-4">
            <strong>⚠️ {error}</strong>
            {#if Object.keys(fieldErrors).length > 0}
              <ul class="error-list">
                {#each Object.entries(fieldErrors) as [field, message]}
                  <li>{message}</li>
                {/each}
              </ul>
            {/if}
          </div>
        {/if}

        <!-- Form -->
        <form
          class="listing-editor-form"
          onsubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <!-- Listing Type -->
          <section class="form-section">
            <h2 class="form-section__title">Listing Type</h2>
            <div class="listing-type-toggle">
              <label class="listing-type-option">
                <input
                  type="radio"
                  name="type"
                  value="product"
                  bind:group={listingType}
                />
                <div
                  class="listing-type-card"
                  class:listing-type-card--selected={listingType === "product"}
                >
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
                <div
                  class="listing-type-card"
                  class:listing-type-card--selected={listingType === "service"}
                >
                  <span class="listing-type-icon">🔧</span>
                  <span>Service</span>
                </div>
              </label>
            </div>
            {#if hasFieldError("type")}
              <p class="form-error">{getFieldError("type")}</p>
            {/if}
          </section>

          <!-- Category -->
          <section class="form-section">
            <h2 class="form-section__title">{t('common.category', userLanguage)}</h2>
            <div class="form-group">
              <CategorySelect
                categories={/** @type {any} */ (filteredCategories)}
                selectedValue={categoryId ? Number(categoryId) : ""}
                id="categoryId"
                label={t('common.category', userLanguage)}
                showLabel={true}
                required={true}
                mode="form"
                filterByType={listingType === 'product' || listingType === 'service' ? listingType : null}
                userLanguage={userLanguage}
                onChange={(value) => {
                  categoryId = value ? value.toString() : "";
                  subcategoryId = ""; // Reset subcategory when main category changes
                }}
              />
              {#if hasFieldError("categoryId")}
                <p class="form-error">{getFieldError("categoryId")}</p>
              {/if}
              {#if categoryId &&
              filteredCategories.some((c) => c.parentId === Number(categoryId))}
                <div class="form-group mt-3">
                  <label for="subcategoryId" class="form-label"
                    >{t('listings.create.subcategoryOptional', userLanguage)}</label
                  >
                  <select
                    id="subcategoryId"
                    name="subcategoryId"
                    class="form-select"
                    bind:value={subcategoryId}
                  >
                    <option value="">{t('listings.create.none', userLanguage)}</option>
                    {#each filteredCategories.filter(
                      (c) => c.parentId === Number(categoryId)
                    ) as subcategory}
                      <option value={subcategory.id}>
                        {subcategory.icon || "📦"} {translateCategoryName(subcategory, userLanguage)}
                      </option>
                    {/each}
                  </select>
                </div>
              {/if}
            </div>
          </section>

          <!-- Basic Information -->
          <section class="form-section">
            <h2 class="form-section__title">Basic Information</h2>
            <div class="form-group">
              <label for="title" class="form-label form-label--required"
                >Title</label
              >
              <input
                type="text"
                id="title"
                name="title"
                class="form-input"
                class:form-input--error={hasFieldError("title")}
                placeholder="e.g., 2019 BMW 3 Series 320i M Sport"
                maxlength="200"
                bind:value={title}
                required
              />
              {#if hasFieldError("title")}
                <p class="form-error">{getFieldError("title")}</p>
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
                class:form-textarea--error={hasFieldError("description")}
                rows="6"
                placeholder="Describe your item in detail..."
                bind:value={description}
                required
              ></textarea>
              {#if hasFieldError("description")}
                <p class="form-error">{getFieldError("description")}</p>
              {/if}
            </div>

            <div class="form-group">
              <label class="form-label">Images</label>
              <ImageUpload bind:images maxImages={10} maxSizeMB={5} />
              <p class="form-helper">
                Add up to 10 images. The first image will be set as the primary
                image.
              </p>
            </div>
          </section>

          <!-- Product Details (for products only) -->
          {#if listingType === "product"}
            <section class="form-section">
              <h2 class="form-section__title">Product Details</h2>
              <div class="form-group">
                <label for="condition" class="form-label form-label--required"
                  >Condition</label
                >
                <select
                  id="condition"
                  name="condition"
                  class="form-select"
                  class:form-select--error={hasFieldError("condition")}
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
                {#if hasFieldError("condition")}
                  <p class="form-error">{getFieldError("condition")}</p>
                {/if}
              </div>

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
            </section>
          {/if}

          <!-- Pricing -->
          <section class="form-section">
            <h2 class="form-section__title">Pricing</h2>
            <div class="form-group">
              <label for="price" class="form-label form-label--required"
                >Price</label
              >
              <div class="input-group" class:input-group--error={hasFieldError("price")}>
                <span class="input-group__prefix">£</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  class="form-input"
                  class:form-input--error={hasFieldError("price")}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  bind:value={price}
                  required
                />
              </div>
              {#if hasFieldError("price")}
                <p class="form-error">{getFieldError("price")}</p>
              {/if}
            </div>

            <div class="form-group">
              <label class="form-label">Options</label>
              <div class="checkbox-group">
                <label class="checkbox">
                  <input type="checkbox" bind:checked={acceptsOffers} />
                  <span>Accept offers</span>
                </label>
              </div>
            </div>
          </section>

          <!-- Location -->
          <section class="form-section">
            <h2 class="form-section__title">Location</h2>
            <div class="form-row">
              <div class="form-group">
                <label for="locationCity" class="form-label form-label--required"
                  >City</label
                >
                <input
                  type="text"
                  id="locationCity"
                  name="locationCity"
                  class="form-input"
                  class:form-input--error={hasFieldError("locationCity")}
                  placeholder="e.g., Newcastle upon Tyne"
                  bind:value={locationCity}
                  required
                />
                {#if hasFieldError("locationCity")}
                  <p class="form-error">{getFieldError("locationCity")}</p>
                {/if}
              </div>
              <div class="form-group">
                <label
                  for="locationPostcode"
                  class="form-label form-label--required"
                  >Postcode</label
                >
                <input
                  type="text"
                  id="locationPostcode"
                  name="locationPostcode"
                  class="form-input"
                  class:form-input--error={hasFieldError("locationPostcode")}
                  placeholder="e.g., NE1 4ST"
                  bind:value={locationPostcode}
                  required
                />
                {#if hasFieldError("locationPostcode")}
                  <p class="form-error">{getFieldError("locationPostcode")}</p>
                {/if}
              </div>
            </div>
          </section>

          <!-- Delivery Options -->
          <section class="form-section">
            <h2 class="form-section__title">Delivery Options</h2>
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
          </section>

          <!-- Publishing Options -->
          <section class="form-section">
            <h2 class="form-section__title">Publishing Options</h2>
            <div class="form-group">
              <label for="status" class="form-label">Status</label>
              <select
                id="status"
                name="status"
                class="form-select"
                bind:value={status}
              >
                <option value="draft">Draft (Save for later)</option>
                <option value="active">Publish Now</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Additional Options</label>
              <div class="checkbox-group">
                <label class="checkbox">
                  <input type="checkbox" bind:checked={featured} />
                  <span>Featured Listing</span>
                </label>
                <label class="checkbox">
                  <input type="checkbox" bind:checked={urgent} />
                  <span>Urgent</span>
                </label>
              </div>
            </div>
          </section>

          <!-- Form Actions -->
          <div class="form-actions">
            <a href="/my-listings" class="btn btn--ghost">Cancel</a>
            <button
              type="submit"
              class="btn btn--primary"
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Listing"}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </main>
</div>

<style>
  .listing-editor-container {
    max-width: 900px;
    padding: var(--space-6) var(--space-4);
  }

  .listing-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-8);
    gap: var(--space-4);
  }

  .listing-editor-header h1 {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
  }

  .listing-editor-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .form-section {
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
  }

  .form-section__title {
    font-size: var(--text-xl);
    margin-bottom: var(--space-6);
    color: var(--color-gray-900);
  }

  .listing-type-toggle {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .listing-type-option {
    cursor: pointer;
  }

  .listing-type-option input {
    display: none;
  }

  .listing-type-card {
    padding: var(--space-6);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    text-align: center;
    transition: all var(--transition-fast);
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
    font-size: var(--text-3xl);
    display: block;
    margin-bottom: var(--space-2);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  .input-group {
    display: flex;
    align-items: stretch;
    position: relative;
    gap: 0 !important; /* Override global gap to eliminate whitespace */
  }

  .input-group__prefix {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-3) var(--space-4);
    background: var(--color-gray-100);
    border: 2px solid var(--color-gray-200);
    border-right: none; /* Remove right border so input's left border connects */
    border-radius: var(--radius-md) 0 0 var(--radius-md);
    font-weight: var(--font-medium);
    line-height: 1;
    min-height: 48px; /* Match form-input height */
    box-sizing: border-box;
    flex-shrink: 0;
    transition: border-color var(--transition-fast);
    z-index: 1;
  }

  .input-group .form-input {
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    border-left: 2px solid var(--color-gray-200); /* Restore left border now that gap is 0 */
    flex: 1;
    min-height: 48px;
    box-sizing: border-box;
    transition: border-color var(--transition-fast);
  }

  /* Ensure seamless connection on focus */
  .input-group:focus-within .input-group__prefix {
    border-color: var(--color-primary);
    border-right: none;
    z-index: 2;
  }

  .input-group:focus-within .form-input {
    border-left-color: var(--color-primary);
    border-color: var(--color-primary);
    z-index: 1;
  }

  /* Error state */
  .input-group--error .input-group__prefix {
    border-color: var(--color-error);
    border-right: none;
    z-index: 2;
  }

  .input-group--error .form-input {
    border-left-color: var(--color-error);
    border-color: var(--color-error);
    z-index: 1;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
  }

  .checkbox input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-gray-200);
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

  .error-list {
    margin-top: var(--space-2);
    margin-left: var(--space-5);
    list-style: disc;
  }

  .error-state {
    text-align: center;
    padding: var(--space-12);
  }

  /* Responsive Styles */
  @media (max-width: 768px) {
    .listing-editor-container {
      padding: var(--space-4) var(--space-3);
    }

    .listing-editor-header {
      flex-direction: column;
      align-items: stretch;
    }

    .listing-editor-header h1 {
      font-size: var(--text-2xl);
    }

    .form-section {
      padding: var(--space-4);
    }

    .form-section__title {
      font-size: var(--text-lg);
      margin-bottom: var(--space-4);
    }

    .listing-type-toggle {
      grid-template-columns: 1fr;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column-reverse;
    }

    .form-actions .btn {
      width: 100%;
    }
  }
</style>

