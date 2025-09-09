document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const categoryFilters = document.getElementById('category-filters');
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');
    const cartCounter = document.getElementById('cart-counter');
    const checkoutBtn = document.getElementById('checkout-btn');

    let allProducts = [];
    let cart = [];

    // --- RENDER PRODUCTS ---
    const renderProducts = (productsToRender) => {
        productGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }

        productsToRender.forEach(product => {
            const isAdded = cart.some(item => item.id === product.id);
            const buttonText = isAdded ? 'Added!' : 'Add to Cart';
            const buttonClass = isAdded ? 'btn-success added' : 'btn-dark';

            const productCard = document.createElement('div');
            productCard.className = 'col';
            productCard.innerHTML = `
                <div class="card h-100 product-card">
                    <div class="product-img-container">
                        <a href="/product.html?id=${product.id}">
                           <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/600x400';">
                        </a>
                    </div>
                    <div class="card-body product-card-body">
                        <p class="category">${product.category || 'Uncategorized'}</p>
                        <h5 class="card-title product-title">
                            <a href="/product.html?id=${product.id}" class="text-dark text-decoration-none">${product.name}</a>
                        </h5>
                        <p class="card-text price">$${product.price.toFixed(2)}</p>
                        <button class="btn ${buttonClass} btn-add-to-cart" data-product-id="${product.id}">${buttonText}</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    };

    // --- RENDER CATEGORIES ---
    const renderCategories = (products) => {
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        // UPDATED: Added new icons for Fashion, Home & Kitchen, and changed Clothing.
        const categoryIcons = {
            'Electronics': 'bi-headphone',
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
            categoryCard.className = 'col-md-2 col-6';
            categoryCard.innerHTML = `
                <div class="category-card" data-category="${category}">
                    <i class="bi ${icon}"></i>
                    <h5>${category}</h5>
                </div>
            `;
            categoryFilters.appendChild(categoryCard);
        });
    };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        // Category Filter Clicks
        categoryFilters.addEventListener('click', (e) => {
            const card = e.target.closest('.category-card');
            if (card) {
                const category = card.dataset.category;
                const filteredProducts = allProducts.filter(p => p.category === category);
                renderProducts(filteredProducts);
            }
        });

        // Search Input
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredProducts = allProducts.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                (p.category && p.category.toLowerCase().includes(searchTerm))
            );
            renderProducts(filteredProducts);
        });

        // Add to Cart Clicks
        productGrid.addEventListener('click', e => {
            if (e.target.classList.contains('btn-add-to-cart') && !e.target.classList.contains('added')) {
                const productId = parseInt(e.target.dataset.productId, 10);
                const productToAdd = allProducts.find(p => p.id === productId);
                
                if (productToAdd) {
                    cart.push({ ...productToAdd, quantity: 1 });
                    updateCartCounter();
                    e.target.textContent = 'Added!';
                    e.target.classList.remove('btn-dark');
                    e.target.classList.add('btn-success', 'added');
                }
            }
        });

        // Checkout Button Click
        checkoutBtn.addEventListener('click', handleCheckout);
    };
    
    // --- CART LOGIC ---
    const updateCartCounter = () => {
        cartCounter.textContent = cart.length;
    };
    
    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const orderRequest = {
            userId: 1, // Hardcoded for now. Will be dynamic after login implementation.
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderRequest)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to place order');
            }
            
            alert('Order placed successfully!');
            cart = []; // Clear the cart
            updateCartCounter();
            renderProducts(allProducts); // Re-render to reset "Added!" buttons

        } catch (error) {
            console.error('Checkout error:', error);
            alert(`Error placing order: ${error.message}`);
        }
    };


    // --- INITIAL FETCH & RENDER ---
    const initialize = async () => {
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
        }
    };

    initialize();
});

