/**
 * Translation utility for the app
 * Loads translations from JSON files based on user language
 */

// Import translations - Vite handles JSON imports
import enMessagesData from '../translations/en.json';
import esMessagesData from '../translations/es.json';

const translations = {
  en: enMessagesData,
  es: esMessagesData
};

/**
 * Get a translated string
 * @param {string} key - Translation key (supports nested keys with dot notation, e.g., 'nav.marketplace')
 * @param {string} [lang='en'] - Language code ('en' or 'es')
 * @param {Object} [params] - Parameters to replace in the translation (e.g., {name: 'John'} for "Hello {name}")
 * @returns {string} Translated string or the key if translation not found
 */
export function t(key, lang = 'en', params = {}) {
  const messages = translations[lang] || translations.en;
  
  // Support nested keys with dot notation
  const keys = key.split('.');
  let value = messages;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      if (lang !== 'en') {
        return t(key, 'en', params);
      }
      // If still not found, return the key
      return key;
    }
  }
  
  // If value is not a string, return the key
  if (typeof value !== 'string') {
    return key;
  }
  
  // Replace parameters in the translation
  if (Object.keys(params).length > 0) {
    // Handle pluralization: {count, plural, =1 {singular} other {plural}}
    value = value.replace(/\{(\w+),\s*plural,\s*([^}]+)\}/g, (match, paramKey, pluralRules) => {
      const count = params[paramKey];
      if (count === undefined) return match;
      
      // Parse plural rules: =1 {one} other {many}
      const rules = {};
      const ruleMatches = pluralRules.match(/(?:=\s*(\d+)|other)\s*\{([^}]+)\}/g);
      if (ruleMatches) {
        ruleMatches.forEach(rule => {
          const exactMatch = rule.match(/=\s*(\d+)\s*\{([^}]+)\}/);
          if (exactMatch) {
            rules[parseInt(exactMatch[1])] = exactMatch[2];
          } else {
            const otherMatch = rule.match(/other\s*\{([^}]+)\}/);
            if (otherMatch) {
              rules.other = otherMatch[1];
            }
          }
        });
      }
      
      // Return appropriate form
      if (rules[count] !== undefined) {
        return rules[count];
      }
      return rules.other || match;
    });
    
    // Replace simple parameters: {key}
    value = value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : match;
    });
  }
  
  return value;
}

/**
 * Get all translations for a specific language
 * @param {string} [lang='en'] - Language code
 * @returns {Object} All translations for the language
 */
export function getTranslations(lang = 'en') {
  return translations[lang] || translations.en;
}

