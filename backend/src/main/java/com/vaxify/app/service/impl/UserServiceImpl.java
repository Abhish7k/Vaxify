package com.vaxify.app.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vaxify.app.dtos.appointment.AppointmentResponse;
import com.vaxify.app.dtos.user.UpdateProfileRequest;
import com.vaxify.app.dtos.user.UserResponse;
import com.vaxify.app.dtos.user.UserStatsResponse;
import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.enums.AppointmentStatus;
import com.vaxify.app.entities.enums.Role;
import com.vaxify.app.exception.ResourceNotFoundException;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.repository.UserRepository;
import com.vaxify.app.repository.AppointmentRepository;
import com.vaxify.app.repository.HospitalRepository;
import com.vaxify.app.mapper.AppointmentMapper;
import com.vaxify.app.mapper.UserMapper;
import com.vaxify.app.service.UserService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppointmentMapper appointmentMapper;

    @Override
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        log.info("Profile retrieved for: {}", email);

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        if (req.getName() != null) {
            user.setName(req.getName());
        }

        if (req.getPhone() != null) {
            user.setPhone(req.getPhone());
        }

        userRepository.save(user);

        log.info("User profile updated for: {}", email);

        return userMapper.toResponse(user);
    }

    @Override
    public UserStatsResponse getUserStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        List<Appointment> allAppts = appointmentRepository.findByUser(user);

        long total = allAppts.size();

        long pending = allAppts.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.BOOKED)
                .count();

        long completed = allAppts.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .count();

        String vaccStatus = "Unvaccinated";
        if (completed == 1) {
            vaccStatus = "Partially Vaccinated";
        } else if (completed >= 2) {
            vaccStatus = "Fully Vaccinated";
        }

        Optional<Appointment> nextUpcoming = allAppts.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.BOOKED)
                .filter(a -> {
                    LocalDate d = a.getSlot().getDate();
                    if (d.isBefore(LocalDate.now()))
                        return false;
                    if (d.isEqual(LocalDate.now()) && a.getSlot().getStartTime().isBefore(LocalTime.now()))
                        return false;
                    return true;
                })
                .min(Comparator.comparing((Appointment a) -> a.getSlot().getDate())
                        .thenComparing(a -> a.getSlot().getStartTime()));

        String upcomingStr = nextUpcoming
                .map(a -> a.getSlot().getDate().toString() + "T" + a.getSlot().getStartTime().toString())
                .orElse("No upcoming");

        List<AppointmentResponse> recent = allAppts.stream()
                .sorted(Comparator.comparing(Appointment::getCreatedAt).reversed())
                .limit(3)
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());

        log.info("Stats retrieved for: {}", email);

        return UserStatsResponse.builder()
                .upcomingAppointmentDate(upcomingStr)
                .vaccinationStatus(vaccStatus)
                .totalAppointments(total)
                .pendingAppointments(pending)
                .completedAppointments(completed)
                .recentAppointments(recent)
                .build();
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new VaxifyException("User not found"));

        if (user.getRole() == Role.STAFF) {
            hospitalRepository.findByStaffUser(user).ifPresent(hospital -> {
                hospitalRepository.delete(hospital);

                log.info("Associated hospital deleted for staff: {}", user.getEmail());
            });
        }

        userRepository.delete(user);

        log.info("User deleted: ID={}", id);
    }

    @Override
    @Transactional
    public User createStaffUser(String name, String email, String password, String phone) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new VaxifyException("Email already registered");
        }

        User staffUser = new User();
        staffUser.setName(name);
        staffUser.setEmail(email);
        staffUser.setPassword(passwordEncoder.encode(password));
        staffUser.setPhone(phone);
        staffUser.setRole(Role.STAFF);
        staffUser.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(staffUser);

        log.info("Staff user created: {}", email);

        return saved;
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

}
