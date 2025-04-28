package com.property.service.impl;

import com.property.dto.MortgageLeadDto;
import com.property.dto.ProfileDetailsDto;
import com.property.dto.ProfileDto;
import com.property.entity.Profile;
import com.property.entity.UserRole;
import com.property.repository.AssetRepository;
import com.property.repository.LiabilityRepository;
import com.property.repository.ProfileRepository;
import com.property.service.AssetService;
import com.property.service.LiabilityService;
import com.property.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
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
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    private Profile getProfileEntity(UUID id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + id));
    }

    @Override
    public ProfileDto getProfile(UUID id) {
        Profile profile = getProfileEntity(id);
        return toDto(profile);
    }

    @Override
    public List<ProfileDto> getAllProfiles() {
        return profileRepository.findAll().stream().map(this::toDto).toList();
    }

    @Override
    public Profile updateProfile(UUID id, Profile profile) {
        Profile existingProfile = getProfileEntity(id);
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
        Profile profile = getProfileEntity(id);
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
        Profile existingProfile = getProfileEntity(id);
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

    @Override
    public Profile getProfileByEmail(String email) {
        return profileRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found with email: " + email));
    }

    @Override
    @Transactional
    public Profile createProfileFromMortgageLead(MortgageLeadDto leadDto) {
        // Check if a profile with this email already exists
        Optional<Profile> existingProfile = profileRepository.findByEmail(leadDto.getEmail());
        
        if (existingProfile.isPresent()) {
            // Update existing profile with lead information
            Profile profile = existingProfile.get();
            profile.setFirstName(leadDto.getFirstName());
            profile.setLastName(leadDto.getLastName());
            profile.setPhone(leadDto.getPhone());
            
            // Update mortgage-related fields if provided
            if (leadDto.getLoanAmount() != null) {
                profile.setExistingLoans(BigDecimal.valueOf(leadDto.getLoanAmount()));
            }
            
            return profileRepository.save(profile);
        } else {
            // Create a new basic profile from lead information
            Profile newProfile = Profile.builder()
                    .firstName(leadDto.getFirstName())
                    .lastName(leadDto.getLastName())
                    .email(leadDto.getEmail())
                    .phone(leadDto.getPhone())
                    .role(UserRole.CLIENT)
                    // Set a default temporary password (should be changed later)
                    .password(passwordEncoder.encode(generateTemporaryPassword()))
                    .build();
            
            // Set mortgage-related fields if provided
            if (leadDto.getLoanAmount() != null) {
                newProfile.setExistingLoans(BigDecimal.valueOf(leadDto.getLoanAmount()));
            }
            
            return profileRepository.save(newProfile);
        }
    }
    
    private String generateTemporaryPassword() {
        // Generate a random temporary password
        return UUID.randomUUID().toString().substring(0, 12);
    }

    private ProfileDto toDto(Profile profile) {
        if (profile == null) return null;
        return ProfileDto.builder()
                .id(profile.getId())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .email(profile.getEmail())
                .phone(profile.getPhone())
                .role(profile.getRole() != null ? profile.getRole().name() : null)
                .address(profile.getAddress())
                .dateOfBirth(profile.getDateOfBirth() != null ? profile.getDateOfBirth().toString() : null)
                .occupation(profile.getOccupation())
                .employer(profile.getEmployer())
                .employmentLength(profile.getEmploymentLength())
                .employmentType(profile.getEmploymentType())
                .onProbation(profile.getOnProbation())
                .maritalStatus(profile.getMaritalStatus())
                .dependants(profile.getDependants())
                // Add other fields as needed
                .build();
    }
} 