package com.property.controller;

import com.property.dto.PortfolioDTO;
import com.property.dto.SimulationRequest;
import com.property.dto.SimulationResponse;
import com.property.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/{userId}")
    public ResponseEntity<PortfolioDTO> getPortfolio(@PathVariable Long userId) {
        return ResponseEntity.ok(portfolioService.getPortfolioByUserId(userId));
    }

    @PostMapping("/simulate")
    public ResponseEntity<SimulationResponse> simulatePropertyImpact(
            @RequestBody SimulationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(portfolioService.simulatePropertyImpact(request));
    }
} 