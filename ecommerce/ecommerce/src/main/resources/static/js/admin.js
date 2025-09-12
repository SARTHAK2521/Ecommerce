document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status on page load
    const checkAdminAuth = async () => {
        try {
            const response = await fetch('/api/users/me');
            if (!response.ok) {
                // Not authenticated or session expired, redirect to login
                window.location.href = '/login.html';
                return;
            }
            const user = await response.json();
            if (user.role !== 'ROLE_ADMIN') {
                // User is authenticated but not an admin, redirect
                window.location.href = '/index.html';
            } else {
                // User is an admin, fetch and display products
                fetchProducts();
            }
        } catch (error) {
            console.error('Error checking authentication status:', error);
            window.location.href = '/login.html';
        }
    };

    const productTableBody = document.getElementById('product-table-body');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('modalTitle');
    const productForm = document.getElementById('productForm');

    let currentProducts = [];
    let isEditing = false;
    let currentProductId = null;

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            currentProducts = await response.json();
            renderProductTable(currentProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const renderProductTable = (products) => {
        productTableBody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.imageUrl}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover;"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn" data-id="${product.id}"><i class="bi bi-pencil"></i> Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${product.id}"><i class="bi bi-trash"></i> Delete</button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
    };

    const showModal = (product = null) => {
        if (product) {
            isEditing = true;
            currentProductId = product.id;
            modalTitle.textContent = 'Edit Product';
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productImageUrl').value = product.imageUrl;
        } else {
            isEditing = false;
            currentProductId = null;
            modalTitle.textContent = 'Add Product';
            productForm.reset();
        }
        productModal.show();
    };

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            imageUrl: document.getElementById('productImageUrl').value
        };

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `/api/products/${currentProductId}` : '/api/products';
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                productModal.hide();
                fetchProducts();
            } else {
                console.error('Failed to save product:', response.statusText);
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    });

    productTableBody.addEventListener('click', async (e) => {
        const id = e.target.closest('button').dataset.id;

        if (e.target.closest('.edit-btn')) {
            const productToEdit = currentProducts.find(p => p.id == id);
            if (productToEdit) {
                showModal(productToEdit);
            }
        } else if (e.target.closest('.delete-btn')) {
            if (confirm('Are you sure you want to delete this product?')) {
                try {
                    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        fetchProducts();
                    } else {
                        console.error('Failed to delete product:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error deleting product:', error);
                }
            }
        }
    });

    // Handle add product button
    addProductBtn.addEventListener('click', () => showModal());

    // Call the auth check on page load
    checkAdminAuth();
});
