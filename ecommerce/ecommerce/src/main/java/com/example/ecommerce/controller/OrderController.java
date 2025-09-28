package com.example.ecommerce.controller;

import com.example.ecommerce.model.Order;
import com.example.ecommerce.service.OrderService;
import com.example.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    // NEW: Inject UserService to look up the numeric ID from the username
    @Autowired
    private UserService userService;

    static class OrderRequest {
        private Long userId;
        private Long shippingOptionId;
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getShippingOptionId() { return shippingOptionId; }
        public void setShippingOptionId(Long shippingOptionId) { this.shippingOptionId = shippingOptionId; }
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest orderRequest) {
        Order newOrder = orderService.createOrder(orderRequest.getUserId(), orderRequest.getShippingOptionId());
        return ResponseEntity.ok(newOrder);
    }

    @GetMapping("/me")
    public ResponseEntity<List<Order>> getMyOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getName().equals("anonymousUser")) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            // FIX: Use the username (authentication.getName()) to find the actual User ID
            String username = authentication.getName();
            Long userId = userService.findByUsername(username)
                                     .map(user -> user.getId())
                                     .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
            
            List<Order> orders = orderService.findOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            // Catches RuntimeException, NumberFormatException, etc.
            return ResponseEntity.status(401).build();
        }
    }
}