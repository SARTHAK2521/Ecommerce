package com.example.ecommerce.controller;

import com.example.ecommerce.model.Order;
import com.example.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    static class OrderRequest {
        private Long userId;
        private Long shippingOptionId;
        private Map<Long, Integer> cart;
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getShippingOptionId() { return shippingOptionId; }
        public void setShippingOptionId(Long shippingOptionId) { this.shippingOptionId = shippingOptionId; }
        public Map<Long, Integer> getCart() { return cart; }
        public void setCart(Map<Long, Integer> cart) { this.cart = cart; }
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest orderRequest) {
        Order newOrder = orderService.createOrder(orderRequest.getUserId(), orderRequest.getShippingOptionId(), orderRequest.getCart());
        return ResponseEntity.ok(newOrder);
    }
}