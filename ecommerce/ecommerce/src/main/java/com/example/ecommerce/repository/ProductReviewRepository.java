package com.example.ecommerce.repository;

import com.example.ecommerce.model.ProductReview;
import com.example.ecommerce.model.Product;
import com.example.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    
    /**
     * Find all reviews for a specific product, ordered by most recent
     */
    List<ProductReview> findByProductOrderByCreatedAtDesc(Product product);
    
    /**
     * Find all reviews for a specific product by ID, ordered by most recent
     */
    @Query("SELECT r FROM ProductReview r WHERE r.product.id = :productId ORDER BY r.createdAt DESC")
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(@Param("productId") Long productId);
    
    /**
     * Find all reviews for a specific product by ID, ordered by most helpful
     */
    @Query("SELECT r FROM ProductReview r WHERE r.product.id = :productId ORDER BY r.helpfulCount DESC, r.createdAt DESC")
    List<ProductReview> findByProductIdOrderByHelpfulCountDesc(@Param("productId") Long productId);
    
    /**
     * Find reviews by rating for a specific product
     */
    @Query("SELECT r FROM ProductReview r WHERE r.product.id = :productId AND r.rating = :rating ORDER BY r.createdAt DESC")
    List<ProductReview> findByProductIdAndRatingOrderByCreatedAtDesc(@Param("productId") Long productId, @Param("rating") int rating);
    
    /**
     * Find verified purchase reviews for a product
     */
    @Query("SELECT r FROM ProductReview r WHERE r.product.id = :productId AND r.verifiedPurchase = true ORDER BY r.createdAt DESC")
    List<ProductReview> findVerifiedReviewsByProductId(@Param("productId") Long productId);
    
    /**
     * Check if user has already reviewed a product
     */
    Optional<ProductReview> findByUserAndProduct(User user, Product product);
    
    /**
     * Check if user has already reviewed a product by IDs
     */
    @Query("SELECT r FROM ProductReview r WHERE r.user.id = :userId AND r.product.id = :productId")
    Optional<ProductReview> findByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
    
    /**
     * Count reviews for a product
     */
    long countByProduct(Product product);
    
    /**
     * Count reviews for a product by ID
     */
    @Query("SELECT COUNT(r) FROM ProductReview r WHERE r.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);
    
    /**
     * Count reviews by rating for a product
     */
    @Query("SELECT COUNT(r) FROM ProductReview r WHERE r.product.id = :productId AND r.rating = :rating")
    long countByProductIdAndRating(@Param("productId") Long productId, @Param("rating") int rating);
    
    /**
     * Get average rating for a product
     */
    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);
    
    /**
     * Get rating distribution for a product
     */
    @Query("SELECT r.rating, COUNT(r) FROM ProductReview r WHERE r.product.id = :productId GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistributionByProductId(@Param("productId") Long productId);
    
    /**
     * Find reviews by user
     */
    List<ProductReview> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find reviews by user ID
     */
    @Query("SELECT r FROM ProductReview r WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<ProductReview> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
}




