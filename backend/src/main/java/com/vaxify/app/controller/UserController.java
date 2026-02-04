package com.vaxify.app.controller;

import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.vaxify.app.dtos.UserDTO;
import com.vaxify.app.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Authentication authentication) {

        // email / username extracted from JWT
        String email = authentication.getName();

        UserDTO userDTO = userService.getProfile(email);

        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/stats")
    public ResponseEntity<com.vaxify.app.dtos.UserStatsDTO> getStats(Authentication authentication) {
        String email = authentication.getName();

        return ResponseEntity.ok(userService.getUserStats(email));
    }

}
