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
    // Find plural blocks and parse them manually to handle nested braces
    let result = value;
    let searchIndex = 0;
    
    while (true) {
      // Find the start of a plural block
      const pluralStart = result.indexOf('{', searchIndex);
      if (pluralStart === -1) break;
      
      // Check if this is a plural pattern
      const pluralMatch = result.substring(pluralStart).match(/^\{(\w+),\s*plural,\s*/);
      if (!pluralMatch) {
        searchIndex = pluralStart + 1;
        continue;
      }
      
      const paramKey = pluralMatch[1];
      const count = params[paramKey];
      
      if (count === undefined) {
        searchIndex = pluralStart + pluralMatch[0].length;
        continue;
      }
      
      // Find the matching closing brace by counting depth
      let depth = 1;
      let i = pluralStart + pluralMatch[0].length;
      const rules = {};
      let currentRule = '';
      let currentValue = '';
      let inRuleValue = false;
      let currentNumber = null;
      
      while (i < result.length && depth > 0) {
        const char = result[i];
        
        if (char === '{') {
          depth++;
          if (depth === 2 && !inRuleValue) {
            // Start of a rule value
            inRuleValue = true;
            currentValue = '';
          } else if (inRuleValue) {
            currentValue += char;
          }
        } else if (char === '}') {
          if (depth === 2 && inRuleValue) {
            // End of a rule value
            if (currentNumber !== null) {
              rules[currentNumber] = currentValue;
            } else if (currentRule.trim() === 'other') {
              rules.other = currentValue;
            }
            currentRule = '';
            currentValue = '';
            currentNumber = null;
            inRuleValue = false;
          } else if (inRuleValue) {
            currentValue += char;
          }
          depth--;
        } else if (inRuleValue) {
          currentValue += char;
        } else {
          // Parse rule type before the opening brace
          const remaining = result.substring(i);
          const exactMatch = remaining.match(/^=\s*(\d+)\s*\{/);
          if (exactMatch) {
            currentNumber = parseInt(exactMatch[1]);
            i += exactMatch[0].length - 1; // Position before the {
            continue;
          } else if (remaining.startsWith('other')) {
            currentRule = 'other';
            i += 5; // Skip "other"
            // Skip whitespace
            while (i < result.length && /\s/.test(result[i])) i++;
            if (result[i] === '{') {
              i--; // Back up to process the {
            }
            continue;
          }
        }
        i++;
      }
      
      // Replace the entire plural block with the selected value
      const pluralBlock = result.substring(pluralStart, i);
      const selectedValue = rules[count] !== undefined ? rules[count] : (rules.other || '');
      result = result.substring(0, pluralStart) + selectedValue + result.substring(i);
      searchIndex = pluralStart + selectedValue.length;
    }
    
    value = result;
    
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

