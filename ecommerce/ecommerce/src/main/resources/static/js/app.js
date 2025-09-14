document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const categoryFilters = document.getElementById('category-filters');
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');
    const cartCounter = document.getElementById('cart-counter');
    const loadingSpinner = document.getElementById('loading-spinner');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    const cartItemsList = document.getElementById('cart-items-list');
    const shippingOptionsList = document.getElementById('shipping-options-list');
    const totalPriceElement = document.getElementById('total-price');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const dealsNavLink = document.getElementById('deals-nav-link');
    const homeNavLink = document.getElementById('home-nav-link');
    const productSectionTitle = document.getElementById('product-section-title');
    const authLink = document.getElementById('auth-link');
    const ordersLinkLi = document.getElementById('orders-link-li');
    const logoutLinkLi = document.getElementById('logout-link-li');
    const logoutBtn = document.getElementById('logout-btn');
    const cartLink = document.getElementById('cart-link');
    
    // New dark mode elements
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    
    let allProducts = [];
    let cart = [];
    let shippingOptions = [];
    let selectedShippingOption = null;
    let wishlistItems = new Set();

    // --- UTILITY FUNCTIONS ---
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

    // --- WISHLIST FUNCTIONS ---
    async function toggleWishlist(productId) {
        try {
            const response = await fetch(`/api/wishlist/toggle/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                wishlistItems.clear();
                if (data.isInWishlist) {
                    wishlistItems.add(productId);
                    showToast('Added to wishlist!', 'success');
                } else {
                    showToast('Removed from wishlist', 'info');
                }
                updateWishlistButtons();
            } else if (response.status === 401) {
                showToast('Please log in to use wishlist', 'warning');
            } else {
                showToast('Error updating wishlist', 'error');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            showToast('Error updating wishlist', 'error');
        }
    }

    async function loadWishlistStatus() {
        try {
            const response = await fetch('/api/wishlist');
            if (response.ok) {
                const wishlistData = await response.json();
                wishlistItems.clear();
                wishlistData.forEach(item => {
                    wishlistItems.add(item.product.id);
                });
                updateWishlistButtons();
            }
        } catch (error) {
            console.error('Error loading wishlist status:', error);
        }
    }

    function updateWishlistButtons() {
        document.querySelectorAll('.btn-wishlist').forEach(btn => {
            const productId = parseInt(btn.dataset.productId);
            const icon = btn.querySelector('i');
            
            if (wishlistItems.has(productId)) {
                btn.classList.add('active');
                icon.className = 'bi bi-heart-fill';
                btn.title = 'Remove from wishlist';
            } else {
                btn.classList.remove('active');
                icon.className = 'bi bi-heart';
                btn.title = 'Add to wishlist';
            }
        });
    }

    async function checkAuthenticationAndSetUserId() {
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
            } else {
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('username');
                sessionStorage.removeItem('userRole');
                authLink.classList.remove('d-none');
                ordersLinkLi.classList.add('d-none');
                logoutLinkLi.classList.add('d-none');
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('userRole');
            authLink.classList.remove('d-none');
            ordersLinkLi.classList.add('d-none');
            logoutLinkLi.classList.add('d-none');
        } finally {
            await fetchCart();
        }
    }

    async function checkAuthAndGetUserId() {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            authLink.classList.add('d-none');
            ordersLinkLi.classList.remove('d-none');
            logoutLinkLi.classList.remove('d-none');
        } else {
            await checkAuthenticationAndSetUserId();
        }
    }

    // --- CART MANAGEMENT (UPDATED) ---
    async function fetchCart() {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            cart = [];
            return;
        }
        try {
            const response = await fetch(`/api/cart/${userId}`);
            if (response.ok) {
                const cartData = await response.json();
                cart = cartData.cartItems.map(item => ({
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    originalPrice: item.product.originalPrice,
                    imageUrl: item.product.imageUrl,
                    category: item.product.category,
                    onSale: item.product.onSale,
                    stockQuantity: item.product.stockQuantity,
                    quantity: item.quantity
                }));
            } else {
                cart = [];
                // Only show toast if the error is not a 404 (cart not found)
                if (response.status !== 404) {
                    showToast('Failed to load cart.', 'danger');
                }
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            showToast('Failed to load cart.', 'danger');
            cart = [];
        } finally {
            updateCartCounter();
            renderProducts(allProducts);
        }
    }

    function updateCartCounter() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartCounter) {
            cartCounter.textContent = totalItems;
            cartCounter.setAttribute('aria-label', `Cart with ${totalItems} items`);
        }
    }

    async function updateCartUI(updatedCart) {
        cart = updatedCart.cartItems.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            originalPrice: item.product.originalPrice,
            imageUrl: item.product.imageUrl,
            category: item.product.category,
            onSale: item.product.onSale,
            stockQuantity: item.product.stockQuantity,
            quantity: item.quantity
        }));
        updateCartCounter();
        renderProducts(allProducts);
    }
    
    async function addToCart(productId, quantity, productName) {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            showToast('You must be logged in to add products to cart.', 'danger');
            setTimeout(() => window.location.href = '/login.html', 2000);
            return;
        }

        try {
            const response = await fetch(`/api/cart/${userId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: productId, quantity: quantity })
            });

            if (response.ok) {
                const updatedCart = await response.json();
                await updateCartUI(updatedCart);
                if (quantity > 0) {
                     showToast(`${quantity} x ${productName} added to cart!`);
                } else if (quantity < 0) {
                     showToast(`${productName} quantity updated in cart!`);
                }
            } else if (response.status === 401) {
                showToast('Session expired. Please log in again.', 'danger');
                sessionStorage.clear();
                setTimeout(() => window.location.href = '/login.html', 2000);
            } else {
                const error = await response.json();
                showToast(error.message || 'Failed to add item to cart.', 'danger');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            showToast('An error occurred while adding to cart.', 'danger');
        }
    }
    
    // --- RENDER PRODUCTS ---
    const renderProducts = (productsToRender) => {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        productGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            noResults.style.display = 'block';
            noResults.innerHTML = `
                <span class="fs-5 text-secondary"><i class="bi bi-emoji-frown me-2"></i>No products found.</span>
                <a href="#" id="clear-search" class="ms-2 text-decoration-underline">Clear search</a>
            `;
            const clearBtn = document.getElementById('clear-search');
            if (clearBtn) {
                clearBtn.onclick = (e) => {
                    e.preventDefault();
                    searchInput.value = '';
                    renderProducts(allProducts);
                };
            }
        } else {
            noResults.style.display = 'none';
        }

        productsToRender.forEach(product => {
            const cartItem = cart.find(item => item.id === product.id);
            const isInCart = !!cartItem;
            const quantity = isInCart ? cartItem.quantity : 0;
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
                        <div class="add-to-cart-container mt-auto" data-product-id="${product.id}">
                            ${isInCart ? 
                                `<div class="quantity-controls d-flex align-items-center justify-content-center">
                                    <button class="quantity-btn decrement btn btn-outline-secondary rounded-circle me-2" aria-label="Decrease quantity" style="width:32px;height:32px;">-</button>
                                    <span class="quantity-display px-2 fw-semibold">${quantity}</span>
                                    <button class="quantity-btn increment btn btn-outline-secondary rounded-circle ms-2" aria-label="Increase quantity" style="width:32px;height:32px;">+</button>
                                </div>` :
                                `<button class="btn btn-primary btn-add-to-cart w-100 fw-semibold" aria-label="Add ${product.name} to cart" ${isOutOfStock ? 'disabled' : ''}><i class="bi bi-cart-plus me-1"></i>${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</button>`
                            }
                            <div class="d-flex gap-2 mt-2">
                                <button class="btn btn-outline-danger btn-wishlist flex-grow-1" data-product-id="${product.id}" title="Add to wishlist">
                                    <i class="bi bi-heart"></i>
                                </button>
                                <a href="/product.html?id=${product.id}" class="btn btn-outline-primary flex-grow-1" title="View details">
                                    <i class="bi bi-eye"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    };

    // --- RENDER CATEGORIES ---
    const renderCategories = (products) => {
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        const categoryIcons = {
            'Electronics': 'bi-laptop',
            'Books': 'bi-book',
            'Clothing': 'bi-t-shirt',
            'Fashion': 'bi-handbag-fill',
            'Home Goods': 'bi-house-door',
            'Home & Kitchen': 'bi-cup-straw',
            'Groceries': 'bi-basket',
            'Default': 'bi-tag'
        };

        categoryFilters.innerHTML = '';
        categories.forEach(category => {
            const icon = categoryIcons[category] || categoryIcons['Default'];
            const categoryCard = document.createElement('div');
            categoryCard.className = 'col-md-2 col-6 mb-3';
            categoryCard.innerHTML = `
                <div class="category-card py-3 px-2 shadow-sm border" data-category="${category}" tabindex="0" role="button" aria-label="Filter by ${category}">
                    <i class="bi ${icon} fs-2 mb-2 text-primary" aria-hidden="true"></i>
                    <h5 class="mb-0 fs-6 fw-semibold">${category}</h5>
                </div>
            `;
            categoryFilters.appendChild(categoryCard);
        });
    };

    // --- RENDER CHECKOUT MODAL ---
    const renderCheckoutModal = () => {
        // Render cart items
        cartItemsList.innerHTML = '';
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li class="list-group-item text-center text-muted">Your cart is empty.</li>';
        } else {
            cart.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                    <div>${item.name} <span class="badge bg-secondary rounded-pill">${item.quantity}</span></div>
                    <span class="fw-bold">$${(item.price * item.quantity).toFixed(2)}</span>
                `;
                cartItemsList.appendChild(li);
            });
        }

        // Render shipping options
        shippingOptionsList.innerHTML = '';
        shippingOptions.forEach(option => {
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input" type="radio" name="shippingOption" id="shipping-${option.id}" value="${option.id}" data-cost="${option.cost}" ${selectedShippingOption && selectedShippingOption.id === option.id ? 'checked' : ''}>
                <label class="form-check-label d-flex justify-content-between" for="shipping-${option.id}">
                    <span>${option.name} (${option.estimatedDeliveryTime})</span>
                    <span class="fw-bold">$${option.cost.toFixed(2)}</span>
                </label>
            `;
            shippingOptionsList.appendChild(div);
        });

        updateTotal();
    };

    const updateTotal = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = selectedShippingOption ? selectedShippingOption.cost : 0;
        const total = subtotal + shippingCost;
        totalPriceElement.textContent = `$${total.toFixed(2)}`;
    };

    const fetchShippingOptions = async () => {
        try {
            const response = await fetch('/api/shipping');
            if (!response.ok) throw new Error('Failed to fetch shipping options');
            shippingOptions = await response.json();
            if (shippingOptions.length > 0) {
                selectedShippingOption = shippingOptions[0];
            }
        } catch (error) {
            console.error('Error fetching shipping options:', error);
            showToast('Failed to load shipping options.', 'danger');
        }
    };
    
    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        categoryFilters.addEventListener('click', (e) => {
            const card = e.target.closest('.category-card');
            if (card) {
                document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const category = card.dataset.category;
                const filteredProducts = allProducts.filter(p => p.category === category);
                renderProducts(filteredProducts);
            }
        });

        categoryFilters.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.category-card');
                if (card) {
                    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    const category = card.dataset.category;
                    const filteredProducts = allProducts.filter(p => p.category === category);
                    renderProducts(filteredProducts);
                }
            }
        });

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = allProducts.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                (p.description && p.description.toLowerCase().includes(searchTerm)) ||
                (p.category && p.category.toLowerCase().includes(searchTerm))
            );
            renderProducts(filteredProducts);
            if (filteredProducts.length > 0) {
                productGrid.scrollIntoView({ behavior: 'smooth' });
            }
        });

        productGrid.addEventListener('click', async e => {
            // Handle wishlist buttons
            if (e.target.closest('.btn-wishlist')) {
                const wishlistBtn = e.target.closest('.btn-wishlist');
                const productId = parseInt(wishlistBtn.dataset.productId, 10);
                await toggleWishlist(productId);
                return;
            }

            // Handle cart buttons
            const addToCartContainer = e.target.closest('.add-to-cart-container');
            if (!addToCartContainer) return;
            
            const productId = parseInt(addToCartContainer.dataset.productId, 10);
            const product = allProducts.find(p => p.id === productId);

            if (e.target.classList.contains('btn-add-to-cart')) {
                await addToCart(productId, 1, product.name);
            } else if (e.target.classList.contains('increment')) {
                await addToCart(productId, 1, product.name);
            } else if (e.target.classList.contains('decrement')) {
                 const cartItem = cart.find(item => item.id === productId);
                if (cartItem && cartItem.quantity > 0) {
                     await addToCart(productId, -1, product.name);
                }
            }
        });
        
        checkoutBtn.addEventListener('click', async () => {
            const userId = sessionStorage.getItem('userId');
            if (!userId) {
                showToast('You must be logged in to place an order.', 'danger');
                setTimeout(() => window.location.href = '/login.html', 2000);
                return;
            }
            if (cart.length === 0) {
                showToast('Your cart is empty. Please add items before checking out.', 'warning');
                return;
            }

            await fetchShippingOptions();
            renderCheckoutModal();
            checkoutModal.show();
        });

        cartLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const userId = sessionStorage.getItem('userId');
            if (!userId) {
                showToast('You must be logged in to view your cart.', 'danger');
                setTimeout(() => window.location.href = '/login.html', 2000);
                return;
            }
            if (cart.length === 0) {
                showToast('Your cart is empty. Add some items to get started!', 'info');
                return;
            }

            await fetchShippingOptions();
            renderCheckoutModal();
            checkoutModal.show();
        });

        shippingOptionsList.addEventListener('change', (e) => {
            const selectedId = parseInt(e.target.value, 10);
            selectedShippingOption = shippingOptions.find(opt => opt.id === selectedId);
            updateTotal();
        });
        
        placeOrderBtn.addEventListener('click', async () => {
            if (!selectedShippingOption) {
                showToast('Please select a shipping option.', 'warning');
                return;
            }

            const userId = sessionStorage.getItem('userId');
            if (!userId) {
                showToast('Authentication failed. Please log in again.', 'danger');
                return;
            }

            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId: userId,
                        shippingOptionId: selectedShippingOption.id
                    })
                });

                if (response.ok) {
                    showToast('Order placed successfully!');
                    checkoutModal.hide();
                    cart = [];
                    updateCartCounter();
                    renderProducts(allProducts);
                    // Clear the server-side cart after a successful order
                    const cartResponse = await fetch(`/api/cart/${userId}`, { method: 'DELETE' });
                    if (!cartResponse.ok) {
                         console.error('Failed to clear cart after order.');
                    }
                } else {
                    const error = await response.json();
                    showToast('Failed to place order: ' + (error.message || 'An error occurred.'), 'danger');
                }
            } catch (error) {
                console.error('Error placing order:', error);
                showToast('An error occurred while placing the order.', 'danger');
            }
        });
        
        // --- DEALS BUTTON LOGIC ---
        dealsNavLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Highlight the active nav link
            homeNavLink.classList.remove('active');
            dealsNavLink.classList.add('active');
            
            // Filter locally and render
            const deals = allProducts.filter(p => p.onSale);
            renderProducts(deals);
            
            // Update the section title
            productSectionTitle.textContent = "Deals & Promotions";
            
            // Reset filters
            searchInput.value = '';
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
        });
        
        homeNavLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Highlight the active nav link
            homeNavLink.classList.add('active');
            dealsNavLink.classList.remove('active');
            
            // Render all products
            renderProducts(allProducts);
            
            // Update the section title
            productSectionTitle.textContent = "Featured Products";
            
            // Reset filters
            searchInput.value = '';
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
        });

        logoutBtn.addEventListener('click', async () => {
            try {
                 const response = await fetch('/logout', { method: 'POST' });
                 if (response.ok) {
                     sessionStorage.removeItem('userId');
                     sessionStorage.removeItem('username');
                     sessionStorage.removeItem('userRole');
                     cart = [];
                     window.location.href = '/login.html';
                 }
            } catch (error) {
                console.error('Logout failed:', error);
                window.location.href = '/login.html';
            }
        });
    };
    
    // Create a separate function for fetching all products to be reused.
    const initializeProducts = async () => {
        try {
            loadingSpinner.style.display = 'block';
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Network response was not ok');
            allProducts = await response.json();
            renderProducts(allProducts);
            renderCategories(allProducts);
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
            productGrid.innerHTML = '<p class="text-danger text-center">Could not load products. Please try again later.</p>';
            showToast('Could not load products. Please try again later.', 'danger');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    };
    
    // --- DARK MODE LOGIC ---
    const setupDarkMode = () => {
        const currentMode = localStorage.getItem('theme');
        if (currentMode === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeIcon.classList.remove('bi-moon-fill');
            darkModeIcon.classList.add('bi-sun-fill');
        } else {
            document.body.classList.remove('dark-mode');
            darkModeIcon.classList.remove('bi-sun-fill');
            darkModeIcon.classList.add('bi-moon-fill');
        }

        darkModeToggle.addEventListener('click', () => {
            if (document.body.classList.contains('dark-mode')) {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
                darkModeIcon.classList.remove('bi-sun-fill');
                darkModeIcon.classList.add('bi-moon-fill');
            } else {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
                darkModeIcon.classList.remove('bi-moon-fill');
                darkModeIcon.classList.add('bi-sun-fill');
            }
        });
    };

    // --- INITIAL FETCH & RENDER ---
    const initialize = async () => {
        await initializeProducts();
        await checkAuthAndGetUserId();
        await loadWishlistStatus();
        setupEventListeners();
        setupDarkMode();
    };

    initialize();
});