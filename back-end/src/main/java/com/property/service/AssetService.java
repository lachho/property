package com.property.service;

import com.property.entity.Asset;
import java.util.List;
import java.util.UUID;

public interface AssetService {
    List<Asset> getAssetsByProfileId(UUID profileId);
    Asset createAsset(UUID profileId, Asset asset);
    Asset updateAsset(UUID profileId, UUID assetId, Asset asset);
    void deleteAsset(UUID profileId, UUID assetId);
} 