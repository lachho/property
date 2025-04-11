package com.property.service.impl;

import com.property.entity.Profile;
import com.property.repository.ProfileRepository;
import com.property.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

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
        existingProfile.setFirstName(profile.getFirstName());
        existingProfile.setLastName(profile.getLastName());
        existingProfile.setPhone(profile.getPhone());
        existingProfile.setDateOfBirth(profile.getDateOfBirth());
        existingProfile.setGrossIncome(profile.getGrossIncome());
        existingProfile.setMaritalStatus(profile.getMaritalStatus());
        existingProfile.setPartnerIncome(profile.getPartnerIncome());
        existingProfile.setExistingLoans(profile.getExistingLoans());
        existingProfile.setDependants(profile.getDependants());
        
        return profileRepository.save(existingProfile);
    }

    @Override
    public void deleteProfile(UUID id) {
        profileRepository.deleteById(id);
    }
} 