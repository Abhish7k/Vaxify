package com.vaxify.app.service;

import java.util.List;
import java.util.Optional;

import com.vaxify.app.dtos.user.UpdateProfileRequest;
import com.vaxify.app.dtos.user.UserResponse;
import com.vaxify.app.dtos.user.UserStatsResponse;
import com.vaxify.app.entities.User;

public interface UserService {

    public UserResponse getProfile(String email);

    public UserResponse updateProfile(String email, UpdateProfileRequest request);

    UserStatsResponse getUserStats(String email);

    List<UserResponse> getAllUsers();

    void deleteUser(Long id);

    User createStaffUser(String name, String email, String password, String phone);

    User findByEmail(String email);

    Optional<User> findById(Long id);
}
