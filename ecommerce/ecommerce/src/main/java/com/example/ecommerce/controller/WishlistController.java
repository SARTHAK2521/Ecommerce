package com.example.ecommerce.controller;

import com.example.ecommerce.model.Wishlist;
import com.example.ecommerce.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    
    @Autowired
    private WishlistService wishlistService;
    
    /**
     * Get current user's wishlist
     */
    @GetMapping
    public ResponseEntity<List<Wishlist>> getUserWishlist() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<Wishlist> wishlist = wishlistService.getUserWishlist(userId);
        return ResponseEntity.ok(wishlist);
    }
    
    /**
     * Add product to wishlist
     */
    @PostMapping("/add/{productId}")
    public ResponseEntity<Map<String, Object>> addToWishlist(@PathVariable Long productId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            Wishlist wishlist = wishlistService.addToWishlist(userId, productId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product added to wishlist");
            response.put("wishlist", wishlist);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Remove product from wishlist
     */
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Map<String, Object>> removeFromWishlist(@PathVariable Long productId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            wishlistService.removeFromWishlist(userId, productId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product removed from wishlist");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Toggle wishlist status
     */
    @PostMapping("/toggle/{productId}")
    public ResponseEntity<Map<String, Object>> toggleWishlist(@PathVariable Long productId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            boolean isAdded = wishlistService.toggleWishlist(userId, productId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isInWishlist", isAdded);
            response.put("message", isAdded ? "Product added to wishlist" : "Product removed from wishlist");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Check if product is in wishlist
     */
    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Object>> checkWishlistStatus(@PathVariable Long productId) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        boolean isInWishlist = wishlistService.isInWishlist(userId, productId);
        Map<String, Object> response = new HashMap<>();
        response.put("isInWishlist", isInWishlist);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get wishlist count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getWishlistCount() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        long count = wishlistService.getWishlistCount(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
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
