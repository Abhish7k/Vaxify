package com.vaxify.app.service;

import com.vaxify.app.dtos.UserDTO;
import com.vaxify.app.dtos.UserStatsDTO;

public interface UserService {

    public UserDTO getProfile(String email);

    UserStatsDTO getUserStats(String email);

    java.util.List<UserDTO> getAllUsers();

    void deleteUser(Long id);
}
