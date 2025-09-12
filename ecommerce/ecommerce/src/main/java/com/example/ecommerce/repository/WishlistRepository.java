package com.example.ecommerce.repository;

import com.example.ecommerce.model.Wishlist;
import com.example.ecommerce.model.User;
import com.example.ecommerce.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    /**
     * Find all wishlist items for a specific user
     */
    List<Wishlist> findByUserOrderByAddedAtDesc(User user);
    
    /**
     * Find all wishlist items for a specific user ID
     */
    @Query("SELECT w FROM Wishlist w WHERE w.user.id = :userId ORDER BY w.addedAt DESC")
    List<Wishlist> findByUserIdOrderByAddedAtDesc(@Param("userId") Long userId);
    
    /**
     * Check if a product is already in user's wishlist
     */
    Optional<Wishlist> findByUserAndProduct(User user, Product product);
    
    /**
     * Check if a product is already in user's wishlist by IDs
     */
    @Query("SELECT w FROM Wishlist w WHERE w.user.id = :userId AND w.product.id = :productId")
    Optional<Wishlist> findByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
    
    /**
     * Count wishlist items for a user
     */
    long countByUser(User user);
    
    /**
     * Count wishlist items for a user by ID
     */
    @Query("SELECT COUNT(w) FROM Wishlist w WHERE w.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    /**
     * Delete wishlist item by user and product
     */
    void deleteByUserAndProduct(User user, Product product);
    
    /**
     * Delete wishlist item by user ID and product ID
     */
    @Query("DELETE FROM Wishlist w WHERE w.user.id = :userId AND w.product.id = :productId")
    void deleteByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
}
