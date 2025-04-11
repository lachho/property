package com.property.service.impl;

import com.property.dto.AuthRequest;
import com.property.dto.AuthResponse;
import com.property.dto.RegisterRequest;
import com.property.entity.Profile;
import com.property.entity.UserRole;
import com.property.repository.ProfileRepository;
import com.property.security.JwtService;
import com.property.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        var profile = Profile.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(UserRole.CLIENT)
                .build();

        profileRepository.save(profile);
        var jwtToken = jwtService.generateToken(profile);
        return AuthResponse.builder()
                .accessToken(jwtToken)
                .email(profile.getEmail())
                .role(profile.getRole().name())
                .build();
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var profile = profileRepository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(profile);
        return AuthResponse.builder()
                .accessToken(jwtToken)
                .email(profile.getEmail())
                .role(profile.getRole().name())
                .build();
    }
} 