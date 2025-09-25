package com.example.ecommerce.controller;

import com.example.ecommerce.model.ProductReview;
import com.example.ecommerce.service.ProductReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ProductReviewController {
    
    @Autowired
    private ProductReviewService reviewService;
    
    /**
     * Get all reviews for a product
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductReview>> getProductReviews(@PathVariable Long productId) {
        List<ProductReview> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * Get reviews by rating for a product
     */
    @GetMapping("/product/{productId}/rating/{rating}")
    public ResponseEntity<List<ProductReview>> getProductReviewsByRating(
            @PathVariable Long productId, 
            @PathVariable int rating) {
        List<ProductReview> reviews = reviewService.getProductReviewsByRating(productId, rating);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * Get verified purchase reviews for a product
     */
    @GetMapping("/product/{productId}/verified")
    public ResponseEntity<List<ProductReview>> getVerifiedReviews(@PathVariable Long productId) {
        List<ProductReview> reviews = reviewService.getVerifiedReviews(productId);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * Get product rating statistics
     */
    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<Map<String, Object>> getProductRatingStats(@PathVariable Long productId) {
        double averageRating = reviewService.getAverageRating(productId);
        long reviewCount = reviewService.getReviewCount(productId);
        Map<Integer, Long> ratingDistribution = reviewService.getRatingDistribution(productId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", Math.round(averageRating * 10.0) / 10.0); // Round to 1 decimal
        stats.put("reviewCount", reviewCount);
        stats.put("ratingDistribution", ratingDistribution);
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Add a new review
     */
    @PostMapping("/product/{productId}")
    public ResponseEntity<Map<String, Object>> addReview(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> reviewData) {
        
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            int rating = (Integer) reviewData.get("rating");
            String comment = (String) reviewData.get("comment");
            
            if (rating < 1 || rating > 5) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Rating must be between 1 and 5");
                return ResponseEntity.badRequest().body(response);
            }
            
            ProductReview review = reviewService.addReview(userId, productId, rating, comment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review added successfully");
            response.put("review", review);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Update an existing review
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<Map<String, Object>> updateReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, Object> reviewData) {
        
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            int rating = (Integer) reviewData.get("rating");
            String comment = (String) reviewData.get("comment");
            
            if (rating < 1 || rating > 5) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Rating must be between 1 and 5");
                return ResponseEntity.badRequest().body(response);
            }
            
            ProductReview review = reviewService.updateReview(reviewId, userId, rating, comment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review updated successfully");
            response.put("review", review);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Delete a review
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, Object>> deleteReview(@PathVariable Long reviewId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            reviewService.deleteReview(reviewId, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Mark review as helpful
     */
    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<Map<String, Object>> markAsHelpful(@PathVariable Long reviewId) {
        try {
            ProductReview review = reviewService.markAsHelpful(reviewId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review marked as helpful");
            response.put("helpfulCount", review.getHelpfulCount());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Check if user can review a product
     */
    @GetMapping("/product/{productId}/can-review")
    public ResponseEntity<Map<String, Object>> canUserReview(@PathVariable Long productId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        boolean canReview = reviewService.canUserReview(userId, productId);
        Map<String, Object> response = new HashMap<>();
        response.put("canReview", canReview);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get user's reviews
     */
    @GetMapping("/user")
    public ResponseEntity<List<ProductReview>> getUserReviews() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<ProductReview> reviews = reviewService.getUserReviews(userId);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * Get current user ID from security context
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            try {
                return Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}








