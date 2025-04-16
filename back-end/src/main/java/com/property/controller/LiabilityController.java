package com.property.controller;

import com.property.entity.Liability;
import com.property.service.LiabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles/{profileId}/liabilities")
public class LiabilityController {

    @Autowired
    private LiabilityService liabilityService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or #profileId == authentication.principal.id")
    public ResponseEntity<List<Liability>> getLiabilitiesByProfileId(@PathVariable UUID profileId) {
        return ResponseEntity.ok(liabilityService.getLiabilitiesByProfileId(profileId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or #profileId == authentication.principal.id")
    public ResponseEntity<Liability> createLiability(@PathVariable UUID profileId, @RequestBody Liability liability) {
        return ResponseEntity.ok(liabilityService.createLiability(profileId, liability));
    }

    @PutMapping("/{liabilityId}")
    @PreAuthorize("hasRole('ADMIN') or #profileId == authentication.principal.id")
    public ResponseEntity<Liability> updateLiability(
            @PathVariable UUID profileId,
            @PathVariable UUID liabilityId,
            @RequestBody Liability liability) {
        return ResponseEntity.ok(liabilityService.updateLiability(profileId, liabilityId, liability));
    }

    @DeleteMapping("/{liabilityId}")
    @PreAuthorize("hasRole('ADMIN') or #profileId == authentication.principal.id")
    public ResponseEntity<Void> deleteLiability(
            @PathVariable UUID profileId,
            @PathVariable UUID liabilityId) {
        liabilityService.deleteLiability(profileId, liabilityId);
        return ResponseEntity.ok().build();
    }
} 