package com.example.ecommerce.repository;

import com.example.ecommerce.model.Order;
import com.example.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
