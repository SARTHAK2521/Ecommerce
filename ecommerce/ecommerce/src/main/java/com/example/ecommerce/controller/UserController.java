package com.example.ecommerce.controller;

import com.example.ecommerce.model.User;
import com.example.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * A simple helper class to map the login request JSON body.
 * This avoids needing to create a separate file for a simple data structure.
 */
class LoginRequest {
    public String username;
    public String password;
}

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Endpoint to handle new user registration.
     * @param user The User object from the request body.
     * @return A ResponseEntity with the created user (without password) or an error message.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = userService.registerNewUser(user);
            // Important: Do not send the password back in the response for security
            registeredUser.setPassword(null); 
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (Exception e) {
            // Return a Bad Request status with the error message (e.g., "Username already exists")
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Endpoint to handle user login.
     * @param loginRequest The login credentials from the request body.
     * @return A ResponseEntity with the authenticated user's data or an unauthorized error.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            User authenticatedUser = userService.authenticate(loginRequest.username, loginRequest.password);
            // On successful login, return user data (without the password)
            authenticatedUser.setPassword(null);
            return ResponseEntity.ok(authenticatedUser);
        } catch (Exception e) {
            // For security, always return a generic "Unauthorized" status for any login failure
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }
}

