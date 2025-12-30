<script>
  import Logo from "$lib/components/Logo.svelte";
  import { useSession, signOut } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  const session = useSession();
  const user = $derived($session.data?.user);
  const sessionData = $derived($session.data?.session);

  // Mobile menu state
  let mobileMenuOpen = $state(false);

  // User dropdown state
  let userDropdownOpen = $state(false);
  let unreadMessagesCount = $state(0);
  let marketplaceUsername = $state(null);

  // Load marketplace username
  async function loadMarketplaceUser() {
    if (!user) return;

    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        marketplaceUsername = data?.marketplaceUser?.username || null;
      }
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

  // Load unread messages count
  async function loadUnreadCount() {
    if (!user) return;

    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        // Use totalUnread from API if available, otherwise calculate from conversations
        if (data.totalUnread !== undefined) {
          unreadMessagesCount = data.totalUnread;
        } else {
          const conversations = data.conversations || [];
          unreadMessagesCount = conversations.reduce(
            (/** @type {number} */ sum, /** @type {any} */ conv) => {
              return sum + (conv.userUnreadCount || 0);
            },
            0,
          );
        }
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
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

  // Close dropdowns on mount and add click listener
  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    if (user) {
      loadUnreadCount();
      loadMarketplaceUser();
      // Refresh unread count every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => {
        document.removeEventListener("click", handleClickOutside);
        clearInterval(interval);
      };
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
        <!-- Mobile-only user actions -->
        {#if user}
          <div class="nav__mobile-user">
            <a href="/messages" class="nav__link nav__link--badge">
              💬 Messages
              {#if unreadMessagesCount > 0}
                <span class="nav__badge">{unreadMessagesCount}</span>
              {/if}
            </a>
            <a href="/favorites" class="nav__link">⭐ Favorites</a>
            <a href="/my-listings" class="nav__link">📊 My Listings</a>
            <button class="nav__link nav__link--button" onclick={handleSignOut}>
              🚪 Logout
            </button>
          </div>
        {/if}
      </nav>

      <!-- Header Actions -->
      <div class="header__actions">
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
                    <div class="user-dropdown__name">{user.name || "User"}</div>
                    <div class="user-dropdown__email">{user.email}</div>
                  </div>
                </div>

                <div class="user-dropdown__divider"></div>

                <div class="user-dropdown__menu">
                  <a
                    href="/my-listings"
                    class="user-dropdown__item"
                    onclick={() => (userDropdownOpen = false)}
                  >
                    <span class="user-dropdown__icon">📊</span>
                    <span>My Listings</span>
                  </a>
                  <a
                    href="/messages"
                    class="user-dropdown__item"
                    onclick={() => (userDropdownOpen = false)}
                  >
                    <span class="user-dropdown__icon">💬</span>
                    <span>Messages</span>
                    {#if unreadMessagesCount > 0}
                      <span class="user-dropdown__badge"
                        >{unreadMessagesCount}</span
                      >
                    {/if}
                  </a>
                  <a
                    href="/favorites"
                    class="user-dropdown__item"
                    onclick={() => (userDropdownOpen = false)}
                  >
                    <span class="user-dropdown__icon">⭐</span>
                    <span>Favorites</span>
                  </a>
                  {#if marketplaceUsername}
                    <a
                      href="/profile/{marketplaceUsername}"
                      class="user-dropdown__item"
                      onclick={() => (userDropdownOpen = false)}
                    >
                      <span class="user-dropdown__icon">👤</span>
                      <span>Profile</span>
                    </a>
                  {/if}
                  <a
                    href="/settings"
                    class="user-dropdown__item"
                    onclick={() => (userDropdownOpen = false)}
                  >
                    <span class="user-dropdown__icon">⚙️</span>
                    <span>Settings</span>
                  </a>
                </div>

                <div class="user-dropdown__divider"></div>

                <div class="user-dropdown__menu">
                  <button
                    class="user-dropdown__item user-dropdown__item--danger"
                    onclick={handleSignOut}
                    type="button"
                  >
                    <span class="user-dropdown__icon">🚪</span>
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
          class:active={mobileMenuOpen}
          aria-label="Toggle menu"
          onclick={toggleMobileMenu}
          type="button"
        >
          <span class="menu-toggle__bar"></span>
          <span class="menu-toggle__bar"></span>
          <span class="menu-toggle__bar"></span>
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
    transition: background 0.2s;
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
  }

  .user-dropdown__item--danger {
    color: var(--color-error);
  }

  .user-dropdown__item--danger:hover {
    background: var(--color-error-subtle);
  }

  .user-dropdown__icon {
    font-size: var(--text-base);
    width: 20px;
    text-align: center;
  }

  .user-dropdown__badge {
    margin-left: auto;
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-full);
    padding: 2px 6px;
    font-size: var(--text-xs);
    font-weight: 600;
    min-width: 20px;
    text-align: center;
  }

  /* Mobile Navigation */
  .nav__mobile-user {
    display: none;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    border-top: 1px solid var(--color-gray-200);
    margin-top: var(--space-4);
  }

  .nav__link--button {
    background: transparent;
    border: none;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .user-dropdown-toggle .user-name {
      display: none;
    }

    .nav__mobile-user {
      display: flex;
    }

    .user-dropdown {
      right: auto;
      left: 0;
      min-width: 200px;
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
