package com.example.ecommerce.service;

import com.example.ecommerce.model.User;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerNewUser(User user) throws Exception {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new Exception("Username already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // --- NEW METHOD ---
    /**
     * Authenticates a user by checking their username and password.
     * @param username The user's username.
     * @param rawPassword The plain-text password to check.
     * @return The authenticated User object.
     * @throws Exception if the user is not found or the password is incorrect.
     */
    public User authenticate(String username, String rawPassword) throws Exception {
        // Find the user by their username
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new Exception("User not found / Invalid credentials"));

        // Check if the provided password matches the stored hashed password
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new Exception("Invalid credentials");
        }
        
        return user;
    }
}

