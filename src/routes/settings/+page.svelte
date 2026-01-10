<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import { useSession } from "$lib/auth-client.js";
  import { enhance } from "$app/forms";
  import { t } from "$lib/utils/translations.js";

  const session = useSession();
  const user = $derived($session.data?.user);

  // Get data from server load function
  const { data, form } = $props();
  const userLanguage = $derived(data?.userLanguage || 'en');

  const marketplaceUser = $derived(data?.marketplaceUser);
  const settings = $derived(data?.settings);

  // Active tab state
  let activeTab = $state("profile");

  // Avatar upload state
  let avatarUploading = $state(false);
  let avatarError = $state(null);
  let avatarPreview = $state(marketplaceUser?.avatarUrl || null);

  // Form states
  let profileForm = $state({
    firstName: marketplaceUser?.firstName || "",
    lastName: marketplaceUser?.lastName || "",
    bio: marketplaceUser?.bio || "",
    phone: marketplaceUser?.phone || "",
    locationCity: marketplaceUser?.locationCity || "",
    locationPostcode: marketplaceUser?.locationPostcode || "",
    tiktok: settings?.tiktok || "",
    instagram: settings?.instagram || "",
    whatsapp: settings?.whatsapp || "",
    telegram: settings?.telegram || "",
  });

  let settingsForm = $state({
    emailNotifications: settings?.emailNotifications ?? true,
    pushNotifications: settings?.pushNotifications ?? true,
    smsNotifications: settings?.smsNotifications ?? false,
    showEmail: settings?.showEmail ?? false,
    showPhone: settings?.showPhone ?? false,
    currencyPreference: settings?.currencyPreference || "USDT",
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
        tiktok: settings?.tiktok || "",
        instagram: settings?.instagram || "",
        whatsapp: settings?.whatsapp || "",
        telegram: settings?.telegram || "",
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
        currencyPreference: settings.currencyPreference || "USDT",
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
  <NavigationBar {userLanguage} />

  <!-- Main Content -->
  <main class="main-content">
    <div class="container settings-container">
      <!-- Page Header -->
      <div class="settings-header">
        <h1>{t('settings.title', userLanguage)}</h1>
        <p class="text-muted">{t('settings.subtitle', userLanguage)}</p>
      </div>

      <!-- Success/Error Messages -->
      {#if form?.success}
        <div class="alert alert--success">
          {form.message || t('settings.saved', userLanguage)}
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
              <span>{t('settings.profile', userLanguage)}</span>
            </button>
            <button
              class="settings-nav__item"
              class:settings-nav__item--active={activeTab === "notifications"}
              onclick={() => (activeTab = "notifications")}
              type="button"
            >
              <span class="settings-nav__icon">🔔</span>
              <span>{t('settings.notifications', userLanguage)}</span>
            </button>
            <button
              class="settings-nav__item"
              class:settings-nav__item--active={activeTab === "privacy"}
              onclick={() => (activeTab = "privacy")}
              type="button"
            >
              <span class="settings-nav__icon">🔒</span>
              <span>{t('settings.privacy', userLanguage)}</span>
            </button>
            <button
              class="settings-nav__item"
              class:settings-nav__item--active={activeTab === "preferences"}
              onclick={() => (activeTab = "preferences")}
              type="button"
            >
              <span class="settings-nav__icon">⚙️</span>
              <span>{t('settings.preferences', userLanguage)}</span>
            </button>
            <button
              class="settings-nav__item"
              class:settings-nav__item--active={activeTab === "security"}
              onclick={() => (activeTab = "security")}
              type="button"
            >
              <span class="settings-nav__icon">🛡️</span>
              <span>{t('settings.security', userLanguage)}</span>
            </button>
          </nav>
        </aside>

        <!-- Settings Content -->
        <div class="settings-content">
          <!-- Profile Tab -->
          {#if activeTab === "profile"}
            <section class="settings-section">
              <h2>{t('settings.profileInfo', userLanguage)}</h2>
              <p class="text-muted">
                {t('settings.profileSubtitle', userLanguage)}
              </p>

              <!-- Avatar Upload Section -->
              <div class="avatar-upload-section">
                <label class="form-label">{t('settings.profilePicture', userLanguage)}</label>
                <div class="avatar-upload">
                  <div class="avatar-preview">
                    {#if avatarPreview}
                      <img src={avatarPreview} alt="Avatar" class="avatar-image" />
                    {:else}
                      <div class="avatar-placeholder">
                        {getUserInitials()}
                      </div>
                    {/if}
                    {#if avatarUploading}
                      <div class="avatar-upload-overlay">
                        <div class="spinner"></div>
                      </div>
                    {/if}
                  </div>
                  <div class="avatar-upload-actions">
                    <label for="avatar-input" class="btn btn--secondary btn--sm">
                      {avatarPreview ? t('settings.change', userLanguage) : t('settings.upload', userLanguage)} {t('settings.profilePicture', userLanguage)}
                    </label>
                    <input
                      type="file"
                      id="avatar-input"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onchange={handleAvatarUpload}
                      style="display: none;"
                      disabled={avatarUploading}
                    />
                    {#if avatarPreview}
                      <button
                        type="button"
                        class="btn btn--outline btn--sm"
                        onclick={handleAvatarDelete}
                        disabled={avatarUploading}
                      >
                        {t('settings.remove', userLanguage)}
                      </button>
                    {/if}
                  </div>
                  {#if avatarError}
                    <p class="form-error">{avatarError}</p>
                  {/if}
                  <p class="form-helper">
                    {t('settings.avatarHelper', userLanguage)}
                  </p>
                </div>
              </div>

              <form method="POST" action="?/updateProfile" use:enhance>
                <div class="form-group">
                  <label for="username" class="form-label">{t('settings.username', userLanguage)}</label>
                  <input
                    type="text"
                    id="username"
                    class="form-input"
                    value={marketplaceUser?.username || ""}
                    readonly
                    style="background: var(--color-gray-50);"
                  />
                  <p class="form-helper">{t('settings.usernameHelper', userLanguage)}</p>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName" class="form-label">{t('settings.firstName', userLanguage)}</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      class="form-input"
                      bind:value={profileForm.firstName}
                    />
                  </div>
                  <div class="form-group">
                    <label for="lastName" class="form-label">{t('settings.lastName', userLanguage)}</label>
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
                  <label for="email" class="form-label">{t('settings.email', userLanguage)}</label>
                  <div class="form-input-group">
                    <input
                      type="email"
                      id="email"
                      class="form-input form-input--readonly"
                      value={user?.email || ""}
                      readonly
                    />
                    {#if user?.emailVerified}
                      <span class="badge badge--success">{t('settings.verified', userLanguage)}</span>
                    {:else}
                      <span class="badge badge--warning">{t('settings.unverified', userLanguage)}</span>
                    {/if}
                  </div>
                  <p class="form-helper">
                    {t('settings.emailHelper', userLanguage)}
                  </p>
                </div>

                <div class="form-group">
                  <label for="phone" class="form-label">{t('settings.phone', userLanguage)}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    class="form-input"
                    bind:value={profileForm.phone}
                    placeholder={t('settings.phonePlaceholder', userLanguage)}
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="locationCity" class="form-label">{t('settings.city', userLanguage)}</label>
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
                      >{t('settings.postcode', userLanguage)}</label
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
                  <label for="bio" class="form-label">{t('settings.bio', userLanguage)}</label>
                  <textarea
                    id="bio"
                    name="bio"
                    class="form-textarea"
                    rows="4"
                    bind:value={profileForm.bio}
                    placeholder={t('settings.bioPlaceholder', userLanguage)}
                  ></textarea>
                </div>

                <!-- Social Media Section -->
                <div class="form-section">
                  <h3 class="form-section__title">Social Media</h3>
                  <p class="form-section__description">
                    Add your social media accounts to help others connect with you
                  </p>

                  <div class="form-group">
                    <label for="tiktok" class="form-label">
                      <span style="margin-right: var(--space-2);">🎵</span>
                      TikTok
                    </label>
                    <input
                      type="text"
                      id="tiktok"
                      name="tiktok"
                      class="form-input"
                      bind:value={profileForm.tiktok}
                      placeholder="@username"
                    />
                    <p class="form-helper">Enter your TikTok username (e.g., @username)</p>
                  </div>

                  <div class="form-group">
                    <label for="instagram" class="form-label">
                      <span style="margin-right: var(--space-2);">📷</span>
                      Instagram
                    </label>
                    <input
                      type="text"
                      id="instagram"
                      name="instagram"
                      class="form-input"
                      bind:value={profileForm.instagram}
                      placeholder="@username"
                    />
                    <p class="form-helper">Enter your Instagram username (e.g., @username)</p>
                  </div>

                  <div class="form-group">
                    <label for="whatsapp" class="form-label">
                      <span style="margin-right: var(--space-2);">💬</span>
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      id="whatsapp"
                      name="whatsapp"
                      class="form-input"
                      bind:value={profileForm.whatsapp}
                      placeholder="+44 7700 900000"
                    />
                    <p class="form-helper">Enter your WhatsApp number with country code</p>
                  </div>

                  <div class="form-group">
                    <label for="telegram" class="form-label">
                      <span style="margin-right: var(--space-2);">✈️</span>
                      Telegram
                    </label>
                    <input
                      type="text"
                      id="telegram"
                      name="telegram"
                      class="form-input"
                      bind:value={profileForm.telegram}
                      placeholder="@username"
                    />
                    <p class="form-helper">Enter your Telegram username (e.g., @username)</p>
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

          <!-- Notifications Tab -->
          {#if activeTab === "notifications"}
            <section class="settings-section">
              <h2>{t('settings.notificationSettings', userLanguage)}</h2>
              <p class="text-muted">
                {t('settings.notificationSubtitle', userLanguage)}
              </p>

              <form method="POST" action="?/updateSettings" use:enhance>
                <div class="settings-group">
                  <div class="settings-item">
                    <div class="settings-item__content">
                      <label
                        for="emailNotifications"
                        class="settings-item__label"
                      >
                        {t('settings.emailNotifications', userLanguage)}
                      </label>
                      <p class="settings-item__description">
                        {t('settings.emailNotificationsDesc', userLanguage)}
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
                        {t('settings.pushNotifications', userLanguage)}
                      </label>
                      <p class="settings-item__description">
                        {t('settings.pushNotificationsDesc', userLanguage)}
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
                        {t('settings.smsNotifications', userLanguage)}
                      </label>
                      <p class="settings-item__description">
                        {t('settings.smsNotificationsDesc', userLanguage)}
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
                    >{t('settings.updateNotifications', userLanguage)}</button
                  >
                </div>
              </form>
            </section>
          {/if}

          <!-- Privacy Tab -->
          {#if activeTab === "privacy"}
            <section class="settings-section">
              <h2>{t('settings.privacySettings', userLanguage)}</h2>
              <p class="text-muted">
                {t('settings.privacySubtitle', userLanguage)}
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
                    <option value="USDT">USDT</option>
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
  .settings-container {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .settings-header {
    margin-bottom: var(--space-8);
    width: 100%;
    max-width: 100%;
  }

  .settings-header h1 {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
  }

  .settings-layout {
    display: grid;
    grid-template-columns: minmax(0, 240px) minmax(0, 1fr);
    gap: var(--space-8);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .settings-sidebar {
    position: sticky;
    top: var(--space-8);
    height: fit-content;
    min-width: 0;
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
    width: 100%;
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }

  .settings-section {
    background: white;
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow-wrap: break-word;
    word-wrap: break-word;
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
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .settings-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-4);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
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

  .form-section {
    margin-top: var(--space-8);
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-gray-200);
  }

  .form-section__title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    margin-bottom: var(--space-2);
    color: var(--color-gray-900);
  }

  .form-section__description {
    font-size: var(--text-sm);
    color: var(--color-gray-600);
    margin-bottom: var(--space-4);
  }

  /* Avatar Upload Section */
  .avatar-upload-section {
    margin-bottom: var(--space-6);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--color-gray-200);
  }

  .avatar-upload {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .avatar-preview {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: var(--radius-full);
    overflow: hidden;
    border: 3px solid var(--color-gray-200);
    background: var(--color-gray-100);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-tertiary) 100%
    );
    color: white;
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
  }

  .avatar-upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .avatar-upload-actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  /* Form responsive styles */
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
    width: 100%;
    max-width: 100%;
  }

  .form-input-group {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    width: 100%;
    max-width: 100%;
  }

  .form-input--readonly {
    flex: 1;
    background: var(--color-gray-50);
    min-width: 0;
  }

  .form-group {
    width: 100%;
    max-width: 100%;
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .settings-header h1 {
    font-size: var(--text-2xl);
  }

  .settings-section {
    padding: var(--space-4);
  }

  .settings-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .settings-item__content {
    width: 100%;
  }

  .toggle {
    align-self: flex-end;
  }

  @media (max-width: 768px) {
    .settings-layout {
      grid-template-columns: 1fr;
      gap: var(--space-6);
      width: 100%;
      max-width: 100%;
    }

    .settings-sidebar {
      position: static;
      width: 100%;
      max-width: 100%;
    }

    .settings-nav {
      flex-direction: row;
      overflow-x: auto;
      padding-bottom: var(--space-2);
      -webkit-overflow-scrolling: touch;
      width: 100%;
    }

    .settings-nav__item {
      white-space: nowrap;
      flex-shrink: 0;
    }

    .settings-header h1 {
      font-size: var(--text-xl);
    }

    .settings-section {
      padding: var(--space-4);
      width: 100%;
      max-width: 100%;
    }

    .form-row {
      grid-template-columns: 1fr;
      gap: var(--space-4);
      width: 100%;
      max-width: 100%;
    }

    .form-input-group {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      max-width: 100%;
    }

    .form-input-group .badge {
      align-self: flex-start;
    }

    .settings-item {
      padding: var(--space-3);
      width: 100%;
      max-width: 100%;
    }

    .settings-item__content {
      margin-bottom: var(--space-2);
      width: 100%;
      max-width: 100%;
    }

    .toggle {
      align-self: flex-start;
    }

    .form-actions {
      flex-direction: column;
      width: 100%;
    }

    .form-actions .btn {
      width: 100%;
    }

    .avatar-upload {
      align-items: center;
    }

    .avatar-preview {
      width: 100px;
      height: 100px;
    }

    .avatar-upload-actions {
      width: 100%;
      justify-content: center;
    }

    .avatar-upload-actions .btn {
      flex: 1;
      min-width: 120px;
    }
  }

  @media (max-width: 480px) {
    .settings-header {
      margin-bottom: var(--space-6);
    }

    .settings-section {
      padding: var(--space-3);
    }

    .settings-nav__item {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-xs);
    }

    .settings-nav__icon {
      font-size: var(--text-sm);
    }
  }
</style>
