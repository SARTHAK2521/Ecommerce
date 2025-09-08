package com.example.ecommerce.repository;

import com.example.ecommerce.model.ProductViewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductViewLogRepository extends JpaRepository<ProductViewLog, Long> {
}
