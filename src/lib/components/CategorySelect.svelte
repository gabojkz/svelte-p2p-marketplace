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
	 */

	/** @type {{ categories: Category[], selectedValue?: string, id?: string, label?: string, onChange?: (value: string) => void, userLanguage?: string }} */
	let { 
		categories = [], 
		selectedValue = 'all',
		id = 'categorySelect',
		label = 'Category',
		onChange,
		userLanguage = 'en'
	} = $props();

	// Separate categories by type
	// Show all categories that can be used for filtering
	// Include subcategories (those with parentId) and exclude only the top-level container categories
	const productCategories = $derived(
		categories.filter(cat => {
			if (cat.type !== 'product') return false;
			// Include all subcategories (they have parentId)
			if (cat.parentId) return true;
			// For top-level categories, exclude container categories like "PRODUCTS / ARTICLES"
			const containerSlugs = ['products-articles'];
			return !containerSlugs.includes(cat.slug);
		})
	);
	const serviceCategories = $derived(
		categories.filter(cat => {
			if (cat.type !== 'service') return false;
			// Include all subcategories (they have parentId)
			if (cat.parentId) return true;
			// For top-level categories, exclude container categories like "SERVICES"
			const containerSlugs = ['services'];
			return !containerSlugs.includes(cat.slug);
		})
	);

	/** @param {Event} e */
	function handleChange(e) {
		const value = /** @type {HTMLSelectElement} */ (e.target).value;
		if (onChange) {
			onChange(value);
		}
	}
</script>

<div class="filter-group">
	<label for={id} class="filter-group__label">{label}</label>
	<select 
		id={id} 
		class="form-select"
		value={selectedValue}
		onchange={handleChange}
	>
		<option value="all">All Categories</option>
		
		{#if productCategories.length > 0}
			<optgroup label="Products">
				{#each productCategories as category}
					<option value={category.slug}>
						{translateCategoryName(category, userLanguage)}
					</option>
				{/each}
			</optgroup>
		{/if}
		
		{#if serviceCategories.length > 0}
			<optgroup label="Services">
				{#each serviceCategories as category}
					<option value={category.slug}>
						{translateCategoryName(category, userLanguage)}
					</option>
				{/each}
			</optgroup>
		{/if}
	</select>
</div>

