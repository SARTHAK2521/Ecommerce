package com.example.ecommerce.repository;

import com.example.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their unique username.
     * Spring Data JPA automatically generates the query for this method.
     * It is crucial for authentication and for retrieving the currently logged-in user.
     * @param username The username to search for.
     * @return an Optional containing the User if found, or empty otherwise.
     */
    Optional<User> findByUsername(String username);

    /**
     * Finds a user by their unique email address.
     * Spring Data JPA automatically generates the query for this method.
     * It is used during the registration process to prevent duplicate accounts.
     * @param email The email to search for.
     * @return an Optional containing the User if found, or empty otherwise.
     */
    Optional<User> findByEmail(String email);
}
