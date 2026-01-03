<script>
  import { onMount } from 'svelte';

  const { images, title, listingType, featured, urgent, onFavoriteToggle, isFavorite, showFavoriteButton } = $props();

  let currentIndex = $state(0);
  let galleryContainer;
  let isDragging = $state(false);
  let startX = $state(0);
  let scrollLeft = $state(0);
  let loadedImages = $state(new Set());

  // Initialize with first image loaded
  $effect(() => {
    if (images && images.length > 0) {
      loadedImages.add(0);
    }
  });

  // Lazy load images
  function loadImage(index) {
    if (images && !loadedImages.has(index) && images[index]) {
      loadedImages.add(index);
    }
  }

  // Preload adjacent images
  function preloadAdjacentImages() {
    if (images && images.length > 0) {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      loadImage(prevIndex);
      loadImage(nextIndex);
    }
  }

  $effect(() => {
    if (images && images.length > 0) {
      loadImage(currentIndex);
      preloadAdjacentImages();
    }
  });

  // Navigate to specific image
  function goToImage(index) {
    if (index >= 0 && index < images.length) {
      currentIndex = index;
      loadImage(index);
      preloadAdjacentImages();
    }
  }

  // Navigate to next image
  function nextImage() {
    if (images && images.length > 0) {
      const next = (currentIndex + 1) % images.length;
      goToImage(next);
    }
  }

  // Navigate to previous image
  function prevImage() {
    if (images && images.length > 0) {
      const prev = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      goToImage(prev);
    }
  }

  // Keyboard navigation
  function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      prevImage();
    } else if (event.key === 'ArrowRight') {
      nextImage();
    }
  }

  // Touch/swipe handlers for mobile
  function handleTouchStart(e) {
    isDragging = true;
    startX = e.touches[0].pageX - galleryContainer.offsetLeft;
    scrollLeft = galleryContainer.scrollLeft;
  }

  function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - galleryContainer.offsetLeft;
    const walk = (x - startX) * 2;
    galleryContainer.scrollLeft = scrollLeft - walk;
  }

  function handleTouchEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    
    const endX = e.changedTouches[0].pageX;
    const diff = startX - endX;
    
    // Swipe threshold
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
  }

  // Mouse drag handlers for desktop
  function handleMouseDown(e) {
    isDragging = true;
    startX = e.pageX - galleryContainer.offsetLeft;
    scrollLeft = galleryContainer.scrollLeft;
    galleryContainer.style.cursor = 'grabbing';
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - galleryContainer.offsetLeft;
    const walk = (x - startX) * 2;
    galleryContainer.scrollLeft = scrollLeft - walk;
  }

  function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    if (galleryContainer) {
      galleryContainer.style.cursor = 'grab';
    }
  }

  // Get high quality image URL
  function getImageUrl(image, useHighQuality = false) {
    if (!image) return '';
    // Use full image URL for main display, thumbnail for thumbnails
    return useHighQuality ? image.imageUrl : (image.thumbnailUrl || image.imageUrl);
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<div class="image-gallery">
  <!-- Main Image Display -->
  <div 
    class="gallery-main"
    bind:this={galleryContainer}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
  >
    {#if images && images.length > 0}
      {#each images as image, index}
        <div 
          class="gallery-slide"
          class:active={currentIndex === index}
        >
          {#if loadedImages.has(index)}
            <img
              src={getImageUrl(image, true)}
              alt="{title} - Image {index + 1}"
              loading={index === 0 ? 'eager' : 'lazy'}
              class="gallery-image"
            />
          {:else}
            <div class="gallery-placeholder">
              <div class="spinner"></div>
            </div>
          {/if}
        </div>
      {/each}
    {:else}
      <!-- Placeholder when no images -->
      <div class="gallery-placeholder gallery-placeholder--empty">
        <div class="placeholder-icon">
          {#if listingType === "product"}
            📦
          {:else}
            🔧
          {/if}
        </div>
        <p>No images available</p>
      </div>
    {/if}

    <!-- Navigation Arrows -->
    {#if images && images.length > 1}
      <button
        class="gallery-nav gallery-nav--prev"
        onclick={prevImage}
        type="button"
        aria-label="Previous image"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        class="gallery-nav gallery-nav--next"
        onclick={nextImage}
        type="button"
        aria-label="Next image"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    {/if}

    <!-- Image Counter -->
    {#if images && images.length > 1}
      <div class="gallery-counter">
        {currentIndex + 1} / {images.length}
      </div>
    {/if}

    <!-- Badges -->
    {#if featured}
      <span class="listing-card__badge listing-card__badge--featured">
        Featured
      </span>
    {/if}
    {#if urgent}
      <span 
        class="listing-card__badge listing-card__badge--urgent"
        style={featured ? 'left: calc(var(--space-4) + 100px);' : ''}
      >
        Urgent
      </span>
    {/if}

    <!-- Favorite Button -->
    {#if showFavoriteButton && onFavoriteToggle}
      <button
        class="gallery-favorite"
        onclick={onFavoriteToggle}
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? "❤️" : "♡"}
        <span class="gallery-favorite__text">{isFavorite ? "Saved" : "Save"}</span>
      </button>
    {/if}
  </div>

  <!-- Thumbnail Navigation -->
  {#if images && images.length > 1}
    <div class="gallery-thumbnails">
      {#each images as image, index}
        <button
          class="gallery-thumbnail"
          class:active={currentIndex === index}
          onclick={() => goToImage(index)}
          type="button"
          aria-label="View image {index + 1}"
        >
          {#if loadedImages.has(index)}
            <img
              src={getImageUrl(image, false)}
              alt="Thumbnail {index + 1}"
              loading="lazy"
              class="gallery-thumbnail__image"
            />
          {:else}
            <div class="gallery-thumbnail__placeholder"></div>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .image-gallery {
    width: 100%;
    margin-bottom: var(--space-6);
  }

  .gallery-main {
    position: relative;
    width: 100%;
    height: 500px;
    background: var(--color-gray-100);
    border-radius: var(--radius-xl);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    user-select: none;
    touch-action: pan-y;
  }

  .gallery-main:active {
    cursor: grabbing;
  }

  .gallery-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gallery-slide.active {
    opacity: 1;
    z-index: 1;
  }

  .gallery-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: var(--color-gray-50);
    display: block;
  }

  .gallery-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-gray-100);
  }

  .gallery-placeholder--empty {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .placeholder-icon {
    font-size: 6rem;
    margin-bottom: var(--space-4);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-gray-200);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .gallery-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
    color: var(--color-gray-700);
    box-shadow: var(--shadow-md);
  }

  .gallery-nav:hover {
    background: var(--color-white);
    color: var(--color-primary);
    transform: translateY(-50%) scale(1.1);
    box-shadow: var(--shadow-lg);
  }

  .gallery-nav--prev {
    left: var(--space-4);
  }

  .gallery-nav--next {
    right: var(--space-4);
  }

  .gallery-counter {
    position: absolute;
    bottom: var(--space-4);
    right: var(--space-4);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    z-index: 10;
  }

  .gallery-favorite {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid var(--color-gray-200);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-full);
    cursor: pointer;
    font-size: var(--text-lg);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
  }

  .gallery-favorite:hover {
    background: var(--color-white);
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
  }

  .gallery-favorite__text {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
  }

  .gallery-thumbnails {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--space-2);
    margin-top: var(--space-3);
    max-width: 100%;
  }

  .gallery-thumbnail {
    aspect-ratio: 1;
    border: 2px solid transparent;
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--color-gray-100);
    cursor: pointer;
    transition: all var(--transition-fast);
    padding: 0;
    position: relative;
  }

  .gallery-thumbnail:hover {
    border-color: var(--color-gray-300);
    transform: translateY(-2px);
  }

  .gallery-thumbnail.active {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-subtle);
  }

  .gallery-thumbnail__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .gallery-thumbnail__placeholder {
    width: 100%;
    height: 100%;
    background: var(--color-gray-200);
  }

  /* Badge styles (reusing existing) */
  .listing-card__badge {
    position: absolute;
    top: var(--space-4);
    left: var(--space-4);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    z-index: 10;
  }

  .listing-card__badge--featured {
    background: var(--color-primary);
    color: var(--color-white);
  }

  .listing-card__badge--urgent {
    background: var(--color-secondary);
    color: var(--color-white);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .gallery-main {
      height: 400px;
    }

    .gallery-nav {
      width: 40px;
      height: 40px;
    }

    .gallery-nav--prev {
      left: var(--space-2);
    }

    .gallery-nav--next {
      right: var(--space-2);
    }

    .gallery-counter {
      bottom: var(--space-2);
      right: var(--space-2);
      font-size: var(--text-xs);
      padding: var(--space-1) var(--space-2);
    }

    .gallery-favorite {
      top: var(--space-2);
      right: var(--space-2);
      padding: var(--space-1) var(--space-3);
    }

    .gallery-favorite__text {
      display: none;
    }

    .gallery-thumbnails {
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: var(--space-1);
    }

    .placeholder-icon {
      font-size: 4rem;
    }
  }
</style>

