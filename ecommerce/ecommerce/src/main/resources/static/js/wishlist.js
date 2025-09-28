document.addEventListener('DOMContentLoaded', () => {
    const wishlistGrid = document.getElementById('wishlist-grid');
    const loadingSpinner = document.getElementById('loading-spinner');
    const emptyWishlist = document.getElementById('empty-wishlist');
    const wishlistCount = document.getElementById('wishlist-count');
    const cartCounter = document.getElementById('cart-counter');
    const authLink = document.getElementById('auth-link');
    const ordersLinkLi = document.getElementById('orders-link-li');
    const logoutLinkLi = document.getElementById('logout-link-li');
    const logoutBtn = document.getElementById('logout-btn');
    const cartLink = document.getElementById('cart-link');
    
    let wishlistItems = [];

    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center text-white bg-${type} border-0`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        toastContainer.appendChild(toastElement);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    async function updateCartCounter() {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            cartCounter.textContent = '0';
            return;
        }

        try {
            const response = await fetch(`/api/cart/${userId}`);
            if (response.ok) {
                const cartData = await response.json();
                const totalItems = cartData.cartItems.reduce((total, item) => total + item.quantity, 0);
                cartCounter.textContent = totalItems;
            } else {
                cartCounter.textContent = '0';
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            cartCounter.textContent = '0';
        }
    }

    // MODIFIED: Centralized authentication check and session maintenance
    async function checkAuthenticationAndSetUserId(redirectOnFail = false) {
        try {
            const response = await fetch('/api/users/me');
            if (response.ok) {
                const user = await response.json();
                sessionStorage.setItem('userId', user.id);
                sessionStorage.setItem('username', user.username);
                sessionStorage.setItem('userRole', user.role);
                authLink.classList.add('d-none');
                ordersLinkLi.classList.remove('d-none');
                logoutLinkLi.classList.remove('d-none');
                return true; // Authenticated
            } else {
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('username');
                sessionStorage.removeItem('userRole');
                authLink.classList.remove('d-none');
                ordersLinkLi.classList.add('d-none');
                logoutLinkLi.classList.add('d-none');

                if (redirectOnFail) {
                    showToast('Your session has expired. Please log in.', 'warning');
                    setTimeout(() => window.location.href = '/login.html', 2000);
                }
                return false; // Not Authenticated
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('userRole');
            authLink.classList.remove('d-none');
            ordersLinkLi.classList.add('d-none');
            logoutLinkLi.classList.add('d-none');
            
            if (redirectOnFail) {
                showToast('A network error occurred. Please log in.', 'danger');
                setTimeout(() => window.location.href = '/login.html', 2000);
            }
            return false;
        } 
    }

    logoutBtn.addEventListener('click', async () => {
        try {
             const response = await fetch('/logout', { method: 'POST' });
             if (response.ok) {
                 sessionStorage.removeItem('userId');
                 sessionStorage.removeItem('username');
                 sessionStorage.removeItem('userRole');
                 window.location.href = '/login.html';
             }
        } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = '/login.html';
        }
    });

    cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/';
    });

    // MODIFIED: fetchWishlist removes the client-side check, relying on initializePage handled auth.
    async function fetchWishlist() {
        loadingSpinner.style.display = 'block';
        try {
            const response = await fetch('/api/wishlist');
            if (response.ok) {
                wishlistItems = await response.json();
                renderWishlist();
            } else if (response.status === 401) {
                 // Failsafe: if somehow unauthorized after auth check, redirect.
                showToast('Authentication failed. Redirecting to login.', 'warning');
                setTimeout(() => window.location.href = '/login.html', 2000);
            } else {
                showToast('Failed to load wishlist', 'danger');
                showEmptyWishlist();
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            showToast('Failed to load wishlist', 'danger');
            showEmptyWishlist();
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    function renderWishlist() {
        if (wishlistItems.length === 0) {
            showEmptyWishlist();
            return;
        }

        wishlistGrid.innerHTML = '';
        wishlistCount.textContent = `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''}`;
        
        wishlistItems.forEach(item => {
            const product = item.product;
            const isOutOfStock = product.stockQuantity <= 0;
            const isLimitedStock = product.stockQuantity > 0 && product.stockQuantity <= 10;
            const discountPercent = product.onSale ? ((product.originalPrice - product.price) / product.originalPrice * 100).toFixed(0) : 0;

            const productCard = document.createElement('div');
            productCard.className = 'col';
            productCard.innerHTML = `
                <div class="card h-100 product-card shadow border-0 position-relative">
                    ${product.onSale ? `<span class="discount-badge">-${discountPercent}%</span>` : ''}
                    <div class="product-img-container bg-white p-3 d-flex align-items-center justify-content-center" style="min-height:180px;">
                        <a href="/product.html?id=${product.id}" tabindex="0">
                            <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" aria-label="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/400x300?text=No+Image';" style="max-height:140px;object-fit:contain;">
                        </a>
                    </div>
                    <div class="card-body product-card-body d-flex flex-column">
                        <p class="category mb-1 text-uppercase text-primary small fw-semibold">${product.category || 'Uncategorized'}</p>
                        <h5 class="card-title product-title mb-2">
                            <a href="/product.html?id=${product.id}" class="text-dark text-decoration-none" aria-label="View details for ${product.name}">${product.name}</a>
                        </h5>
                        <div class="price-flex">
                            <p class="card-text price mb-0 fw-bold fs-5 text-success">$${product.price.toFixed(2)}</p>
                            ${product.onSale ? `<p class="card-text original-price mb-0">$${product.originalPrice.toFixed(2)}</p>` : ''}
                        </div>
                        ${isLimitedStock ? `<span class="limited-stock"><i class="bi bi-exclamation-circle me-1"></i>Only ${product.stockQuantity} left!</span>` : ''}
                        ${isOutOfStock ? `<span class="out-of-stock fw-bold"><i class="bi bi-x-circle me-1"></i>Out of Stock</span>` : ''}
                        <div class="mt-auto">
                            <button class="btn btn-primary btn-sm w-100 mb-2 add-to-cart-btn" data-product-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                                <i class="bi bi-cart-plus me-1"></i>${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button class="btn btn-outline-danger btn-sm w-100 remove-from-wishlist-btn" data-product-id="${product.id}">
                                <i class="bi bi-heart-fill me-1"></i>Remove from Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            `;
            wishlistGrid.appendChild(productCard);
        });

        // Add event listeners for the new buttons
        setupWishlistEventListeners();
    }

    function showEmptyWishlist() {
        wishlistGrid.innerHTML = '';
        emptyWishlist.style.display = 'block';
        wishlistCount.textContent = '0 items';
        loadingSpinner.style.display = 'none';
    }

    function setupWishlistEventListeners() {
        // Add to cart functionality
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const productId = parseInt(e.target.closest('.add-to-cart-btn').dataset.productId);
                const product = wishlistItems.find(item => item.product.id === productId)?.product;
                
                if (product) {
                    await addToCart(product, 1);
                }
            });
        });

        // Remove from wishlist functionality
        document.querySelectorAll('.remove-from-wishlist-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const productId = parseInt(e.target.closest('.remove-from-wishlist-btn').dataset.productId);
                await removeFromWishlist(productId);
            });
        });
    }

    async function addToCart(product, quantity = 1) {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            showToast('You must be logged in to add products to cart.', 'danger');
            return;
        }

        try {
            const response = await fetch(`/api/cart/${userId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, quantity: quantity })
            });

            if (response.ok) {
                await updateCartCounter();
                showToast(`${quantity} x ${product.name} added to cart!`);
            } else {
                const error = await response.json();
                showToast(error.message || 'Failed to add item to cart.', 'danger');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            showToast('An error occurred while adding to cart.', 'danger');
        }
    }

    async function removeFromWishlist(productId) {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            showToast('You must be logged in to manage your wishlist.', 'danger');
            return;
        }

        try {
            const response = await fetch(`/api/wishlist/remove/${productId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                showToast(data.message || 'Product removed from wishlist', 'info');
                // Refresh the wishlist
                await fetchWishlist();
            } else {
                const error = await response.json();
                showToast(error.message || 'Failed to remove item from wishlist.', 'danger');
            }
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            showToast('An error occurred while removing from wishlist.', 'danger');
        }
    }

    // NEW: Initialization sequence to ensure authentication runs first
    const initializePage = async () => {
        await updateCartCounter();
        const isAuthenticated = await checkAuthenticationAndSetUserId(true);
        
        if (isAuthenticated) {
            await fetchWishlist();
        } else {
             showEmptyWishlist();
        }
    }

    // Initialize the page
    initializePage();
});