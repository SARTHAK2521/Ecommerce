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

    @Transactional
    public Order createOrder(Long userId, Long shippingOptionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        ShippingOption shippingOption = shippingOptionRepository.findById(shippingOptionId)
                .orElseThrow(() -> new RuntimeException("Shipping option not found with id: " + shippingOptionId));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        Order order = new Order();
        order.setUser(user);
        order.setShippingOption(shippingOption);
        order.setShippingCost(shippingOption.getCost());
        order.setOrderDate(LocalDateTime.now());

        double subtotalAmount = 0.0;

        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(cartItem.getProduct().getPrice());

            order.getOrderItems().add(orderItem);

            subtotalAmount += cartItem.getProduct().getPrice() * cartItem.getQuantity();
        }

        order.setTotalAmount(subtotalAmount + shippingOption.getCost());
        return orderRepository.save(order);
    }

    /**
     * READ: Retrieves a list of orders for a specific user.
     * @param userId The ID of the user whose orders to retrieve.
     * @return a list of all orders for the given user.
     */
    public List<Order> findOrdersByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return orderRepository.findByUser(user);
    }
}