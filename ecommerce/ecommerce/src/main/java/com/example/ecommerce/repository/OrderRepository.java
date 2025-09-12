package com.example.ecommerce.repository;

import com.example.ecommerce.model.Order;
import com.example.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    /**
     * Finds all orders placed by a specific user.
     * Spring Data JPA automatically generates the query for this method.
     * @param user The user object to search for.
     * @return a List of Order objects.
     */
    List<Order> findByUser(User user);
    
    /**
     * Check if a user has purchased a specific product
     * @param userId The ID of the user
     * @param productId The ID of the product
     * @return true if the user has purchased the product, false otherwise
     */
    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.orderItems oi WHERE o.user.id = :userId AND oi.product.id = :productId")
    boolean existsByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
}
