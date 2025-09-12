package com.example.ecommerce.controller;

import com.example.ecommerce.model.Cart;
import com.example.ecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable Long userId) {
        Cart cart = cartService.getOrCreateCart(userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<Cart> addItemToCart(@PathVariable Long userId, @RequestBody Map<String, Object> payload) {
        Long productId = Long.parseLong(payload.get("productId").toString());
        int quantity = Integer.parseInt(payload.get("quantity").toString());
        Cart updatedCart = cartService.addProductToCart(userId, productId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public ResponseEntity<Cart> removeItemFromCart(@PathVariable Long userId, @PathVariable Long productId) {
        Cart updatedCart = cartService.removeItemFromCart(userId, productId);
        return ResponseEntity.ok(updatedCart);
    }
    
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}