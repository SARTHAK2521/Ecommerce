package com.example.ecommerce.controller;

import com.example.ecommerce.model.ShippingOption;
import com.example.ecommerce.service.ShippingOptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/shipping")
public class ShippingOptionController {

    @Autowired
    private ShippingOptionService shippingOptionService;

    /**
     * READ: Handles GET requests to /api/shipping to fetch all available shipping options.
     * @return A list of all shipping options.
     */
    @GetMapping
    public ResponseEntity<List<ShippingOption>> getAllShippingOptions() {
        List<ShippingOption> shippingOptions = shippingOptionService.findAllShippingOptions();
        return ResponseEntity.ok(shippingOptions);
    }
}