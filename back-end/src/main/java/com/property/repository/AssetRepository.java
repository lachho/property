package com.property.repository;

import com.property.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {
    List<Asset> findByProfileId(UUID profileId);
    void deleteByProfileId(UUID profileId);
} 