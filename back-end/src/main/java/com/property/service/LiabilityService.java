package com.property.service;

import com.property.entity.Liability;
import java.util.List;
import java.util.UUID;

public interface LiabilityService {
    List<Liability> getLiabilitiesByProfileId(UUID profileId);
    Liability createLiability(UUID profileId, Liability liability);
    Liability updateLiability(UUID profileId, UUID liabilityId, Liability liability);
    void deleteLiability(UUID profileId, UUID liabilityId);
} 