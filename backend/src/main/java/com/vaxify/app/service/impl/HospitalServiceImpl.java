package com.vaxify.app.service.impl;

import com.vaxify.app.dtos.hospital.HospitalResponse;
import com.vaxify.app.dtos.hospital.HospitalSummaryResponse;
import com.vaxify.app.dtos.hospital.StaffHospitalRegisterRequest;
import com.vaxify.app.dtos.hospital.UpdateHospitalRequest;
import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.Slot;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.entities.enums.HospitalStatus;
import com.vaxify.app.entities.enums.Role;
import com.vaxify.app.repository.HospitalRepository;
import com.vaxify.app.repository.UserRepository;
import com.vaxify.app.service.EmailService;
import com.vaxify.app.service.HospitalService;
import com.vaxify.app.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.vaxify.app.dtos.StaffHospitalRegistrationDTO;
import com.vaxify.app.dtos.VaccineResponseDTO;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import com.vaxify.app.repository.VaccineRepository;
import com.vaxify.app.repository.AppointmentRepository;
import com.vaxify.app.repository.SlotRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HospitalServiceImpl implements HospitalService {

        private final HospitalRepository hospitalRepository;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final VaccineRepository vaccineRepository;
        private final AppointmentRepository appointmentRepository;
        private final SlotRepository slotRepository;

        private final S3Service s3Service;
        private final EmailService emailService;

        // for staff
        @Override
        @Transactional
        public HospitalResponse registerHospital(
                        StaffHospitalRegisterRequest request,
                        String staffEmail) {

                User staffUser = userRepository.findByEmail(staffEmail)
                                .orElseThrow(() -> new IllegalStateException("Staff user not found"));

                if (staffUser.getRole() != Role.STAFF) {
                        throw new AccessDeniedException("Only hospital staff can register hospitals");
                }

                hospitalRepository.findByStaffUser(staffUser)
                                .ifPresent(h -> {
                                        throw new IllegalStateException(
                                                        "Hospital already registered for this staff");
                                });

                Hospital hospital = Hospital.builder()
                                .name(request.getName())
                                .address(request.getAddress())
                                .staffUser(staffUser)
                                .status(HospitalStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();

                Hospital saved = hospitalRepository.save(hospital);
                return toResponse(saved, true, true);
        }

        @Override
        public HospitalResponse getMyHospital(String staffEmail) {

                User staffUser = userRepository.findByEmail(staffEmail)
                                .orElseThrow(() -> new IllegalStateException("Staff user not found"));

                Hospital hospital = hospitalRepository.findByStaffUser(staffUser)
                                .orElseThrow(() -> new IllegalStateException("No hospital found for this staff"));

                return toResponse(hospital, true, true);
        }

        @Override
        @Transactional
        public HospitalResponse updateHospital(UpdateHospitalRequest request, String staffEmail) {
                User staffUser = userRepository.findByEmail(staffEmail)
                                .orElseThrow(() -> new IllegalStateException("Staff user not found"));

                Hospital hospital = hospitalRepository.findByStaffUser(staffUser)
                                .orElseThrow(() -> new IllegalStateException("No hospital found for this staff"));

                hospital.setName(request.getName());
                hospital.setAddress(request.getAddress());
                hospital.setCity(request.getCity());
                hospital.setState(request.getState());
                hospital.setPincode(request.getPincode());
                hospital.setDocumentUrl(request.getDocumentUrl());

                return toResponse(hospitalRepository.save(hospital), true, true);
        }

        @Override
        public HospitalResponse getHospitalById(Long id) {
                Hospital hospital = hospitalRepository.findByIdWithStaff(id)
                                .orElseThrow(() -> new IllegalStateException("Hospital not found"));

                // check if user is admin or staff for sensitive info
                boolean isPrivileged = false;

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated()) {
                        String userRole = auth.getAuthorities().stream()
                                        .map(a -> a.getAuthority())
                                        .findFirst().orElse("");
                        isPrivileged = userRole.equals("ROLE_ADMIN") || userRole.equals("ROLE_STAFF");
                }

                return toResponse(hospital, false, isPrivileged);
        }

        @Override
        public List<HospitalSummaryResponse> getApprovedHospitals() {
                List<Hospital> hospitals = hospitalRepository.findByStatusWithStaff(HospitalStatus.APPROVED);
                return toSummaryResponses(hospitals);
        }

        @Override
        public List<HospitalResponse> getAllHospitals() {
                List<Hospital> hospitals = hospitalRepository.findAllWithStaff();
                return toResponses(hospitals, false, true);
        }

        @Override
        public List<HospitalResponse> getPendingHospitals() {
                List<Hospital> hospitals = hospitalRepository.findByStatusWithStaff(HospitalStatus.PENDING);
                return toResponses(hospitals, true, true);
        }

        @Override
        @Transactional
        public HospitalResponse approveHospital(Long hospitalId) {

                Hospital hospital = getPendingHospital(hospitalId);

                hospital.setStatus(HospitalStatus.APPROVED);

                Hospital saved = hospitalRepository.save(hospital);

                // send email
                if (saved.getStaffUser() != null) {
                        String subject = "Hospital Registration Approved - Vaxify";
                        String body = "Dear " + saved.getStaffUser().getName() + ",\n\n" +
                                        "Your hospital registration for '" + saved.getName()
                                        + "' has been APPROVED by the admin.\n" +
                                        "You can now login and manage your hospital dashboard.\n\n" +
                                        "Regards,\nVaxify Team";

                        emailService.sendSimpleEmail(saved.getStaffUser().getEmail(), subject, body);
                }

                return toResponse(saved, true, true);

        }

        @Override
        @Transactional
        public HospitalResponse rejectHospital(Long hospitalId) {

                Hospital hospital = getPendingHospital(hospitalId);

                hospital.setStatus(HospitalStatus.REJECTED);

                Hospital saved = hospitalRepository.save(hospital);

                // send email
                if (saved.getStaffUser() != null) {
                        String subject = "Hospital Registration Rejected - Vaxify";
                        String body = "Dear " + saved.getStaffUser().getName() + ",\n\n" +
                                        "Your hospital registration for '" + saved.getName()
                                        + "' has been REJECTED by the admin.\n" +
                                        "Please contact support for more details.\n\n" +
                                        "Regards,\nVaxify Team";

                        emailService.sendSimpleEmail(saved.getStaffUser().getEmail(), subject, body);
                }

                return toResponse(saved, true, true);

        }

        // helpers
        private Hospital getPendingHospital(Long id) {
                Hospital hospital = hospitalRepository.findById(id)
                                .orElseThrow(() -> new IllegalStateException("Hospital not found"));

                if (hospital.getStatus() != HospitalStatus.PENDING) {
                        throw new IllegalStateException("Hospital is not pending");
                }

                return hospital;
        }

        private HospitalResponse toResponse(Hospital hospital, boolean includeLowStock, boolean isPrivileged) {
                List<VaccineResponseDTO> vaccines = vaccineRepository.findByHospital(hospital)
                                .stream()
                                .filter(v -> {
                                        if (includeLowStock)
                                                return true;
                                        // filter out critical low stock vaccines (< 20%)
                                        if (v.getCapacity() != null && v.getCapacity() > 0) {
                                                return v.getStock() >= (v.getCapacity() * 0.2);
                                        }
                                        return true;
                                })
                                .map(v -> VaccineResponseDTO.builder()
                                                .id(v.getId())
                                                .name(v.getName())
                                                .type(v.getType())
                                                .manufacturer(v.getManufacturer())
                                                .stock(v.getStock())
                                                .capacity(v.getCapacity())
                                                .lastUpdated(v.getCreatedAt() != null ? v.getCreatedAt().toString()
                                                                : null)
                                                .build())
                                .collect(Collectors.toList());

                String dbDocumentUrl = hospital.getDocumentUrl();
                String finalDocumentUrl = dbDocumentUrl;

                if (dbDocumentUrl != null && !dbDocumentUrl.isEmpty() && !dbDocumentUrl.startsWith("http")) {
                        try {
                                finalDocumentUrl = s3Service.generatePresignedUrl(dbDocumentUrl);
                        } catch (Exception e) {
                                // fallback to raw value if signing fails
                        }
                }

                return HospitalResponse.builder()
                                .id(hospital.getId())
                                .name(hospital.getName())
                                .address(hospital.getAddress())
                                .licenseNumber(isPrivileged ? hospital.getLicenseNumber() : null)
                                .documentUrl(isPrivileged ? finalDocumentUrl : null)
                                .city(hospital.getCity())
                                .state(hospital.getState())
                                .pincode(hospital.getPincode())
                                .status(hospital.getStatus())
                                .staffName(hospital.getStaffUser() != null ? hospital.getStaffUser().getName() : null)
                                .staffEmail(hospital.getStaffUser() != null ? hospital.getStaffUser().getEmail() : null)
                                .staffPhone(hospital.getStaffUser() != null ? hospital.getStaffUser().getPhone() : null)
                                .staffCreatedAt(hospital.getStaffUser() != null ? hospital.getStaffUser().getCreatedAt()
                                                : null)
                                .availableVaccines(vaccines)
                                .build();
        }

        private List<HospitalResponse> toResponses(List<Hospital> hospitals, boolean includeLowStock,
                        boolean isPrivileged) {
                if (hospitals.isEmpty())
                        return List.of();

                // 1. Fetch all vaccines for all hospitals in one go to prevent N+1
                List<Vaccine> allVaccines = vaccineRepository.findByHospitalIn(hospitals);

                // 2. Group vaccines by hospital ID
                Map<Long, List<Vaccine>> vaccinesByHospital = allVaccines.stream()
                                .collect(Collectors.groupingBy(v -> v.getHospital().getId()));

                // 3. Map to Response DTOs efficiently
                return hospitals.stream()
                                .map(hospital -> {
                                        List<Vaccine> hospitalVaccines = vaccinesByHospital
                                                        .getOrDefault(hospital.getId(), List.of());

                                        List<VaccineResponseDTO> vaccineDTOs = hospitalVaccines
                                                        .stream()
                                                        .filter(v -> {
                                                                if (includeLowStock)
                                                                        return true;
                                                                if (v.getCapacity() != null && v.getCapacity() > 0) {
                                                                        return v.getStock() >= (v.getCapacity() * 0.2);
                                                                }
                                                                return true;
                                                        })
                                                        .map(v -> VaccineResponseDTO.builder()
                                                                        .id(v.getId())
                                                                        .name(v.getName())
                                                                        .type(v.getType())
                                                                        .manufacturer(v.getManufacturer())
                                                                        .stock(v.getStock())
                                                                        .capacity(v.getCapacity())
                                                                        .lastUpdated(v.getCreatedAt() != null
                                                                                        ? v.getCreatedAt().toString()
                                                                                        : null)
                                                                        .build())
                                                        .collect(Collectors.toList());

                                        String dbDocumentUrl = hospital.getDocumentUrl();
                                        String finalDocumentUrl = dbDocumentUrl;

                                        if (dbDocumentUrl != null && !dbDocumentUrl.isEmpty()
                                                        && !dbDocumentUrl.startsWith("http")) {
                                                try {
                                                        finalDocumentUrl = s3Service
                                                                        .generatePresignedUrl(dbDocumentUrl);
                                                } catch (Exception e) {
                                                }
                                        }

                                        return HospitalResponse.builder()
                                                        .id(hospital.getId())
                                                        .name(hospital.getName())
                                                        .address(hospital.getAddress())
                                                        .licenseNumber(isPrivileged ? hospital.getLicenseNumber()
                                                                        : null)
                                                        .documentUrl(isPrivileged ? finalDocumentUrl : null)
                                                        .city(hospital.getCity())
                                                        .state(hospital.getState())
                                                        .pincode(hospital.getPincode())
                                                        .status(hospital.getStatus())
                                                        .staffName(hospital.getStaffUser() != null
                                                                        ? hospital.getStaffUser().getName()
                                                                        : null)
                                                        .staffEmail(hospital.getStaffUser() != null
                                                                        ? hospital.getStaffUser().getEmail()
                                                                        : null)
                                                        .staffPhone(hospital.getStaffUser() != null
                                                                        ? hospital.getStaffUser().getPhone()
                                                                        : null)
                                                        .staffCreatedAt(hospital.getStaffUser() != null
                                                                        ? hospital.getStaffUser().getCreatedAt()
                                                                        : null)
                                                        .availableVaccines(vaccineDTOs)
                                                        .build();
                                })
                                .collect(Collectors.toList());
        }

        private List<HospitalSummaryResponse> toSummaryResponses(List<Hospital> hospitals) {
                if (hospitals.isEmpty())
                        return List.of();

                // 1. Fetch all vaccines for all hospitals in one go
                List<Vaccine> allVaccines = vaccineRepository.findByHospitalIn(hospitals);

                // 2. Group vaccine names by hospital ID
                Map<Long, List<String>> vaccineNamesByHospital = allVaccines.stream()
                                .collect(Collectors.groupingBy(
                                                v -> v.getHospital().getId(),
                                                Collectors.mapping(v -> v.getName(), Collectors.toList())));

                // 3. Map to Summary DTOs
                return hospitals.stream()
                                .map(hospital -> HospitalSummaryResponse.builder()
                                                .id(hospital.getId())
                                                .name(hospital.getName())
                                                .address(hospital.getAddress())
                                                .city(hospital.getCity())
                                                .state(hospital.getState())
                                                .pincode(hospital.getPincode())
                                                .availableVaccineNames(vaccineNamesByHospital
                                                                .getOrDefault(hospital.getId(), List.of()))
                                                .build())
                                .collect(Collectors.toList());
        }

        // regiter staff and hospital
        @Override
        @Transactional
        public void registerHospitalStaff(StaffHospitalRegistrationDTO dto) {
                // check if email already exists
                if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already registered");
                }

                // create staff user
                User staffUser = new User();
                staffUser.setName(dto.getStaffName());
                staffUser.setEmail(dto.getEmail());
                staffUser.setPassword(passwordEncoder.encode(dto.getPassword()));
                staffUser.setPhone(dto.getPhone());
                staffUser.setRole(Role.STAFF);
                staffUser.setCreatedAt(LocalDateTime.now());

                userRepository.save(staffUser);

                // create hospital
                Hospital hospital = new Hospital();
                hospital.setName(dto.getHospitalName());
                hospital.setAddress(dto.getHospitalAddress());
                hospital.setLicenseNumber(dto.getLicenseNumber());
                hospital.setDocumentUrl(dto.getDocument());
                hospital.setCity(dto.getCity());
                hospital.setState(dto.getState());
                hospital.setPincode(dto.getPincode());

                hospital.setStaffUser(staffUser);
                hospital.setStatus(HospitalStatus.PENDING);
                hospital.setCreatedAt(LocalDateTime.now());

                Hospital savedHospital = hospitalRepository.save(hospital);

                // send email
                String subject = "Hospital Registration Received - Vaxify";
                String body = "Dear " + staffUser.getName() + ",\n\n" +
                                "You have successfully registered your hospital '" + savedHospital.getName()
                                + "' on Vaxify.\n" +
                                "Your application is currently PENDING approval from the admin.\n" +
                                "You will be notified once the status changes.\n\n" +
                                "Regards,\nVaxify Team";

                emailService.sendSimpleEmail(staffUser.getEmail(), subject, body);

        }

        @Override
        @Transactional
        public void deleteHospital(Long id) {
                Hospital hospital = hospitalRepository.findById(id)
                                .orElseThrow(() -> new IllegalStateException("Hospital not found"));

                // delete all vaccines associated with this hospital first
                List<Vaccine> vaccines = vaccineRepository.findByHospital(hospital);

                // delete appointments first (constraint fix)
                List<Appointment> appointments = appointmentRepository
                                .findByVaccineIn(vaccines);

                appointmentRepository.deleteAll(appointments);

                vaccineRepository.deleteAll(vaccines);

                // delete slots
                List<Slot> slots = slotRepository.findByCenterId(id);
                slotRepository.deleteAll(slots);

                // get associated staff user before deleting hospital
                User staffUser = hospital.getStaffUser();

                // delete hospital
                hospitalRepository.delete(hospital);

                // delete staff user
                if (staffUser != null) {
                        userRepository.delete(staffUser);
                }
        }

}
