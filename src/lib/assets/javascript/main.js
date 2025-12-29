/* ============================================
   P2P MARKETPLACE - MAIN JAVASCRIPT
   Handles: Navigation, Modals, Tabs, Dropdowns,
   and other UI interactions
   ============================================ */

'use strict';

/* ============================================
   DOM READY
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileNav();
    initModals();
    initTabs();
    initDropdowns();
    initTooltips();
    initFormValidation();
    initRatingStars();
    initCopyToClipboard();
    initSearchFilters();
    initSmoothScroll();
    initAlerts();
    initFileUpload();
    initPasswordToggle();
    initCounters();
    initMobileFilters();
    initCategoryTabs();
});

/* ============================================
   MOBILE NAVIGATION
   ============================================ */
function initMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    const navOverlay = document.querySelector('.nav-overlay');

    if (!menuToggle || !nav) return;

    // Toggle menu on button click
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('is-active');
        nav.classList.toggle('is-active');
        if (navOverlay) {
            navOverlay.classList.toggle('is-active');
        }
        document.body.classList.toggle('nav-open');
    });

    // Close menu on overlay click
    if (navOverlay) {
        navOverlay.addEventListener('click', function() {
            menuToggle.classList.remove('is-active');
            nav.classList.remove('is-active');
            navOverlay.classList.remove('is-active');
            document.body.classList.remove('nav-open');
        });
    }

    // Close menu on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('is-active')) {
            menuToggle.classList.remove('is-active');
            nav.classList.remove('is-active');
            if (navOverlay) {
                navOverlay.classList.remove('is-active');
            }
            document.body.classList.remove('nav-open');
        }
    });

    // Close menu when clicking on nav links
    const navLinks = nav.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('is-active');
            nav.classList.remove('is-active');
            if (navOverlay) {
                navOverlay.classList.remove('is-active');
            }
            document.body.classList.remove('nav-open');
        });
    });
}

/* ============================================
   MODAL SYSTEM
   ============================================ */
function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modalCloses = document.querySelectorAll('[data-modal-close]');

    // Open modal
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal-target');
            openModal(modalId);
        });
    });

    // Close modal via close button
    modalCloses.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            const backdrop = document.querySelector('.modal-backdrop');
            closeModal(modal, backdrop);
        });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', function() {
            const activeModal = document.querySelector('.modal.is-active');
            if (activeModal) {
                closeModal(activeModal, this);
            }
        });
    });

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.is-active');
            const backdrop = document.querySelector('.modal-backdrop.is-active');
            if (activeModal && backdrop) {
                closeModal(activeModal, backdrop);
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = document.querySelector('.modal-backdrop');

    if (modal && backdrop) {
        backdrop.classList.add('is-active');
        modal.classList.add('is-active');
        document.body.style.overflow = 'hidden';

        // Focus first focusable element
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
            focusable.focus();
        }
    }
}

function closeModal(modal, backdrop) {
    if (modal) modal.classList.remove('is-active');
    if (backdrop) backdrop.classList.remove('is-active');
    document.body.style.overflow = '';
}

// Expose to global scope for inline handlers
window.openModal = openModal;
window.closeModal = closeModal;

/* ============================================
   TABS SYSTEM
   ============================================ */
function initTabs() {
    const tabGroups = document.querySelectorAll('.tabs');

    tabGroups.forEach(tabGroup => {
        const tabs = tabGroup.querySelectorAll('.tab');
        const tabContents = tabGroup.parentElement.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetId = this.getAttribute('data-tab');

                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('is-active'));
                tabContents.forEach(c => c.classList.remove('is-active'));

                // Add active class to clicked tab and corresponding content
                this.classList.add('is-active');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('is-active');
                }
            });
        });
    });
}

/* ============================================
   DROPDOWN SYSTEM
   ============================================ */
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown__trigger');
        
        if (trigger) {
            trigger.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('is-active');
                    }
                });

                dropdown.classList.toggle('is-active');
            });
        }
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function() {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('is-active');
        });
    });

    // Close on ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('is-active');
            });
        }
    });
}

/* ============================================
   TOOLTIPS
   ============================================ */
function initTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');

    tooltipTriggers.forEach(trigger => {
        const tooltipText = trigger.getAttribute('data-tooltip');
        
        trigger.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            document.body.appendChild(tooltip);

            const rect = this.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            tooltip.style.zIndex = 'var(--z-tooltip)';
        });

        trigger.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

