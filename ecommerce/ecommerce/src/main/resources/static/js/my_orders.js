document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noOrders = document.getElementById('no-orders');
    const cartCounter = document.getElementById('cart-counter');
    const authLink = document.getElementById('auth-link');
    const ordersLinkLi = document.getElementById('orders-link-li');
    const logoutLinkLi = document.getElementById('logout-link-li');
    const logoutBtn = document.getElementById('logout-btn');
    const cartLink = document.getElementById('cart-link');
    
    let orders = [];

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

    cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Please visit the home page to view your cart and checkout.', 'info');
        setTimeout(() => window.location.href = '/', 2000);
    });

    async function fetchOrders() {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            showToast('Please log in to view your orders', 'warning');
            setTimeout(() => window.location.href = '/login.html', 2000);
            return;
        }

        loadingSpinner.style.display = 'block';
        try {
            const response = await fetch('/api/orders/me');
            if (response.ok) {
                orders = await response.json();
                renderOrders();
            } else if (response.status === 401) {
                showToast('Please log in to view your orders', 'warning');
                setTimeout(() => window.location.href = '/login.html', 2000);
            } else {
                showToast('Failed to load orders', 'danger');
                showNoOrders();
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast('Failed to load orders', 'danger');
            showNoOrders();
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    function renderOrders() {
        if (orders.length === 0) {
            showNoOrders();
            return;
        }

        ordersContainer.innerHTML = '';
        
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'col-md-6 col-lg-4 mb-4';
            
            const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const statusBadgeClass = getStatusBadgeClass(order.status);
            const statusIcon = getStatusIcon(order.status);

            orderCard.innerHTML = `
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-header bg-light d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0 fw-bold">Order #${order.id}</h6>
                            <small class="text-muted">${orderDate}</small>
                        </div>
                        <span class="badge ${statusBadgeClass}">
                            <i class="bi ${statusIcon} me-1"></i>${order.status}
                        </span>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <h6 class="fw-semibold mb-2">Items (${order.orderItems.length})</h6>
                            <div class="order-items">
                                ${order.orderItems.map(item => `
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div class="d-flex align-items-center">
                                            <img src="${item.product.imageUrl}" 
                                                 class="rounded me-2" 
                                                 style="width: 40px; height: 40px; object-fit: cover;"
                                                 onerror="this.onerror=null;this.src='https://placehold.co/40x40?text=No+Image';">
                                            <div>
                                                <small class="fw-semibold">${item.product.name}</small>
                                                <br>
                                                <small class="text-muted">Qty: ${item.quantity}</small>
                                            </div>
                                        </div>
                                        <small class="fw-bold">$${(item.product.price * item.quantity).toFixed(2)}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="border-top pt-3">
                            <div class="d-flex justify-content-between mb-1">
                                <small>Subtotal:</small>
                                <small>$${order.subtotal.toFixed(2)}</small>
                            </div>
                            <div class="d-flex justify-content-between mb-1">
                                <small>Shipping:</small>
                                <small>$${order.shippingCost.toFixed(2)}</small>
                            </div>
                            <div class="d-flex justify-content-between fw-bold">
                                <span>Total:</span>
                                <span>$${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary btn-sm flex-grow-1 view-order-btn" data-order-id="${order.id}">
                                <i class="bi bi-eye me-1"></i>View Details
                            </button>
                            ${order.status === 'DELIVERED' ? `
                                <button class="btn btn-outline-success btn-sm reorder-btn" data-order-id="${order.id}">
                                    <i class="bi bi-arrow-repeat me-1"></i>Reorder
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            ordersContainer.appendChild(orderCard);
        });

        // Add event listeners
        setupOrderEventListeners();
    }

    function showNoOrders() {
        ordersContainer.innerHTML = '';
        noOrders.classList.remove('d-none');
    }

    function getStatusBadgeClass(status) {
        switch (status.toUpperCase()) {
            case 'PENDING': return 'bg-warning text-dark';
            case 'CONFIRMED': return 'bg-info text-white';
            case 'SHIPPED': return 'bg-primary text-white';
            case 'DELIVERED': return 'bg-success text-white';
            case 'CANCELLED': return 'bg-danger text-white';
            default: return 'bg-secondary text-white';
        }
    }

    function getStatusIcon(status) {
        switch (status.toUpperCase()) {
            case 'PENDING': return 'bi-clock';
            case 'CONFIRMED': return 'bi-check-circle';
            case 'SHIPPED': return 'bi-truck';
            case 'DELIVERED': return 'bi-check-circle-fill';
            case 'CANCELLED': return 'bi-x-circle';
            default: return 'bi-question-circle';
        }
    }

    function setupOrderEventListeners() {
        // View order details
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.target.closest('.view-order-btn').dataset.orderId;
                showOrderDetails(orderId);
            });
        });

        // Reorder functionality
        document.querySelectorAll('.reorder-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const orderId = e.target.closest('.reorder-btn').dataset.orderId;
                await reorderItems(orderId);
            });
        });
    }

    function showOrderDetails(orderId) {
        const order = orders.find(o => o.id == orderId);
        if (!order) return;

        const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const modalHtml = `
            <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="orderDetailsModalLabel">Order #${order.id} Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="fw-bold">Order Information</h6>
                                    <p><strong>Order Date:</strong> ${orderDate}</p>
                                    <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></p>
                                    <p><strong>Total Items:</strong> ${order.orderItems.length}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="fw-bold">Order Summary</h6>
                                    <div class="d-flex justify-content-between">
                                        <span>Subtotal:</span>
                                        <span>$${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>Shipping:</span>
                                        <span>$${order.shippingCost.toFixed(2)}</span>
                                    </div>
                                    <hr>
                                    <div class="d-flex justify-content-between fw-bold">
                                        <span>Total:</span>
                                        <span>$${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <h6 class="fw-bold">Order Items</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.orderItems.map(item => `
                                            <tr>
                                                <td>
                                                    <div class="d-flex align-items-center">
                                                        <img src="${item.product.imageUrl}" 
                                                             class="rounded me-2" 
                                                             style="width: 40px; height: 40px; object-fit: cover;"
                                                             onerror="this.onerror=null;this.src='https://placehold.co/40x40?text=No+Image';">
                                                        <div>
                                                            <div class="fw-semibold">${item.product.name}</div>
                                                            <small class="text-muted">${item.product.category}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>$${item.product.price.toFixed(2)}</td>
                                                <td>${item.quantity}</td>
                                                <td class="fw-bold">$${(item.product.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            ${order.status === 'DELIVERED' ? `
                                <button type="button" class="btn btn-primary reorder-modal-btn" data-order-id="${order.id}">
                                    <i class="bi bi-arrow-repeat me-1"></i>Reorder Items
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('orderDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();

        // Add reorder event listener for modal button
        const reorderModalBtn = document.querySelector('.reorder-modal-btn');
        if (reorderModalBtn) {
            reorderModalBtn.addEventListener('click', async () => {
                const orderId = reorderModalBtn.dataset.orderId;
                modal.hide();
                await reorderItems(orderId);
            });
        }

        // Clean up modal when hidden
        document.getElementById('orderDetailsModal').addEventListener('hidden.bs.modal', () => {
            document.getElementById('orderDetailsModal').remove();
        });
    }

    async function reorderItems(orderId) {
        const order = orders.find(o => o.id == orderId);
        if (!order) return;

        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            showToast('You must be logged in to reorder items', 'danger');
            return;
        }

        try {
            // Add each item from the order to cart
            for (const orderItem of order.orderItems) {
                const response = await fetch(`/api/cart/${userId}/items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        productId: orderItem.product.id, 
                        quantity: orderItem.quantity 
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    showToast(`Failed to add ${orderItem.product.name} to cart: ${error.message}`, 'danger');
                    return;
                }
            }

            await updateCartCounter();
            showToast('All items from this order have been added to your cart!', 'success');
            
            // Optionally redirect to cart or home page
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);

        } catch (error) {
            console.error('Error reordering items:', error);
            showToast('An error occurred while reordering items', 'danger');
        }
    }

    // Initialize the page
    checkAuthAndGetUserId();
    fetchOrders();
});
