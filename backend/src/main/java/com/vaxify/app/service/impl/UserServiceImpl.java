package com.vaxify.app.service.impl;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.vaxify.app.dtos.UserDTO;
import com.vaxify.app.dtos.UserStatsDTO;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.Appointment;
import com.vaxify.app.exception.ResourceNotFoundException;
import com.vaxify.app.repository.UserRepository;
import com.vaxify.app.repository.AppointmentRepository;
import com.vaxify.app.service.UserService;

import java.util.List;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final com.vaxify.app.repository.HospitalRepository hospitalRepository;

    @Override
    public UserDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email ID " + email));
        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    public UserStatsDTO getUserStats(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new ResourceNotFoundException("User not found with email ID " + email);
        }

        List<Appointment> allAppointments = appointmentRepository.findByUserEmail(email);

        long completedCount = allAppointments.stream()
                .filter(a -> a.getStatus() == com.vaxify.app.entities.enums.AppointmentStatus.COMPLETED)
                .count();

        java.util.Optional<Appointment> upcoming = allAppointments.stream()
                .filter(a -> a.getStatus() == com.vaxify.app.entities.enums.AppointmentStatus.BOOKED)
                .filter(a -> a.getSlot().getDate().isAfter(java.time.LocalDate.now().minusDays(1)))
                .sorted(java.util.Comparator.comparing(a -> a.getSlot().getDate()))
                .findFirst();

        String vaccinationStatus = "Not Vaccinated";
        if (completedCount >= 2) {
            vaccinationStatus = "Fully Vaccinated";
        } else if (completedCount == 1) {
            vaccinationStatus = "Partially Vaccinated";
        }

        List<com.vaxify.app.dtos.appointment.AppointmentResponse> recent = allAppointments.stream()
                .sorted(java.util.Comparator.comparing(Appointment::getCreatedAt).reversed())
                .limit(5)
                .map(this::mapToAppointmentResponse)
                .collect(java.util.stream.Collectors.toList());

        return UserStatsDTO.builder()
                .upcomingAppointmentDate(upcoming.map(a -> a.getSlot().getDate().toString()).orElse("No upcoming"))
                .vaccinationStatus(vaccinationStatus)
                .totalAppointments(allAppointments.size())
                .completedAppointments((int) completedCount)
                .certificateAvailable(completedCount >= 2)
                .recentAppointments(recent)
                .build();
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .collect(java.util.stream.Collectors.toList());
    }

    private com.vaxify.app.dtos.appointment.AppointmentResponse mapToAppointmentResponse(Appointment a) {
        return com.vaxify.app.dtos.appointment.AppointmentResponse.builder()
                .id(a.getId())
                .centerId(a.getSlot().getCenter().getId())
                .centerName(a.getSlot().getCenter().getName())
                .centerAddress(a.getSlot().getCenter().getAddress())
                .vaccineId(a.getVaccine().getId())
                .vaccineName(a.getVaccine().getName())
                .date(a.getSlot().getDate().toString())
                .slot(a.getSlot().getStartTime().toString())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt())
                .patientName(a.getUser().getName())
                .patientEmail(a.getUser().getEmail())
                .patientPhone(a.getUser().getPhone())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        // If staff user, delete associated hospital first to fix FK constraint
        if (user.getRole() == com.vaxify.app.entities.enums.Role.STAFF) {
            hospitalRepository.findByStaffUser(user).ifPresent(hospital -> {
                // Check if it has vaccines/slots? Ideally delete those too via
                // HospitalService.deleteHospital
                // For now, simple direct delete if no complex dependencies:
                hospitalRepository.delete(hospital);
            });
        }

        userRepository.delete(user);
    }
}
