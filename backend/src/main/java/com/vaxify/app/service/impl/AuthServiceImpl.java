package com.vaxify.app.service.impl;

import com.vaxify.app.dtos.auth.AuthResponse;
import com.vaxify.app.dtos.auth.LoginRequest;
import com.vaxify.app.dtos.auth.SignupRequest;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.entities.enums.Role;
import com.vaxify.app.entities.User;
import com.vaxify.app.mapper.UserMapper;
import com.vaxify.app.repository.UserRepository;
import com.vaxify.app.security.JwtUtil;
import com.vaxify.app.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    @Override
    public AuthResponse signup(SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new VaxifyException("Email already exists");
        }

        if (request.getRole() == Role.ADMIN) {
            throw new VaxifyException("Invalid role");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());

        userRepository.save(user);

        log.info("Successfully registered new user: {}", request.getEmail());

        String token = generateToken(user);

        return new AuthResponse(token, userMapper.toDto(user));
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new VaxifyException("Invalid credentials"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {
            log.warn("Failed login attempt for user: {}", request.getEmail());
            throw new VaxifyException("Invalid credentials");
        }

        log.info("User logged in successfully: {}", request.getEmail());

        String token = generateToken(user);

        return new AuthResponse(token, userMapper.toDto(user));
    }

    private String generateToken(User user) {
        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }
}
