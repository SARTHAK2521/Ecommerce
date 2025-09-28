document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('product-not-found');
    const productTitlePage = document.getElementById('product-title-page');
    const cartCounter = document.getElementById('cart-counter');
    const reviewSummary = document.getElementById('review-summary');
    const reviewsList = document.getElementById('reviews-list');
    const noReviewsMessage = document.getElementById('no-reviews');
    
    // Auth link logic
    const authLink = document.getElementById('auth-link');
    const ordersLinkLi = document.getElementById('orders-link-li');
    const logoutLinkLi = document.getElementById('logout-link-li');
    const logoutBtn = document.getElementById('logout-btn');
    const cartLink = document.getElementById('cart-link');
    
    // NEW ELEMENTS FOR REVIEW SUBMISSION
    const reviewModalElement = document.getElementById('reviewModal');
    const reviewModal = new bootstrap.Modal(reviewModalElement);
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    const reviewForm = document.getElementById('reviewForm');
    
    // NEW ELEMENTS FOR EXTERNAL SEARCH
    const externalSearchBtn = document.getElementById('externalSearchBtn');
    const externalSearchModalElement = document.getElementById('externalSearchModal');
    const externalSearchModal = new bootstrap.Modal(externalSearchModalElement);
    const searchLoading = document.getElementById('search-loading');
    const searchResultsContent = document.getElementById('search-results-content');
    const aiSummaryText = document.getElementById('ai-summary-text');
    const sourceList = document.getElementById('source-list');
    const noSources = document.getElementById('no-sources');

    
    let currentProduct = null;
    let wishlistItems = new Set();

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

    // Wishlist functions
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
                if (data.isInWishlist) {
                    wishlistItems.add(productId);
                    showToast('Added to wishlist!', 'success');
                } else {
                    wishlistItems.delete(productId);
                    showToast('Removed from wishlist', 'info');
                }
                updateWishlistButton();
            } else if (response.status === 401) {
                showToast('Please log in to use wishlist', 'warning');
            } else {
                showToast('Error updating wishlist', 'danger');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            showToast('Error updating wishlist', 'danger');
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
                updateWishlistButton();
            }
        } catch (error) {
            console.error('Error loading wishlist status:', error);
        }
    }

    function updateWishlistButton() {
        const wishlistBtn = document.getElementById('wishlist-btn');
        if (!wishlistBtn) return;
        
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));

        if (wishlistItems.has(productId)) {
            wishlistBtn.classList.add('active');
            wishlistBtn.title = 'Remove from wishlist';
            wishlistBtn.innerHTML = '<i class="bi bi-heart-fill me-2"></i> Remove from Wishlist';
        } else {
            wishlistBtn.classList.remove('active');
            wishlistBtn.title = 'Add to wishlist';
            wishlistBtn.innerHTML = '<i class="bi bi-heart me-2"></i> Add to Wishlist';
        }
    }


    // New function to handle cart from the backend
    async function addToCart(product, quantity = 1) {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            showToast('You must be logged in to add products to cart.', 'danger');
            return;
        }

        // Client-side stock check for a better user experience
        const currentCartItem = await fetch(`/api/cart/${userId}`)
            .then(res => res.json())
            .then(cartData => cartData.cartItems.find(item => item.product.id === product.id))
            .catch(() => ({ quantity: 0 }));

        const currentQuantityInCart = currentCartItem ? currentCartItem.quantity : 0;
        const potentialNewQuantity = currentQuantityInCart + quantity;
        
        if (potentialNewQuantity > product.stockQuantity) {
            showToast(`Cannot add product: insufficient stock available. Only ${product.stockQuantity} units remaining.`, 'danger');
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

    cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/'; // Simple redirect to homepage where cart modal works
    });
    
    // Function to check if the user can review and update the button
    const checkCanUserReview = async (productId) => {
        const userId = sessionStorage.getItem('userId');
        const writeReviewBtn = document.getElementById('write-review-btn');
        if (!userId) {
             writeReviewBtn.disabled = true;
             writeReviewBtn.textContent = 'Login to Review';
             writeReviewBtn.setAttribute('title', 'You must be logged in to write a review.');
             return;
        }

        try {
            // Call the backend endpoint to check review status
            const response = await fetch(`/api/reviews/product/${productId}/can-review`);
            const data = await response.json();
            
            if (data.canReview) {
                writeReviewBtn.disabled = false;
                writeReviewBtn.textContent = 'Write a Review';
                writeReviewBtn.removeAttribute('title');
            } else {
                writeReviewBtn.disabled = true;
                writeReviewBtn.textContent = 'Already Reviewed';
                writeReviewBtn.setAttribute('title', 'You have already submitted a review for this product.');
            }
        } catch (error) {
            console.error('Error checking review status:', error);
            writeReviewBtn.disabled = true;
            writeReviewBtn.textContent = 'Error Loading Status';
        }
    };
    
    // Function to handle review submission
    const submitReview = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const userId = sessionStorage.getItem('userId');
        
        if (!userId) {
            showToast('You must be logged in to submit a review.', 'danger');
            reviewModal.hide();
            return;
        }

        const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
        const comment = document.getElementById('reviewComment').value.trim();

        if (!ratingInput) {
            showToast('Please select a rating.', 'warning');
            return;
        }

        const rating = parseInt(ratingInput.value, 10);
        
        try {
            // Call the backend API to add the review
            const response = await fetch(`/api/reviews/product/${productId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment })
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message || 'Review added successfully!');
                reviewModal.hide();
                reviewForm.reset();
                // Refresh the reviews list and update the button state
                await fetchAndRenderReviews(productId);
                await checkCanUserReview(productId);
            } else {
                showToast(data.message || 'Failed to submit review. If you have already reviewed, you cannot submit another.', 'danger');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            showToast('An error occurred while submitting your review.', 'danger');
        }
    };
    
    // Add event listener for review submission button
    submitReviewBtn.addEventListener('click', submitReview);

    // --- NEW: External Search API Logic ---
    const performExternalSearch = async (productName) => {
        const userQuery = `Find recent external reviews and key features for the product: ${productName}`;
        const systemPrompt = "You are a product analyst. Your task is to perform a Google Search based on the user's query and generate a concise, objective, two-paragraph summary of the key findings, including common consumer pros and cons if available. Cite all sources found below your summary.";
        const apiKey = ""; // Canvas will automatically provide the key.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        // Reset and show loading state
        aiSummaryText.textContent = '';
        sourceList.innerHTML = '';
        noSources.style.display = 'none';
        searchResultsContent.style.display = 'none';
        searchLoading.style.display = 'block';
        externalSearchModal.show();

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            tools: [{ "google_search": {} }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        const maxRetries = 3;
        let delay = 1000;
        let finalStatus = 0; // To store the last HTTP status code
        let response = null;

        for (let i = 0; i < maxRetries; i++) {
            try {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                finalStatus = response.status;

                if (response.ok) break;
                if (response.status === 429) { // Rate limit exceeded
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                } else {
                    // For non-retryable errors (like 400, 403, 500), stop and throw immediately
                    throw new Error(`API returned non-ok status: ${response.status}`);
                }
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                if (i === maxRetries - 1 || finalStatus !== 429) {
                    // Update error message to include the status code
                    searchLoading.style.display = 'none';
                    const message = finalStatus > 0 
                        ? `Failed to fetch external insights (Error ${finalStatus}). Please check API configuration or network.`
                        : 'Failed to fetch external insights. Please try again later due to a network error.';
                    aiSummaryText.textContent = message;
                    searchResultsContent.style.display = 'block';
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }
        }

        // Check if the loop finished without a successful response (only possible if response is null or not ok)
        if (!response || !response.ok) {
            searchLoading.style.display = 'none';
            const message = finalStatus > 0 
                ? `Failed to fetch external insights (Error ${finalStatus}). Please check API configuration or network.`
                : 'Failed to fetch external insights. Please try again later due to a network error.';
            aiSummaryText.textContent = message;
            searchResultsContent.style.display = 'block';
            return;
        }


        try {
            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                const text = candidate.content.parts[0].text;
                let sources = [];
                const groundingMetadata = candidate.groundingMetadata;

                if (groundingMetadata && groundingMetadata.groundingAttributions) {
                    sources = groundingMetadata.groundingAttributions
                        .map(attribution => ({
                            uri: attribution.web?.uri,
                            title: attribution.web?.title,
                        }))
                        .filter(source => source.uri && source.title);
                }

                // Display results
                aiSummaryText.innerHTML = text.replace(/\n/g, '<br>');
                
                if (sources.length > 0) {
                    sourceList.innerHTML = sources.map((source, index) => `
                        <li class="list-group-item d-flex justify-content-between align-items-start px-0">
                            <a href="${source.uri}" target="_blank" class="text-decoration-none">${source.title}</a>
                        </li>
                    `).join('');
                    noSources.style.display = 'none';
                } else {
                    sourceList.innerHTML = '';
                    noSources.style.display = 'block';
                }

            } else {
                 aiSummaryText.textContent = 'No relevant external information could be generated for this product.';
            }
        } catch (error) {
            aiSummaryText.textContent = 'An error occurred while processing external insights.';
            console.error('Error processing Gemini response:', error);
        } finally {
            searchLoading.style.display = 'none';
            searchResultsContent.style.display = 'block';
        }
    };
    // --- END: External Search API Logic ---

    const fetchProductDetails = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            errorMessage.style.display = 'block';
            return;
        }

        loadingSpinner.style.display = 'block';
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) {
                errorMessage.style.display = 'block';
                throw new Error('Product not found');
            }
            const product = await response.json();
            currentProduct = product; // Store the product globally
            renderProductDetails(product);
            await fetchAndRenderReviews(productId);
            await checkCanUserReview(productId);
        } catch (error) {
            console.error('Error fetching product details:', error);
            errorMessage.style.display = 'block';
        } finally {
            loadingSpinner.style.display = 'none';
        }
    };

    const renderProductDetails = (product) => {
        document.getElementById('product-details').style.display = 'block';
        document.getElementById('product-category').textContent = product.category;
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-description').textContent = product.description;
        document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('product-original-price').textContent = product.onSale ? `$${product.originalPrice.toFixed(2)}` : '';
        document.querySelector('.product-image-container img').src = product.imageUrl;

        const isOutOfStock = product.stockQuantity <= 0;
        const isLimitedStock = product.stockQuantity > 0 && product.stockQuantity <= 10;
        
        document.getElementById('product-limited-stock').textContent = isLimitedStock ? `Only ${product.stockQuantity} left!` : '';
        document.getElementById('product-out-of-stock').textContent = isOutOfStock ? `Out of Stock` : '';
        document.getElementById('addToCartBtn').disabled = isOutOfStock;
        document.getElementById('addToCartBtn').innerHTML = `<i class="bi bi-cart-plus me-2"></i> ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}`;

        // Remove old listener before adding a new one to prevent duplicates
        const addToCartBtn = document.getElementById('addToCartBtn');
        addToCartBtn.replaceWith(addToCartBtn.cloneNode(true));
        document.getElementById('addToCartBtn').addEventListener('click', async () => {
            await addToCart(product, 1);
        });

        // Ensure wishlist button state is updated correctly
        const wishlistBtn = document.getElementById('wishlist-btn');
        wishlistBtn.replaceWith(wishlistBtn.cloneNode(true));
        document.getElementById('wishlist-btn').addEventListener('click', async () => {
            const productId = parseInt(new URLSearchParams(window.location.search).get('id'));
            await toggleWishlist(productId);
        });
        
        // Add event listener for the NEW external search button
        externalSearchBtn.addEventListener('click', () => {
            if (currentProduct && currentProduct.name) {
                performExternalSearch(currentProduct.name);
            } else {
                 showToast('Product name is unavailable for search.', 'warning');
            }
        });
    };
    
    // Review functions
    const fetchAndRenderReviews = async (productId) => {
        try {
            const statsResponse = await fetch(`/api/reviews/product/${productId}/stats`);
            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                document.getElementById('average-rating').textContent = stats.averageRating || '0.0';
                document.getElementById('review-count').textContent = `${stats.reviewCount} reviews`;
                const starHtml = getStarRating(stats.averageRating);
                document.getElementById('review-stars').innerHTML = starHtml;
            }

            const reviewsResponse = await fetch(`/api/reviews/product/${productId}`);
            if (!reviewsResponse.ok) throw new Error('Failed to fetch reviews.');
            
            const reviews = await reviewsResponse.json();
            reviewsList.innerHTML = '';
            if (reviews.length === 0) {
                noReviewsMessage.classList.remove('d-none');
                reviewsList.classList.add('d-none');
            } else {
                noReviewsMessage.classList.add('d-none');
                reviewsList.classList.remove('d-none');
                reviews.forEach(review => {
                    const verifiedBadge = review.verifiedPurchase ? '<span class="badge bg-success ms-2"><i class="bi bi-patch-check-fill"></i> Verified Purchase</span>' : '';
                    const reviewCard = document.createElement('div');
                    reviewCard.className = 'card mb-3';
                    reviewCard.innerHTML = `
                        <div class="card-body">
                            <h6 class="card-title fw-bold">${review.user.username} ${verifiedBadge}</h6>
                            <small class="text-muted d-block mb-2">${new Date(review.createdAt).toLocaleDateString()}</small>
                            <div class="mb-2">${getStarRating(review.rating)}</div>
                            <p class="card-text">${review.comment}</p>
                            ${review.helpfulCount > 0 ? `<small class="text-muted">${review.helpfulCount} found this helpful</small>` : ''}
                        </div>
                    `;
                    reviewsList.appendChild(reviewCard);
                });
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            reviewsList.innerHTML = '<p class="text-danger">Failed to load reviews.</p>';
        }
    };

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        let starHtml = '';
        for (let i = 0; i < fullStars; i++) starHtml += '<i class="bi bi-star-fill text-warning me-1"></i>';
        if (halfStar) starHtml += '<i class="bi bi-star-half text-warning me-1"></i>';
        for (let i = 0; i < emptyStars; i++) starHtml += '<i class="bi bi-star text-warning me-1"></i>';
        
        return starHtml;
    };

    // Initial calls
    checkAuthAndGetUserId();
    fetchProductDetails();
    loadWishlistStatus();
});
