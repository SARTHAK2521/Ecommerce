document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const productTitlePage = document.getElementById('product-title-page');
    const cartCounter = document.getElementById('cart-counter');
    
    // Auth link logic
    const authLink = document.getElementById('auth-link');
    const ordersLinkLi = document.getElementById('orders-link-li');
    const logoutLinkLi = document.getElementById('logout-link-li');
    const logoutBtn = document.getElementById('logout-btn');
    
    let allProducts = [];

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


    // New function to handle cart from the backend
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
            await updateCartCounter();
        }
    }
    
    function checkAuthAndGetUserId() {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            authLink.classList.add('d-none');
            ordersLinkLi.classList.remove('d-none');
            logoutLinkLi.classList.remove('d-none');
        } else {
            checkAuthenticationAndSetUserId();
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

    const fetchProductDetails = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            errorMessage.classList.remove('d-none');
            return;
        }

        loadingSpinner.style.display = 'block';
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) {
                errorMessage.classList.remove('d-none');
                throw new Error('Product not found');
            }
            const product = await response.json();
            allProducts = [product]; // Keep a local reference for addToCart
            renderProductDetails(product);
        } catch (error) {
            console.error('Error fetching product details:', error);
            errorMessage.classList.remove('d-none');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    };

    const renderProductDetails = (product) => {
        productTitlePage.textContent = product.name;
        productDetailContainer.classList.remove('d-none');
        
        const discountPercent = product.onSale ? ((product.originalPrice - product.price) / product.originalPrice * 100).toFixed(0) : 0;
        const isOutOfStock = product.stockQuantity <= 0;
        const isLimitedStock = product.stockQuantity > 0 && product.stockQuantity <= 10;
        
        productDetailContainer.innerHTML = `
            <div class="col-md-6 text-center product-image-container">
                <img src="${product.imageUrl}" alt="${product.name}" class="img-fluid" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=No+Image';">
            </div>
            <div class="col-md-6 product-details">
                <h6 class="text-uppercase text-primary fw-semibold">${product.category}</h6>
                <h1 class="display-5 fw-bold">${product.name}</h1>
                <p class="lead text-muted">${product.description}</p>
                <div class="d-flex align-items-center mb-4">
                    <h2 class="price">$${product.price.toFixed(2)}</h2>
                    ${product.onSale ? `<p class="original-price ms-3 mb-0">$${product.originalPrice.toFixed(2)}</p>` : ''}
                </div>
                ${isLimitedStock ? `<p class="limited-stock"><i class="bi bi-exclamation-circle me-1"></i>Only ${product.stockQuantity} left!</p>` : ''}
                ${isOutOfStock ? `<p class="out-of-stock fw-bold"><i class="bi bi-x-circle me-1"></i>Out of Stock</p>` : ''}
                <div class="d-grid mt-4">
                    <button id="addToCartBtn" class="btn btn-primary btn-lg fw-semibold add-to-cart-button-details" ${isOutOfStock ? 'disabled' : ''}>
                        <i class="bi bi-cart-plus me-2"></i> ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `;

        document.getElementById('addToCartBtn').addEventListener('click', async () => {
            await addToCart(product, 1);
        });
    };

    // Initial calls
    checkAuthAndGetUserId();
    fetchProductDetails();
});