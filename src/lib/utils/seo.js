/**
 * SEO utility functions for generating meta tags
 */

import { APP_NAME, APP_DESCRIPTION } from './constants.js';

const SITE_NAME = APP_NAME;
const SITE_DESCRIPTION = APP_DESCRIPTION;
const DEFAULT_IMAGE = '/favicon.svg';
const TWITTER_HANDLE = '@verkado'; // Update with your actual Twitter handle

/**
 * Generate comprehensive meta tags for a page
 * @param {Object} options - SEO options
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} [options.image] - Open Graph image URL
 * @param {string} [options.url] - Canonical URL
 * @param {string} [options.type] - Open Graph type (website, article, product, etc.)
 * @param {string} [options.keywords] - Meta keywords (comma-separated)
 * @param {string} [options.author] - Page author
 * @param {Date|string} [options.publishedTime] - Publication date
 * @param {Date|string} [options.modifiedTime] - Last modified date
 * @param {string} [options.locale] - Locale (default: en_US)
 * @returns {Object} Meta tags object
 */
export function generateSEOTags({
	title,
	description,
	image = DEFAULT_IMAGE,
	url,
	type = 'website',
	keywords,
	author,
	publishedTime,
	modifiedTime,
	locale = 'en_US'
}) {
	const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
	const fullDescription = description || SITE_DESCRIPTION;
	const fullImage = image.startsWith('http') ? image : `${url || ''}${image}`;
	const fullUrl = url || '';

	return {
		title: fullTitle,
		description: fullDescription,
		keywords: keywords,
		author: author,
		// Open Graph tags
		'og:title': fullTitle,
		'og:description': fullDescription,
		'og:image': fullImage,
		'og:url': fullUrl,
		'og:type': type,
		'og:site_name': SITE_NAME,
		'og:locale': locale,
		// Twitter Card tags
		'twitter:card': 'summary_large_image',
		'twitter:title': fullTitle,
		'twitter:description': fullDescription,
		'twitter:image': fullImage,
		'twitter:site': TWITTER_HANDLE,
		'twitter:creator': TWITTER_HANDLE,
		// Article specific
		'article:published_time': publishedTime,
		'article:modified_time': modifiedTime,
		// Canonical URL
		canonical: fullUrl
	};
}

/**
 * Generate structured data (JSON-LD) for a page
 * @param {Object} options - Structured data options
 * @param {string} options.type - Schema type (Organization, WebSite, Product, Article, etc.)
 * @param {Object} options.data - Schema data
 * @returns {string} JSON-LD string
 */
export function generateStructuredData(type, data) {
	const baseSchema = {
		'@context': 'https://schema.org',
		'@type': type,
		...data
	};

	return JSON.stringify(baseSchema);
}

/**
 * Generate organization structured data
 */
export function getOrganizationSchema() {
	return generateStructuredData('Organization', {
		name: SITE_NAME,
		url: 'https://verkado.com', // Update with your actual domain
		logo: 'https://verkado.com/favicon.svg', // Update with your actual logo URL
		description: SITE_DESCRIPTION,
		sameAs: [
			// Add your social media profiles
			// 'https://twitter.com/verkado',
			// 'https://facebook.com/verkado',
		]
	});
}

/**
 * Generate WebSite structured data with search action
 */
export function getWebSiteSchema(siteUrl = 'https://verkado.com') {
	return generateStructuredData('WebSite', {
		name: SITE_NAME,
		url: siteUrl,
		description: SITE_DESCRIPTION,
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${siteUrl}/marketplace?q={search_term_string}`
			},
			'query-input': 'required name=search_term_string'
		}
	});
}

/**
 * Generate Product structured data for a listing
 */
export function getProductSchema(listing) {
	if (!listing) return null;

	return generateStructuredData('Product', {
		name: listing.title,
		description: listing.description,
		image: listing.images?.[0]?.imageUrl || DEFAULT_IMAGE,
		offers: {
			'@type': 'Offer',
			price: listing.price,
			priceCurrency: 'USD', // Update based on your currency
			availability: listing.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
			url: `https://verkado.com/listing-details/${listing.id}` // Update with your domain
		},
		category: listing.category?.name,
		aggregateRating: listing.averageRating ? {
			'@type': 'AggregateRating',
			ratingValue: listing.averageRating,
			reviewCount: listing.reviewCount || 0
		} : undefined
	});
}

/**
 * Generate LocalBusiness structured data
 */
export function getLocalBusinessSchema() {
	return generateStructuredData('LocalBusiness', {
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		url: 'https://verkado.com', // Update with your actual domain
		priceRange: 'Free',
		// Add your business address if applicable
		// address: {
		// 	'@type': 'PostalAddress',
		// 	streetAddress: '123 Main St',
		// 	addressLocality: 'City',
		// 	addressRegion: 'State',
		// 	postalCode: '12345',
		// 	addressCountry: 'US'
		// }
	});
}

