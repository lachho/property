package com.property.service.impl;

import com.property.dto.ProfileDetailsDto;
import com.property.entity.Profile;
import com.property.repository.AssetRepository;
import com.property.repository.LiabilityRepository;
import com.property.repository.ProfileRepository;
import com.property.service.AssetService;
import com.property.service.LiabilityService;
import com.property.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private AssetRepository assetRepository;
    
    @Autowired
    private LiabilityRepository liabilityRepository;
    
    @Autowired
    private AssetService assetService;
    
    @Autowired
    private LiabilityService liabilityService;

    @Override
    public Profile getProfile(UUID id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
    }

    @Override
    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }

    @Override
    public Profile updateProfile(UUID id, Profile profile) {
        Profile existingProfile = getProfile(id);
        // Update fields that are allowed to be modified
        updateProfileFields(existingProfile, profile);
        
        return profileRepository.save(existingProfile);
    }

    @Override
    public void deleteProfile(UUID id) {
        profileRepository.deleteById(id);
    }
    
    @Override
    public ProfileDetailsDto getProfileDetails(UUID id) {
        Profile profile = getProfile(id);
        
        return ProfileDetailsDto.builder()
                .profile(profile)
                .assets(assetRepository.findByProfileId(id))
                .liabilities(liabilityRepository.findByProfileId(id))
                .build();
    }
    
    @Override
    @Transactional
    public ProfileDetailsDto updateProfileDetails(UUID id, ProfileDetailsDto profileDetails) {
        // Update profile
        Profile existingProfile = getProfile(id);
        updateProfileFields(existingProfile, profileDetails.getProfile());
        profileRepository.save(existingProfile);
        
        // Delete and recreate assets
        assetRepository.deleteByProfileId(id);
        if (profileDetails.getAssets() != null && !profileDetails.getAssets().isEmpty()) {
            profileDetails.getAssets().forEach(asset -> assetService.createAsset(id, asset));
        }
        
        // Delete and recreate liabilities
        liabilityRepository.deleteByProfileId(id);
        if (profileDetails.getLiabilities() != null && !profileDetails.getLiabilities().isEmpty()) {
            profileDetails.getLiabilities().forEach(liability -> liabilityService.createLiability(id, liability));
        }
        
        // Return updated details
        return getProfileDetails(id);
    }
    
    private void updateProfileFields(Profile existingProfile, Profile updatedProfile) {
        // Basic fields
        existingProfile.setFirstName(updatedProfile.getFirstName());
        existingProfile.setLastName(updatedProfile.getLastName());
        existingProfile.setPhone(updatedProfile.getPhone());
        existingProfile.setDateOfBirth(updatedProfile.getDateOfBirth());
        
        // New fields
        existingProfile.setAddress(updatedProfile.getAddress());
        existingProfile.setOccupation(updatedProfile.getOccupation());
        existingProfile.setEmployer(updatedProfile.getEmployer());
        existingProfile.setEmploymentLength(updatedProfile.getEmploymentLength());
        existingProfile.setEmploymentType(updatedProfile.getEmploymentType());
        existingProfile.setOnProbation(updatedProfile.getOnProbation());
        existingProfile.setGrossIncome(updatedProfile.getGrossIncome());
        existingProfile.setNonTaxableIncome(updatedProfile.getNonTaxableIncome());
        
        // Partner fields
        existingProfile.setAssessWithPartner(updatedProfile.getAssessWithPartner());
        existingProfile.setPartnerFirstName(updatedProfile.getPartnerFirstName());
        existingProfile.setPartnerLastName(updatedProfile.getPartnerLastName());
        existingProfile.setPartnerDob(updatedProfile.getPartnerDob());
        existingProfile.setPartnerMobile(updatedProfile.getPartnerMobile());
        existingProfile.setPartnerAddress(updatedProfile.getPartnerAddress());
        existingProfile.setPartnerEmail(updatedProfile.getPartnerEmail());
        existingProfile.setPartnerOccupation(updatedProfile.getPartnerOccupation());
        existingProfile.setPartnerEmployer(updatedProfile.getPartnerEmployer());
        existingProfile.setPartnerEmploymentLength(updatedProfile.getPartnerEmploymentLength());
        existingProfile.setPartnerEmploymentType(updatedProfile.getPartnerEmploymentType());
        existingProfile.setPartnerOnProbation(updatedProfile.getPartnerOnProbation());
        existingProfile.setPartnerIncome(updatedProfile.getPartnerIncome());
        existingProfile.setPartnerNonTaxableIncome(updatedProfile.getPartnerNonTaxableIncome());
        
        // Expense fields
        existingProfile.setIsRenting(updatedProfile.getIsRenting());
        existingProfile.setRentPerWeek(updatedProfile.getRentPerWeek());
        existingProfile.setMonthlyLivingExpenses(updatedProfile.getMonthlyLivingExpenses());
        existingProfile.setResidenceHistory(updatedProfile.getResidenceHistory());
        existingProfile.setDependants(updatedProfile.getDependants());
        existingProfile.setDependantsAgeRanges(updatedProfile.getDependantsAgeRanges());
        
        // Retirement fields
        existingProfile.setRetirementPassiveIncomeGoal(updatedProfile.getRetirementPassiveIncomeGoal());
        existingProfile.setDesiredRetirementAge(updatedProfile.getDesiredRetirementAge());
        
        // Existing fields
        existingProfile.setMaritalStatus(updatedProfile.getMaritalStatus());
        existingProfile.setExistingLoans(updatedProfile.getExistingLoans());
    }
} 