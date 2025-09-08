document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const productGrid = document.getElementById('product-grid');
    const categoryFilters = document.getElementById('category-filters');
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');
    const cartCounter = document.getElementById('cart-counter');
    const checkoutBtn = document.getElementById('checkout-btn');
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    const navbar = document.querySelector('.navbar');

    let allProducts = [];
    let cart = [];

    // --- RENDER PRODUCTS ---
    const renderProducts = (productsToRender) => {
        productGrid.innerHTML = '';
        noResults.style.display = productsToRender.length === 0 ? 'block' : 'none';

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
        const categoryIcons = {
            'Electronics': 'bi-headphone', 'Books': 'bi-book', 'Clothing': 'bi-t-shirt',
            'Fashion': 'bi-handbag-fill', 'Home Goods': 'bi-house-door', 
            'Home & Kitchen': 'bi-cup-straw', 'Groceries': 'bi-basket', 'Default': 'bi-tag'
        };

        categoryFilters.innerHTML = ''; // Clear previous
        
        const createCategoryCard = (categoryName, iconClass, isActive = false) => {
            const card = document.createElement('div');
            card.className = 'col-lg-2 col-md-3 col-4';
            card.innerHTML = `
                <div class="category-card ${isActive ? 'active' : ''}" data-category="${categoryName.toLowerCase()}">
                    <i class="bi ${iconClass}"></i>
                    <h5>${categoryName}</h5>
                </div>
            `;
            return card;
        };

        categoryFilters.appendChild(createCategoryCard('All', 'bi-grid-fill', true));

        categories.forEach(category => {
            const icon = categoryIcons[category] || categoryIcons['Default'];
            categoryFilters.appendChild(createCategoryCard(category, icon));
        });
    };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        // Category Filter Clicks
        categoryFilters.addEventListener('click', (e) => {
            const card = e.target.closest('.category-card');
            if (card) {
                document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                const category = card.dataset.category;
                renderProducts(
                    category === 'all' ? allProducts : allProducts.filter(p => p.category.toLowerCase() === category)
                );
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
            const button = e.target.closest('.btn-add-to-cart');
            if (button && !button.classList.contains('added')) {
                const productId = parseInt(button.dataset.productId, 10);
                const productToAdd = allProducts.find(p => p.id === productId);
                
                if (productToAdd) {
                    cart.push({ ...productToAdd, quantity: 1 });
                    updateCartCounter();
                    button.textContent = 'Added!';
                    button.classList.remove('btn-dark');
                    button.classList.add('btn-success', 'added');
                }
            }
        });

        // Checkout Button Click
        checkoutBtn.addEventListener('click', handleCheckout);
        
        // Window Scroll Listener for Navbar shadow and Scroll to Top button
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) { 
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }

            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        // Scroll to Top Button Click
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
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
            userId: 1, // Placeholder for now.
            items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
        };
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderRequest)
            });
            if (!response.ok) throw new Error(await response.text());
            alert('Order placed successfully!');
            cart = [];
            updateCartCounter();
            renderProducts(allProducts); // Re-render to reset button states
        } catch (error) {
            console.error('Checkout error:', error);
            alert(`Error placing order.`);
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

