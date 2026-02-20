package com.vaxify.app.service;

import com.vaxify.app.dtos.auth.AuthResponse;
import com.vaxify.app.dtos.auth.LoginRequest;
import com.vaxify.app.dtos.auth.SignupRequest;

public interface AuthService {

    AuthResponse signup(SignupRequest request);

    AuthResponse login(LoginRequest request);
}
