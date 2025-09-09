package com.example.ecommerce.repository;

import com.example.ecommerce.model.ShippingOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingOptionRepository extends JpaRepository<ShippingOption, Long> {
}