package com.vaxify.app.mapper;

import com.vaxify.app.dtos.auth.AuthUserResponse;
import com.vaxify.app.entities.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public AuthUserResponse toDto(User user) {
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
}