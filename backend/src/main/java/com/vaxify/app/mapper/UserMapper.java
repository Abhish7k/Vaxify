package com.vaxify.app.mapper;

import com.vaxify.app.dtos.auth.AuthUserResponse;
import com.vaxify.app.dtos.user.UserResponse;
import com.vaxify.app.entities.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public AuthUserResponse toDto(User user) {
        if (user == null) {
            return null;
        }

        AuthUserResponse dto = new AuthUserResponse();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());

        if (user.getCreatedAt() != null) {
            dto.setCreatedAt(user.getCreatedAt().toString());
        }

        return dto;
    }

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().name());
        response.setCreatedAt(user.getCreatedAt());

        return response;
    }
}