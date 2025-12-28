<script>
	import '../app.css';
	
	let { children } = $props();
</script>

<svelte:head>
	<title>AuthFlow — Modern Authentication</title>
	<meta name="description" content="Secure, fast, and beautiful authentication powered by SvelteKit and Better Auth" />
</svelte:head>

{@render children()}
