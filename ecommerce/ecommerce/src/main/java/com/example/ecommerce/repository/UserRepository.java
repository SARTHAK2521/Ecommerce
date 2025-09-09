package com.example.ecommerce.repository;

import com.example.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA understands this method name and will automatically
    // create a query to find a user by their username.
    Optional<User> findByUsername(String username);

    // This is the missing method. By adding it here, Spring Data JPA will
    // now know how to find a user by their email address.
    Optional<User> findByEmail(String email);
}

