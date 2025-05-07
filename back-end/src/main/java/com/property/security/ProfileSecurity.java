package com.property.security;

import com.property.entity.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("profileSecurity")
public class ProfileSecurity {
    public boolean isOwner(UUID id, Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof Profile profile) {
            return profile.getId() != null && profile.getId().equals(id);
        }
        return false;
    }
} 