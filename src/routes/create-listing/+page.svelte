<script>
  import Logo from "$lib/components/Logo.svelte";
  import CategorySelect from "$lib/components/CategorySelect.svelte";
  // check if the user is logged in
  import { useSession, signOut } from "$lib/auth-client.js";

  const session = useSession();

  // Derived values for easier access
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data } = $props();

  const categories = $derived(data?.categories || []);

  let step = 1;

  function nextStep() {
    console.log({ step });
    step++;
  }
  function prevStep() {
    step--;
  }
</script>

<div class="page-wrapper">
  <!-- Header -->
  <header class="header">
    <div class="container">
      <div class="header__inner">
        <Logo />

        <nav class="nav" aria-label="Main navigation">
          <a href="marketplace.html" class="nav__link">Browse</a>
          <a href="marketplace.html?category=vehicles" class="nav__link"
            >My Listings</a
          >
        </nav>

        <div class="header__actions">
          <a href="dashboard.html" class="btn btn--ghost">Dashboard</a>
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
        <div class="step step--active">
          <div class="step__number">1</div>
          <div class="step__label">Category</div>
        </div>
        <div class="step">
          <div class="step__number">2</div>
          <div class="step__label">Details</div>
        </div>
        <div class="step">
          <div class="step__number">3</div>
          <div class="step__label">Photos</div>
        </div>
        <div class="step">
          <div class="step__number">4</div>
          <div class="step__label">Location & Price</div>
        </div>
      </div>

      <!-- Form Card -->
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
                    name="listing_type"
                    value="product"
                    checked
                    class="sr-only"
                  />
                  <div
                    class="listing-type-card"
                    style="padding: var(--space-4); border: 2px solid var(--color-primary); border-radius: var(--radius-lg); text-align: center; cursor: pointer; background: var(--color-primary-subtle);"
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
                    name="listing_type"
                    value="service"
                    class="sr-only"
                  />
                  <div
                    class="listing-type-card"
                    style="padding: var(--space-4); border: 2px solid var(--color-gray-200); border-radius: var(--radius-lg); text-align: center; cursor: pointer;"
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

              <!-- Subcategory (appears after category selection) -->
              <div class="form-group mt-6" id="subcategoryWrapper">
                <CategorySelect {categories} />
              </div>
            </div>
          {/if}

          <!-- Step 2: Item Details -->
          {#if step === 2}
            <div class="form-step" id="step2">
              <h3 style="margin-bottom: var(--space-6);">Item Details</h3>

              <div class="form-group">
                <label class="form-label form-label--required">Title</label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="e.g., 2019 BMW 3 Series 320i M Sport"
                  maxlength="100"
                />
                <p class="form-helper">
                  Be specific - include brand, model, size, or colour
                </p>
              </div>

              <div class="form-group">
                <label class="form-label form-label--required"
                  >Description</label
                >
                <textarea
                  class="form-textarea"
                  rows="6"
                  placeholder="Describe your item in detail. Include condition, features, history, and any flaws..."
                ></textarea>
                <p class="form-helper">
                  Detailed descriptions help buyers make decisions faster
                </p>
              </div>

              <div
                style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);"
              >
                <div class="form-group">
                  <label class="form-label form-label--required"
                    >Condition</label
                  >
                  <select class="form-select">
                    <option value="">Select condition...</option>
                    <option value="new">New (Unused, with tags)</option>
                    <option value="like-new">Like New (Excellent)</option>
                    <option value="good">Good (Minor wear)</option>
                    <option value="fair">Fair (Visible wear)</option>
                    <option value="parts">For Parts / Not Working</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Brand (if applicable)</label>
                  <input
                    type="text"
                    class="form-input"
                    placeholder="e.g., BMW, Apple, IKEA"
                  />
                </div>
              </div>

              <!-- Dynamic fields based on category -->
              <div
                class="category-specific-fields"
                style="border-top: 1px solid var(--color-gray-200); padding-top: var(--space-6); margin-top: var(--space-6);"
              >
                <h4 style="margin-bottom: var(--space-4);">Vehicle Details</h4>

                <div
                  style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4);"
                >
                  <div class="form-group">
                    <label class="form-label">Year</label>
                    <input
                      type="number"
                      class="form-input"
                      placeholder="2019"
                      min="1900"
                      max="2025"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Mileage</label>
                    <input
                      type="number"
                      class="form-input"
                      placeholder="45,000"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Fuel Type</label>
                    <select class="form-select">
                      <option value="">Select...</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Transmission</label>
                    <select class="form-select">
                      <option value="">Select...</option>
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Colour</label>
                    <input
                      type="text"
                      class="form-input"
                      placeholder="e.g., Alpine White"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Doors</label>
                    <select class="form-select">
                      <option value="">Select...</option>
                      <option value="2">2 doors</option>
                      <option value="3">3 doors</option>
                      <option value="4">4 doors</option>
                      <option value="5">5 doors</option>
                    </select>
                  </div>
                </div>
              </div>
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
                <strong>Tips:</strong> Use good lighting, capture multiple angles,
                and show any imperfections honestly.
              </p>

              <!-- Photo preview grid -->
              <div
                class="photo-preview-grid"
                style="display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-3); margin-top: var(--space-6);"
              >
                <!-- Preview items will be added here by JS -->
                <div
                  class="photo-preview-placeholder"
                  style="aspect-ratio: 1; border: 2px dashed var(--color-gray-300); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--color-gray-400);"
                >
                  +
                </div>
              </div>
            </div>
          {/if}

          <!-- Step 4: Location & Price -->
          {#if step === 4}
            <div class="form-step hidden" id="step4">
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
                    <label class="form-label form-label--required"
                      >City or Town</label
                    >
                    <input
                      type="text"
                      class="form-input"
                      placeholder="e.g., Newcastle upon Tyne"
                      id="locationCity"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label form-label--required"
                      >Postcode</label
                    >
                    <input
                      type="text"
                      class="form-input"
                      placeholder="e.g., NE1 4ST"
                      id="locationPostcode"
                    />
                  </div>
                </div>

                <!-- Map Preview (placeholder) -->
                <div
                  class="map-preview"
                  style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border-radius: var(--radius-lg); padding: var(--space-8); text-align: center; margin-top: var(--space-4);"
                >
                  <div
                    style="font-size: var(--text-3xl); margin-bottom: var(--space-2);"
                  >
                    🗺️
                  </div>
                  <p class="text-muted">
                    Your approximate location will be shown on the map
                  </p>
                  <p class="text-muted" style="font-size: var(--text-sm);">
                    (Exact address is never shared)
                  </p>
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
                    <label class="form-label form-label--required">Price</label>
                    <div class="input-group">
                      <span
                        style="padding: var(--space-3) var(--space-4); background: var(--color-gray-100); border: 2px solid var(--color-gray-200); border-right: none; border-radius: var(--radius-md) 0 0 var(--radius-md);"
                        >£</span
                      >
                      <input
                        type="number"
                        class="form-input"
                        placeholder="0.00"
                        style="border-radius: 0 var(--radius-md) var(--radius-md) 0;"
                      />
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Price Type</label>
                    <select class="form-select">
                      <option value="fixed">Fixed Price</option>
                      <option value="negotiable">Negotiable</option>
                      <option value="free">Free</option>
                      <option value="swap">Swap / Trade</option>
                    </select>
                  </div>
                </div>

                <div class="form-group mt-4">
                  <label class="form-check">
                    <input type="checkbox" class="form-check-input" />
                    <span class="form-check-label"
                      >Accept offers below asking price</span
                    >
                  </label>
                </div>
              </div>

              <!-- Delivery Options -->
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
                      <input type="checkbox" class="form-check-input" checked />
                      <span class="form-check-label"
                        >Collection only (Buyer picks up)</span
                      >
                    </label>
                    <label class="form-check">
                      <input type="checkbox" class="form-check-input" />
                      <span class="form-check-label"
                        >Local delivery available</span
                      >
                    </label>
                    <label class="form-check">
                      <input type="checkbox" class="form-check-input" />
                      <span class="form-check-label">Nationwide shipping</span>
                    </label>
                  </div>
                </div>
              </div>
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
              id="prevBtn"
              style="visibility: hidden;"
              on:click={prevStep}
            >
              ← Back
            </button>
            <div style="display: flex; gap: var(--space-3);">
              <button type="button" class="btn btn--outline">Save Draft</button>
              <button
                type="button"
                class="btn btn--primary"
                id="nextBtn"
                on:click={nextStep}
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      </div>

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
          <a href="#" class="footer__link">Privacy</a>
          <a href="#" class="footer__link">Terms</a>
        </nav>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Category selection cards */
  .category-select-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-5);
    background: var(--color-white);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .category-select-card:hover {
    border-color: var(--color-primary);
  }

  .category-select-card--selected {
    border-color: var(--color-primary);
    background: var(--color-primary-subtle);
  }

  .category-select-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-2xl);
    margin-bottom: var(--space-3);
  }

  .category-select-label {
    font-weight: var(--font-medium);
    color: var(--color-gray-700);
  }
</style>
