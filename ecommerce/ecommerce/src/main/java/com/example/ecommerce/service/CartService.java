package com.example.ecommerce.service;

import com.example.ecommerce.model.Cart;
import com.example.ecommerce.model.CartItem;
import com.example.ecommerce.model.Product;
import com.example.ecommerce.model.User;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    @Transactional
    public Cart addProductToCart(Long userId, Long productId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingCartItem = cartItemRepository.findByCartAndProduct(cart, product);

        CartItem cartItem;
        if (existingCartItem.isPresent()) {
            cartItem = existingCartItem.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            
            // Check for stock availability when increasing quantity
            if (newQuantity > product.getStockQuantity()) {
                throw new RuntimeException("Cannot add product: insufficient stock available. Only " + product.getStockQuantity() + " units remaining.");
            }
            
            if (newQuantity <= 0) {
                // Remove item if quantity becomes 0 or negative
                cartItemRepository.delete(cartItem);
                cart.getCartItems().remove(cartItem);
            } else {
                cartItem.setQuantity(newQuantity);
                cartItemRepository.save(cartItem);
            }
        } else {
            if (quantity > 0) {
                // Check stock for new item
                if (quantity > product.getStockQuantity()) {
                    throw new RuntimeException("Cannot add product: insufficient stock available. Only " + product.getStockQuantity() + " units remaining.");
                }
                
                cartItem = new CartItem();
                cartItem.setCart(cart);
                cartItem.setProduct(product);
                cartItem.setQuantity(quantity);
                cart.getCartItems().add(cartItem);
                cartItemRepository.save(cartItem);
            }
        }

        return cart;
    }

    @Transactional
    public Cart removeItemFromCart(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        cartItemRepository.delete(cartItem);
        cart.getCartItems().remove(cartItem);
        return cart;
    }
    
    @Transactional
    public void clearCart(Long userId) {
        cartRepository.findByUser(userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found")))
                .ifPresent(cart -> cartRepository.delete(cart));
    }
}