package com.example.ecommerce.repository;

import com.example.ecommerce.model.ProductViewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductViewLogRepository extends JpaRepository<ProductViewLog, Long> {
    
    // NEW Query: Get the IDs of the most recently viewed products by a user.
    // Groups by productId and orders by the max view date (most recent view), limited to 8 items.
    @Query(value = "SELECT pvl.productId FROM ProductViewLog pvl WHERE pvl.userId = :userId " +
                   "GROUP BY pvl.productId ORDER BY MAX(pvl.viewStart) DESC LIMIT 8",
           nativeQuery = true) // Using native query for reliable LIMIT
    List<Long> findRecentlyViewedProductIds(@Param("userId") Long userId);
}