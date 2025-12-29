<script>
  import Logo from "$lib/components/Logo.svelte";

  // Mobile menu state
  let mobileMenuOpen = $state(false);

  // Toggle mobile menu
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  import { useSession, signOut } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";

  const session = useSession();

  // Derived values for easier access
  const user = $derived($session.data?.user);
  console.log({ user });
  const sessionData = $derived($session.data?.session);
  console.log({ sessionData });
  async function handleSignOut() {
    await signOut();
    goto("/");
  }
</script>

<header class="header">
  <div class="container">
    <div class="header__inner">
      <!-- Logo -->
      <Logo />

      <!-- Mobile menu overlay -->
      <div
        class="nav-overlay"
        class:active={mobileMenuOpen}
        onclick={toggleMobileMenu}
        onkeydown={(e) => e.key === "Enter" && toggleMobileMenu()}
        role="button"
        tabindex="0"
        aria-label="Close menu"
      ></div>

      <!-- Main Navigation -->
      <nav
        class="nav"
        class:active={mobileMenuOpen}
        aria-label="Main navigation"
      >
        <a href="/marketplace" class="nav__link">Browse</a>
        <a href="/marketplace?category=vehicles" class="nav__link">Vehicles</a>
        <a href="/marketplace?category=electronics" class="nav__link"
          >Electronics</a
        >
        <a href="#how-it-works" class="nav__link">How It Works</a>
        <a href="#categories" class="nav__link">Categories</a>
      </nav>

      <!-- Header Actions -->
      <div class="header__actions">
        {#if user}
          <a href="/dashboard" class="btn btn--ghost">
            <span>Dashboard</span>
          </a>
        {:else}
          <a href="/login" class="btn btn--ghost">
            <span>Log In</span>
          </a>
        {/if}
        <a href="/marketplace" class="btn btn--primary">
          <span>Sell Now</span>
        </a>

        <!-- Mobile Menu Toggle -->
        <button
          class="menu-toggle"
          class:active={mobileMenuOpen}
          aria-label="Toggle menu"
          onclick={toggleMobileMenu}
        >
          <span class="menu-toggle__bar"></span>
        </button>
      </div>
    </div>
  </div>
</header>
