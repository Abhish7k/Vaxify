package com.vaxify.app.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vaxify.app.dtos.vaccine.VaccineRequest;
import com.vaxify.app.dtos.vaccine.VaccineResponse;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.repository.HospitalRepository;
import com.vaxify.app.repository.UserRepository;
import com.vaxify.app.repository.VaccineRepository;
import com.vaxify.app.service.NotificationService;
import com.vaxify.app.service.VaccineService;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.mapper.VaccineMapper;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class VaccineServiceImpl implements VaccineService {

    private final VaccineRepository vaccineRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final VaccineMapper vaccineMapper;

    @Override
    @Transactional
    public VaccineResponse createVaccine(VaccineRequest dto, String staffEmail) {
        Hospital hospital = getHospitalByStaffEmail(staffEmail);

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
    public VaccineResponse updateVaccine(Long id, VaccineRequest dto, String staffEmail) {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new VaxifyException("Vaccine not found"));

        // verify ownership
        Hospital staffHospital = getHospitalByStaffEmail(staffEmail);

        if (!vaccine.getHospital().getId().equals(staffHospital.getId())) {
            throw new VaxifyException("Unauthorized: This vaccine does not belong to your hospital");
        }

        vaccineMapper.updateEntity(vaccine, dto);

        // check defaults
        if (vaccine.getStock() == null) {
            vaccine.setStock(0);
        }

        if (vaccine.getCapacity() == null) {
            vaccine.setCapacity(0);
        }

        validateStockAndCapacity(vaccine.getStock(), vaccine.getCapacity());

        Vaccine saved = vaccineRepository.save(vaccine);

        log.info("Vaccine updated: {} (ID: {}) for hospital: {}",
                saved.getName(), saved.getId(), staffHospital.getName());

        checkStockAlerts(saved);

        return vaccineMapper.toResponse(saved);
    }

    private void validateStockAndCapacity(Integer stock, Integer capacity) {
        if (stock < 0) {
            throw new VaxifyException("Stock cannot be negative");
        }

        if (capacity <= 0) {
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
                .orElseThrow(() -> new VaxifyException("Vaccine not found"));

        // verify ownership
        Hospital staffHospital = getHospitalByStaffEmail(staffEmail);

        if (!vaccine.getHospital().getId().equals(staffHospital.getId())) {
            throw new VaxifyException("Unauthorized access");
        }

        vaccineRepository.delete(vaccine);

        log.info("Vaccine deleted: {} (ID: {}) for hospital: {}",
                vaccine.getName(), id, staffHospital.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public VaccineResponse getVaccineById(Long id) {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new VaxifyException("Vaccine not found"));

        return vaccineMapper.toResponse(vaccine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaccineResponse> getAllVaccines() {
        return vaccineRepository.findAll()
                .stream()
                .filter(v -> {
                    // filter critical stock (< 20%)
                    if (v.getCapacity() != null && v.getCapacity() > 0) {
                        return v.getStock() >= (v.getCapacity() * 0.2);
                    }
                    return true;
                })
                .map(vaccineMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaccineResponse> getVaccinesByStaff(String staffEmail) {
        Hospital hospital = getHospitalByStaffEmail(staffEmail);

        return vaccineRepository.findByHospital(hospital)
                .stream()
                .map(vaccineMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaccineResponse> getVaccinesByHospitalId(Long hospitalId) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new VaxifyException("Hospital not found"));

        return vaccineRepository.findByHospital(hospital)
                .stream()
                .filter(v -> {
                    // filter critical stock (< 20%)
                    if (v.getCapacity() != null && v.getCapacity() > 0) {
                        return v.getStock() >= (v.getCapacity() * 0.2);
                    }
                    return true;
                })
                .map(vaccineMapper::toResponse)
                .toList();
    }

    // helper
    private Hospital getHospitalByStaffEmail(String email) {
        User staffUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new VaxifyException("Staff user not found"));

        return hospitalRepository.findByStaffUser(staffUser)
                .orElseThrow(() -> new VaxifyException("Hospital not found for this staff"));
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

            notificationService.sendVaccineStockCritical(vaccine, stock, capacity);
        }
        // < 40% warning
        else if (stock < (capacity * 0.4)) {
            log.info("Low stock warning: Vaccine {} at {}% ({} units left) [Hospital: {}]",
                    vaccine.getName(), (stock * 100 / capacity), stock, vaccine.getHospital().getName());

            notificationService.sendVaccineStockLow(vaccine, stock, capacity);
        }
    }
}