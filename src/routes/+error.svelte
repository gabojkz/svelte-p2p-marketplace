<script>
  import NavigationBar from "$lib/components/NavigationBar.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  const { error: errorObj, status } = $props();

  // Get error message - handle both Error objects and strings
  const errorMessage = $derived.by(() => {
    if (!errorObj) return null;
    
    // If it's a string, use it directly
    if (typeof errorObj === 'string') return errorObj;
    
    // If it's an Error instance, get the message
    if (errorObj instanceof Error) return errorObj.message;
    
    // If it has a message property
    if (errorObj?.message) return errorObj.message;
    
    // If it has a toString method, try that
    if (typeof errorObj?.toString === 'function') {
      const str = errorObj.toString();
      if (str !== '[object Object]') return str;
    }
    
    // Try JSON stringify for debugging
    try {
      const json = JSON.stringify(errorObj);
      if (json !== '{}') return json;
    } catch (e) {
      // Ignore JSON errors
    }
    
    return null;
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
          message: errorMessage || 'Something went wrong on our end.',
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
          message: errorMessage || 'The request was invalid or malformed.',
          suggestion: 'Please check your input and try again.',
          buttonText: 'Go Back',
          buttonAction: () => window.history.back()
        };
      default:
        return {
          icon: '⚠️',
          title: `Error ${status || 'Unknown'}`,
          message: errorMessage || 'An unexpected error occurred',
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
      
      {#if errorMessage && (errorMessage !== content.message || status === 500 || status === 400)}
        <p class="error-message error-message--actual">{errorMessage}</p>
      {:else}
        <p class="error-message">{content.message}</p>
      {/if}
      
      {#if errorMessage && errorMessage !== content.message && status !== 500 && status !== 400}
        <div class="error-details">
          <details>
            <summary>Technical Details</summary>
            <pre class="error-details__content">{errorMessage}</pre>
          </details>
        </div>
      {/if}
      
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

  .error-message--actual {
    font-weight: var(--font-semibold);
    color: var(--color-gray-900);
    background: var(--color-gray-50);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-primary);
  }

  .error-suggestion {
    font-size: var(--text-base);
    color: var(--color-gray-600);
    margin-bottom: var(--space-8);
    line-height: var(--leading-relaxed);
  }

  .error-details {
    margin: var(--space-4) 0;
    text-align: left;
  }

  .error-details summary {
    cursor: pointer;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-gray-700);
    padding: var(--space-2);
    border-radius: var(--radius-md);
    background: var(--color-gray-50);
    user-select: none;
  }

  .error-details summary:hover {
    background: var(--color-gray-100);
  }

  .error-details__content {
    margin-top: var(--space-2);
    padding: var(--space-4);
    background: var(--color-gray-50);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--color-gray-800);
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 300px;
    overflow-y: auto;
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

