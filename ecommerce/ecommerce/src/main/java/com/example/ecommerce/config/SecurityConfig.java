package com.example.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for simplicity in this project
            .authorizeHttpRequests(auth -> auth
                // Allow access to all static resources (CSS, JS, images)
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                // Allow access to public pages
                .requestMatchers("/", "/index.html", "/login.html", "/product.html").permitAll()
                // Allow access to public API endpoints
                .requestMatchers("/api/products/**", "/api/users/register", "/api/users/login").permitAll()
                // IMPORTANT: Only allow users with the 'ADMIN' role to access the admin page
                .requestMatchers("/admin.html").hasRole("ADMIN")
                // Require authentication for any other request
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                // Specify the URL for our custom login page
                .loginPage("/login.html")
                // The URL where the login form will be submitted to
                .loginProcessingUrl("/login") 
                // The URL to redirect to after a successful login
                .defaultSuccessUrl("/index.html", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .permitAll()
            );
        return http.build();
    }
}