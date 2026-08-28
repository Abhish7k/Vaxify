package com.vaxify.app.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vaxify.app.dtos.vaccine.UpdateStockRequest;
import com.vaxify.app.dtos.vaccine.VaccineRequest;
import com.vaxify.app.dtos.vaccine.VaccineResponse;
import com.vaxify.app.dtos.notification.NotificationPayloads;
import com.vaxify.app.dtos.notification.VaccineStockMailData;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.entities.enums.AppointmentStatus;
import com.vaxify.app.repository.AppointmentRepository;
import com.vaxify.app.repository.VaccineRepository;
import com.vaxify.app.service.HospitalService;
import com.vaxify.app.service.NotificationService;
import com.vaxify.app.service.VaccineService;
import com.vaxify.app.exception.ConflictException;
import com.vaxify.app.exception.ForbiddenException;
import com.vaxify.app.exception.ResourceNotFoundException;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.mapper.VaccineMapper;
import com.vaxify.app.util.AfterCommit;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class VaccineServiceImpl implements VaccineService {

    private final VaccineRepository vaccineRepository;
    private final AppointmentRepository appointmentRepository;
    private final HospitalService hospitalService;
    private final NotificationService notificationService;
    private final VaccineMapper vaccineMapper;

    @Override
    @Transactional
    public VaccineResponse createVaccine(VaccineRequest dto, String staffEmail) {
        Hospital hospital = hospitalService.requireApprovedStaffHospital(staffEmail);

        Vaccine vaccine = vaccineMapper.toEntity(dto);

        vaccine.setHospital(hospital);

        // defaults
        if (vaccine.getStock() == null) {
            vaccine.setStock(0);
        }

        if (vaccine.getCapacity() == null) {
            vaccine.setCapacity(0);
        }

        validateStockAndCapacity(vaccine.getStock(), vaccine.getCapacity());

        Vaccine saved = vaccineRepository.save(vaccine);

        log.info("Vaccine created: {} (ID: {}, Hospital: {})", saved.getName(), saved.getId(), hospital.getName());

        return vaccineMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public VaccineResponse updateStock(Long id, UpdateStockRequest dto, String staffEmail) {
        Vaccine vaccine = vaccineRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccine not found"));

        Hospital staffHospital = hospitalService.requireApprovedStaffHospital(staffEmail);

        if (!vaccine.getHospital().getId().equals(staffHospital.getId())) {
            throw new ForbiddenException("This vaccine does not belong to your hospital");
        }

        vaccine.setStock(dto.getStock());

        validateStockAndCapacity(vaccine.getStock(), vaccine.getCapacity());

        Vaccine saved = vaccineRepository.save(vaccine);

        log.info("Vaccine stock updated: {} (ID: {}) for hospital: {}",
                saved.getName(), saved.getId(), staffHospital.getName());

        checkStockAlerts(saved);

        return vaccineMapper.toResponse(saved);
    }

    private void validateStockAndCapacity(Integer stock, Integer capacity) {
        if (stock == null || stock < 0) {
            throw new VaxifyException("Stock cannot be negative");
        }

        if (capacity == null || capacity <= 0) {
            throw new VaxifyException("Capacity must be greater than zero");
        }

        if (stock > capacity) {
            throw new VaxifyException("Stock cannot be more than the capacity");
        }
    }

    @Override
    @Transactional
    public void deleteVaccine(Long id, String staffEmail) {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccine not found"));

        // verify ownership
        Hospital staffHospital = hospitalService.requireApprovedStaffHospital(staffEmail);

        if (!vaccine.getHospital().getId().equals(staffHospital.getId())) {
            throw new ForbiddenException("Unauthorized access");
        }

        if (appointmentRepository.existsByVaccineAndStatus(vaccine, AppointmentStatus.BOOKED)) {
            throw new ConflictException("Cannot delete vaccine with active bookings");
        }

        if (appointmentRepository.existsByVaccine(vaccine)) {
            throw new ConflictException("Cannot delete vaccine with existing appointment history");
        }

        vaccineRepository.delete(vaccine);

        log.info("Vaccine deleted: {} (ID: {}) for hospital: {}",
                vaccine.getName(), id, staffHospital.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public VaccineResponse getVaccineById(Long id) {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccine not found"));

        return vaccineMapper.toResponse(vaccine);
    }

    @Override
    @Transactional(readOnly = true)
    public Vaccine findEntityById(Long id) {
        return vaccineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccine not found"));
    }

    @Override
    @Transactional
    public Vaccine findEntityByIdForUpdate(Long id) {
        return vaccineRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccine not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaccineResponse> getAllVaccines() {
        return vaccineRepository.findAllAvailable()
                .stream()
                .map(vaccineMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaccineResponse> getVaccinesByStaff(String staffEmail) {
        Hospital hospital = hospitalService.findEntityByStaffEmail(staffEmail);

        return vaccineRepository.findByHospital(hospital)
                .stream()
                .map(vaccineMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaccineResponse> getVaccinesByHospitalId(Long hospitalId) {
        return vaccineRepository.findAvailableByHospitalId(hospitalId)
                .stream()
                .map(vaccineMapper::toResponse)
                .toList();
    }

    @Override
    public void checkStockAlerts(Vaccine vaccine) {
        int stock = vaccine.getStock();

        int capacity = vaccine.getCapacity();

        if (capacity == 0) {
            return;
        }

        // < 20% critical
        if (stock < (capacity * 0.2)) {
            log.warn("CRITICAL STOCK ALERT: Vaccine {} at {}% ({} units left) [Hospital: {}]",
                    vaccine.getName(), (stock * 100 / capacity), stock, vaccine.getHospital().getName());

            VaccineStockMailData mailData = NotificationPayloads.fromVaccine(vaccine, stock, capacity);
            AfterCommit.run(() -> notificationService.sendVaccineStockCritical(mailData));
        }
        // < 40% warning
        else if (stock < (capacity * 0.4)) {
            log.info("Low stock warning: Vaccine {} at {}% ({} units left) [Hospital: {}]",
                    vaccine.getName(), (stock * 100 / capacity), stock, vaccine.getHospital().getName());

            VaccineStockMailData mailData = NotificationPayloads.fromVaccine(vaccine, stock, capacity);
            AfterCommit.run(() -> notificationService.sendVaccineStockLow(mailData));
        }
    }

    @Override
    @Transactional
    public void deductStock(Vaccine vaccine) {
        Vaccine locked = vaccineRepository.findByIdForUpdate(vaccine.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vaccine not found"));

        if (locked.getStock() == null || locked.getStock() <= 0) {
            throw new ConflictException("Vaccine is out of stock");
        }

        locked.setStock(locked.getStock() - 1);

        vaccineRepository.save(locked);

        log.info("Stock deducted: Vaccine={}, New Stock={}", locked.getName(), locked.getStock());

        checkStockAlerts(locked);
    }

    @Override
    @Transactional
    public void refundStock(Vaccine vaccine) {
        Vaccine locked = vaccineRepository.findByIdForUpdate(vaccine.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vaccine not found"));

        int stock = locked.getStock() == null ? 0 : locked.getStock();
        Integer capacity = locked.getCapacity();
        if (capacity == null || stock < capacity) {
            locked.setStock(stock + 1);
            vaccineRepository.save(locked);
            log.info("Stock refunded: Vaccine={}, New Stock={}", locked.getName(), locked.getStock());
        } else {
            log.warn("Skipped stock refund that would exceed capacity: Vaccine={}, Stock={}, Capacity={}",
                    locked.getName(), stock, capacity);
        }
    }

    @Override
    public void validateAvailable(Vaccine vaccine) {
        if (vaccine.getStock() <= 0) {
            throw new ConflictException("Vaccine is out of stock");
        }
    }

    @Override
    public List<Vaccine> getEntitiesByHospitals(List<Hospital> hospitals) {
        return vaccineRepository.findByHospitalIn(hospitals);
    }

    @Override
    public List<Vaccine> getEntitiesByHospital(Hospital hospital) {
        return vaccineRepository.findByHospital(hospital);
    }
}