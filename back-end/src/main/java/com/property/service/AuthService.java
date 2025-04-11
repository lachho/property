package com.property.service;

import com.property.dto.AuthRequest;
import com.property.dto.AuthResponse;
import com.property.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
} 