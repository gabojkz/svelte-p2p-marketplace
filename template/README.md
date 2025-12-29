# P2P Crypto Marketplace - Frontend Template

A modern, fully responsive frontend template for a peer-to-peer cryptocurrency marketplace with secure escrow trading. Built with vanilla HTML, CSS, and JavaScript — no frameworks required.

## 🎨 Design Style

**Corporate Memphis** - A modern, playful yet professional design aesthetic featuring:
- Flat, geometric shapes
- Bold, rounded elements
- Vibrant color palette with primary color `#45D98E`
- Clean typography using DM Sans and Space Grotesk fonts

## 📁 Folder Structure

```
p2p-marketplace/
├── index.html                 # Landing Page
├── README.md                  # This file
├── assets/
│   └── images/               # Image assets (add your own)
├── css/
│   ├── styles.css            # Main styles & CSS variables
│   ├── components.css        # Reusable UI components
│   └── responsive.css        # Responsive breakpoints
├── js/
│   └── main.js               # UI interactions & utilities
└── pages/
    ├── marketplace.html      # The Feed - All active offers
    ├── search.html           # Search & Filters
    ├── offer-detail.html     # Single offer details
    ├── user-profile.html     # Public trader profile
    ├── trade-initiation.html # Start a new trade
    ├── trade-room.html       # Live trade chat + escrow
    ├── feedback.html         # Post-trade rating
    ├── dispute.html          # Dispute resolution portal
    ├── dashboard.html        # User dashboard
    ├── wallet.html           # Wallet balances
    ├── deposit.html          # Deposit crypto
    ├── withdraw.html         # Withdraw crypto
    ├── transactions.html     # Transaction history
    ├── create-listing.html   # Create new listing (multi-step)
    ├── my-listings.html      # Manage listings
    ├── kyc.html              # KYC verification center
    └── settings.html         # Account settings
```

## 🚀 Getting Started

1. **Clone or Download** this template
2. **Open `index.html`** in your browser
3. **Navigate** through all linked pages

No build tools or dependencies required — just pure HTML, CSS, and JavaScript.

## 📱 Responsive Breakpoints

| Breakpoint | Screen Size | Description |
|------------|-------------|-------------|
| Mobile | 360px – 480px | Small mobile devices |
| Tablet | 768px – 1024px | Tablets and small laptops |
| Desktop | 1280px+ | Standard desktop screens |
| Large Desktop | 1440px+ | Wide screens |

## 🎯 Key Features

### Public / Discovery Zone
- **Landing Page** - Marketing site explaining the P2P escrow system
- **Marketplace** - Browse all active buy/sell offers
- **Search & Filters** - Filter by payment method, crypto, price
- **Offer Details** - View seller terms, reputation, and pricing
- **User Profiles** - Public trader reputation and history

### Trading & Escrow Zone
- **Trade Initiation** - Enter amount and start trade
- **Live Trade Room** - Real-time chat with escrow status
- **Feedback System** - Star ratings and reviews
- **Dispute Resolution** - Upload evidence for conflicts

### User Wallet & Account
- **Dashboard** - Overview of active trades and balance
- **Wallet** - Manage crypto balances
- **Deposit/Withdraw** - Fund management
- **Transaction History** - Full ledger of activities

### Seller Management
- **Create Listing** - Multi-step listing form
- **My Listings** - Toggle ads on/off, edit prices
- **KYC Verification** - Identity verification portal
- **Settings** - Security, 2FA, payment methods

## 🎨 CSS Architecture

### CSS Variables (Custom Properties)

All colors, spacing, typography, and other design tokens are defined in `styles.css`:

```css
:root {
    /* Primary Colors */
    --color-primary: #45D98E;
    --color-primary-light: #6BE5A8;
    --color-primary-dark: #2EBC74;
    
    /* Spacing */
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    
    /* Border Radius */
    --radius-md: 12px;
    --radius-lg: 16px;
    
    /* ... and more */
}
```

### Component Classes

Reusable component styles in `components.css`:

- `.btn` - Buttons (`.btn--primary`, `.btn--outline`, etc.)
- `.card` - Content cards
- `.offer-card` - Marketplace offer cards
- `.form-input`, `.form-select` - Form elements
- `.modal` - Modal dialogs
- `.tabs` - Tab navigation
- `.alert` - Alert messages
- `.badge` - Status badges
- `.avatar` - User avatars
- `.table` - Data tables
- And more...

## 🔧 JavaScript Features

Minimal vanilla JavaScript for UI interactions:

- **Mobile Navigation** - Hamburger menu toggle
- **Modals** - Open/close modal dialogs
- **Tabs** - Tab switching
- **Dropdowns** - Dropdown menus
- **Form Validation** - Basic client-side validation
- **Rating Stars** - Interactive star ratings
- **Copy to Clipboard** - One-click copy functionality
- **Toast Notifications** - Popup notifications
- **File Upload Preview** - Image preview on upload
- **Animated Counters** - Number animations
- **Smooth Scroll** - Smooth anchor scrolling

## 🔌 Integration Guide

### React

```jsx
// Import the CSS
import './css/styles.css';
import './css/components.css';
import './css/responsive.css';

// Use the class names directly
function Button({ children }) {
  return <button className="btn btn--primary">{children}</button>;
}
```

### Vue

```vue
<template>
  <button class="btn btn--primary">
    <slot />
  </button>
</template>

<style>
@import './css/styles.css';
@import './css/components.css';
@import './css/responsive.css';
</style>
```

### Laravel Blade

```php
<!-- Include CSS in layout -->
<link rel="stylesheet" href="{{ asset('css/styles.css') }}">
<link rel="stylesheet" href="{{ asset('css/components.css') }}">
<link rel="stylesheet" href="{{ asset('css/responsive.css') }}">

<!-- Use components -->
<button class="btn btn--primary">Submit</button>
```

## 🎨 Customization

### Changing the Primary Color

Update the CSS variable in `styles.css`:

```css
:root {
    --color-primary: #YOUR_COLOR;
    --color-primary-light: /* lighter shade */;
    --color-primary-dark: /* darker shade */;
}
```

### Adding New Fonts

1. Add Google Fonts link in HTML `<head>`
2. Update font variables in `styles.css`:

```css
:root {
    --font-primary: 'Your Font', sans-serif;
    --font-display: 'Your Display Font', sans-serif;
}
```

## ✅ Accessibility

- Semantic HTML5 elements
- ARIA labels where appropriate
- Keyboard navigation support
- Focus visible states
- Color contrast compliance
- Reduced motion support

## 📄 License

This template is free to use for personal and commercial projects.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

Built with ❤️ for the crypto community

