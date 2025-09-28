package com.example.ecommerce.service;

import com.example.ecommerce.model.*;
import com.example.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private ShippingOptionRepository shippingOptionRepository;
    @Autowired 
    private ProductService productService; // NEW: Inject ProductService

    @Transactional
    public Order createOrder(Long userId, Long shippingOptionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        ShippingOption shippingOption = shippingOptionRepository.findById(shippingOptionId)
                .orElseThrow(() -> new RuntimeException("Shipping option not found with id: " + shippingOptionId));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));
        
        if (cart.getCartItems().isEmpty()) {
             throw new RuntimeException("Cannot create an order from an empty cart.");
        }
        
        // 1. Final Stock Check before processing
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName() + 
                                            ". Available: " + product.getStockQuantity() + 
                                            ", Requested: " + cartItem.getQuantity());
            }
        }


        Order order = new Order();
        order.setUser(user);
        order.setShippingOption(shippingOption);
        order.setShippingCost(shippingOption.getCost());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.CONFIRMED); // Set initial status

        double subtotalAmount = 0.0;

        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(cartItem.getProduct().getPrice());

            order.getOrderItems().add(orderItem);

            subtotalAmount += cartItem.getProduct().getPrice() * cartItem.getQuantity();
            
            // 2. Decrement product stock
            Product product = cartItem.getProduct();
            productService.updateProductStock(product.getId(), product.getStockQuantity() - cartItem.getQuantity());
        }

        order.setSubtotal(subtotalAmount);
        order.setTotalAmount(subtotalAmount + shippingOption.getCost());
        return orderRepository.save(order);
    }

    /**
 
     * @param userId The ID of the user whose orders to retrieve.
     * @return a list of all orders for the given user.
     */
    public List<Order> findOrdersByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return orderRepository.findByUser(user);
    }
}