package com.property.controller;

import com.property.dto.MortgageLeadDto;
import com.property.entity.Profile;
import com.property.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mortgage-leads")
@RequiredArgsConstructor
public class MortgageLeadController {

    private final ProfileService profileService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createMortgageLead(@RequestBody MortgageLeadDto leadDto) {
        // Create a basic profile from the lead information
        Profile profile = profileService.createProfileFromMortgageLead(leadDto);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("profileId", profile.getId());
        response.put("message", "Lead successfully converted to profile");
        
        return ResponseEntity.ok(response);
    }
} 