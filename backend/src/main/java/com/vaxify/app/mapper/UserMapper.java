package com.vaxify.app.mapper;

import com.vaxify.app.dtos.AuthDTO;
import com.vaxify.app.entities.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public AuthDTO toDto(User user) {
        AuthDTO dto = new AuthDTO();

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