<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import CategorySelect from "$lib/components/CategorySelect.svelte";
  import ImageUpload from "$lib/components/ImageUpload.svelte";
  import { goto } from "$app/navigation";
  import { createListing, uploadListingImages } from "$lib/services/listings.js";
  import { t } from "$lib/utils/translations.js";

  // Get data from server load function
  const { data } = $props();
  const userLanguage = $derived(data?.userLanguage || 'en');

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
          <h1>{t('listings.create.title', userLanguage)}</h1>
          <p class="text-muted">{t('listings.create.subtitle', userLanguage)}</p>
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
          <h2 class="form-section__title">{t('listings.create.listingType', userLanguage)}</h2>
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
                <span>{t('listings.create.product', userLanguage)}</span>
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
                <span>{t('listings.create.service', userLanguage)}</span>
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
            <label for="categoryId" class="form-label form-label--required"
              >{t('common.category', userLanguage)}</label
            >
            <select
              id="categoryId"
              name="categoryId"
              class="form-select"
              class:form-select--error={hasFieldError("categoryId")}
              bind:value={categoryId}
              required
            >
              <option value="">{t('listings.create.selectCategory', userLanguage)}</option>
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
          <h2 class="form-section__title">{t('listings.create.basicInfo', userLanguage)}</h2>
          <div class="form-group">
            <label for="title" class="form-label form-label--required"
              >{t('listing.title', userLanguage)}</label
            >
            <input
              type="text"
              id="title"
              name="title"
              class="form-input"
              class:form-input--error={hasFieldError("title")}
              placeholder={t('listings.create.titlePlaceholder', userLanguage)}
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
              >{t('listing.description', userLanguage)}</label
            >
            <textarea
              id="description"
              name="description"
              class="form-textarea"
              class:form-textarea--error={hasFieldError("description")}
              rows="6"
              placeholder={t('listings.create.descriptionPlaceholder', userLanguage)}
              bind:value={description}
              required
            ></textarea>
            {#if hasFieldError("description")}
              <p class="form-error">{getFieldError("description")}</p>
            {/if}
          </div>

          <div class="form-group">
            <label class="form-label">{t('listing.images', userLanguage)}</label>
            <ImageUpload bind:images maxImages={10} maxSizeMB={5} />
            <p class="form-helper">
              {t('listings.create.imagesHelper', userLanguage)}
            </p>
          </div>
        </section>

        <!-- Product Details (for products only) -->
        {#if listingType === "product"}
          <section class="form-section">
            <h2 class="form-section__title">{t('listings.create.productDetails', userLanguage)}</h2>
            <div class="form-group">
              <label for="condition" class="form-label form-label--required"
                >{t('listing.condition', userLanguage)}</label
              >
              <select
                id="condition"
                name="condition"
                class="form-select"
                class:form-select--error={hasFieldError("condition")}
                bind:value={condition}
                required
              >
                <option value="">{t('common.select', userLanguage)} {t('listing.condition', userLanguage).toLowerCase()}...</option>
                <option value="new">{t('listing.new', userLanguage)}</option>
                <option value="like-new">{t('listing.likeNew', userLanguage)}</option>
                <option value="good">{t('listing.good', userLanguage)}</option>
                <option value="fair">{t('listing.fair', userLanguage)}</option>
                <option value="parts">{t('listing.forParts', userLanguage)}</option>
              </select>
              {#if hasFieldError("condition")}
                <p class="form-error">{getFieldError("condition")}</p>
              {/if}
            </div>

            <div class="form-group">
              <label for="brand" class="form-label">{t('listingDetails.brand', userLanguage)} ({t('common.optional', userLanguage)})</label>
              <input
                type="text"
                id="brand"
                name="brand"
                class="form-input"
                placeholder={t('listings.create.brandPlaceholder', userLanguage)}
                bind:value={brand}
              />
            </div>
          </section>
        {/if}

        <!-- Pricing -->
        <section class="form-section">
          <h2 class="form-section__title">{t('listings.create.pricing', userLanguage)}</h2>
          <div class="form-group">
            <label for="price" class="form-label form-label--required"
              >{t('listing.price', userLanguage)}</label
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
            <label class="form-label">{t('common.options', userLanguage)}</label>
            <div class="checkbox-group">
              <label class="checkbox">
                <input type="checkbox" bind:checked={acceptsOffers} />
                <span>{t('listings.create.acceptsOffers', userLanguage)}</span>
              </label>
            </div>
          </div>
        </section>

        <!-- Location -->
        <section class="form-section">
          <h2 class="form-section__title">{t('listings.create.location', userLanguage)}</h2>
          <div class="form-row">
            <div class="form-group">
              <label for="locationCity" class="form-label form-label--required"
                >{t('listings.create.city', userLanguage)}</label
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
                >{t('listings.create.postcode', userLanguage)}</label
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
          <h2 class="form-section__title">{t('listings.create.delivery', userLanguage)}</h2>
          <div class="checkbox-group">
            <label class="checkbox">
              <input type="checkbox" bind:checked={deliveryCollection} />
              <span>{t('listings.create.collection', userLanguage)}</span>
            </label>
            <label class="checkbox">
              <input type="checkbox" bind:checked={deliveryLocal} />
              <span>{t('listings.create.localDelivery', userLanguage)}</span>
            </label>
            <label class="checkbox">
              <input type="checkbox" bind:checked={deliveryShipping} />
              <span>{t('listings.create.shipping', userLanguage)}</span>
            </label>
          </div>
        </section>

        <!-- Publishing Options -->
        <section class="form-section">
          <h2 class="form-section__title">{t('listings.create.publishing', userLanguage)}</h2>
          <div class="form-group">
            <label for="status" class="form-label">{t('listings.create.status', userLanguage)}</label>
            <select
              id="status"
              name="status"
              class="form-select"
              bind:value={status}
            >
              <option value="draft">{t('listings.create.draft', userLanguage)} ({t('listings.create.saveForLater', userLanguage)})</option>
              <option value="active">{t('listings.create.publishNow', userLanguage)}</option>
              <option value="paused">{t('listings.create.paused', userLanguage)}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">{t('listings.create.additionalOptions', userLanguage)}</label>
            <div class="checkbox-group">
              <label class="checkbox">
                <input type="checkbox" bind:checked={featured} />
                <span>{t('listings.create.featured', userLanguage)}</span>
              </label>
              <label class="checkbox">
                <input type="checkbox" bind:checked={urgent} />
                <span>{t('listings.create.urgent', userLanguage)}</span>
              </label>
            </div>
          </div>
        </section>

        <!-- Form Actions -->
        <div class="form-actions">
          <a href="/my-listings" class="btn btn--ghost">{t('common.cancel', userLanguage)}</a>
          <button
            type="submit"
            class="btn btn--primary"
            disabled={saving}
          >
            {saving ? t('listings.create.saving', userLanguage) : t('listings.create.save', userLanguage)}
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

