<script>
  import "../styles/styles.css";
  import "../styles/components.css";
  import "../styles/responsive.css";
  import { page } from "$app/stores";
  import { generateSEOTags, getOrganizationSchema, getWebSiteSchema } from "$lib/utils/seo.js";

  let { children } = $props();

  // Default SEO tags
  const defaultSEO = generateSEOTags({
    title: "Marketto - Local P2P Marketplace",
    description: "Local peer-to-peer marketplace for safe trading, barter, and community exchange. Buy and sell products and services with your neighbors. 100% free, no fees, no commissions.",
    url: $page.url.href,
    type: "website"
  });

  // Generate structured data
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema($page.url.origin);
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>{defaultSEO.title}</title>
  <meta name="title" content={defaultSEO.title} />
  <meta name="description" content={defaultSEO.description} />
  {#if defaultSEO.keywords}
    <meta name="keywords" content={defaultSEO.keywords} />
  {/if}
  {#if defaultSEO.author}
    <meta name="author" content={defaultSEO.author} />
  {/if}
  <meta name="robots" content="index, follow" />
  <meta name="language" content="English" />
  <meta name="revisit-after" content="7 days" />
  <meta name="theme-color" content="#00247d" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={defaultSEO['og:type']} />
  <meta property="og:url" content={defaultSEO['og:url']} />
  <meta property="og:title" content={defaultSEO['og:title']} />
  <meta property="og:description" content={defaultSEO['og:description']} />
  <meta property="og:image" content={defaultSEO['og:image']} />
  <meta property="og:site_name" content={defaultSEO['og:site_name']} />
  <meta property="og:locale" content={defaultSEO['og:locale']} />

  <!-- Twitter -->
  <meta name="twitter:card" content={defaultSEO['twitter:card']} />
  <meta name="twitter:url" content={defaultSEO['og:url']} />
  <meta name="twitter:title" content={defaultSEO['twitter:title']} />
  <meta name="twitter:description" content={defaultSEO['twitter:description']} />
  <meta name="twitter:image" content={defaultSEO['twitter:image']} />
  <meta name="twitter:site" content={defaultSEO['twitter:site']} />
  <meta name="twitter:creator" content={defaultSEO['twitter:creator']} />

  <!-- Canonical URL -->
  <link rel="canonical" href={defaultSEO.canonical} />

  <!-- Structured Data (JSON-LD) -->
  {@html `<script type="application/ld+json">${organizationSchema}</script>`}
  {@html `<script type="application/ld+json">${websiteSchema}</script>`}
</svelte:head>

{@render children()}