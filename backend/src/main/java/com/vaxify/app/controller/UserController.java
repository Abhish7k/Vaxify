package com.vaxify.app.controller;

import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vaxify.app.dtos.user.UpdateProfileRequest;
import com.vaxify.app.dtos.user.UserResponse;
import com.vaxify.app.dtos.user.UserStatsResponse;
import com.vaxify.app.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {

        // email / username extracted from JWT
        String email = authentication.getName();

        UserResponse userResponse = userService.getProfile(email);

        return ResponseEntity.ok(userResponse);
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {

        String email = authentication.getName();

        UserResponse userResponse = userService.updateProfile(email, request);

        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsResponse> getStats(Authentication authentication) {
        String email = authentication.getName();

        return ResponseEntity.ok(userService.getUserStats(email));
    }

}
