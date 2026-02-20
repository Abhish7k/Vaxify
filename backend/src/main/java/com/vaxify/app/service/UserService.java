package com.vaxify.app.service;

import java.util.List;

import com.vaxify.app.dtos.user.UserResponse;
import com.vaxify.app.dtos.user.UserStatsResponse;

public interface UserService {

    public UserResponse getProfile(String email);

    UserStatsResponse getUserStats(String email);

    List<UserResponse> getAllUsers();

    void deleteUser(Long id);
}
