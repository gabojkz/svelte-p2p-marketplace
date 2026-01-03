<script>
  import Logo from "$lib/components/Logo.svelte";
</script>

<svelte:head>
  <title>Privacy Policy — Marketto</title>
  <meta
    name="description"
    content="Privacy Policy for Marketto - Learn how we collect, use, and protect your personal information"
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
          <h1>Privacy Policy</h1>
          <p class="legal-intro">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p class="legal-intro">
            At Marketto, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our peer-to-peer marketplace platform.
          </p>

          <section class="legal-section">
            <h2>1. Information We Collect</h2>
            <h3>1.1 Personal Information</h3>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul>
              <li>Name, email address, and phone number</li>
              <li>Username and profile information</li>
              <li>Location information (city, postcode)</li>
              <li>Payment and transaction information</li>
              <li>Communications with other users</li>
              <li>Social media account information (if provided)</li>
            </ul>

            <h3>1.2 Automatically Collected Information</h3>
            <p>
              When you use our platform, we automatically collect certain information, including:
            </p>
            <ul>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, features used)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and facilitate trades</li>
              <li>Communicate with you about your account and transactions</li>
              <li>Send you notifications and updates (with your consent)</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
              <li>Personalize your experience on our platform</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>3. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul>
              <li><strong>With other users:</strong> Your profile information and listings are visible to other users as part of the marketplace functionality</li>
              <li><strong>Service providers:</strong> We may share information with third-party service providers who perform services on our behalf</li>
              <li><strong>Legal requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
              <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
            </p>
          </section>

          <section class="legal-section">
            <h2>5. Your Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul>
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate or incomplete data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
            </p>
          </section>

          <section class="legal-section">
            <h2>6. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. For more information, please see our <a href="/cookie-policy">Cookie Policy</a>.
            </p>
          </section>

          <section class="legal-section">
            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section class="legal-section">
            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section class="legal-section">
            <h2>9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section class="legal-section">
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@marketto.com<br />
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
  }
</style>

