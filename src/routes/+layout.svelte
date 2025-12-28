<script>
  import "../styles/styles.css";
  import "../styles/components.css";
  import "../styles/responsive.css";

  let { children } = $props();
</script>

<svelte:head>
  <title>AuthFlow — Modern Authentication</title>
  <meta
    name="description"
    content="Secure, fast, and beautiful p2p marketplace"
  />
</svelte:head>

{@render children()}
