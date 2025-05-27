package com.property.controller;

import com.property.entity.Asset;
import com.property.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles/{profileId}/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or #profileId == authentication.principal.id")
    public ResponseEntity<List<Asset>> getAssetsByProfileId(@PathVariable UUID profileId) {
        return ResponseEntity.ok(assetService.getAssetsByProfileId(profileId));
    }

    @PostMapping
    public ResponseEntity<Asset> createAsset(@RequestBody Asset asset) {
        try {
            Asset newAsset = assetService.createAsset(asset);
            return ResponseEntity.ok(newAsset);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/{assetId}")
    @PreAuthorize("hasRole('ADMIN') or #profileId == authentication.principal.id")
    public ResponseEntity<Asset> updateAsset(
            @PathVariable UUID profileId,
            @PathVariable UUID assetId,
            @RequestBody Asset asset) {
        return ResponseEntity.ok(assetService.updateAsset(profileId, assetId, asset));
    }

    @DeleteMapping("/{assetId}")
    @PreAuthorize("hasRole('ADMIN') or #profileId == authentication.principal.id")
    public ResponseEntity<Void> deleteAsset(
            @PathVariable UUID profileId,
            @PathVariable UUID assetId) {
        assetService.deleteAsset(profileId, assetId);
        return ResponseEntity.ok().build();
    }
} 