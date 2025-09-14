package com.example.ecommerce.service;

import com.example.ecommerce.model.ProductReview;
import com.example.ecommerce.model.User;
import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.ProductReviewRepository;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class ProductReviewService {
    
    @Autowired
    private ProductReviewRepository reviewRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    /**
     * Add a review for a product
     */
    public ProductReview addReview(Long userId, Long productId, int rating, String comment) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if user has already reviewed this product
        Optional<ProductReview> existingReview = reviewRepository.findByUserAndProduct(user, product);
        if (existingReview.isPresent()) {
            throw new RuntimeException("You have already reviewed this product");
        }
        
        // Check if user has purchased this product (for verified purchase status)
        boolean hasPurchased = orderRepository.existsByUserIdAndProductId(userId, productId);
        
        ProductReview review = new ProductReview(user, product, rating, comment);
        review.setVerifiedPurchase(hasPurchased);
        
        return reviewRepository.save(review);
    }
    
    /**
     * Update an existing review
     */
    public ProductReview updateReview(Long reviewId, Long userId, int rating, String comment) {
        ProductReview review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own reviews");
        }
        
        review.setRating(rating);
        review.setComment(comment);
        
        return reviewRepository.save(review);
    }
    
    /**
     * Delete a review
     */
    public void deleteReview(Long reviewId, Long userId) {
        ProductReview review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }
        
        reviewRepository.delete(review);
    }
    
    /**
     * Get all reviews for a product
     */
    public List<ProductReview> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }
    
    /**
     * Get reviews for a product with pagination
     */
    public List<ProductReview> getProductReviews(Long productId, int page, int size) {
        // This would need to be implemented with Pageable in a real application
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }
    
    /**
     * Get reviews by rating for a product
     */
    public List<ProductReview> getProductReviewsByRating(Long productId, int rating) {
        return reviewRepository.findByProductIdAndRatingOrderByCreatedAtDesc(productId, rating);
    }
    
    /**
     * Get verified purchase reviews for a product
     */
    public List<ProductReview> getVerifiedReviews(Long productId) {
        return reviewRepository.findVerifiedReviewsByProductId(productId);
    }
    
    /**
     * Get average rating for a product
     */
    public double getAverageRating(Long productId) {
        Double average = reviewRepository.getAverageRatingByProductId(productId);
        return average != null ? average : 0.0;
    }
    
    /**
     * Get rating distribution for a product
     */
    public Map<Integer, Long> getRatingDistribution(Long productId) {
        List<Object[]> results = reviewRepository.getRatingDistributionByProductId(productId);
        Map<Integer, Long> distribution = new HashMap<>();
        
        for (Object[] result : results) {
            Integer rating = (Integer) result[0];
            Long count = (Long) result[1];
            distribution.put(rating, count);
        }
        
        return distribution;
    }
    
    /**
     * Get total review count for a product
     */
    public long getReviewCount(Long productId) {
        return reviewRepository.countByProductId(productId);
    }
    
    /**
     * Check if user can review a product
     */
    public boolean canUserReview(Long userId, Long productId) {
        return !reviewRepository.findByUserIdAndProductId(userId, productId).isPresent();
    }
    
    /**
     * Mark review as helpful
     */
    public ProductReview markAsHelpful(Long reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.incrementHelpfulCount();
        return reviewRepository.save(review);
    }
    
    /**
     * Get user's reviews
     */
    public List<ProductReview> getUserReviews(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get recent reviews across all products
     */
    public List<ProductReview> getRecentReviews(int limit) {
        // This would need a custom query in a real application
        return reviewRepository.findAll().stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(limit)
            .toList();
    }
}