/* ============================================
   FORM VALIDATION
   ============================================ */
function initFormValidation() {
    const forms = document.querySelectorAll('[data-validate]');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                // Remove previous error state
                field.classList.remove('form-input--error');
                const existingError = field.parentElement.querySelector('.form-error');
                if (existingError) existingError.remove();

                // Validate
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('form-input--error');
                    
                    const error = document.createElement('span');
                    error.className = 'form-error';
                    error.textContent = 'This field is required';
                    field.parentElement.appendChild(error);
                }

                // Email validation
                if (field.type === 'email' && field.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value)) {
                        isValid = false;
                        field.classList.add('form-input--error');
                        
                        const error = document.createElement('span');
                        error.className = 'form-error';
                        error.textContent = 'Please enter a valid email';
                        field.parentElement.appendChild(error);
                    }
                }
            });

            if (!isValid) {
                e.preventDefault();
            }
        });

        // Clear error on input
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('form-input--error');
                const error = this.parentElement.querySelector('.form-error');
                if (error) error.remove();
            });
        });
    });
}

/* ============================================
   RATING STARS
   ============================================ */
function initRatingStars() {
    const ratingContainers = document.querySelectorAll('.rating');

    ratingContainers.forEach(container => {
        const stars = container.querySelectorAll('.rating__star');
        const input = container.querySelector('input[type="hidden"]');

        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                const rating = index + 1;
                
                // Update hidden input
                if (input) {
                    input.value = rating;
                }

                // Update visual state
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('rating__star--filled');
                    } else {
                        s.classList.remove('rating__star--filled');
                    }
                });
            });

            // Hover effect
            star.addEventListener('mouseenter', function() {
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.style.color = 'var(--color-accent-yellow)';
                    } else {
                        s.style.color = '';
                    }
                });
            });
        });

        container.addEventListener('mouseleave', function() {
            stars.forEach(s => {
                s.style.color = '';
            });
        });
    });
}

/* ============================================
   COPY TO CLIPBOARD
   ============================================ */
function initCopyToClipboard() {
    const copyButtons = document.querySelectorAll('[data-copy]');

    copyButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const textToCopy = this.getAttribute('data-copy');
            
            try {
                await navigator.clipboard.writeText(textToCopy);
                
                // Show feedback
                const originalText = this.innerHTML;
                this.innerHTML = '✓ Copied!';
                this.classList.add('btn--success');
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.classList.remove('btn--success');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });
}

/* ============================================
   SEARCH & FILTERS
   ============================================ */
function initSearchFilters() {
    const searchInput = document.querySelector('.search-input');
    const filterToggles = document.querySelectorAll('.filter-toggle');
    const filterSidebar = document.querySelector('.filter-sidebar');
    const filterOverlay = document.querySelector('.filter-overlay');

    // Search input debounce
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                // Trigger search (in real app, this would filter results)
                console.log('Searching for:', this.value);
            }, 300);
        });
    }

    // Filter sidebar toggle (mobile)
    filterToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            if (filterSidebar) {
                filterSidebar.classList.toggle('is-active');
            }
            if (filterOverlay) {
                filterOverlay.classList.toggle('is-active');
            }
        });
    });

    // Close filter sidebar
    if (filterOverlay) {
        filterOverlay.addEventListener('click', function() {
            if (filterSidebar) {
                filterSidebar.classList.remove('is-active');
            }
            filterOverlay.classList.remove('is-active');
        });
    }

    // Filter checkboxes
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // In real app, this would filter the results
            console.log('Filter changed:', this.name, this.checked);
        });
    });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerOffset = 80; // Account for fixed header
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   DISMISSIBLE ALERTS
   ============================================ */
function initAlerts() {
    const alertDismissButtons = document.querySelectorAll('.alert__dismiss');

    alertDismissButtons.forEach(button => {
        button.addEventListener('click', function() {
            const alert = this.closest('.alert');
            if (alert) {
                alert.style.opacity = '0';
                alert.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    alert.remove();
                }, 300);
            }
        });
    });
}

/* ============================================
   FILE UPLOAD PREVIEW
   ============================================ */
