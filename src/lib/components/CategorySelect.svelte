<script>
	import { translateCategoryName } from '$lib/utils/category-translations.js';
	
	/**
	 * @typedef {Object} Category
	 * @property {number} id
	 * @property {string} name
	 * @property {string} nameEs
	 * @property {string} slug
	 * @property {'product' | 'service'} type
	 * @property {string | null} icon
	 * @property {number | null} parentId
	 */

	/** 
	 * @type {{ 
	 *   categories: Category[], 
	 *   selectedValue?: string | number, 
	 *   id?: string, 
	 *   label?: string, 
	 *   showLabel?: boolean,
	 *   required?: boolean,
	 *   onChange?: (value: string | number) => void, 
	 *   userLanguage?: string,
	 *   mode?: 'filter' | 'form',
	 *   showSubcategories?: boolean,
	 *   filterByType?: 'product' | 'service' | null
	 * }} 
	 */
	let { 
		categories = [], 
		selectedValue = 'all',
		id = 'categorySelect',
		label = 'Category',
		showLabel = true,
		required = false,
		onChange,
		userLanguage = 'en',
		mode = 'filter', // 'filter' uses slugs, 'form' uses IDs
		showSubcategories = false, // For form mode, whether to show subcategories
		filterByType = null // For form mode, filter by specific type
	} = $props();

	// Filter categories based on mode and type
	const filteredCategories = $derived.by(() => {
		let result = categories;
		
		// Filter by type if specified (for form mode)
		if (filterByType) {
			result = result.filter(cat => cat.type === filterByType);
		}
		
		// For filter mode, exclude container categories and include subcategories
		if (mode === 'filter') {
			return result.filter(cat => {
				// Include all subcategories (they have parentId)
				if (cat.parentId) return true;
				// For top-level categories, exclude container categories
				const containerSlugs = ['products-articles', 'services'];
				return !containerSlugs.includes(cat.slug);
			});
		}
		
		// For form mode, show only top-level categories (no parentId) unless showSubcategories is true
		if (mode === 'form') {
			if (showSubcategories) {
				return result; // Show all categories
			}
			return result.filter(cat => !cat.parentId); // Only top-level
		}
		
		return result;
	});

	// Separate by type for display
	const productCategories = $derived(
		filteredCategories.filter(cat => cat.type === 'product')
	);
	const serviceCategories = $derived(
		filteredCategories.filter(cat => cat.type === 'service')
	);

	/** @param {Event} e */
	function handleChange(e) {
		const value = /** @type {HTMLSelectElement} */ (e.target).value;
		if (onChange) {
			// Convert to number if in form mode and value is numeric
			if (mode === 'form' && value && !isNaN(Number(value))) {
				onChange(Number(value));
			} else {
				onChange(value);
			}
		}
	}

	// Get the value to use for the select (convert ID to string if needed)
	const selectValue = $derived(
		mode === 'form' && typeof selectedValue === 'number' 
			? selectedValue.toString() 
			: selectedValue?.toString() || 'all'
	);
</script>

<div class={mode === 'form' ? 'form-group' : 'filter-group'}>
	{#if showLabel}
		<label 
			for={id} 
			class={mode === 'form' ? (required ? 'form-label form-label--required' : 'form-label') : 'filter-group__label'}
		>
			{label}
		</label>
	{/if}
	<select 
		id={id} 
		class="form-select"
		value={selectValue}
		onchange={handleChange}
		required={required || mode === 'form'}
	>
		{#if mode === 'filter'}
			<option value="all">All Categories</option>
		{:else}
			<option value="">Select a category...</option>
		{/if}
		
		{#if productCategories.length > 0}
			<optgroup label="Products">
				{#each productCategories as category}
					<option value={mode === 'form' ? category.id : category.slug}>
						{category.icon || "📦"} {translateCategoryName(category, userLanguage)}
					</option>
				{/each}
			</optgroup>
		{/if}
		
		{#if serviceCategories.length > 0}
			<optgroup label="Services">
				{#each serviceCategories as category}
					<option value={mode === 'form' ? category.id : category.slug}>
						{category.icon || "🔧"} {translateCategoryName(category, userLanguage)}
					</option>
				{/each}
			</optgroup>
		{/if}
	</select>
</div>

