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
    private ProductRepository productRepository;
    @Autowired
    private ShippingOptionRepository shippingOptionRepository;

    @Transactional
    public Order createOrder(Long userId, Long shippingOptionId, Map<Long, Integer> cart) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        ShippingOption shippingOption = shippingOptionRepository.findById(shippingOptionId)
                .orElseThrow(() -> new RuntimeException("Shipping option not found with id: " + shippingOptionId));

        Order order = new Order();
        order.setUser(user);
        order.setShippingOption(shippingOption);
        order.setShippingCost(shippingOption.getCost());
        order.setOrderDate(LocalDateTime.now());

        double subtotalAmount = 0.0;

        for (Map.Entry<Long, Integer> entry : cart.entrySet()) {
            Long productId = entry.getKey();
            Integer quantity = entry.getValue();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setPriceAtPurchase(product.getPrice());

            order.getOrderItems().add(orderItem);

            subtotalAmount += product.getPrice() * quantity;
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
