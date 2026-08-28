package com.vaxify.app.service.impl;

import com.vaxify.app.dtos.hospital.HospitalResponse;
import com.vaxify.app.dtos.hospital.HospitalSummaryResponse;
import com.vaxify.app.dtos.hospital.StaffHospitalRegisterRequest;
import com.vaxify.app.dtos.hospital.UpdateHospitalRequest;
import com.vaxify.app.dtos.hospital.StaffHospitalRegistrationRequest;
import com.vaxify.app.dtos.notification.HospitalMailData;
import com.vaxify.app.dtos.notification.NotificationPayloads;
import com.vaxify.app.entities.*;
import com.vaxify.app.entities.enums.AppointmentStatus;
import com.vaxify.app.entities.enums.HospitalStatus;
import com.vaxify.app.entities.enums.Role;
import com.vaxify.app.mapper.HospitalMapper;
import com.vaxify.app.repository.*;
import com.vaxify.app.exception.ConflictException;
import com.vaxify.app.exception.ForbiddenException;
import com.vaxify.app.exception.ResourceNotFoundException;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.service.HospitalService;
import com.vaxify.app.service.S3Service;
import com.vaxify.app.service.UserService;
import com.vaxify.app.service.NotificationService;
import com.vaxify.app.util.AfterCommit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class HospitalServiceImpl implements HospitalService {

        private final HospitalRepository hospitalRepository;
        private final VaccineRepository vaccineRepository;
        private final AppointmentRepository appointmentRepository;
        private final UserService userService;
        private final HospitalMapper hospitalMapper;
        private final NotificationService notificationService;
        private final S3Service s3Service;

        @Override
        @Transactional
        public HospitalResponse registerHospital(StaffHospitalRegisterRequest request, String staffEmail) {
                User staffUser = getStaffUser(staffEmail);

                if (staffUser.getRole() != Role.STAFF) {
                        throw new ForbiddenException("Only hospital staff can register hospitals");
                }

                hospitalRepository.findByStaffUser(staffUser)
                                .ifPresent(h -> {
                                        throw new ConflictException("Hospital already registered for this staff");
                                });

                Hospital hospital = Hospital.builder()
                                .name(request.getName())
                                .address(request.getAddress())
                                .staffUser(staffUser)
                                .status(HospitalStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();

                Hospital saved = hospitalRepository.save(hospital);

                log.info("Hospital registered: {} (by: {})", saved.getName(), staffEmail);

                return toHospitalResponse(saved, true, true);
        }

        @Override
        public HospitalResponse getMyHospital(String staffEmail) {
                User staffUser = getStaffUser(staffEmail);

                Hospital hospital = hospitalRepository.findByStaffUser(staffUser)
                                .orElseThrow(() -> new ResourceNotFoundException("No hospital found for this staff"));

                return toHospitalResponse(hospital, true, true);
        }

        @Override
        @Transactional
        public HospitalResponse updateHospital(UpdateHospitalRequest req, String staffEmail) {
                Hospital hospital = requireApprovedStaffHospital(staffEmail);

                hospital.setName(req.getName());
                hospital.setAddress(req.getAddress());
                hospital.setCity(req.getCity());
                hospital.setState(req.getState());
                hospital.setPincode(req.getPincode());
                hospital.setDocumentUrl(s3Service.toStoredKey(req.getDocumentUrl(), hospital.getDocumentUrl()));

                Hospital saved = hospitalRepository.save(hospital);

                log.info("Hospital updated: {} (by: {})", saved.getName(), staffEmail);

                return toHospitalResponse(saved, true, true);
        }

        @Override
        public HospitalResponse getHospitalById(Long id) {
                Hospital hospital = hospitalRepository.findByIdWithStaff(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

                if (hospital.getStatus() != HospitalStatus.APPROVED) {
                        throw new ResourceNotFoundException("Hospital not found");
                }

                return toHospitalResponse(hospital, false, false);
        }

        @Override
        public HospitalResponse getAdminHospitalById(Long id) {
                Hospital hospital = hospitalRepository.findByIdWithStaff(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

                return toHospitalResponse(hospital, true, true);
        }

        @Override
        public List<HospitalSummaryResponse> getApprovedHospitals() {
                List<Hospital> hospitals = hospitalRepository.findByStatusWithStaff(HospitalStatus.APPROVED);

                List<Vaccine> allVaccines = vaccinesFor(hospitals);

                return hospitalMapper.toSummaryResponses(hospitals, allVaccines);
        }

        @Override
        public List<HospitalResponse> getAllHospitals() {
                List<Hospital> hospitals = hospitalRepository.findAllWithStaff();

                List<Vaccine> allVaccines = vaccinesFor(hospitals);

                return hospitalMapper.toResponses(hospitals, allVaccines, false, true);
        }

        @Override
        public List<HospitalResponse> getPendingHospitals() {
                List<Hospital> hospitals = hospitalRepository.findByStatusWithStaff(HospitalStatus.PENDING);

                List<Vaccine> allVaccines = vaccinesFor(hospitals);

                return hospitalMapper.toResponses(hospitals, allVaccines, true, true);
        }

        @Override
        @Transactional
        public HospitalResponse approveHospital(Long hospitalId) {
                Hospital hospital = getPendingHospital(hospitalId);

                hospital.setStatus(HospitalStatus.APPROVED);

                Hospital saved = hospitalRepository.save(hospital);

                HospitalMailData mailData = saved.getStaffUser() != null
                                ? NotificationPayloads.fromHospital(saved)
                                : null;

                AfterCommit.run(() -> {
                        if (mailData != null) {
                                notificationService.sendHospitalApproved(mailData);
                        }
                });

                log.info("Hospital approved: {} (ID: {})", saved.getName(), hospitalId);

                return toHospitalResponse(saved, true, true);
        }

        @Override
        @Transactional
        public HospitalResponse rejectHospital(Long hospitalId) {
                Hospital hospital = getPendingHospital(hospitalId);

                hospital.setStatus(HospitalStatus.REJECTED);

                Hospital saved = hospitalRepository.save(hospital);

                HospitalMailData mailData = saved.getStaffUser() != null
                                ? NotificationPayloads.fromHospital(saved)
                                : null;

                AfterCommit.run(() -> {
                        if (mailData != null) {
                                notificationService.sendHospitalRejected(mailData);
                        }
                });

                log.info("Hospital rejected: {} (ID: {})", saved.getName(), hospitalId);

                return toHospitalResponse(saved, true, true);
        }

        private Hospital getPendingHospital(Long id) {
                Hospital hospital = hospitalRepository.findByIdForUpdate(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

                if (hospital.getStatus() != HospitalStatus.PENDING) {
                        throw new ConflictException("Hospital is not pending");
                }

                return hospital;
        }

        private User getStaffUser(String email) {
                return userService.findByEmail(email);
        }

        private HospitalResponse toHospitalResponse(Hospital hospital, boolean includeLowStock, boolean isPrivileged) {
                List<Vaccine> vaccines = vaccineRepository.findByHospital(hospital);

                return hospitalMapper.toResponse(hospital, vaccines, includeLowStock, isPrivileged);
        }

        @Override
        @Transactional
        public void registerHospitalStaff(StaffHospitalRegistrationRequest dto) {
                User staffUser = userService.createStaffUser(dto.getStaffName(), dto.getEmail(), dto.getPassword(),
                                dto.getPhone());

                Hospital hospital = new Hospital();
                hospital.setName(dto.getHospitalName());
                hospital.setAddress(dto.getHospitalAddress());
                hospital.setLicenseNumber(dto.getLicenseNumber());
                String documentKey = s3Service.toStoredKey(dto.getDocument(), null);
                if (documentKey == null || documentKey.isBlank()) {
                        throw new VaxifyException("Invalid verification document");
                }
                hospital.setDocumentUrl(documentKey);
                hospital.setCity(dto.getCity());
                hospital.setState(dto.getState());
                hospital.setPincode(dto.getPincode());
                hospital.setStaffUser(staffUser);
                hospital.setStatus(HospitalStatus.PENDING);
                hospital.setCreatedAt(LocalDateTime.now());

                Hospital savedHospital = hospitalRepository.save(hospital);

                HospitalMailData mailData = NotificationPayloads.fromHospital(savedHospital);

                AfterCommit.run(() -> notificationService.sendHospitalRegistrationReceived(mailData));

                log.info("Hospital registration requested: {} (Staff: {})", savedHospital.getName(), dto.getEmail());
        }

        @Override
        @Transactional
        public void deleteHospital(Long id) {
                Hospital hospital = hospitalRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

                if (appointmentRepository.existsBySlotCenterIdAndStatus(id, AppointmentStatus.BOOKED)) {
                        throw new ConflictException("Cannot delete hospital with active bookings");
                }

                if (appointmentRepository.existsBySlotCenterId(id)) {
                        throw new ConflictException("Cannot delete hospital with existing appointment history");
                }

                User staffUser = hospital.getStaffUser();

                hospitalRepository.delete(hospital);

                if (staffUser != null) {
                        userService.deleteUser(staffUser.getId());
                }

                log.info("Hospital deleted: ID={}, Name={}", id, hospital.getName());
        }

        @Override
        public Hospital findEntityByStaffEmail(String email) {
                return getHospitalByStaffEmail(email);
        }

        @Override
        public Hospital requireApprovedStaffHospital(String email) {
                Hospital hospital = findEntityByStaffEmail(email);

                if (hospital.getStatus() != HospitalStatus.APPROVED) {
                        throw new ForbiddenException("Hospital must be approved before making this change");
                }

                return hospital;
        }

        @Override
        public Hospital findEntityById(Long id) {
                return hospitalRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
        }

        private Hospital getHospitalByStaffEmail(String email) {
                User staffUser = userService.findByEmail(email);

                return hospitalRepository.findByStaffUser(staffUser)
                                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found for this staff"));
        }

        private List<Vaccine> vaccinesFor(List<Hospital> hospitals) {
                if (hospitals == null || hospitals.isEmpty()) {
                        return List.of();
                }

                return vaccineRepository.findByHospitalIn(hospitals);
        }
}
