package com.vaxify.app.service.impl;

import com.vaxify.app.dtos.hospital.HospitalResponse;
import com.vaxify.app.dtos.hospital.HospitalSummaryResponse;
import com.vaxify.app.dtos.hospital.StaffHospitalRegisterRequest;
import com.vaxify.app.dtos.hospital.UpdateHospitalRequest;
import com.vaxify.app.dtos.hospital.StaffHospitalRegistrationRequest;
import com.vaxify.app.entities.*;
import com.vaxify.app.entities.enums.HospitalStatus;
import com.vaxify.app.entities.enums.Role;
import com.vaxify.app.mapper.HospitalMapper;
import com.vaxify.app.repository.*;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.service.HospitalService;
import com.vaxify.app.service.NotificationService;
import com.vaxify.app.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HospitalServiceImpl implements HospitalService {

        private final HospitalRepository hospitalRepository;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final VaccineRepository vaccineRepository;

        private final HospitalMapper hospitalMapper;
        private final SecurityUtils securityUtils;
        private final NotificationService notificationService;

        @Override
        @Transactional
        public HospitalResponse registerHospital(StaffHospitalRegisterRequest request, String staffEmail) {
                User staffUser = userRepository.findByEmail(staffEmail)
                                .orElseThrow(() -> new VaxifyException("Staff user not found"));

                if (staffUser.getRole() != Role.STAFF) {
                        throw new AccessDeniedException("Only hospital staff can register hospitals");
                }

                hospitalRepository.findByStaffUser(staffUser)
                                .ifPresent(h -> {
                                        throw new VaxifyException("Hospital already registered for this staff");
                                });

                Hospital hospital = Hospital.builder()
                                .name(request.getName())
                                .address(request.getAddress())
                                .staffUser(staffUser)
                                .status(HospitalStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();

                Hospital saved = hospitalRepository.save(hospital);

                List<Vaccine> vaccines = vaccineRepository.findByHospital(saved);

                return hospitalMapper.toResponse(saved, vaccines, true, true);
        }

        @Override
        public HospitalResponse getMyHospital(String staffEmail) {
                User staffUser = userRepository.findByEmail(staffEmail)
                                .orElseThrow(() -> new VaxifyException("Staff user not found"));

                Hospital hospital = hospitalRepository.findByStaffUser(staffUser)
                                .orElseThrow(() -> new VaxifyException("No hospital found for this staff"));

                List<Vaccine> vaccines = vaccineRepository.findByHospital(hospital);

                return hospitalMapper.toResponse(hospital, vaccines, true, true);
        }

        @Override
        @Transactional
        public HospitalResponse updateHospital(UpdateHospitalRequest request, String staffEmail) {
                User staffUser = userRepository.findByEmail(staffEmail)
                                .orElseThrow(() -> new VaxifyException("Staff user not found"));

                Hospital hospital = hospitalRepository.findByStaffUser(staffUser)
                                .orElseThrow(() -> new VaxifyException("No hospital found for this staff"));

                hospital.setName(request.getName());
                hospital.setAddress(request.getAddress());
                hospital.setCity(request.getCity());
                hospital.setState(request.getState());
                hospital.setPincode(request.getPincode());
                hospital.setDocumentUrl(request.getDocumentUrl());

                Hospital saved = hospitalRepository.save(hospital);

                List<Vaccine> vaccines = vaccineRepository.findByHospital(saved);

                return hospitalMapper.toResponse(saved, vaccines, true, true);
        }

        @Override
        public HospitalResponse getHospitalById(Long id) {
                Hospital hospital = hospitalRepository.findByIdWithStaff(id)
                                .orElseThrow(() -> new VaxifyException("Hospital not found"));

                boolean isPrivileged = securityUtils.isPrivileged();

                List<Vaccine> vaccines = vaccineRepository.findByHospital(hospital);

                return hospitalMapper.toResponse(hospital, vaccines, false, isPrivileged);
        }

        @Override
        public List<HospitalSummaryResponse> getApprovedHospitals() {
                List<Hospital> hospitals = hospitalRepository.findByStatusWithStaff(HospitalStatus.APPROVED);
                List<Vaccine> allVaccines = vaccineRepository.findByHospitalIn(hospitals);

                return hospitalMapper.toSummaryResponses(hospitals, allVaccines);
        }

        @Override
        public List<HospitalResponse> getAllHospitals() {
                List<Hospital> hospitals = hospitalRepository.findAllWithStaff();
                List<Vaccine> allVaccines = vaccineRepository.findByHospitalIn(hospitals);

                return hospitalMapper.toResponses(hospitals, allVaccines, false, true);
        }

        @Override
        public List<HospitalResponse> getPendingHospitals() {
                List<Hospital> hospitals = hospitalRepository.findByStatusWithStaff(HospitalStatus.PENDING);
                List<Vaccine> allVaccines = vaccineRepository.findByHospitalIn(hospitals);

                return hospitalMapper.toResponses(hospitals, allVaccines, true, true);
        }

        @Override
        @Transactional
        public HospitalResponse approveHospital(Long hospitalId) {
                Hospital hospital = getPendingHospital(hospitalId);

                hospital.setStatus(HospitalStatus.APPROVED);

                Hospital saved = hospitalRepository.save(hospital);

                if (saved.getStaffUser() != null) {
                        notificationService.sendHospitalApproved(saved);
                }

                List<Vaccine> vaccines = vaccineRepository.findByHospital(saved);

                return hospitalMapper.toResponse(saved, vaccines, true, true);
        }

        @Override
        @Transactional
        public HospitalResponse rejectHospital(Long hospitalId) {
                Hospital hospital = getPendingHospital(hospitalId);

                hospital.setStatus(HospitalStatus.REJECTED);

                Hospital saved = hospitalRepository.save(hospital);

                if (saved.getStaffUser() != null) {
                        notificationService.sendHospitalRejected(saved);
                }

                List<Vaccine> vaccines = vaccineRepository.findByHospital(saved);

                return hospitalMapper.toResponse(saved, vaccines, true, true);
        }

        private Hospital getPendingHospital(Long id) {
                Hospital hospital = hospitalRepository.findById(id)
                                .orElseThrow(() -> new VaxifyException("Hospital not found"));

                if (hospital.getStatus() != HospitalStatus.PENDING) {
                        throw new VaxifyException("Hospital is not pending");
                }

                return hospital;
        }

        @Override
        @Transactional
        public void registerHospitalStaff(StaffHospitalRegistrationRequest dto) {
                if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                        throw new VaxifyException("Email already registered");
                }

                User staffUser = new User();
                staffUser.setName(dto.getStaffName());
                staffUser.setEmail(dto.getEmail());
                staffUser.setPassword(passwordEncoder.encode(dto.getPassword()));
                staffUser.setPhone(dto.getPhone());
                staffUser.setRole(Role.STAFF);
                staffUser.setCreatedAt(LocalDateTime.now());

                userRepository.save(staffUser);

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

                notificationService.sendHospitalRegistrationReceived(savedHospital);
        }

        @Override
        @Transactional
        public void deleteHospital(Long id) {
                Hospital hospital = hospitalRepository.findById(id)
                                .orElseThrow(() -> new VaxifyException("Hospital not found"));

                User staffUser = hospital.getStaffUser();

                hospitalRepository.delete(hospital);

                if (staffUser != null) {
                        userRepository.delete(staffUser);
                }
        }
}
