package com.property.service.impl;

import com.property.entity.Asset;
import com.property.entity.Profile;
import com.property.repository.AssetRepository;
import com.property.repository.ProfileRepository;
import com.property.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AssetServiceImpl implements AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Override
    public List<Asset> getAssetsByProfileId(UUID profileId) {
        validateProfileExists(profileId);
        return assetRepository.findByProfileId(profileId);
    }

    @Override
    @Transactional
    public Asset createAsset(UUID profileId, Asset asset) {
        Profile profile = validateProfileExists(profileId);
        asset.setProfile(profile);
        
        // Generate a new UUID if not provided
        if (asset.getId() == null) {
            asset.setId(UUID.randomUUID());
        }
        
        return assetRepository.save(asset);
    }

    @Override
    @Transactional
    public Asset updateAsset(UUID profileId, UUID assetId, Asset asset) {
        validateProfileExists(profileId);
        
        Asset existingAsset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + assetId));
        
        // Ensure the asset belongs to the specified profile
        if (!existingAsset.getProfile().getId().equals(profileId)) {
            throw new RuntimeException("Asset does not belong to the specified profile");
        }
        
        // Update fields
        existingAsset.setAssetType(asset.getAssetType());
        existingAsset.setCurrentValue(asset.getCurrentValue());
        existingAsset.setOriginalPrice(asset.getOriginalPrice());
        existingAsset.setYearPurchased(asset.getYearPurchased());
        existingAsset.setOwnershipPercentage(asset.getOwnershipPercentage());
        existingAsset.setIncomeAmount(asset.getIncomeAmount());
        existingAsset.setIncomeFrequency(asset.getIncomeFrequency());
        existingAsset.setDescription(asset.getDescription());
        
        return assetRepository.save(existingAsset);
    }

    @Override
    @Transactional
    public void deleteAsset(UUID profileId, UUID assetId) {
        validateProfileExists(profileId);
        
        Asset existingAsset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + assetId));
        
        // Ensure the asset belongs to the specified profile
        if (!existingAsset.getProfile().getId().equals(profileId)) {
            throw new RuntimeException("Asset does not belong to the specified profile");
        }
        
        assetRepository.deleteById(assetId);
    }
    
    private Profile validateProfileExists(UUID profileId) {
        return profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + profileId));
    }
} 