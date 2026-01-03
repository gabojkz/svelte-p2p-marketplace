<script>
  import Logo from "$lib/components/Logo.svelte";
</script>

<svelte:head>
  <title>Terms of Service — Marketto</title>
  <meta
    name="description"
    content="Terms of Service for Marketto - Read our terms and conditions for using our peer-to-peer marketplace platform"
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
          <h1>Terms of Service</h1>
          <p class="legal-intro">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p class="legal-intro">
            Please read these Terms of Service ("Terms") carefully before using the Marketto platform. By accessing or using our service, you agree to be bound by these Terms.
          </p>

          <section class="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account, accessing, or using Marketto, you agree to comply with and be bound by these Terms of Service. If you do not agree to these Terms, you may not use our platform.
            </p>
          </section>

          <section class="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              Marketto is a peer-to-peer marketplace platform that connects buyers and sellers. We provide a platform for users to list items for sale, browse listings, communicate with other users, and facilitate transactions. Marketto acts as an intermediary and does not take ownership of items listed on the platform.
            </p>
          </section>

          <section class="legal-section">
            <h2>3. User Accounts</h2>
            <h3>3.1 Account Registration</h3>
            <p>
              To use certain features of our platform, you must register for an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3>3.2 Account Eligibility</h3>
            <p>
              You must be at least 18 years old to use our platform. By using Marketto, you represent and warrant that you meet this age requirement.
            </p>
          </section>

          <section class="legal-section">
            <h2>4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>List items that are illegal, stolen, or violate any laws or regulations</li>
              <li>Post false, misleading, or deceptive information</li>
              <li>Infringe upon intellectual property rights of others</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use the platform for any fraudulent or illegal purpose</li>
              <li>Interfere with or disrupt the platform's operation</li>
              <li>Attempt to gain unauthorized access to the platform</li>
              <li>Circumvent any security measures or payment systems</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>5. Listings and Transactions</h2>
            <h3>5.1 Listing Items</h3>
            <p>
              When listing items, you agree to provide accurate descriptions, images, and pricing. You are responsible for the accuracy of your listings and for ensuring that items comply with all applicable laws.
            </p>

            <h3>5.2 Transactions</h3>
            <p>
              Transactions are between buyers and sellers. Marketto facilitates the connection but is not a party to transactions. We are not responsible for:
            </p>
            <ul>
              <li>The quality, safety, or legality of items listed</li>
              <li>The accuracy of listings or user information</li>
              <li>The ability of users to complete transactions</li>
              <li>Disputes between buyers and sellers</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>6. Fees and Payments</h2>
            <p>
              Marketto may charge fees for certain services. All fees will be clearly disclosed before you commit to a transaction. You are responsible for all applicable taxes related to your use of the platform.
            </p>
          </section>

          <section class="legal-section">
            <h2>7. Intellectual Property</h2>
            <p>
              The Marketto platform, including its design, features, and content, is owned by Marketto and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
            </p>
            <p>
              You retain ownership of content you post on the platform, but by posting, you grant Marketto a license to use, display, and distribute your content on the platform.
            </p>
          </section>

          <section class="legal-section">
            <h2>8. Disclaimers and Limitation of Liability</h2>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MARKETTO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
            </p>
          </section>

          <section class="legal-section">
            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Marketto, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the platform, violation of these Terms, or infringement of any rights of another.
            </p>
          </section>

          <section class="legal-section">
            <h2>10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time, with or without cause, and with or without notice. You may terminate your account at any time by contacting us or using account deletion features.
            </p>
          </section>

          <section class="legal-section">
            <h2>11. Dispute Resolution</h2>
            <p>
              If you have a dispute with another user, we encourage you to contact them directly. Marketto may, but is not obligated to, assist in resolving disputes. For disputes with Marketto, you agree to first contact us to seek resolution.
            </p>
          </section>

          <section class="legal-section">
            <h2>12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on the platform. Your continued use of the platform after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section class="legal-section">
            <h2>13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
          </section>

          <section class="legal-section">
            <h2>14. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> legal@marketto.com<br />
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

