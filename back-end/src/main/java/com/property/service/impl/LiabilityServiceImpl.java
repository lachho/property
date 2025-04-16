package com.property.service.impl;

import com.property.entity.Liability;
import com.property.entity.Profile;
import com.property.repository.LiabilityRepository;
import com.property.repository.ProfileRepository;
import com.property.service.LiabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class LiabilityServiceImpl implements LiabilityService {

    @Autowired
    private LiabilityRepository liabilityRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Override
    public List<Liability> getLiabilitiesByProfileId(UUID profileId) {
        validateProfileExists(profileId);
        return liabilityRepository.findByProfileId(profileId);
    }

    @Override
    @Transactional
    public Liability createLiability(UUID profileId, Liability liability) {
        Profile profile = validateProfileExists(profileId);
        liability.setProfile(profile);
        
        // Generate a new UUID if not provided
        if (liability.getId() == null) {
            liability.setId(UUID.randomUUID());
        }
        
        return liabilityRepository.save(liability);
    }

    @Override
    @Transactional
    public Liability updateLiability(UUID profileId, UUID liabilityId, Liability liability) {
        validateProfileExists(profileId);
        
        Liability existingLiability = liabilityRepository.findById(liabilityId)
                .orElseThrow(() -> new RuntimeException("Liability not found with id: " + liabilityId));
        
        // Ensure the liability belongs to the specified profile
        if (!existingLiability.getProfile().getId().equals(profileId)) {
            throw new RuntimeException("Liability does not belong to the specified profile");
        }
        
        // Update fields
        existingLiability.setLiabilityType(liability.getLiabilityType());
        existingLiability.setIsPrimaryResidence(liability.getIsPrimaryResidence());
        existingLiability.setLoanBalance(liability.getLoanBalance());
        existingLiability.setLimitAmount(liability.getLimitAmount());
        existingLiability.setLenderType(liability.getLenderType());
        existingLiability.setInterestRate(liability.getInterestRate());
        existingLiability.setTermType(liability.getTermType());
        existingLiability.setRepaymentAmount(liability.getRepaymentAmount());
        existingLiability.setRepaymentFrequency(liability.getRepaymentFrequency());
        existingLiability.setLoanType(liability.getLoanType());
        existingLiability.setDescription(liability.getDescription());
        
        return liabilityRepository.save(existingLiability);
    }

    @Override
    @Transactional
    public void deleteLiability(UUID profileId, UUID liabilityId) {
        validateProfileExists(profileId);
        
        Liability existingLiability = liabilityRepository.findById(liabilityId)
                .orElseThrow(() -> new RuntimeException("Liability not found with id: " + liabilityId));
        
        // Ensure the liability belongs to the specified profile
        if (!existingLiability.getProfile().getId().equals(profileId)) {
            throw new RuntimeException("Liability does not belong to the specified profile");
        }
        
        liabilityRepository.deleteById(liabilityId);
    }
    
    private Profile validateProfileExists(UUID profileId) {
        return profileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + profileId));
    }
} 