package com.vaxify.app.service.impl;

import com.vaxify.app.dtos.admin.AdminActivityResponse;
import com.vaxify.app.dtos.admin.AdminStatsResponse;
import com.vaxify.app.entities.enums.HospitalStatus;
import com.vaxify.app.entities.enums.Role;
import com.vaxify.app.repository.AppointmentRepository;
import com.vaxify.app.repository.HospitalRepository;
import com.vaxify.app.repository.UserRepository;
import com.vaxify.app.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public AdminStatsResponse getAdminStats() {
        AdminStatsResponse response = AdminStatsResponse.builder()
                .totalHospitals(hospitalRepository.count())
                .pendingApprovals(hospitalRepository.countByStatus(HospitalStatus.PENDING))
                .totalUsers(userRepository.countByRole(Role.USER))
                .activeCenters(hospitalRepository.countByStatus(HospitalStatus.APPROVED))
                .totalAppointments(appointmentRepository.count())
                .build();

        return response;
    }

    @Override
    public List<AdminActivityResponse> getRecentActivities() {
        List<AdminActivityResponse> activities = new ArrayList<>();

        // Add Recent Hospitals
        hospitalRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(5)
                .forEach(h -> {
                    String action = h.getStatus() == HospitalStatus.PENDING
                            ? "New hospital registered"
                            : "Hospital " + h.getStatus().toString().toLowerCase();
                    activities.add(AdminActivityResponse.builder()
                            .id("h-" + h.getId())
                            .action(action)
                            .target(h.getName())
                            .type("HOSPITAL")
                            .status(h.getStatus().toString())
                            .timestamp(h.getCreatedAt())
                            .build());
                });

        // Add Recent User Registrations
        userRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(u -> u.getRole() == Role.USER)
                .limit(5)
                .forEach(u -> {
                    activities.add(AdminActivityResponse.builder()
                            .id("u-" + u.getId())
                            .action("New user registered")
                            .target(u.getName())
                            .type("USER")
                            .timestamp(u.getCreatedAt())
                            .build());
                });

        // Sort by timestamp desc and limit to 5
        return activities.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(5)
                .collect(Collectors.toList());
    }
}
