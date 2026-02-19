package com.vaxify.app.service.impl;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vaxify.app.dtos.VaccineRequestDTO;
import com.vaxify.app.dtos.VaccineResponseDTO;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.User;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.repository.HospitalRepository;
import com.vaxify.app.repository.UserRepository;
import com.vaxify.app.repository.VaccineRepository;
import com.vaxify.app.service.AppointmentService;
import com.vaxify.app.service.VaccineService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VaccineServiceImpl implements VaccineService {

    private final VaccineRepository vaccineRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final AppointmentService appointmentService;

    @Override
    @Transactional
    public VaccineResponseDTO createVaccine(VaccineRequestDTO dto, String staffEmail) {
        Hospital hospital = getHospitalByStaffEmail(staffEmail);

        Vaccine vaccine = modelMapper.map(dto, Vaccine.class);
        vaccine.setHospital(hospital);

        // defaults if null
        if (vaccine.getStock() == null)
            vaccine.setStock(0);
        if (vaccine.getCapacity() == null)
            vaccine.setCapacity(0);

        validateStockAndCapacity(vaccine.getStock(), vaccine.getCapacity());

        return toResponse(vaccineRepository.save(vaccine));
    }

    @Override
    @Transactional
    public VaccineResponseDTO updateVaccine(Long id, VaccineRequestDTO dto, String staffEmail) {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vaccine not found"));

        // verify ownership
        Hospital staffHospital = getHospitalByStaffEmail(staffEmail);
        if (!vaccine.getHospital().getId().equals(staffHospital.getId())) {
            throw new RuntimeException("Unauthorized: This vaccine does not belong to your hospital");
        }

        // map updates
        modelMapper.map(dto, vaccine);

        // defaults if null (in case mapping set them to null or they were null)
        if (vaccine.getStock() == null)
            vaccine.setStock(0);
        if (vaccine.getCapacity() == null)
            vaccine.setCapacity(0);

        validateStockAndCapacity(vaccine.getStock(), vaccine.getCapacity());

        Vaccine saved = vaccineRepository.save(vaccine);

        // check stock alerts (since user might have manually lowered stock)
        try {
            appointmentService.checkStockAlerts(saved);
        } catch (Exception e) {
            // ignore
        }

        return toResponse(saved);
    }

    private void validateStockAndCapacity(Integer stock, Integer capacity) {
        if (stock < 0) {
            throw new RuntimeException("Stock cannot be negative");
        }
        if (capacity <= 0) {
            throw new RuntimeException("Capacity must be greater than zero");
        }
        if (stock > capacity) {
            throw new RuntimeException("Stock cannot be more than the capacity");
        }
    }

    @Override
    @Transactional
    public void deleteVaccine(Long id, String staffEmail) {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vaccine not found"));

        // verify ownership
        Hospital staffHospital = getHospitalByStaffEmail(staffEmail);
        if (!vaccine.getHospital().getId().equals(staffHospital.getId())) {
            throw new RuntimeException("Unauthorized: This vaccine does not belong to your hospital");
        }

        vaccineRepository.delete(vaccine);
    }

    @Override
    @Transactional(readOnly = true)
    public VaccineResponseDTO getVaccineById(Long id) {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vaccine not found"));
        return toResponse(vaccine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaccineResponseDTO> getAllVaccines() {
        return vaccineRepository.findAll()
                .stream()
                .filter(v -> {
                    // filter out critical low stock vaccines (< 20%)
                    if (v.getCapacity() != null && v.getCapacity() > 0) {
                        return v.getStock() >= (v.getCapacity() * 0.2);
                    }
                    return true;
                })
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaccineResponseDTO> getVaccinesByStaff(String staffEmail) {
        Hospital hospital = getHospitalByStaffEmail(staffEmail);

        return vaccineRepository.findByHospital(hospital)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaccineResponseDTO> getVaccinesByHospitalId(Long hospitalId) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        return vaccineRepository.findByHospital(hospital)
                .stream()
                .filter(v -> {
                    // filter out critical low stock vaccines (< 20%)
                    if (v.getCapacity() != null && v.getCapacity() > 0) {
                        return v.getStock() >= (v.getCapacity() * 0.2);
                    }
                    return true;
                })
                .map(this::toResponse)
                .toList();
    }

    // helper
    private Hospital getHospitalByStaffEmail(String email) {
        User staffUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Staff user not found"));

        return hospitalRepository.findByStaffUser(staffUser)
                .orElseThrow(() -> new RuntimeException("Hospital not found for this staff"));
    }

    private VaccineResponseDTO toResponse(Vaccine vaccine) {
        VaccineResponseDTO response = modelMapper.map(vaccine, VaccineResponseDTO.class);
        if (vaccine.getCreatedAt() != null) {
            response.setLastUpdated(vaccine.getCreatedAt().toString());
        }
        return response;
    }
}