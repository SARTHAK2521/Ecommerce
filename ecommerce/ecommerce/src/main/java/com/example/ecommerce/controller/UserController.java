package com.example.ecommerce.controller;

import com.example.ecommerce.model.User;
import com.example.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.security.Principal;
import java.util.List;
import java.util.Optional;

/**
 * A simple helper class to map the login request JSON body.
 */
class LoginRequest {
    public String username;
    public String password;
}

/**
 * DTO to send back a cleaner response after login.
 */
class LoginResponse {
    public Long id;
    public String username;
    public String email;
    public String role;
}

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private SecurityContextRepository securityContextRepository;

    /**
     * READ: Endpoint to get a list of all users.
     * NOTE: For a real-world app, this should be restricted to ADMIN roles.
     * @return A list of all users.
     */
    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAllUsers();
    }

    /**
     * READ: Endpoint to get a single user by ID.
     * @param id The ID of the user to retrieve.
     * @return A ResponseEntity with the user or a 404 status.
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.findUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * READ: Endpoint to get the details of the currently logged-in user.
     * @param principal The object representing the currently authenticated user.
     * @return A ResponseEntity with the user's data or an unauthorized status.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No authenticated user found");
        }
        
        Optional<User> optionalUser = userService.findByUsername(principal.getName());
        
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            // Important: Do not send the password back in the response
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    /**
     * CREATE: Endpoint to handle new user registration.
     * @param user The User object from the request body.
     * @return A ResponseEntity with the created user or an error message.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = userService.createUser(user);
            registeredUser.setPassword(null);
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * UPDATE: Endpoint to update an existing user by ID.
     * @param id The ID of the user to update.
     * @param userDetails The updated user data.
     * @return A ResponseEntity with the updated user or a 404 status.
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            updatedUser.setPassword(null); // Ensure password is not returned
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE: Endpoint to delete a user by ID.
     * @param id The ID of the user to delete.
     * @return A ResponseEntity with a 204 No Content status on success or 404 if not found.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUserById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * AUTHENTICATE: Endpoint to handle user login, now integrated with Spring Security session.
     * @param loginRequest The login credentials from the request body.
     * @return A ResponseEntity with the authenticated user's data or an unauthorized error.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest, 
                                    HttpServletRequest request, 
                                    HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username, loginRequest.password)
            );
            
            // Create security context and save to session
            SecurityContextHolder.getContext().setAuthentication(authentication);
            securityContextRepository.saveContext(SecurityContextHolder.getContext(), request, response);

            Optional<User> optionalUser = userService.findByUsername(loginRequest.username);
            if (optionalUser.isPresent()) {
                User authenticatedUser = optionalUser.get();
                LoginResponse loginResponse = new LoginResponse();
                loginResponse.id = authenticatedUser.getId();
                loginResponse.username = authenticatedUser.getUsername();
                loginResponse.email = authenticatedUser.getEmail();
                loginResponse.role = authenticatedUser.getRole();

                return ResponseEntity.ok(loginResponse);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }
}