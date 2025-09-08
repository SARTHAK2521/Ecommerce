package com.example.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Use BCrypt for strong, salted password hashing
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for our API endpoints, common for stateless APIs
            .csrf(csrf -> csrf.disable()) 
            .authorizeHttpRequests(authz -> authz
                // Allow public access to the home page, API endpoints, and static assets
                .requestMatchers("/", "/index.html", "/product.html", "/login.html", "/css/**", "/js/**").permitAll()
                .requestMatchers("/api/products/**").permitAll()
                .requestMatchers("/api/users/**").permitAll()
                // Any other request must be authenticated (we'll build on this later)
                .anyRequest().authenticated() 
            );
        return http.build();
    }
}
