<script>
  import { APP_NAME } from '$lib/utils/constants.js';
  import LogoIcon from './LogoIcon.svelte';
</script>

<a href="/" class="logo">
  <span class="logo__icon">
    <LogoIcon size={24} />
  </span>
  <span class="logo__text">{APP_NAME}</span>
</a>
