document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const categoryFilters = document.getElementById('category-filters');
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');
    const cartCounter = document.getElementById('cart-counter');
    const loadingSpinner = document.getElementById('loading-spinner');

    let allProducts = [];
    let cart = [];

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

            const productCard = document.createElement('div');
            productCard.className = 'col';
            productCard.innerHTML = `
                <div class="card h-100 product-card shadow border-0">
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
                        <p class="card-text price mb-2 fw-bold fs-5 text-success">$${product.price.toFixed(2)}</p>
                        <div class="add-to-cart-container mt-auto" data-product-id="${product.id}">
                            ${isInCart ? 
                                `<div class="quantity-controls d-flex align-items-center justify-content-center">
                                    <button class="quantity-btn decrement btn btn-outline-secondary rounded-circle me-2" aria-label="Decrease quantity" style="width:32px;height:32px;">-</button>
                                    <span class="quantity-display px-2 fw-semibold">${quantity}</span>
                                    <button class="quantity-btn increment btn btn-outline-secondary rounded-circle ms-2" aria-label="Increase quantity" style="width:32px;height:32px;">+</button>
                                </div>` :
                                `<button class="btn btn-primary btn-add-to-cart w-100 fw-semibold" aria-label="Add ${product.name} to cart"><i class="bi bi-cart-plus me-1"></i>Add to Cart</button>`
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
                if (productToUpdate) {
                    productToUpdate.quantity++;
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
    };

    // --- INITIAL FETCH & RENDER ---
    const initialize = async () => {
        window.loadCart();
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Network response was not ok');
            allProducts = await response.json();

            renderProducts(allProducts);
            renderCategories(allProducts);
            setupEventListeners();
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
            productGrid.innerHTML = '<p class="text-danger text-center">Could not load products. Please try again later.</p>';
        } finally {
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    };

    initialize();
});