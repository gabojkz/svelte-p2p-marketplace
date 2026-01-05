<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import CategorySelect from "$lib/components/CategorySelect.svelte";
  import ImageUpload from "$lib/components/ImageUpload.svelte";
  import { goto } from "$app/navigation";
  import { createListing, uploadListingImages } from "$lib/services/listings.js";

  // Get data from server load function
  const { data, userLanguage = "en" } = $props();

  const marketplaceUser = $derived(data?.marketplaceUser);
  const categories = $derived(data?.categories || []);

  // Form state
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
  let locationCity = $state(marketplaceUser?.locationCity || "");
  let locationPostcode = $state(marketplaceUser?.locationPostcode || "");
  let deliveryCollection = $state(true);
  let deliveryLocal = $state(false);
  let deliveryShipping = $state(false);
  let status = $state("draft");
  let featured = $state(false);
  let urgent = $state(false);
  let images = $state([]);

  // Filter categories by type
  const filteredCategories = $derived(
    categories.filter((cat) => cat.type === listingType)
  );

  // Helper functions
  function getFieldError(fieldName) {
    return fieldErrors[fieldName] || null;
  }

  function hasFieldError(fieldName) {
    return !!fieldErrors[fieldName];
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
        urgent: urgent,
      };

      const savedListing = await createListing(listingData);
      const newListingId = savedListing.id;

      // Upload images if any
      if (images.length > 0 && newListingId) {
        try {
          const formData = new FormData();
          images.forEach((img) => {
            if (img.file instanceof File) {
              formData.append("images", img.file);
            }
          });

          if (formData.has("images")) {
            await uploadListingImages(newListingId, formData);
          }
        } catch (imgErr) {
          console.warn("Failed to upload images, but listing was saved", imgErr);
        }
      }

      // Success - redirect to listing details or my-listings
      await goto(`/listing-details/${newListingId}`);
    } catch (err) {
      error = err.message || "Failed to save listing";
      console.error("Error saving listing:", err);
    } finally {
      saving = false;
    }
  }
</script>

<div class="page-wrapper">
  <NavigationBar {userLanguage} />

  <main class="main-content">
    <div class="container listing-editor-container">
      <!-- Page Header -->
      <div class="listing-editor-header">
        <div>
          <h1>Create New Listing</h1>
          <p class="text-muted">Fill in the details below to create your listing</p>
        </div>
        <a href="/my-listings" class="btn btn--ghost">Cancel</a>
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
          <h2 class="form-section__title">Category</h2>
          <div class="form-group">
            <label for="categoryId" class="form-label form-label--required"
              >Category</label
            >
            <select
              id="categoryId"
              name="categoryId"
              class="form-select"
              class:form-select--error={hasFieldError("categoryId")}
              bind:value={categoryId}
              required
            >
              <option value="">Select a category...</option>
              {#if filteredCategories.length > 0}
                {#each filteredCategories.filter((c) => !c.parentId) as category}
                  <option value={category.id}>
                    {category.icon || "📦"} {category.name}
                  </option>
                {/each}
              {/if}
            </select>
            {#if hasFieldError("categoryId")}
              <p class="form-error">{getFieldError("categoryId")}</p>
            {/if}
            {#if categoryId &&
            filteredCategories.some((c) => c.parentId === Number(categoryId))}
              <div class="form-group mt-3">
                <label for="subcategoryId" class="form-label"
                  >Subcategory (optional)</label
                >
                <select
                  id="subcategoryId"
                  name="subcategoryId"
                  class="form-select"
                  bind:value={subcategoryId}
                >
                  <option value="">None</option>
                  {#each filteredCategories.filter(
                    (c) => c.parentId === Number(categoryId)
                  ) as subcategory}
                    <option value={subcategory.id}>
                      {subcategory.icon || "📦"} {subcategory.name}
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
            <div class="input-group">
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
            {saving ? "Creating..." : "Create Listing"}
          </button>
        </div>
      </form>
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

