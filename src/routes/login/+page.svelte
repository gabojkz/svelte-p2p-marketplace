<script>
  import { signIn } from "$lib/auth-client.js";
  import { goto } from "$app/navigation";
  import Logo from "$lib/components/Logo.svelte";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);

  /** @param {SubmitEvent} e */
  async function handleSubmit(e) {
    e.preventDefault();
    error = "";
    loading = true;

    try {
      const result = await signIn.email({ email, password });

      if (result.error) {
        error = result.error.message || "Invalid credentials";
      } else {
        goto("/my-listings");
      }
    } catch (err) {
      error = "An unexpected error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign In — Marketto</title>
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
          <a href="/register" class="btn btn--ghost">Sign Up</a>
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
            <h1>Welcome back</h1>
            <p class="text-muted">Sign in to your account to continue</p>
          </div>

          <form class="auth-form" onsubmit={handleSubmit}>
            {#if error}
              <div class="alert alert--error">
                <span class="error-icon">⚠️</span>
                {error}
              </div>
            {/if}

            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                type="email"
                bind:value={email}
                class="form-input"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                type="password"
                bind:value={password}
                class="form-input"
                placeholder="••••••••"
                required
                disabled={loading}
                minlength="8"
              />
            </div>

            <button
              type="submit"
              class="btn btn--primary btn--full"
              disabled={loading}
            >
              {#if loading}
                <span class="spinner"></span>
                Signing in...
              {:else}
                Sign In
              {/if}
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a href="/register">Create one</a></p>
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
        </nav>
      </div>
    </div>
  </footer>
</div>

<style>
  .auth-page {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-16) 0;
    position: relative;
  }

  .back-link {
    position: absolute;
    top: var(--space-8);
    left: var(--space-6);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-gray-600);
    font-size: var(--text-sm);
    transition: color var(--transition-fast);
    text-decoration: none;
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

  @media (max-width: 768px) {
    .back-link {
      position: static;
      margin-bottom: var(--space-4);
    }

    .auth-container {
      padding: var(--space-6);
    }
  }
</style>
