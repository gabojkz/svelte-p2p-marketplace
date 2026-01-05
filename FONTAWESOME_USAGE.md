# Font Awesome Usage in Svelte

Font Awesome has been installed using `svelte-fa`. Here's how to use it:

## Installation

The following packages are installed:
- `svelte-fa` - Svelte component for Font Awesome
- `@fortawesome/free-solid-svg-icons` - Solid style icons
- `@fortawesome/free-brands-svg-icons` - Brand icons
- `@fortawesome/free-regular-svg-icons` - Regular style icons

## Usage in Components

### Basic Example

```svelte
<script>
  import Fa from 'svelte-fa';
  import { faCoffee, faHeart, faUser } from '@fortawesome/free-solid-svg-icons';
  import { faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
</script>

<!-- Basic usage -->
<Fa icon={faCoffee} />

<!-- With size -->
<Fa icon={faHeart} size="2x" />

<!-- With color -->
<Fa icon={faUser} color="#ff0000" />

<!-- Brand icons -->
<Fa icon={faTwitter} />
<Fa icon={faGithub} />
```

### With Styling

```svelte
<script>
  import Fa from 'svelte-fa';
  import { faStar } from '@fortawesome/free-solid-svg-icons';
</script>

<Fa 
  icon={faStar} 
  size="lg" 
  color="#ffd700" 
  class="my-icon"
/>
```

### Available Props

- `icon` - The Font Awesome icon object (required)
- `size` - Size: "xs", "sm", "lg", "2x", "3x", etc.
- `color` - CSS color value
- `class` - Additional CSS classes
- `spin` - Boolean, adds spinning animation
- `pulse` - Boolean, adds pulsing animation
- `flip` - "horizontal", "vertical", or "both"
- `rotate` - "90", "180", or "270"

## Finding Icons

Browse available icons at: https://fontawesome.com/icons

Import the icon you need from the appropriate package:
- Solid icons: `@fortawesome/free-solid-svg-icons`
- Regular icons: `@fortawesome/free-regular-svg-icons`
- Brand icons: `@fortawesome/free-brands-svg-icons`

## Example: Using in Navigation

```svelte
<script>
  import Fa from 'svelte-fa';
  import { faHome, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
</script>

<nav>
  <a href="/">
    <Fa icon={faHome} /> Home
  </a>
  <a href="/search">
    <Fa icon={faSearch} /> Search
  </a>
  <a href="/profile">
    <Fa icon={faUser} /> Profile
  </a>
</nav>
```

