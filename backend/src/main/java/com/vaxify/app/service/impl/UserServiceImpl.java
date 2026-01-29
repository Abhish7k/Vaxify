package com.vaxify.app.service.impl;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.vaxify.app.dtos.UserDTO;
import com.vaxify.app.entities.User;
import com.vaxify.app.exception.ResourceNotFoundException;
import com.vaxify.app.repository.UserRepository;
import com.vaxify.app.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final ModelMapper modelMapper;
    private final UserRepository userRepository;

    @Override
    public UserDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email ID "+email));
    return modelMapper.map(user, UserDTO.class);
    }

    
    
}
