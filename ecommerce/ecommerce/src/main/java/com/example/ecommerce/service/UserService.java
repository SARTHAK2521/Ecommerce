package com.example.ecommerce.service;

import com.example.ecommerce.model.User;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * READ: Retrieves a list of all users from the database.
     * @return a list of all users.
     */
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    /**
     * READ: Finds a single user by their unique ID.
     * @param id The ID of the user to find.
     * @return an Optional containing the user if found, or empty if not.
     */
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * Finds a user by their username.
     * @param username The username of the user to find.
     * @return an Optional containing the User if found, or empty if not.
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * CREATE: Handles new user registration.
     * @param user The User object to be created.
     * @return the newly created user (without the password).
     * @throws RuntimeException if the username or email is already taken.
     */
    public User createUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_USER");
        return userRepository.save(user);
    }

    /**
     * UPDATE: Updates an existing user's details.
     * @param id The ID of the user to update.
     * @param userDetails The new user data.
     * @return the updated user object.
     * @throws RuntimeException if the user is not found.
     */
    public User updateUser(Long id, User userDetails) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        existingUser.setUsername(userDetails.getUsername());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setRole(userDetails.getRole());
        
        // Only update password if a new one is provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    /**
     * DELETE: Deletes a user by their unique ID.
     * @param id The ID of the user to delete.
     * @throws RuntimeException if the user is not found.
     */
    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * AUTHENTICATE: Authenticates a user with a given username and password.
     * @param username The username of the user.
     * @param password The raw password to check.
     * @return An Optional containing the authenticated user, or empty if authentication fails.
     */
    public Optional<User> authenticate(String username, String password) {
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }
}
