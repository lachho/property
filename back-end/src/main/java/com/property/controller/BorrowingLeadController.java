package com.property.controller;

import com.property.dto.BorrowingLeadDto;
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
@RequestMapping("/api/borrowing-leads")
@RequiredArgsConstructor
public class BorrowingLeadController {

    private final ProfileService profileService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBorrowingLead(@RequestBody BorrowingLeadDto leadDto) {
        // Create a basic profile from the lead information
        Profile profile = profileService.createProfileFromBorrowingLead(leadDto);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("profileId", profile.getId());
        response.put("message", "Lead successfully converted to profile");
        
        return ResponseEntity.ok(response);
    }
} 