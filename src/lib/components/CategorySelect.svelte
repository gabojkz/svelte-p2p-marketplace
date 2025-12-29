<script>
	/**
	 * @typedef {Object} Category
	 * @property {number} id
	 * @property {string} name
	 * @property {string} slug
	 * @property {'product' | 'service'} type
	 * @property {string | null} icon
	 */

	/** @type {{ categories: Category[], selectedValue?: string, id?: string, label?: string, onChange?: (value: string) => void }} */
	let { 
		categories = [], 
		selectedValue = 'all',
		id = 'categorySelect',
		label = 'Category',
		onChange
	} = $props();

	// Separate categories by type
	const productCategories = $derived(
		categories.filter(cat => cat.type === 'product' && !cat.parentId)
	);
	const serviceCategories = $derived(
		categories.filter(cat => cat.type === 'service' && !cat.parentId)
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
						{category.icon || '📦'} {category.name}
					</option>
				{/each}
			</optgroup>
		{/if}
		
		{#if serviceCategories.length > 0}
			<optgroup label="Services">
				{#each serviceCategories as category}
					<option value={category.slug}>
						{category.icon || '🔧'} {category.name}
					</option>
				{/each}
			</optgroup>
		{/if}
	</select>
</div>

