package com.example.ecommerce.controller;

import com.example.ecommerce.model.Product;
import com.example.ecommerce.model.ProductViewLog;
import com.example.ecommerce.repository.ProductViewLogRepository;
import com.example.ecommerce.service.ProductService;
import com.example.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    @Autowired
    private ProductViewLogRepository logRepository;
    @Autowired
    private ProductService productService;
    @Autowired
    private UserService userService;
    
    @PostMapping("/log-view")
    public ResponseEntity<Void> logProductView(@RequestBody ProductViewLog log) {
        logRepository.save(log);
        return ResponseEntity.ok().build();
    }
    
    /**
     * NEW ENDPOINT: Get the top 8 recently viewed products by the authenticated user.
     */
    @GetMapping("/recently-viewed")
    public ResponseEntity<List<Product>> getRecentlyViewedProducts() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            // Return an empty list for unauthenticated users
            return ResponseEntity.ok(List.of());
        }
        
        // 1. Get the list of recently viewed Product IDs
        List<Long> productIds = logRepository.findRecentlyViewedProductIds(userId);
        
        // 2. Fetch the corresponding Product objects
        List<Product> products = productIds.stream()
            .map(id -> productService.findProductById(id))
            .filter(productOptional -> productOptional.isPresent())
            .map(productOptional -> productOptional.get())
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(products);
    }
    
    /**
     * Helper method to get current user ID from security context (Copied from other controllers)
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            
            String username = authentication.getName();

            return userService.findByUsername(username)
                    .map(user -> user.getId())
                    .orElse(null);
        }
        return null;
    }
}