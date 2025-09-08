package com.example.ecommerce.controller;

import com.example.ecommerce.model.ProductViewLog;
import com.example.ecommerce.repository.ProductViewLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    @Autowired
    private ProductViewLogRepository logRepository;
    @PostMapping("/log-view")
    public ResponseEntity<Void> logProductView(@RequestBody ProductViewLog log) {
        logRepository.save(log);
        return ResponseEntity.ok().build();
    }
}
