package com.vaxify.app.service;

import com.vaxify.app.dtos.UserDTO;

public interface UserService {
    
    public UserDTO getProfile(String email);
}
