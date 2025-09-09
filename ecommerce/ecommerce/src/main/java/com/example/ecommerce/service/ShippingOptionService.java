package com.example.ecommerce.service;

import com.example.ecommerce.model.ShippingOption;
import com.example.ecommerce.repository.ShippingOptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ShippingOptionService {

    @Autowired
    private ShippingOptionRepository shippingOptionRepository;

    /**
     * READ: Retrieves all available shipping options.
     * @return a list of all shipping options.
     */
    public List<ShippingOption> findAllShippingOptions() {
        return shippingOptionRepository.findAll();
    }

    /**
     * READ: Finds a single shipping option by its unique ID.
     * @param id The ID of the shipping option to find.
     * @return an Optional containing the shipping option if found, or empty if not.
     */
    public Optional<ShippingOption> findShippingOptionById(Long id) {
        return shippingOptionRepository.findById(id);
    }
}