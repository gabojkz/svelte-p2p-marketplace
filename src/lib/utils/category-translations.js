/**
 * Translates a category name based on user language preference
 * @param {Object} category - Category object with name and nameEs properties
 * @param {string} [language='en'] - User's language preference ('en' or 'es')
 * @returns {string} Translated category name or original name if translation not found
 */
export function translateCategoryName(category, language = 'en') {
	if (!category) {
		return '';
	}
	
	// If language is Spanish and nameEs exists, return Spanish name
	if (language === 'es' && category.nameEs) {
		return category.nameEs;
	}
	
	// Otherwise return English name (default)
	return category.name || '';
}

