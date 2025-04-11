package com.property.service;

import com.property.entity.Profile;
import java.util.List;
import java.util.UUID;

public interface ProfileService {
    Profile getProfile(UUID id);
    List<Profile> getAllProfiles();
    Profile updateProfile(UUID id, Profile profile);
    void deleteProfile(UUID id);
} 