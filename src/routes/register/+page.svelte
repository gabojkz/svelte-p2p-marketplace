<script>
  import { signUp } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import Logo from "$lib/components/Logo.svelte";

  let name = $state("");
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let error = $state("");
  let loading = $state(false);
  let emailError = $state("");
  let checkingEmail = $state(false);

  // Validate email domain
  async function validateEmailDomain(emailValue) {
    if (!emailValue || !emailValue.includes("@")) {
      emailError = "";
      return true;
    }

    checkingEmail = true;
    emailError = "";

    try {
      const { validateEmail } = await import("$lib/services/auth.js");
      const data = await validateEmail(emailValue);

      if (data.valid) {
        emailError = "";
        return true;
      } else {
        emailError = data.error || "Email domain is not allowed";
        return false;
      }
    } catch (err) {
      console.error("Error validating email:", err);
      // Don't block registration if validation service fails
      return true;
    } finally {
      checkingEmail = false;
    }
  }

  // Handle email input with debounce
  /** @type {ReturnType<typeof setTimeout> | null} */
  let emailTimeout = null;

  async function handleEmailInput() {
    if (emailTimeout) clearTimeout(emailTimeout);
    emailTimeout = setTimeout(async () => {
      if (email) {
        await validateEmailDomain(email);
      }
    }, 500);
  }

  /** @param {SubmitEvent} e */
  async function handleSubmit(e) {
    e.preventDefault();
    error = "";
    emailError = "";

    // Validate email domain before submitting
    const isEmailValid = await validateEmailDomain(email);
    if (!isEmailValid) {
      error = emailError || "Please use an allowed email domain";
      return;
    }

    if (password !== confirmPassword) {
      error = "Passwords do not match";
      return;
    }

    if (password.length < 8) {
      error = "Password must be at least 8 characters";
      return;
    }

    loading = true;

    try {
      const result = await signUp.email({ name, email, password });

      if (result.error) {
        error = result.error.message || "Registration failed";
      } else {
        goto("/marketplace");
      }
    } catch (err) {
      error = "An unexpected error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Create Account — Marketto</title>
</svelte:head>

<div class="page-wrapper">
  <!-- Header -->
  <header class="header">
    <div class="container">
      <div class="header__inner">
        <Logo />
        <nav class="nav" aria-label="Main navigation">
          <a href="/marketplace" class="nav__link">Browse</a>
          <a href="/marketplace" class="nav__link">How It Works</a>
        </nav>
        <div class="header__actions">
          <a href="/login" class="btn btn--ghost">Sign In</a>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container container--narrow">
      <div class="auth-page">
        <a href="/" class="back-link">
          <span>←</span> Back to home
        </a>

        <div class="auth-container">
          <div class="auth-header">
            <h1>Create your account</h1>
            <p class="text-muted">Get started with Marketto today</p>
          </div>

          <form class="auth-form" onsubmit={handleSubmit} autocomplete="on">
            {#if error}
              <div class="alert alert--error">
                <span class="error-icon">⚠️</span>
                {error}
              </div>
            {/if}

            <div class="form-group">
              <label for="name" class="form-label">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                bind:value={name}
                class="form-input"
                placeholder="John Doe"
                autocomplete="name"
                required
                disabled={loading}
              />
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                bind:value={email}
                class="form-input"
                class:form-input--error={!!emailError}
                placeholder="you@example.com"
                autocomplete="email"
                required
                disabled={loading || checkingEmail}
                oninput={handleEmailInput}
              />
              {#if checkingEmail}
                <span class="form-helper" style="color: var(--color-gray-500);">
                  Checking email domain...
                </span>
              {:else if emailError}
                <span class="form-error">{emailError}</span>
              {:else}
                <span class="form-helper">
                  Only certain email providers are allowed
                </span>
              {/if}
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                bind:value={password}
                class="form-input"
                placeholder="••••••••"
                autocomplete="new-password"
                required
                disabled={loading}
                minlength="8"
              />
              <span class="form-helper">Must be at least 8 characters</span>
            </div>

            <div class="form-group">
              <label for="confirmPassword" class="form-label"
                >Confirm Password</label
              >
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                bind:value={confirmPassword}
                class="form-input"
                placeholder="••••••••"
                autocomplete="new-password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              class="btn btn--primary btn--full"
              disabled={loading}
            >
              {#if loading}
                <span class="spinner"></span>
                Creating account...
              {:else}
                Create Account
              {/if}
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a href="/login">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer footer--compact">
    <div class="container">
      <div class="footer__bottom">
        <div class="flex items-center gap-3">
          <span class="logo__icon">🏪</span>
          <span>&copy; 2025 Marketto. All rights reserved.</span>
        </div>
        <nav class="footer__legal-links">
          <a href="/privacy" class="footer__link">Privacy</a>
          <a href="/terms" class="footer__link">Terms</a>
          <a href="/cookie-policy" class="footer__link">Cookies</a>
        </nav>
      </div>
    </div>
  </footer>
</div>

<style>
  .auth-page {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-16) 0;
    gap: var(--space-6);
  }

  .back-link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-gray-600);
    font-size: var(--text-sm);
    transition: color var(--transition-fast);
    text-decoration: none;
    align-self: flex-start;
    margin-left: var(--space-4);
  }

  .back-link:hover {
    color: var(--color-primary);
  }

  .auth-container {
    width: 100%;
    max-width: 440px;
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-xl);
    padding: var(--space-10);
    box-shadow: var(--shadow-lg);
  }

  .auth-header {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .auth-header h1 {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
    margin-bottom: var(--space-2);
    color: var(--color-gray-900);
  }

  .auth-header p {
    color: var(--color-gray-600);
    font-size: var(--text-base);
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .alert {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  .alert--error {
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    color: var(--color-error);
  }

  .error-icon {
    font-size: var(--text-lg);
  }

  .auth-footer {
    margin-top: var(--space-8);
    text-align: center;
    color: var(--color-gray-600);
    font-size: var(--text-sm);
  }

  .auth-footer a {
    color: var(--color-primary);
    font-weight: var(--font-medium);
    text-decoration: none;
  }

  .auth-footer a:hover {
    text-decoration: underline;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: var(--radius-full);
    animation: spin 0.6s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .form-error {
    color: var(--color-error);
    font-size: var(--text-sm);
    margin-top: var(--space-1);
    display: block;
  }

  .form-input--error {
    border-color: var(--color-error);
  }

  @media (max-width: 768px) {
    .auth-page {
      padding: var(--space-8) 0;
      gap: var(--space-4);
    }

    .back-link {
      margin-left: 0;
      align-self: flex-start;
    }

    .auth-container {
      padding: var(--space-6);
      width: 100%;
    }
  }
</style>