function initFileUpload() {
    const fileInputs = document.querySelectorAll('.file-upload__input');

    fileInputs.forEach(input => {
        const wrapper = input.closest('.file-upload');
        const preview = wrapper ? wrapper.querySelector('.file-upload__preview') : null;
        const label = wrapper ? wrapper.querySelector('.file-upload__label') : null;

        input.addEventListener('change', function() {
            const file = this.files[0];
            
            if (file) {
                // Update label text
                if (label) {
                    label.textContent = file.name;
                }

                // Show image preview if applicable
                if (preview && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                        preview.classList.add('has-image');
                    };
                    reader.readAsDataURL(file);
                }
            }
        });

        // Drag and drop
        if (wrapper) {
            wrapper.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('is-dragover');
            });

            wrapper.addEventListener('dragleave', function() {
                this.classList.remove('is-dragover');
            });

            wrapper.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('is-dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    input.files = files;
                    input.dispatchEvent(new Event('change'));
                }
            });
        }
    });
}

/* ============================================
   PASSWORD VISIBILITY TOGGLE
   ============================================ */
function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.password-toggle');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            
            if (input && input.type === 'password') {
                input.type = 'text';
                this.textContent = '🙈';
            } else if (input) {
                input.type = 'password';
                this.textContent = '👁';
            }
        });
    });
}

/* ============================================
   ANIMATED COUNTERS
   ============================================ */
function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-counter'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current));
        }
    }, 16);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

/* ============================================
   TOAST NOTIFICATIONS
   ============================================ */
function showToast(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');
    
    // Create container if it doesn't exist
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <span class="toast__message">${message}</span>
        <button class="toast__close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Expose to global scope
window.showToast = showToast;

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Debounce function to limit how often a function is called
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls to once per interval
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format crypto amount
 */
function formatCrypto(amount, decimals = 8) {
    return parseFloat(amount).toFixed(decimals);
}

/**
 * Calculate percentage
 */
function calculatePercentage(part, whole) {
    return ((part / whole) * 100).toFixed(2);
}

// Expose utilities to global scope
window.debounce = debounce;
window.throttle = throttle;
window.formatCurrency = formatCurrency;
window.formatCrypto = formatCrypto;

/* ============================================
   TRADE AMOUNT CALCULATOR
   (For trade initiation page)
   ============================================ */
function initTradeCalculator() {
    const fiatInput = document.getElementById('fiat-amount');
    const cryptoDisplay = document.getElementById('crypto-amount');
    const exchangeRate = document.getElementById('exchange-rate');

    if (fiatInput && cryptoDisplay) {
        fiatInput.addEventListener('input', function() {
            const fiatAmount = parseFloat(this.value) || 0;
            const rate = parseFloat(exchangeRate?.dataset?.rate) || 42000;
            const cryptoAmount = fiatAmount / rate;
            cryptoDisplay.textContent = formatCrypto(cryptoAmount);
        });
    }
}

// Initialize trade calculator if on trade page
if (document.getElementById('fiat-amount')) {
    initTradeCalculator();
}

/* ============================================
   SIDEBAR TOGGLE (Dashboard)
   ============================================ */
function initDashboardSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.dashboard-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('is-active');
            if (overlay) overlay.classList.toggle('is-active');
        });

        if (overlay) {
            overlay.addEventListener('click', function() {
                sidebar.classList.remove('is-active');
                overlay.classList.remove('is-active');
            });
        }
    }
}

// Initialize dashboard sidebar
initDashboardSidebar();

/* ============================================
   CHAT FUNCTIONALITY
   (For trade room)
   ============================================ */
function initChat() {
    const chatForm = document.querySelector('.chat-form');
    const chatInput = document.querySelector('.chat-input input');
    const chatMessages = document.querySelector('.chat-messages');

    if (chatForm && chatInput && chatMessages) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const message = chatInput.value.trim();
            if (!message) return;

            // Add message to chat (in real app, this would send to server)
            const messageEl = document.createElement('div');
            messageEl.className = 'chat-message chat-message--own';
            messageEl.innerHTML = `
                <div class="chat-message__bubble">
                    ${escapeHtml(message)}
                </div>
                <span class="chat-message__time">Just now</span>
            `;
            chatMessages.appendChild(messageEl);

            // Clear input
            chatInput.value = '';

            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize chat
initChat();

/* ============================================
   STEP WIZARD
   (For multi-step forms)
   ============================================ */
function initStepWizard() {
    const wizard = document.querySelector('.step-wizard');
    if (!wizard) return;

    const steps = wizard.querySelectorAll('.step-wizard__step');
    const nextBtns = wizard.querySelectorAll('.step-wizard__next');
    const prevBtns = wizard.querySelectorAll('.step-wizard__prev');
    let currentStep = 0;

    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.toggle('is-active', i === index);
        });

        // Update step indicators
        const indicators = wizard.querySelectorAll('.step');
        indicators.forEach((indicator, i) => {
            indicator.classList.remove('step--active', 'step--completed');
            if (i < index) {
                indicator.classList.add('step--completed');
            } else if (i === index) {
                indicator.classList.add('step--active');
            }
        });
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });
}

