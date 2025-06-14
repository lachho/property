package com.property.service;

import com.property.dto.MortgageLeadDto;
import com.property.dto.BorrowingLeadDto;
import com.property.dto.ProfileDetailsDto;
import com.property.dto.ProfileDto;
import com.property.entity.Profile;
import java.util.List;
import java.util.UUID;

public interface ProfileService {
    ProfileDto getProfile(UUID id);
    List<ProfileDto> getAllProfiles();
    Profile updateProfile(UUID id, Profile profile);
    void deleteProfile(UUID id);
    
    // Get profile by email
    Profile getProfileByEmail(String email);
    
    // New methods for comprehensive client details
    ProfileDetailsDto getProfileDetails(UUID id);
    ProfileDetailsDto updateProfileDetails(UUID id, ProfileDetailsDto profileDetails);
    
    // Methods to create profiles from leads
    Profile createProfileFromMortgageLead(MortgageLeadDto leadDto);
    Profile createProfileFromBorrowingLead(BorrowingLeadDto leadDto);
} 