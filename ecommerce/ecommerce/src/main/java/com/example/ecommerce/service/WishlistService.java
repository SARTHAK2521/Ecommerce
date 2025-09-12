package com.example.ecommerce.service;

import com.example.ecommerce.model.Wishlist;
import com.example.ecommerce.model.User;
import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.WishlistRepository;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class WishlistService {
    
    @Autowired
    private WishlistRepository wishlistRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    /**
     * Add a product to user's wishlist
     */
    public Wishlist addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if already in wishlist
        Optional<Wishlist> existingWishlist = wishlistRepository.findByUserAndProduct(user, product);
        if (existingWishlist.isPresent()) {
            return existingWishlist.get();
        }
        
        Wishlist wishlist = new Wishlist(user, product);
        return wishlistRepository.save(wishlist);
    }
    
    /**
     * Remove a product from user's wishlist
     */
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }
    
    /**
     * Get all wishlist items for a user
     */
    public List<Wishlist> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByAddedAtDesc(userId);
    }
    
    /**
     * Check if a product is in user's wishlist
     */
    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.findByUserIdAndProductId(userId, productId).isPresent();
    }
    
    /**
     * Get wishlist count for a user
     */
    public long getWishlistCount(Long userId) {
        return wishlistRepository.countByUserId(userId);
    }
    
    /**
     * Toggle wishlist status (add if not present, remove if present)
     */
    public boolean toggleWishlist(Long userId, Long productId) {
        Optional<Wishlist> existingWishlist = wishlistRepository.findByUserIdAndProductId(userId, productId);
        
        if (existingWishlist.isPresent()) {
            wishlistRepository.delete(existingWishlist.get());
            return false; // Removed
        } else {
            addToWishlist(userId, productId);
            return true; // Added
        }
    }
}
