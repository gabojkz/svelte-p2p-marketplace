<script>
	import { page } from "$app/stores";
	import { generateSEOTags, generateStructuredData } from "$lib/utils/seo.js";

	/**
	 * @typedef {Object} SEOProps
	 * @property {string} [title] - Page title
	 * @property {string} [description] - Page description
	 * @property {string} [image] - Open Graph image URL
	 * @property {string} [type] - Open Graph type
	 * @property {string} [keywords] - Meta keywords
	 * @property {string} [author] - Page author
	 * @property {string|Date} [publishedTime] - Publication date
	 * @property {string|Date} [modifiedTime] - Last modified date
	 * @property {Object} [structuredData] - Additional structured data
	 */

	/** @type {SEOProps} */
	let {
		title,
		description,
		image,
		type = "website",
		keywords,
		author,
		publishedTime,
		modifiedTime,
		structuredData
	} = $props();

	// Generate SEO tags
	const seo = generateSEOTags({
		title,
		description,
		image,
		url: $page.url.href,
		type,
		keywords,
		author,
		publishedTime,
		modifiedTime
	});
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{seo.title}</title>
	<meta name="title" content={seo.title} />
	<meta name="description" content={seo.description} />
	{#if seo.keywords}
		<meta name="keywords" content={seo.keywords} />
	{/if}
	{#if seo.author}
		<meta name="author" content={seo.author} />
	{/if}
	<meta name="robots" content="index, follow" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={seo["og:type"]} />
	<meta property="og:url" content={seo["og:url"]} />
	<meta property="og:title" content={seo["og:title"]} />
	<meta property="og:description" content={seo["og:description"]} />
	<meta property="og:image" content={seo["og:image"]} />
	<meta property="og:site_name" content={seo["og:site_name"]} />
	<meta property="og:locale" content={seo["og:locale"]} />
	{#if seo["article:published_time"]}
		<meta property="article:published_time" content={seo["article:published_time"]} />
	{/if}
	{#if seo["article:modified_time"]}
		<meta property="article:modified_time" content={seo["article:modified_time"]} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content={seo["twitter:card"]} />
	<meta name="twitter:url" content={seo["og:url"]} />
	<meta name="twitter:title" content={seo["twitter:title"]} />
	<meta name="twitter:description" content={seo["twitter:description"]} />
	<meta name="twitter:image" content={seo["twitter:image"]} />
	<meta name="twitter:site" content={seo["twitter:site"]} />
	<meta name="twitter:creator" content={seo["twitter:creator"]} />

	<!-- Canonical URL -->
	<link rel="canonical" href={seo.canonical} />

	<!-- Additional Structured Data -->
	{#if structuredData}
		{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
	{/if}
</svelte:head>

