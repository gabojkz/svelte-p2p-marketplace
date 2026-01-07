<script>
  import Logo from "$lib/components/Logo.svelte";
  import LogoIcon from "$lib/components/LogoIcon.svelte";
  import { APP_NAME } from "$lib/utils/constants.js";
</script>

<svelte:head>
  <title>Cookie Policy — {APP_NAME}</title>
  <meta
    name="description"
    content="Cookie Policy for {APP_NAME} - Learn about how we use cookies and similar tracking technologies on our platform"
  />
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
          <a href="/login" class="btn btn--ghost">Log In</a>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="container container--narrow">
      <div class="legal-page">
        <a href="/" class="back-link">
          <span>←</span> Back to home
        </a>

        <div class="legal-content">
          <h1>Cookie Policy</h1>
          <p class="legal-intro">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p class="legal-intro">
            This Cookie Policy explains how {APP_NAME} uses cookies and similar tracking technologies when you visit our platform. By using our platform, you consent to the use of cookies as described in this policy.
          </p>

          <section class="legal-section">
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners. Cookies can be "persistent" (remain on your device until deleted) or "session" cookies (deleted when you close your browser).
            </p>
          </section>

          <section class="legal-section">
            <h2>2. How We Use Cookies</h2>
            <p>
              We use cookies and similar tracking technologies for the following purposes:
            </p>

            <h3>2.1 Essential Cookies</h3>
            <p>
              These cookies are necessary for the platform to function properly. They enable core functionality such as:
            </p>
            <ul>
              <li>User authentication and session management</li>
              <li>Security and fraud prevention</li>
              <li>Load balancing and performance</li>
              <li>Remembering your preferences and settings</li>
            </ul>
            <p>
              These cookies cannot be disabled as they are essential for the platform to work.
            </p>

            <h3>2.2 Functional Cookies</h3>
            <p>
              These cookies allow the platform to remember choices you make and provide enhanced, personalized features:
            </p>
            <ul>
              <li>Language preferences</li>
              <li>Currency preferences</li>
              <li>Display preferences</li>
              <li>Location settings</li>
            </ul>

            <h3>2.3 Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously:
            </p>
            <ul>
              <li>Page views and navigation patterns</li>
              <li>Time spent on pages</li>
              <li>Features used and interactions</li>
              <li>Error messages and performance issues</li>
            </ul>

            <h3>2.4 Marketing Cookies</h3>
            <p>
              These cookies are used to deliver advertisements and track the effectiveness of our marketing campaigns:
            </p>
            <ul>
              <li>Tracking conversions and ad performance</li>
              <li>Delivering relevant advertisements</li>
              <li>Limiting the number of times you see an ad</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>3. Types of Cookies We Use</h2>
            <table class="cookie-table">
              <thead>
                <tr>
                  <th>Cookie Name</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>session_id</td>
                  <td>Maintains your login session</td>
                  <td>Session</td>
                </tr>
                <tr>
                  <td>preferences</td>
                  <td>Stores your user preferences</td>
                  <td>1 year</td>
                </tr>
                <tr>
                  <td>analytics_id</td>
                  <td>Helps us analyze platform usage</td>
                  <td>2 years</td>
                </tr>
              </tbody>
            </table>
            <p class="table-note">
              <em>Note: This is an example table. You should update it with your actual cookies.</em>
            </p>
          </section>

          <section class="legal-section">
            <h2>4. Third-Party Cookies</h2>
            <p>
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and provide other services. These third parties may include:
            </p>
            <ul>
              <li>Analytics providers (e.g., Google Analytics)</li>
              <li>Advertising networks</li>
              <li>Social media platforms</li>
              <li>Payment processors</li>
            </ul>
            <p>
              These third parties may use cookies to collect information about your online activities across different websites. We do not control these third-party cookies.
            </p>
          </section>

          <section class="legal-section">
            <h2>5. Managing Cookies</h2>
            <p>
              You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer.
            </p>

            <h3>5.1 Browser Settings</h3>
            <p>
              You can control cookies through your browser settings. Here are links to instructions for popular browsers:
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>

            <h3>5.2 Opt-Out Tools</h3>
            <p>
              You can also opt out of certain third-party cookies by visiting:
            </p>
            <ul>
              <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">Your Online Choices</a></li>
              <li><a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance</a></li>
            </ul>

            <p>
              <strong>Please note:</strong> If you disable cookies, some features of our platform may not function properly, and your experience may be affected.
            </p>
          </section>

          <section class="legal-section">
            <h2>6. Do Not Track Signals</h2>
            <p>
              Some browsers include a "Do Not Track" (DNT) feature that signals to websites you visit that you do not want to have your online activity tracked. Currently, there is no standard for how DNT signals should be interpreted. We do not currently respond to DNT signals.
            </p>
          </section>

          <section class="legal-section">
            <h2>7. Updates to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our practices. We will notify you of any material changes by posting the updated policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section class="legal-section">
            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@verkado.com<br />
              <strong>Address:</strong> [Your Company Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer footer--compact">
    <div class="container">
      <div class="footer__bottom">
        <div class="flex items-center gap-3">
          <span class="logo__icon"><LogoIcon size={20} /></span>
          <span>&copy; 2025 {APP_NAME}. All rights reserved.</span>
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
  .legal-page {
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

  .legal-content {
    max-width: 800px;
    margin: 0 auto;
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-xl);
    padding: var(--space-10);
    box-shadow: var(--shadow-lg);
  }

  .legal-content h1 {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
    margin-bottom: var(--space-4);
    color: var(--color-gray-900);
  }

  .legal-intro {
    font-size: var(--text-base);
    color: var(--color-gray-600);
    margin-bottom: var(--space-6);
    line-height: 1.6;
  }

  .legal-section {
    margin-bottom: var(--space-8);
  }

  .legal-section h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    margin-bottom: var(--space-4);
    margin-top: var(--space-6);
    color: var(--color-gray-900);
  }

  .legal-section h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    margin-bottom: var(--space-3);
    margin-top: var(--space-4);
    color: var(--color-gray-800);
  }

  .legal-section p {
    font-size: var(--text-base);
    color: var(--color-gray-700);
    margin-bottom: var(--space-4);
    line-height: 1.7;
  }

  .legal-section ul {
    margin-bottom: var(--space-4);
    padding-left: var(--space-6);
  }

  .legal-section li {
    font-size: var(--text-base);
    color: var(--color-gray-700);
    margin-bottom: var(--space-2);
    line-height: 1.6;
  }

  .legal-section a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: var(--font-medium);
  }

  .legal-section a:hover {
    text-decoration: underline;
  }

  .legal-section strong {
    font-weight: var(--font-semibold);
    color: var(--color-gray-900);
  }

  .cookie-table {
    width: 100%;
    border-collapse: collapse;
    margin: var(--space-4) 0;
    font-size: var(--text-sm);
  }

  .cookie-table th,
  .cookie-table td {
    padding: var(--space-3);
    text-align: left;
    border-bottom: 1px solid var(--color-gray-200);
  }

  .cookie-table th {
    background: var(--color-gray-50);
    font-weight: var(--font-semibold);
    color: var(--color-gray-900);
  }

  .cookie-table td {
    color: var(--color-gray-700);
  }

  .table-note {
    font-size: var(--text-sm);
    color: var(--color-gray-500);
    font-style: italic;
    margin-top: var(--space-2);
  }

  @media (max-width: 768px) {
    .back-link {
      position: static;
      margin-bottom: var(--space-4);
    }

    .legal-content {
      padding: var(--space-6);
    }

    .legal-content h1 {
      font-size: var(--text-2xl);
    }

    .cookie-table {
      font-size: var(--text-xs);
    }

    .cookie-table th,
    .cookie-table td {
      padding: var(--space-2);
    }
  }
</style>

