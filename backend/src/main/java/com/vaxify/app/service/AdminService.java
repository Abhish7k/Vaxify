package com.vaxify.app.service;

import com.vaxify.app.dtos.admin.AdminActivityResponse;
import com.vaxify.app.dtos.admin.AdminStatsResponse;

import java.util.List;

public interface AdminService {
    AdminStatsResponse getAdminStats();

    List<AdminActivityResponse> getRecentActivities();
}
