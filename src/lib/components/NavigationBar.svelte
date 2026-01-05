<script>
  import Fa from "svelte-fa";
  import {
    faBars,
    faXmark,
    faStar,
    faList,
    faHandshake,
    faComments,
    faRightFromBracket,
    faUser,
    faGear
  } from "@fortawesome/free-solid-svg-icons";
  import Logo from "$lib/components/Logo.svelte";
  import { useSession, signOut } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { getUserProfile } from "$lib/services/user.js";
  import { invalidateAll } from "$app/navigation";

  let { userLanguage = "en" } = $props();

  const session = useSession();
  const user = $derived($session.data?.user);
  
  // Language state - derive from prop
  const currentLanguage = $derived(userLanguage);
  let updatingLanguage = $state(false);

  // Mobile menu state
  let mobileMenuOpen = $state(false);

  // User dropdown state
  let userDropdownOpen = $state(false);
  let marketplaceUsername = $state(null);

  // Load marketplace username
  async function loadMarketplaceUser() {
    if (!user) return;

    try {
      const data = await getUserProfile();
      marketplaceUsername = /** @type {any} */ (data)?.username || null;
    } catch (error) {
      console.error("Error loading marketplace user:", error);
    }
  }

  // Toggle mobile menu
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    // Close user dropdown when opening mobile menu
    if (mobileMenuOpen) {
      userDropdownOpen = false;
    }
  }

  // Toggle user dropdown
  function toggleUserDropdown() {
    userDropdownOpen = !userDropdownOpen;
    // Close mobile menu when opening user dropdown
    if (userDropdownOpen) {
      mobileMenuOpen = false;
    }
  }

  // Close dropdowns when clicking outside
  /** @param {MouseEvent} event */
  function handleClickOutside(event) {
    const target = /** @type {HTMLElement | null} */ (event.target);
    if (!target) return;

    if (
      !target.closest(".user-dropdown") &&
      !target.closest(".user-dropdown-toggle")
    ) {
      userDropdownOpen = false;
    }
    if (!target.closest(".nav") && !target.closest(".menu-toggle")) {
      mobileMenuOpen = false;
    }
  }


  async function handleSignOut() {
    await signOut();
    goto("/");
  }

  // Get user initials for avatar
  function getUserInitials() {
    if (!user?.name) return "?";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name[0].toUpperCase();
  }

  // Helper to close mobile menu
  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  // Helper to close user dropdown
  function closeUserDropdown() {
    userDropdownOpen = false;
  }

  // Navigation menu items configuration
  const generalNavItems = [
    { href: "/marketplace", label: "Browse" },
    { href: "/#how-it-works", label: "How It Works" }
  ];

  // User menu items configuration
  const userMenuItems = $derived([
    { href: "/favorites", label: "Favorites", icon: faStar },
    { href: "/my-listings", label: "My Listings", icon: faList },
    { href: "/my-trades", label: "My Trades", icon: faHandshake },
    { href: "/my-chat-rooms", label: "Chat Rooms", icon: faComments },
    ...(marketplaceUsername
      ? [{ href: `/profile/${marketplaceUsername}`, label: "Profile", icon: faUser }]
      : []),
    { href: "/settings", label: "Settings", icon: faGear }
  ]);

  // Close menu on navigation
  $effect(() => {
    // Close mobile menu when route changes
    mobileMenuOpen = false;
    userDropdownOpen = false;
  });

  // Handle language change
  /** @param {'en' | 'es'} lang */
  async function changeLanguage(lang) {
    if (lang === currentLanguage || updatingLanguage) return;
    
    updatingLanguage = true;
    try {
      const response = await fetch('/api/user/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: lang }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update language');
      }

      // Invalidate all data to reload with new language
      await invalidateAll();
      // Reload page to apply language change
      window.location.reload();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update language');
      console.error('Error updating language:', error);
      // Show error but don't block - try to continue anyway
      console.warn('Language update failed, but continuing...', error);
      // Still reload to try to get updated language from cookie
      window.location.reload();
    } finally {
      updatingLanguage = false;
    }
  }

  // Close dropdowns on mount and add click listener
  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    if (user) {
      loadMarketplaceUser();
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
</script>

<header class="header">
  <div class="container">
    <div class="header__inner">
      <!-- Logo -->
      <Logo />

      <!-- Mobile menu overlay -->
      <div
        class="nav-overlay"
        class:is-active={mobileMenuOpen}
        onclick={toggleMobileMenu}
        onkeydown={(e) => e.key === "Enter" && toggleMobileMenu()}
        role="button"
        tabindex="0"
        aria-label="Close menu"
      ></div>

      <!-- Main Navigation -->
      <nav
        class="nav"
        class:is-active={mobileMenuOpen}
        aria-label="Main navigation"
      >
        <!-- Close Button -->
        <button
          class="nav__close"
          onclick={toggleMobileMenu}
          type="button"
          aria-label="Close menu"
        >
          <Fa icon={faXmark} />
        </button>

        <!-- General Navigation Links -->
        <div class="nav__main-links">
          {#each generalNavItems as item}
            <a href={item.href} class="nav__link" onclick={closeMobileMenu}>{item.label}</a>
          {/each}
        </div>

        <!-- Mobile-only user actions -->
        {#if user}
          <div class="nav__mobile-user">
            {#each userMenuItems as item}
              <a href={item.href} class="nav__link" onclick={closeMobileMenu}>
                <Fa icon={item.icon} /> {item.label}
              </a>
            {/each}
            <button class="nav__link nav__link--button" onclick={handleSignOut}>
              <Fa icon={faRightFromBracket} /> Logout
            </button>
          </div>
        {:else}
          <!-- Not logged in - show login link -->
          <div class="nav__mobile-user">
            <a href="/login" class="nav__link" onclick={closeMobileMenu}>Log In</a>
            <a href="/register" class="nav__link" onclick={closeMobileMenu}>Sign Up</a>
          </div>
        {/if}
      </nav>

      <!-- Header Actions -->
      <div class="header__actions">
        <!-- Language Selector -->
        <div class="language-selector">
          <button
            class="language-btn"
            class:language-btn--active={currentLanguage === "en"}
            onclick={() => changeLanguage("en")}
            disabled={updatingLanguage}
            type="button"
            aria-label="Switch to English"
            title="English"
          >
            EN
          </button>
          <button
            class="language-btn"
            class:language-btn--active={currentLanguage === "es"}
            onclick={() => changeLanguage("es")}
            disabled={updatingLanguage}
            type="button"
            aria-label="Cambiar a Español"
            title="Español"
          >
            ES
          </button>
        </div>

        {#if user}
          <!-- Desktop: User Dropdown -->
          <div class="user-dropdown-wrapper">
            <button
              class="user-dropdown-toggle"
              onclick={toggleUserDropdown}
              type="button"
              aria-label="User menu"
              aria-expanded={userDropdownOpen}
            >
              <div class="user-avatar">
                {getUserInitials()}
              </div>
              <span class="user-name">{user.name || user.email}</span>
              <svg
                class="dropdown-arrow"
                class:open={userDropdownOpen}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 4L6 8L10 4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            {#if userDropdownOpen}
              <div class="user-dropdown">
                <div class="user-dropdown__header">
                  <div class="user-avatar user-avatar--large">
                    {getUserInitials()}
                  </div>
                  <div class="user-dropdown__info">
                    <a
                      href={marketplaceUsername ? `/profile/${marketplaceUsername}` : "#"}
                      class="user-dropdown__name"
                      style="text-decoration: none; color: inherit;"
                    >
                      {user.name || "User"}
                    </a>
                    <div class="user-dropdown__email">{user.email}</div>
                  </div>
                </div>

                <div class="user-dropdown__menu">
                  {#each userMenuItems as item}
                    <a
                      href={item.href}
                      class="user-dropdown__item"
                      onclick={closeUserDropdown}
                    >
                      <span class="user-dropdown__icon"><Fa icon={item.icon} /></span>
                      <span>{item.label}</span>
                    </a>
                  {/each}
                </div>

                <div class="user-dropdown__divider"></div>

                <div class="user-dropdown__menu">
                  <button
                    class="user-dropdown__item user-dropdown__item--danger"
                    onclick={handleSignOut}
                    type="button"
                  >
                    <span class="user-dropdown__icon"><Fa icon={faRightFromBracket} /></span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <!-- Not logged in -->
          <a href="/login" class="btn btn--ghost">
            <span>Log In</span>
          </a>
        {/if}

        <!-- Mobile Menu Toggle -->
        <button
          class="menu-toggle"
          class:is-active={mobileMenuOpen}
          aria-label="Toggle menu"
          onclick={toggleMobileMenu}
          type="button"
        >
          <Fa icon={faBars} />
        </button>
      </div>
    </div>
  </div>
</header>

<style>
  /* User Dropdown */
  .user-dropdown-wrapper {
    position: relative;
  }

  .user-dropdown-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
    font-size: var(--text-sm);
    color: var(--color-gray-700);
  }

  .user-dropdown-toggle:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-subtle);
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-tertiary) 100%
    );
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: var(--text-sm);
    flex-shrink: 0;
  }

  .user-avatar--large {
    width: 48px;
    height: 48px;
    font-size: var(--text-base);
  }

  .user-name {
    font-weight: 500;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-arrow {
    transition: transform 0.2s;
    color: var(--color-gray-500);
  }

  .dropdown-arrow.open {
    transform: rotate(180deg);
  }

  .user-dropdown {
    position: absolute;
    top: calc(100% + var(--space-2));
    right: 0;
    min-width: 240px;
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow: hidden;
  }

  .user-dropdown__header {
    padding: var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    background: var(--color-gray-50);
    border-bottom: 1px solid var(--color-gray-200);
  }

  .user-dropdown__info {
    flex: 1;
    min-width: 0;
  }

  .user-dropdown__name {
    font-weight: 600;
    font-size: var(--text-sm);
    color: var(--color-gray-900);
    margin-bottom: var(--space-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color var(--transition-fast);
  }

  .user-dropdown__name:hover {
    color: var(--color-primary);
  }

  .user-dropdown__email {
    font-size: var(--text-xs);
    color: var(--color-gray-500);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-dropdown__divider {
    height: 1px;
    background: var(--color-gray-200);
    margin: var(--space-2) 0;
  }

  .user-dropdown__menu {
    padding: var(--space-2) 0;
  }

  .user-dropdown__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    color: var(--color-gray-700);
    text-decoration: none;
    transition: all var(--transition-fast);
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    font-size: var(--text-sm);
    cursor: pointer;
    font-family: inherit;
  }

  .user-dropdown__item:hover {
    background: var(--color-gray-50);
    color: var(--color-primary);
    transform: translateX(4px);
  }

  .user-dropdown__item--danger {
    color: var(--color-error);
  }

  .user-dropdown__item--danger:hover {
    background: var(--color-error-subtle);
    transform: translateX(4px);
  }

  .user-dropdown__icon {
    font-size: var(--text-base);
    width: 20px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Language Selector */
  .language-selector {
    display: flex;
    gap: var(--space-1);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    padding: var(--space-1);
    background: var(--color-white);
  }

  .language-btn {
    padding: var(--space-2) var(--space-3);
    border: none;
    background: transparent;
    color: var(--color-gray-600);
    font-weight: var(--font-medium);
    font-size: var(--text-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-width: 40px;
    text-align: center;
  }

  .language-btn:hover:not(:disabled) {
    background: var(--color-gray-100);
    color: var(--color-gray-900);
  }

  .language-btn--active {
    background: var(--color-primary);
    color: var(--color-white);
  }

  .language-btn--active:hover {
    background: var(--color-primary-dark);
  }

  .language-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }


  /* Mobile Navigation */
  .nav__close {
    display: none;
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    background: var(--color-gray-100);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--color-gray-700);
    font-size: var(--text-lg);
    transition: all var(--transition-fast);
    z-index: 1001;
  }

  .nav__close:hover {
    background: var(--color-gray-200);
    color: var(--color-gray-900);
  }

  .nav__main-links {
    display: none;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
  }

  .nav__mobile-user {
    display: none;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    border-top: 1px solid var(--color-gray-200);
    margin-top: var(--space-4);
  }

  .nav__link {
    color: var(--color-gray-700);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .nav__link:hover {
    color: var(--color-primary);
    background: var(--color-primary-subtle);
    transform: translateX(2px);
  }

  .nav__link--button {
    background: transparent;
    border: none;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    width: 100%;
    color: var(--color-gray-700);
    transition: all var(--transition-fast);
  }

  .nav__link--button:hover {
    color: var(--color-primary);
    background: var(--color-primary-subtle);
    transform: translateX(2px);
  }

  /* Menu Toggle - Hidden by default on larger screens */
  .menu-toggle {
    display: none;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .user-dropdown-wrapper {
      display: none;
    }

    .menu-toggle {
      display: flex;
    }

    .nav__close {
      display: flex;
    }

    .nav__main-links {
      display: flex;
    }

    .nav__mobile-user {
      display: flex;
    }

    .header__actions {
      gap: var(--space-2);
    }

    .btn {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-sm);
    }
  }

  @media (max-width: 480px) {
    .user-dropdown-toggle {
      padding: var(--space-2);
    }

    .user-dropdown-toggle .user-avatar {
      width: 28px;
      height: 28px;
      font-size: var(--text-xs);
    }
  }
</style>
