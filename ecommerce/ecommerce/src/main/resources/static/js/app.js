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

    let allProducts = [];
    let cart = [];
    let shippingOptions = [];
    let selectedShippingOption = null;

    // --- CART PERSISTENCE & SYNC (Shared functions) ---
    window.saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    window.loadCart = () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
        window.updateCartCounter();
    };

    window.updateCartCounter = () => {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartCounter) {
            cartCounter.textContent = totalItems;
            cartCounter.setAttribute('aria-label', `Cart with ${totalItems} items`);
        }
    };

    window.getCart = () => cart;
    window.setCart = (newCart) => {
        cart = newCart;
        window.saveCart();
        window.updateCartCounter();
    };

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
        });

        productGrid.addEventListener('click', e => {
            const addToCartContainer = e.target.closest('.add-to-cart-container');
            if (!addToCartContainer) return;
            
            const productId = parseInt(addToCartContainer.dataset.productId, 10);
            let productToUpdate = cart.find(item => item.id === productId);

            if (e.target.classList.contains('btn-add-to-cart')) {
                if (!productToUpdate) {
                    const product = allProducts.find(p => p.id === productId);
                    if (product) {
                        cart.push({ ...product, quantity: 1 });
                    }
                }
            } else if (e.target.classList.contains('increment')) {
                const productInStock = allProducts.find(p => p.id === productId).stockQuantity;
                if (productToUpdate && productToUpdate.quantity < productInStock) {
                    productToUpdate.quantity++;
                } else if (productToUpdate && productToUpdate.quantity >= productInStock) {
                     alert("You've reached the maximum available stock for this product.");
                }
            } else if (e.target.classList.contains('decrement')) {
                if (productToUpdate && productToUpdate.quantity > 1) {
                    productToUpdate.quantity--;
                } else if (productToUpdate && productToUpdate.quantity === 1) {
                    cart = cart.filter(item => item.id !== productId);
                }
            }

            window.saveCart();
            window.updateCartCounter();
            renderProducts(allProducts);
        });
        
        checkoutBtn.addEventListener('click', async () => {
            if (cart.length === 0) {
                alert('Your cart is empty. Please add items before checking out.');
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
                alert('Please select a shipping option.');
                return;
            }

            const dummyUserId = 1;
            const cartAsMap = cart.reduce((map, item) => {
                map[item.id] = item.quantity;
                return map;
            }, {});

            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId: dummyUserId,
                        shippingOptionId: selectedShippingOption.id,
                        cart: cartAsMap
                    })
                });

                if (response.ok) {
                    alert('Order placed successfully!');
                    checkoutModal.hide();
                    window.setCart([]);
                } else {
                    const error = await response.json();
                    alert('Failed to place order: ' + (error.message || 'An error occurred.'));
                }
            } catch (error) {
                console.error('Error placing order:', error);
                alert('An error occurred while placing the order.');
            }
        });
        
        // --- DEALS BUTTON LOGIC ---
        dealsNavLink.addEventListener('click', (e) => {
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
        
        homeNavLink.addEventListener('click', (e) => {
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
        } finally {
            loadingSpinner.style.display = 'none';
        }
    };

    // --- INITIAL FETCH & RENDER ---
    const initialize = async () => {
        window.loadCart();
        await initializeProducts();
        setupEventListeners();
    };

    initialize();
});