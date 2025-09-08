package com.example.ecommerce.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class ProductViewLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long productId;
    private Long userId; // Can be null for guest users
    private LocalDateTime viewStart;
    private Integer durationSeconds;
    // Getters & Setters...
}
