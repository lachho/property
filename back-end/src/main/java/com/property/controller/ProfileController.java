package com.property.controller;

import com.property.dto.ProfileDetailsDto;
import com.property.dto.ProfileDto;
import com.property.entity.Profile;
import com.property.entity.UserRole;
import com.property.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ProfileDto> getProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(profileService.getProfile(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProfileDto>> getAllProfiles() {
        return ResponseEntity.ok(profileService.getAllProfiles());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<Profile> updateProfile(@PathVariable UUID id, @RequestBody Profile profile) {
        return ResponseEntity.ok(profileService.updateProfile(id, profile));
    }

    @PutMapping("/{id}/details")
    @PreAuthorize("hasRole('ADMIN') or @profileSecurity.isOwner(#id, authentication)")
    public ResponseEntity<ProfileDetailsDto> updateProfileDetails(@PathVariable UUID id, @RequestBody ProfileDetailsDto profileDetails) {
        return ResponseEntity.ok(profileService.updateProfileDetails(id, profileDetails));
    }

    @GetMapping("/{id}/details")
    @PreAuthorize("hasRole('ADMIN') or @profileSecurity.isOwner(#id, authentication)")
    public ResponseEntity<ProfileDetailsDto> getProfileDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(profileService.getProfileDetails(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProfile(@PathVariable UUID id) {
        profileService.deleteProfile(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/current")
    public ResponseEntity<Profile> getCurrentProfile() {
        // Get the currently authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Profile profile = profileService.getProfileByEmail(email);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/{id}/set-admin")
    public ResponseEntity<ProfileDto> setAdminRole(@PathVariable UUID id) {
        try {
            // Get the current profile as DTO
            ProfileDto profileDto = profileService.getProfile(id);
            
            // Get the current profile entity for updating
            Profile profile = profileService.getProfileByEmail(profileDto.getEmail());
            
            // Set role to ADMIN
            profile.setRole(UserRole.ADMIN);
            
            // Update the profile
            Profile updatedProfile = profileService.updateProfile(id, profile);
            
            // Return the updated profile as DTO
            ProfileDto updatedDto = profileService.getProfile(id);
            return ResponseEntity.ok(updatedDto);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to set admin role: " + e.getMessage(), e);
        }
    }
} 