<script>
  let { 
    images = $bindable([]),
    maxImages = 10,
    maxSizeMB = 5
  } = $props();

  let dragActive = $state(false);
  let uploading = $state(false);
  let error = $state(null);
  let fileInputRef = $state(null);

  // Validate file
  function validateFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: `Image size must be less than ${maxSizeMB}MB` };
    }

    return { valid: true };
  }

  // Convert file to data URL
  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Create thumbnail
  function createThumbnail(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target?.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Handle file processing
  async function processFiles(files) {
    if (images.length + files.length > maxImages) {
      error = `You can only upload up to ${maxImages} images`;
      setTimeout(() => error = null, 5000);
      return;
    }

    uploading = true;
    error = null;

    try {
      const newImages = [];

      for (const file of Array.from(files)) {
        const validation = validateFile(file);
        if (!validation.valid) {
          error = validation.error;
          continue;
        }

        const [imageUrl, thumbnailUrl] = await Promise.all([
          fileToDataURL(file),
          createThumbnail(file)
        ]);

        newImages.push({
          id: Date.now() + Math.random(), // Temporary ID
          file: file,
          imageUrl: imageUrl,
          thumbnailUrl: thumbnailUrl,
          displayOrder: images.length + newImages.length,
          isPrimary: images.length === 0 && newImages.length === 0
        });
      }

      if (newImages.length > 0) {
        images = [...images, ...newImages];
      }
    } catch (err) {
      console.error('Error processing files:', err);
      error = 'Failed to process images. Please try again.';
    } finally {
      uploading = false;
    }
  }

  // Handle drag events
  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    dragActive = true;
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dragActive = false;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  async function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dragActive = false;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  }

  // Handle file input change
  async function handleFileInput(e) {
    const files = e.target?.files;
    if (files && files.length > 0) {
      await processFiles(files);
      // Reset input
      if (fileInputRef) {
        fileInputRef.value = '';
      }
    }
  }

  // Remove image
  function removeImage(index) {
    const newImages = images.filter((_, i) => i !== index);
    // Update primary if needed
    if (images[index]?.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    images = newImages;
  }

  // Set primary image
  function setPrimary(index) {
    images = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
  }

  // Reorder images
  function moveImage(fromIndex, toIndex) {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    // Update display order
    images = newImages.map((img, i) => ({
      ...img,
      displayOrder: i
    }));
  }
</script>

<div class="image-upload">
  <!-- Error Message -->
  {#if error}
    <div class="image-upload__error">
      ⚠️ {error}
    </div>
  {/if}

  <!-- Drop Zone -->
  <div
    class="image-upload__dropzone"
    class:image-upload__dropzone--active={dragActive}
    class:image-upload__dropzone--uploading={uploading}
    ondragenter={handleDragEnter}
    ondragleave={handleDragLeave}
    ondragover={handleDragOver}
    ondrop={handleDrop}
  >
    <input
      type="file"
      bind:this={fileInputRef}
      accept="image/*"
      multiple
      onchange={handleFileInput}
      class="image-upload__input"
      id="image-upload-input"
    />
    <label for="image-upload-input" class="image-upload__label">
      {#if uploading}
        <div class="image-upload__spinner">⏳</div>
        <p>Processing images...</p>
      {:else}
        <div class="image-upload__icon">📸</div>
        <p><strong>Click to upload</strong> or drag and drop</p>
        <p class="image-upload__hint">PNG, JPG, WebP up to {maxSizeMB}MB (max {maxImages} images)</p>
      {/if}
    </label>
  </div>

  <!-- Image Preview Grid -->
  {#if images.length > 0}
    <div class="image-upload__preview">
      {#each images as image, index (image.id)}
        <div class="image-upload__preview-item">
          <div class="image-upload__preview-image">
            <img src={image.thumbnailUrl || image.imageUrl} alt="Preview {index + 1}" />
            {#if image.isPrimary}
              <span class="image-upload__primary-badge">Primary</span>
            {/if}
          </div>
          <div class="image-upload__preview-actions">
            {#if !image.isPrimary}
              <button
                class="image-upload__action-btn"
                onclick={() => setPrimary(index)}
                type="button"
                title="Set as primary"
              >
                ⭐
              </button>
            {/if}
            {#if index > 0}
              <button
                class="image-upload__action-btn"
                onclick={() => moveImage(index, index - 1)}
                type="button"
                title="Move up"
              >
                ↑
              </button>
            {/if}
            {#if index < images.length - 1}
              <button
                class="image-upload__action-btn"
                onclick={() => moveImage(index, index + 1)}
                type="button"
                title="Move down"
              >
                ↓
              </button>
            {/if}
            <button
              class="image-upload__action-btn image-upload__action-btn--danger"
              onclick={() => removeImage(index)}
              type="button"
              title="Remove"
            >
              🗑️
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .image-upload {
    margin-bottom: var(--space-4);
  }

  .image-upload__error {
    background: var(--color-error-subtle);
    color: var(--color-error);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-3);
    font-size: var(--text-sm);
  }

  .image-upload__dropzone {
    border: 2px dashed var(--color-gray-300);
    border-radius: var(--radius-md);
    padding: var(--space-8);
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--color-gray-50);
  }

  .image-upload__dropzone:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-subtle);
  }

  .image-upload__dropzone--active {
    border-color: var(--color-primary);
    background: var(--color-primary-subtle);
    transform: scale(1.02);
  }

  .image-upload__dropzone--uploading {
    opacity: 0.6;
    cursor: wait;
  }

  .image-upload__input {
    display: none;
  }

  .image-upload__label {
    display: block;
    cursor: pointer;
  }

  .image-upload__icon {
    font-size: var(--text-4xl);
    margin-bottom: var(--space-2);
  }

  .image-upload__spinner {
    font-size: var(--text-4xl);
    margin-bottom: var(--space-2);
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .image-upload__hint {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
    margin-top: var(--space-1);
  }

  .image-upload__preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  .image-upload__preview-item {
    position: relative;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: white;
  }

  .image-upload__preview-image {
    position: relative;
    width: 100%;
    padding-top: 100%; /* Square aspect ratio */
    overflow: hidden;
  }

  .image-upload__preview-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-upload__primary-badge {
    position: absolute;
    top: var(--space-1);
    left: var(--space-1);
    background: var(--color-primary);
    color: white;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
  }

  .image-upload__preview-actions {
    display: flex;
    gap: var(--space-1);
    padding: var(--space-2);
    justify-content: center;
    background: var(--color-gray-50);
  }

  .image-upload__action-btn {
    padding: var(--space-1) var(--space-2);
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--text-sm);
    transition: all 0.2s;
  }

  .image-upload__action-btn:hover {
    background: var(--color-gray-100);
    border-color: var(--color-primary);
  }

  .image-upload__action-btn--danger:hover {
    background: var(--color-error-subtle);
    border-color: var(--color-error);
    color: var(--color-error);
  }
</style>