// Initialize step wizard
initStepWizard();

/* ============================================
   MOBILE FILTERS TOGGLE
   (For marketplace page)
   ============================================ */
function initMobileFilters() {
    const filterBtn = document.getElementById('mobileFilterBtn');
    const filtersSidebar = document.getElementById('filtersSidebar');
    const filterCloseBtn = document.getElementById('filterCloseBtn');

    if (!filterBtn || !filtersSidebar) return;

    // Create overlay if it doesn't exist
    let filterOverlay = document.querySelector('.filters-overlay');
    if (!filterOverlay) {
        filterOverlay = document.createElement('div');
        filterOverlay.className = 'filters-overlay';
        filterOverlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(filterOverlay);
    }

    // Open sidebar
    filterBtn.addEventListener('click', function() {
        filtersSidebar.classList.add('is-active');
        filterOverlay.style.opacity = '1';
        filterOverlay.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        
        // Show close button on mobile
        if (filterCloseBtn) {
            filterCloseBtn.style.display = 'block';
        }
    });

    // Close sidebar via close button
    if (filterCloseBtn) {
        filterCloseBtn.addEventListener('click', function() {
            filtersSidebar.classList.remove('is-active');
            filterOverlay.style.opacity = '0';
            filterOverlay.style.visibility = 'hidden';
            document.body.style.overflow = '';
        });
    }

    // Close sidebar via overlay
    filterOverlay.addEventListener('click', function() {
        filtersSidebar.classList.remove('is-active');
        filterOverlay.style.opacity = '0';
        filterOverlay.style.visibility = 'hidden';
        document.body.style.overflow = '';
    });

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && filtersSidebar.classList.contains('is-active')) {
            filtersSidebar.classList.remove('is-active');
            filterOverlay.style.opacity = '0';
            filterOverlay.style.visibility = 'hidden';
            document.body.style.overflow = '';
        }
    });
}

/* ============================================
   CATEGORY TABS
   (For marketplace page)
   ============================================ */
function initCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    
    if (!categoryTabs.length) return;

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active from all tabs
            categoryTabs.forEach(t => t.classList.remove('category-tab--active'));
            
            // Add active to clicked tab
            this.classList.add('category-tab--active');
            
            // Get category
            const category = this.dataset.category;
            
            // In a real app, this would filter the listings
            console.log('Selected category:', category);
            
            // Scroll tab into view on mobile
            this.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
    });
}

/* ============================================
   CREATE LISTING - CATEGORY SELECTION
   ============================================ */
