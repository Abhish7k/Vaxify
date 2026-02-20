package com.vaxify.app.controller;

import com.vaxify.app.dtos.admin.AdminActivityResponse;
import com.vaxify.app.dtos.admin.AdminStatsResponse;
import com.vaxify.app.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminDashboardController {

        private final AdminService adminService;

        @GetMapping
        public AdminStatsResponse getAdminStats() {
                return adminService.getAdminStats();
        }

        @GetMapping("/activities")
        public List<AdminActivityResponse> getRecentActivities() {
                return adminService.getRecentActivities();
        }
}
