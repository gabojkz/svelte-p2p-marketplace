<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  const { error: errorObj, status } = $props();

  // Get error message - handle both Error objects and strings
  const errorMessage = $derived.by(() => {
    if (!errorObj) return 'An unexpected error occurred';
    if (typeof errorObj === 'string') return errorObj;
    if (errorObj instanceof Error) return errorObj.message;
    if (errorObj?.message) return errorObj.message;
    return 'An unexpected error occurred';
  });

  // Get status-specific content
  const content = $derived.by(() => {
    switch (status) {
      case 404:
        return {
          icon: '🔍',
          title: 'Page Not Found',
          message: "Sorry, we couldn't find the page you're looking for.",
          suggestion: 'The page may have been moved, deleted, or the URL might be incorrect.',
          buttonText: 'Go to Homepage',
          buttonAction: () => goto('/')
        };
      case 500:
        return {
          icon: '⚠️',
          title: 'Server Error',
          message: 'Something went wrong on our end.',
          suggestion: 'We\'re working to fix this issue. Please try again in a few moments.',
          buttonText: 'Go to Homepage',
          buttonAction: () => goto('/')
        };
      case 403:
        return {
          icon: '🚫',
          title: 'Access Forbidden',
          message: "You don't have permission to access this resource.",
          suggestion: 'If you believe this is an error, please contact support.',
          buttonText: 'Go to Homepage',
          buttonAction: () => goto('/')
        };
      case 401:
        return {
          icon: '🔐',
          title: 'Unauthorized',
          message: 'You need to be logged in to access this page.',
          suggestion: 'Please sign in to continue.',
          buttonText: 'Sign In',
          buttonAction: () => goto('/login')
        };
      case 400:
        return {
          icon: '❌',
          title: 'Bad Request',
          message: 'The request was invalid or malformed.',
          suggestion: 'Please check your input and try again.',
          buttonText: 'Go Back',
          buttonAction: () => window.history.back()
        };
      default:
        return {
          icon: '⚠️',
          title: `Error ${status || 'Unknown'}`,
          message: errorMessage,
          suggestion: 'Please try again or contact support if the problem persists.',
          buttonText: 'Go to Homepage',
          buttonAction: () => goto('/')
        };
    }
  });
</script>

<svelte:head>
  <title>{content.title} — Marketto</title>
</svelte:head>

<NavigationBar />

<div class="page-wrapper">
  <main class="error-page">
    <div class="error-container" data-status={status}>
      <div class="error-icon">{content.icon}</div>
      
      <h1 class="error-title">{content.title}</h1>
      
      {#if status}
        <div class="error-status">Error {status}</div>
      {/if}
      
      <p class="error-message">{content.message}</p>
      
      {#if content.suggestion}
        <p class="error-suggestion">{content.suggestion}</p>
      {/if}

      <div class="error-actions">
        <button
          class="btn btn--primary btn--lg"
          onclick={content.buttonAction}
          type="button"
        >
          {content.buttonText}
        </button>
        <button
          class="btn btn--outline btn--lg"
          onclick={() => window.history.back()}
          type="button"
        >
          Go Back
        </button>
      </div>

      <div class="error-links">
        <a href="/marketplace" class="error-link">Browse Marketplace</a>
        <span class="error-link-separator">•</span>
        <a href="/my-listings" class="error-link">My Listings</a>
        <span class="error-link-separator">•</span>
        <a href="/my-trades" class="error-link">My Trades</a>
      </div>
    </div>
  </main>
</div>

<style>
  .error-page {
    min-height: calc(100vh - 80px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-8) var(--space-4);
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .error-container {
    max-width: 600px;
    width: 100%;
    text-align: center;
    background: var(--color-white);
    border-radius: var(--radius-xl);
    padding: var(--space-12) var(--space-8);
    box-shadow: var(--shadow-xl);
  }

  .error-icon {
    font-size: 5rem;
    margin-bottom: var(--space-6);
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .error-title {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
    color: var(--color-gray-900);
    margin-bottom: var(--space-2);
  }

  .error-status {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    background: var(--color-gray-100);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--color-gray-600);
    margin-bottom: var(--space-4);
    font-family: var(--font-mono);
  }

  .error-message {
    font-size: var(--text-lg);
    color: var(--color-gray-700);
    margin-bottom: var(--space-3);
    line-height: var(--leading-relaxed);
  }

  .error-suggestion {
    font-size: var(--text-base);
    color: var(--color-gray-600);
    margin-bottom: var(--space-8);
    line-height: var(--leading-relaxed);
  }

  .error-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    margin-bottom: var(--space-8);
    flex-wrap: wrap;
  }

  .error-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    flex-wrap: wrap;
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-gray-200);
  }

  .error-link {
    color: var(--color-primary);
    text-decoration: none;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    transition: color var(--transition-fast);
  }

  .error-link:hover {
    color: var(--color-primary-dark);
    text-decoration: underline;
  }

  .error-link-separator {
    color: var(--color-gray-400);
    font-size: var(--text-sm);
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .error-page {
      padding: var(--space-4);
    }

    .error-container {
      padding: var(--space-8) var(--space-6);
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: var(--space-4);
    }

    .error-title {
      font-size: var(--text-2xl);
    }

    .error-message {
      font-size: var(--text-base);
    }

    .error-actions {
      flex-direction: column;
    }

    .error-actions .btn {
      width: 100%;
    }

    .error-links {
      flex-direction: column;
      gap: var(--space-3);
    }

    .error-link-separator {
      display: none;
    }
  }

  /* Status-specific colors */
  .error-container[data-status="404"] .error-status {
    background: #fef3c7;
    color: #92400e;
  }

  .error-container[data-status="500"] .error-status {
    background: #fee2e2;
    color: #991b1b;
  }

  .error-container[data-status="403"] .error-status {
    background: #fce7f3;
    color: #9f1239;
  }

  .error-container[data-status="401"] .error-status {
    background: #dbeafe;
    color: #1e40af;
  }

  .error-container[data-status="400"] .error-status {
    background: #fef3c7;
    color: #92400e;
  }
</style>