function initCreateListing() {
    const listingTypeInputs = document.querySelectorAll('input[name="listing_type"]');
    const productCategories = document.getElementById('productCategories');
    const serviceCategories = document.getElementById('serviceCategories');
    const categoryInputs = document.querySelectorAll('input[name="category"]');
    const subcategorySelect = document.getElementById('subcategory');
    
    if (!listingTypeInputs.length || !productCategories) return;

    // Subcategory data
    const subcategories = {
        // PRODUCTS
        'electronics': [
            'Cell Phones & Smartphones',
            'Laptops & Desktop Computers',
            'Computer Components (RAM, SSD, GPU)',
            'Audio & Headphones',
            'Cameras & Photography',
            'Wearables & Smartwatches',
            'Video Games & Consoles',
            'Accessories & Peripherals'
        ],
        'home': [
            'Major Appliances (Fridges, Washers)',
            'Small Kitchen Appliances',
            'Furniture & Mattresses',
            'Home Decor & Lighting',
            'Kitchenware & Dining',
            'Bedding & Bath',
            'Storage & Organization'
        ],
        'hardware': [
            'Power Generators & Inverters',
            'Solar Panels & Batteries',
            'Power & Hand Tools',
            'Building Materials',
            'Paints & Finishes',
            'Smart Home & Security Systems'
        ],
        'fashion': [
            'Men\'s Clothing',
            'Women\'s Clothing',
            'Kids & Baby Clothing',
            'Footwear (Sneakers, Formal, Boots)',
            'Watches & Jewelry',
            'Bags, Luggage & Wallets',
            'Eyewear & Sunglasses',
            'Pre-loved / Thrift Store'
        ],
        'motors': [
            'Car Parts & Components',
            'Motorcycle Parts',
            'Car Accessories',
            'Tires & Wheels',
            'Oils, Fluids & Lubricants',
            'Car Care & Detailing'
        ],
        'health-beauty': [
            'Makeup & Cosmetics',
            'Skincare & Haircare',
            'Fragrances & Perfumes',
            'Vitamins & Supplements',
            'Medical Equipment & Orthopedics',
            'Personal Hygiene'
        ],
        'collectibles': [
            'Coins & Paper Money (Numismatics)',
            'Antiques',
            'Fine Art (Paintings & Sculptures)',
            'Musical Instruments',
            'Books, Magazines & Comics',
            'Action Figures & Vintage Toys'
        ],
        'sports': [
            'Fitness & Gym Equipment',
            'Cycling & Bikes',
            'Camping & Hiking Gear',
            'Fishing & Hunting',
            'Sportswear & Team Jerseys'
        ],
        // SERVICES
        'home-improvement': [
            'Electrical & Wiring',
            'Plumbing & Leak Detection',
            'HVAC (AC & Heating) Repair',
            'Carpentry & Woodworking',
            'Masonry & Renovations',
            'Pest Control & Fumigation',
            'Upholstery & Carpet Cleaning'
        ],
        'health-services': [
            'Telemedicine & Online Consultations',
            'Home Nursing Care',
            'Physiotherapy & Massage',
            'Therapy & Counseling',
            'Dental Services',
            'Veterinary & Pet Grooming'
        ],
        'professional': [
            'Legal Advice & Attorneys',
            'Accounting & Tax Preparation',
            'Graphic Design & Branding',
            'Web & Software Development',
            'Digital Marketing & SEO',
            'Virtual Assistance & Admin Support',
            'Translation & Copywriting'
        ],
        'education': [
            'Language Lessons',
            'Academic Tutoring',
            'Coding & Tech Bootcamps',
            'Music & Art Classes',
            'Vocational Training (Cooking, Sewing)'
        ],
        'logistics': [
            'Local Delivery & Courier',
            'Moving & Freight Services',
            'Private Transportation / Carpooling',
            'Vehicle Rentals'
        ]
    };

    // Toggle between Product and Service
    listingTypeInputs.forEach(input => {
        input.addEventListener('change', function() {
            const isService = this.value === 'service';
            
            productCategories.style.display = isService ? 'none' : 'block';
            serviceCategories.style.display = isService ? 'block' : 'none';
            
            // Update toggle card styles
            document.querySelectorAll('.listing-type-card').forEach(card => {
                card.style.borderColor = 'var(--color-gray-200)';
                card.style.background = 'transparent';
            });
            this.nextElementSibling.style.borderColor = 'var(--color-primary)';
            this.nextElementSibling.style.background = 'var(--color-primary-subtle)';
            
            // Clear category selection
            categoryInputs.forEach(cat => cat.checked = false);
            document.querySelectorAll('.category-select-card').forEach(card => {
                card.classList.remove('is-selected');
            });
            
            // Reset subcategory
            subcategorySelect.innerHTML = '<option value="">Select a category first...</option>';
        });
    });

    // Handle category selection
    categoryInputs.forEach(input => {
        input.addEventListener('change', function() {
            const category = this.value;
            
            // Update visual selection
            document.querySelectorAll('.category-select-card').forEach(card => {
                card.classList.remove('is-selected');
            });
            this.nextElementSibling.classList.add('is-selected');
            
            // Populate subcategories
            const subs = subcategories[category] || [];
            subcategorySelect.innerHTML = '<option value="">Select a subcategory...</option>';
            subs.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                option.textContent = sub;
                subcategorySelect.appendChild(option);
            });
            
            // Update hint
            const hint = document.getElementById('subcategoryHint');
            if (hint) {
                hint.textContent = `${subs.length} subcategories available`;
            }
        });
    });
}

// Initialize create listing if on that page
// Check if DOM is already loaded (for when script is at bottom of page)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCreateListing);
} else {
    initCreateListing();
}

