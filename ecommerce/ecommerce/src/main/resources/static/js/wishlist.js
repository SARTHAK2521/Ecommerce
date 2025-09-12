// Wishlist functionality
class WishlistManager {
    constructor() {
        this.wishlistItems = [];
        this.init();
    }

    init() {
        this.loadWishlist();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', this.toggleDarkMode.bind(this));
        }

        // Load dark mode preference
        this.loadDarkModePreference();
    }

    async loadWishlist() {
        const loadingSpinner = document.getElementById('loading-spinner');
        const emptyWishlist = document.getElementById('empty-wishlist');
        const wishlistGrid = document.getElementById('wishlist-grid');
        const wishlistCount = document.getElementById('wishlist-count');

        try {
            loadingSpinner.style.display = 'block';
            emptyWishlist.style.display = 'none';
            wishlistGrid.innerHTML = '';

            const response = await fetch('/api/wishlist');
            
            if (response.status === 401) {
                // User not authenticated, redirect to login
                window.location.href = '/login.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to load wishlist');
            }

            this.wishlistItems = await response.json();
            
            if (this.wishlistItems.length === 0) {
                emptyWishlist.style.display = 'block';
                wishlistGrid.style.display = 'none';
            } else {
                emptyWishlist.style.display = 'none';
                wishlistGrid.style.display = 'grid';
                this.renderWishlistItems();
            }

            wishlistCount.textContent = `${this.wishlistItems.length} item${this.wishlistItems.length !== 1 ? 's' : ''}`;

        } catch (error) {
            console.error('Error loading wishlist:', error);
            this.showToast('Error loading wishlist', 'error');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    renderWishlistItems() {
        const wishlistGrid = document.getElementById('wishlist-grid');
        wishlistGrid.innerHTML = '';

        this.wishlistItems.forEach(item => {
            const product = item.product;
            const productCard = this.createProductCard(product, item.id);
            wishlistGrid.appendChild(productCard);
        });
    }

    createProductCard(product, wishlistId) {
        const col = document.createElement('div');
        col.className = 'col';

        const discountBadge = product.onSale && product.originalPrice > product.price 
            ? `<div class="discount-badge">${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</div>`
            : '';

        const priceDisplay = product.onSale && product.originalPrice > product.price
            ? `<div class="price-flex">
                <span class="price">$${product.price.toFixed(2)}</span>
                <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
               </div>`
            : `<div class="price">$${product.price.toFixed(2)}</div>`;

        col.innerHTML = `
            <div class="product-card h-100">
                <div class="product-img-container position-relative">
                    ${discountBadge}
                    <img src="${product.imageUrl}" alt="${product.name}" class="img-fluid">
                </div>
                <div class="product-card-body">
                    <div class="category">${product.category}</div>
                    <h5 class="product-title">${product.name}</h5>
                    <p class="text-muted small">${product.description}</p>
                    ${priceDisplay}
                    <div class="btn-group mt-3">
                        <button class="btn btn-primary btn-add-to-cart" data-product-id="${product.id}">
                            <i class="bi bi-cart-plus me-1"></i>Add to Cart
                        </button>
                        <button class="btn btn-outline-danger btn-remove-wishlist" data-wishlist-id="${wishlistId}" data-product-id="${product.id}">
                            <i class="bi bi-heart-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const addToCartBtn = col.querySelector('.btn-add-to-cart');
        const removeWishlistBtn = col.querySelector('.btn-remove-wishlist');

        addToCartBtn.addEventListener('click', (e) => {
            this.addToCart(product.id);
        });

        removeWishlistBtn.addEventListener('click', (e) => {
            this.removeFromWishlist(wishlistId, product.id);
        });

        return col;
    }

    async addToCart(productId) {
        try {
            const response = await fetch(`/api/cart/add/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.showToast('Product added to cart!', 'success');
                this.updateCartCounter();
            } else if (response.status === 401) {
                this.showToast('Please log in to add items to cart', 'warning');
            } else {
                this.showToast('Error adding product to cart', 'error');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showToast('Error adding product to cart', 'error');
        }
    }

    async removeFromWishlist(wishlistId, productId) {
        try {
            const response = await fetch(`/api/wishlist/remove/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showToast('Product removed from wishlist', 'success');
                // Remove the item from the UI
                this.wishlistItems = this.wishlistItems.filter(item => item.id !== wishlistId);
                this.renderWishlistItems();
                this.updateWishlistCount();
                
                // Show empty state if no items left
                if (this.wishlistItems.length === 0) {
                    document.getElementById('empty-wishlist').style.display = 'block';
                    document.getElementById('wishlist-grid').style.display = 'none';
                }
            } else {
                this.showToast('Error removing product from wishlist', 'error');
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            this.showToast('Error removing product from wishlist', 'error');
        }
    }

    async updateCartCounter() {
        try {
            const response = await fetch('/api/cart/count');
            if (response.ok) {
                const data = await response.json();
                const cartCounter = document.getElementById('cart-counter');
                if (cartCounter) {
                    cartCounter.textContent = data.count;
                }
            }
        } catch (error) {
            console.error('Error updating cart counter:', error);
        }
    }

    updateWishlistCount() {
        const wishlistCount = document.getElementById('wishlist-count');
        if (wishlistCount) {
            wishlistCount.textContent = `${this.wishlistItems.length} item${this.wishlistItems.length !== 1 ? 's' : ''}`;
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toastId = 'toast-' + Date.now();
        
        const toastClass = type === 'success' ? 'bg-success' : 
                          type === 'error' ? 'bg-danger' : 
                          type === 'warning' ? 'bg-warning' : 'bg-info';
        
        const textColor = type === 'warning' ? 'text-dark' : 'text-white';
        
        const toastHTML = `
            <div id="${toastId}" class="toast ${toastClass} ${textColor}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-body d-flex align-items-center">
                    <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
        toast.show();
        
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    toggleDarkMode() {
        const body = document.body;
        const darkModeIcon = document.getElementById('dark-mode-icon');
        
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            darkModeIcon.className = 'bi bi-sun-fill';
            localStorage.setItem('darkMode', 'enabled');
        } else {
            darkModeIcon.className = 'bi bi-moon-fill';
            localStorage.setItem('darkMode', 'disabled');
        }
    }

    loadDarkModePreference() {
        const darkMode = localStorage.getItem('darkMode');
        const body = document.body;
        const darkModeIcon = document.getElementById('dark-mode-icon');
        
        if (darkMode === 'enabled') {
            body.classList.add('dark-mode');
            darkModeIcon.className = 'bi bi-sun-fill';
        }
    }
}

// Initialize wishlist manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WishlistManager();
});
