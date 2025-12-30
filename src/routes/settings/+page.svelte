<script>
  import Logo from "$lib/components/Logo.svelte";
  import { useSession } from "$lib/auth-client.js";
  import { enhance } from "$app/forms";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data, form } = $props();

  const marketplaceUser = $derived(data?.marketplaceUser);
  const settings = $derived(data?.settings);

  // Active tab state
  let activeTab = $state("profile");

  // Form states
  let profileForm = $state({
    firstName: marketplaceUser?.firstName || "",
    lastName: marketplaceUser?.lastName || "",
    bio: marketplaceUser?.bio || "",
    phone: marketplaceUser?.phone || "",
    locationCity: marketplaceUser?.locationCity || "",
    locationPostcode: marketplaceUser?.locationPostcode || "",
  });

  let settingsForm = $state({
    emailNotifications: settings?.emailNotifications ?? true,
    pushNotifications: settings?.pushNotifications ?? true,
    smsNotifications: settings?.smsNotifications ?? false,
    showEmail: settings?.showEmail ?? false,
    showPhone: settings?.showPhone ?? false,
    currencyPreference: settings?.currencyPreference || "GBP",
    language: settings?.language || "en",
    timezone: settings?.timezone || "UTC",
  });

  // Update form when data changes
  $effect(() => {
    if (marketplaceUser) {
      profileForm = {
        firstName: marketplaceUser.firstName || "",
        lastName: marketplaceUser.lastName || "",
        bio: marketplaceUser.bio || "",
        phone: marketplaceUser.phone || "",
        locationCity: marketplaceUser.locationCity || "",
        locationPostcode: marketplaceUser.locationPostcode || "",
      };
    }
  });

  $effect(() => {
    if (settings) {
      settingsForm = {
        emailNotifications: settings.emailNotifications ?? true,
        pushNotifications: settings.pushNotifications ?? true,
        smsNotifications: settings.smsNotifications ?? false,
        showEmail: settings.showEmail ?? false,
        showPhone: settings.showPhone ?? false,
        currencyPreference: settings.currencyPreference || "GBP",
        language: settings.language || "en",
        timezone: settings.timezone || "UTC",
      };
    }
  });

  // Get user initials for avatar
  function getUserInitials() {
    if (!marketplaceUser) return "?";
    const firstName = marketplaceUser.firstName || "";
    const lastName = marketplaceUser.lastName || "";
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (marketplaceUser.username) {
      return marketplaceUser.username[0].toUpperCase();
    }
    return "?";
  }
</script>

