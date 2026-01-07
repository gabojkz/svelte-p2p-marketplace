<script>
  import Fa from "svelte-fa";
  import { faXTwitter, faFacebook, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
  import { APP_NAME } from '$lib/utils/constants.js';
  import { t } from '$lib/utils/translations.js';
  import LogoIcon from './LogoIcon.svelte';

  let { appName = APP_NAME, userLanguage = 'en' } = $props();
</script>

<!-- ============================================
         FOOTER
         ============================================ -->
<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <!-- Brand Column -->
      <div class="footer__brand">
        <a href="/" class="logo footer__logo">
          <span class="logo__icon">
            <LogoIcon size={24} />
          </span>
          <span>{appName}</span>
        </a>
        <p class="footer__description">
          The best way to buy and sell locally. Connect with your community.
        </p>
        <div class="footer__social">
          <button
            type="button"
            class="footer__social-link"
            aria-label="Twitter"
          >
            <Fa icon={faXTwitter} />
          </button>
          <button
            type="button"
            class="footer__social-link"
            aria-label="Facebook"
          >
            <Fa icon={faFacebook} />
          </button>
          <button
            type="button"
            class="footer__social-link"
            aria-label="Instagram"
          >
            <Fa icon={faInstagram} />
          </button>
          <button
            type="button"
            class="footer__social-link"
            aria-label="YouTube"
          >
            <Fa icon={faYoutube} />
          </button>
        </div>
      </div>

      <!-- Categories Column -->
      <div class="footer__column">
        <h4 class="footer__column-title">Categories</h4>
        <nav class="footer__links">
          <a href="/marketplace?category=vehicles" class="footer__link"
            >Vehicles</a
          >
          <a href="/marketplace?category=electronics" class="footer__link"
            >Electronics</a
          >
          <a href="/marketplace?category=property" class="footer__link"
            >Property</a
          >
          <a href="/marketplace?category=fashion" class="footer__link"
            >Fashion</a
          >
        </nav>
      </div>

      <!-- Resources Column -->
      <div class="footer__column">
        <h4 class="footer__column-title">Resources</h4>
        <nav class="footer__links">
          <button type="button" class="footer__link">Help Center</button>
          <button type="button" class="footer__link">Safety Tips</button>
          <button type="button" class="footer__link">Seller Guide</button>
          <button type="button" class="footer__link">Buyer Guide</button>
        </nav>
      </div>

      <!-- Company Column -->
      <div class="footer__column">
        <h4 class="footer__column-title">Company</h4>
        <nav class="footer__links">
          <button type="button" class="footer__link">About Us</button>
          <button type="button" class="footer__link">Careers</button>
          <button type="button" class="footer__link">Blog</button>
          <button type="button" class="footer__link">Contact</button>
        </nav>
      </div>
    </div>

    <div class="footer__bottom">
      <p>{t('footer.copyright', userLanguage, { year: new Date().getFullYear(), appName })}</p>
      <nav class="footer__legal-links">
        <a href="/privacy" class="footer__link">{t('footer.privacy', userLanguage)}</a>
        <a href="/terms" class="footer__link">{t('footer.terms', userLanguage)}</a>
        <a href="/cookie-policy" class="footer__link">{t('footer.cookies', userLanguage)}</a>
      </nav>
    </div>
  </div>
</footer>