<div class="page-wrapper">
  <!-- Header -->
  <header class="header">
    <div class="container">
      <div class="header__inner">
        <Logo />
        <nav class="nav" aria-label="Main navigation">
          <a href="/marketplace" class="nav__link">Browse</a>
          <a href="/my-listings" class="nav__link">My Listings</a>
        </nav>
        <div class="header__actions">
          <a href="/my-listings" class="btn btn--ghost">Back to My Listings</a>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container">
      <!-- Page Header -->
      <div class="settings-header">
        <h1>Settings</h1>
        <p class="text-muted">Manage your account, preferences, and privacy</p>
      </div>

      <!-- Success/Error Messages -->
      {#if form?.success}
        <div class="alert alert--success">
          {form.message || "Settings saved successfully!"}
        </div>
      {/if}
      {#if form?.error}
        <div class="alert alert--error">
          {form.error}
        </div>
      {/if}

      <div class="settings-layout">
        <!-- Settings Sidebar -->
        <aside class="settings-sidebar">
          <nav class="settings-nav">
            <button
              class="settings-nav__item"
              class:settings-nav__item--active={activeTab === "profile"}
              onclick={() => (activeTab = "profile")}
              type="button"
            >
              <span class="settings-nav__icon">👤</span>
              <span>Profile</span>
            </button>
            <button
              class="settings-nav__item"
              class:settings-nav__item--active={activeTab === "notifications"}
              onclick={() => (activeTab = "notifications")}
              type="button"
            >
              <span class="settings-nav__icon">🔔</span>
              <span>Notifications</span>
            </button>
            <button
              class="settings-nav__item"
              class:settings-nav__item--active={activeTab === "privacy"}
              onclick={() => (activeTab = "privacy")}
              type="button"
            >
              <span class="settings-nav__icon">🔒</span>
              <span>Privacy</span>
            </button>
            <button
              class="settings-nav__item"
              class:settings-nav__item--active={activeTab === "preferences"}
              onclick={() => (activeTab = "preferences")}
              type="button"
            >
              <span class="settings-nav__icon">⚙️</span>
              <span>Preferences</span>
            </button>
            <button
              class="settings-nav__item"
              class:settings-nav__item--active={activeTab === "security"}
              onclick={() => (activeTab = "security")}
              type="button"
            >
              <span class="settings-nav__icon">🛡️</span>
              <span>Security</span>
            </button>
          </nav>
        </aside>

        <!-- Settings Content -->
        <div class="settings-content">
          <!-- Profile Tab -->
          {#if activeTab === "profile"}
            <section class="settings-section">
              <h2>Profile Information</h2>
              <p class="text-muted">
                Update your personal information and profile details
              </p>

              <form method="POST" action="?/updateProfile" use:enhance>
                <div class="form-group">
                  <label for="username" class="form-label">Username</label>
                  <input
                    type="text"
                    id="username"
                    class="form-input"
                    value={marketplaceUser?.username || ""}
                    readonly
                    style="background: var(--color-gray-50);"
                  />
                  <p class="form-helper">Username cannot be changed</p>
                </div>

                <div
                  style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);"
                >
                  <div class="form-group">
                    <label for="firstName" class="form-label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      class="form-input"
                      bind:value={profileForm.firstName}
                    />
                  </div>
                  <div class="form-group">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      class="form-input"
                      bind:value={profileForm.lastName}
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="email" class="form-label">Email</label>
                  <div
                    style="display: flex; gap: var(--space-2); align-items: center;"
                  >
                    <input
                      type="email"
                      id="email"
                      class="form-input"
                      value={user?.email || ""}
                      readonly
                      style="flex: 1; background: var(--color-gray-50);"
                    />
                    {#if user?.emailVerified}
                      <span class="badge badge--success">Verified</span>
                    {:else}
                      <span class="badge badge--warning">Unverified</span>
                    {/if}
                  </div>
                  <p class="form-helper">
                    Email is managed by your account settings
                  </p>
                </div>

                <div class="form-group">
                  <label for="phone" class="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    class="form-input"
                    bind:value={profileForm.phone}
                    placeholder="+44 7700 900000"
                  />
                </div>

                <div
                  style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);"
                >
                  <div class="form-group">
                    <label for="locationCity" class="form-label">City</label>
                    <input
                      type="text"
                      id="locationCity"
                      name="locationCity"
                      class="form-input"
                      bind:value={profileForm.locationCity}
                      placeholder="Newcastle upon Tyne"
                    />
                  </div>
                  <div class="form-group">
                    <label for="locationPostcode" class="form-label"
                      >Postcode</label
                    >
                    <input
                      type="text"
                      id="locationPostcode"
                      name="locationPostcode"
                      class="form-input"
                      bind:value={profileForm.locationPostcode}
                      placeholder="NE1 4ST"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="bio" class="form-label">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    class="form-textarea"
                    rows="4"
                    bind:value={profileForm.bio}
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn--primary"
                    >Save Changes</button
                  >
                </div>
              </form>
            </section>
          {/if}

          <!-- Notifications Tab -->
          {#if activeTab === "notifications"}
            <section class="settings-section">
              <h2>Notification Preferences</h2>
              <p class="text-muted">
                Choose how you want to be notified about activity
              </p>

              <form method="POST" action="?/updateSettings" use:enhance>
                <div class="settings-group">
                  <div class="settings-item">
                    <div class="settings-item__content">
                      <label
                        for="emailNotifications"
                        class="settings-item__label"
                      >
                        Email Notifications
                      </label>
                      <p class="settings-item__description">
                        Receive email notifications about messages, trades, and
                        updates
                      </p>
                    </div>
                    <label class="toggle">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        name="emailNotifications"
                        bind:checked={settingsForm.emailNotifications}
                        value="true"
                      />
                      <span class="toggle__slider"></span>
                    </label>
                  </div>

                  <div class="settings-item">
                    <div class="settings-item__content">
                      <label
                        for="pushNotifications"
                        class="settings-item__label"
                      >
                        Push Notifications
                      </label>
                      <p class="settings-item__description">
                        Receive browser push notifications for real-time updates
                      </p>
                    </div>
                    <label class="toggle">
                      <input
                        type="checkbox"
                        id="pushNotifications"
                        name="pushNotifications"
                        bind:checked={settingsForm.pushNotifications}
                        value="true"
                      />
                      <span class="toggle__slider"></span>
                    </label>
                  </div>

                  <div class="settings-item">
                    <div class="settings-item__content">
                      <label
                        for="smsNotifications"
                        class="settings-item__label"
                      >
                        SMS Notifications
                      </label>
                      <p class="settings-item__description">
                        Receive text message notifications (requires verified
                        phone)
                      </p>
                    </div>
                    <label class="toggle">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        name="smsNotifications"
                        bind:checked={settingsForm.smsNotifications}
                        value="true"
                      />
                      <span class="toggle__slider"></span>
                    </label>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn--primary"
                    >Save Changes</button
                  >
                </div>
              </form>
            </section>
          {/if}

          <!-- Privacy Tab -->
          {#if activeTab === "privacy"}
            <section class="settings-section">
              <h2>Privacy Settings</h2>
              <p class="text-muted">
                Control what information is visible to other users
              </p>

              <form method="POST" action="?/updateSettings" use:enhance>
                <div class="settings-group">
                  <div class="settings-item">
                    <div class="settings-item__content">
                      <label for="showEmail" class="settings-item__label">
                        Show Email Address
                      </label>
                      <p class="settings-item__description">
                        Allow other users to see your email address on your
                        profile
                      </p>
                    </div>
                    <label class="toggle">
                      <input
                        type="checkbox"
                        id="showEmail"
                        name="showEmail"
                        bind:checked={settingsForm.showEmail}
                        value="true"
                      />
                      <span class="toggle__slider"></span>
                    </label>
                  </div>

                  <div class="settings-item">
                    <div class="settings-item__content">
                      <label for="showPhone" class="settings-item__label">
                        Show Phone Number
                      </label>
                      <p class="settings-item__description">
                        Allow other users to see your phone number on your
                        profile
                      </p>
                    </div>
                    <label class="toggle">
                      <input
                        type="checkbox"
                        id="showPhone"
                        name="showPhone"
                        bind:checked={settingsForm.showPhone}
                        value="true"
                      />
                      <span class="toggle__slider"></span>
                    </label>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn--primary"
                    >Save Changes</button
                  >
                </div>
              </form>
            </section>
          {/if}

          <!-- Preferences Tab -->
          {#if activeTab === "preferences"}
            <section class="settings-section">
              <h2>Preferences</h2>
              <p class="text-muted">Customize your experience</p>

              <form method="POST" action="?/updateSettings" use:enhance>
                <div class="form-group">
                  <label for="currencyPreference" class="form-label"
                    >Currency</label
                  >
                  <select
                    id="currencyPreference"
                    name="currencyPreference"
                    class="form-select"
                    bind:value={settingsForm.currencyPreference}
                  >
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="language" class="form-label">Language</label>
                  <select
                    id="language"
                    name="language"
                    class="form-select"
                    bind:value={settingsForm.language}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="timezone" class="form-label">Timezone</label>
                  <select
                    id="timezone"
                    name="timezone"
                    class="form-select"
                    bind:value={settingsForm.timezone}
                  >
                    <option value="UTC">UTC</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="America/New_York">New York (EST)</option>
                    <option value="America/Los_Angeles"
                      >Los Angeles (PST)</option
                    >
                    <option value="Europe/Paris">Paris (CET)</option>
                  </select>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn--primary"
                    >Save Changes</button
                  >
                </div>
              </form>
            </section>
          {/if}

          <!-- Security Tab -->
          {#if activeTab === "security"}
            <section class="settings-section">
              <h2>Security</h2>
              <p class="text-muted">Manage your account security</p>

              <form method="POST" action="?/changePassword" use:enhance>
                <div class="form-group">
                  <label for="currentPassword" class="form-label"
                    >Current Password</label
                  >
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="newPassword" class="form-label"
                    >New Password</label
                  >
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    class="form-input"
                    required
                    minlength="8"
                  />
                  <p class="form-helper">
                    Password must be at least 8 characters
                  </p>
                </div>

                <div class="form-group">
                  <label for="confirmPassword" class="form-label"
                    >Confirm New Password</label
                  >
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    class="form-input"
                    required
                    minlength="8"
                  />
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn--primary"
                    >Change Password</button
                  >
                </div>
              </form>
            </section>
          {/if}
        </div>
      </div>
    </div>
  </main>
</div>

<style>
  .settings-header {
    margin-bottom: var(--space-8);
  }

  .settings-header h1 {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
  }

  .settings-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: var(--space-8);
  }

  .settings-sidebar {
    position: sticky;
    top: var(--space-8);
    height: fit-content;
  }

  .settings-nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .settings-nav__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: transparent;
    border: none;
    color: var(--color-gray-700);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    font-family: inherit;
  }

  .settings-nav__item:hover {
    background: var(--color-gray-50);
  }

  .settings-nav__item--active {
    background: var(--color-primary-subtle);
    color: var(--color-primary-dark);
    font-weight: var(--font-semibold);
  }

  .settings-nav__icon {
    font-size: var(--text-base);
  }

  .settings-content {
    min-width: 0;
  }

  .settings-section {
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
  }

  .settings-section h2 {
    font-size: var(--text-xl);
    margin-bottom: var(--space-2);
  }

  .settings-section > p {
    margin-bottom: var(--space-6);
  }

  .settings-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .settings-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
  }

  .settings-item__content {
    flex: 1;
  }

  .settings-item__label {
    display: block;
    font-weight: var(--font-semibold);
    margin-bottom: var(--space-1);
    cursor: pointer;
  }

  .settings-item__description {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
  }

  /* Toggle Switch */
  .toggle {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
    cursor: pointer;
  }

  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle__slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-gray-300);
    transition: 0.3s;
    border-radius: 24px;
  }

  .toggle__slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  .toggle input:checked + .toggle__slider {
    background-color: var(--color-primary);
  }

  .toggle input:checked + .toggle__slider:before {
    transform: translateX(24px);
  }

  .form-actions {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-6);
  }

  .alert {
    padding: var(--space-4);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-6);
  }

  .alert--success {
    background: rgba(34, 197, 94, 0.1);
    color: var(--color-success);
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .alert--error {
    background: rgba(255, 107, 107, 0.1);
    color: var(--color-error);
    border: 1px solid rgba(255, 107, 107, 0.3);
  }

  @media (max-width: 768px) {
    .settings-layout {
      grid-template-columns: 1fr;
    }

    .settings-sidebar {
      position: static;
    }

    .settings-nav {
      flex-direction: row;
      overflow-x: auto;
      padding-bottom: var(--space-2);
    }

    .settings-nav__item {
      white-space: nowrap;
    }
  }
</style>
