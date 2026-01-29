package com.vaxify.app.service.impl;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vaxify.app.dtos.VaccineRequestDTO;
import com.vaxify.app.dtos.VaccineResponseDTO;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.repository.VaccineRepository;
import com.vaxify.app.service.VaccineService;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor

public class VaccineServiceImpl implements VaccineService {

    private final VaccineRepository vaccineRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public VaccineResponseDTO createVaccine(VaccineRequestDTO dto) {
        Vaccine vaccine = modelMapper.map(dto, Vaccine.class);
        return modelMapper.map(vaccineRepository.save(vaccine), VaccineResponseDTO.class);
    }

    @Override
    @Transactional
    public VaccineResponseDTO updateVaccine(Long id, VaccineRequestDTO dto) {
        Vaccine vaccine = vaccineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vaccine not found"));

        modelMapper.map(dto, vaccine);
        return modelMapper.map(vaccineRepository.save(vaccine), VaccineResponseDTO.class);
    }

    @Override
    @Transactional
    public void deleteVaccine(Long id) {
        vaccineRepository.deleteById(id);
    }

    @Override
    @Transactional
    public VaccineResponseDTO getVaccineById(Long id) {
        return modelMapper.map(
                vaccineRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Vaccine not found")),
                VaccineResponseDTO.class
        );
    }

    @Override
    @Transactional
    public List<VaccineResponseDTO> getAllVaccines() {
        return vaccineRepository.findAll()
                .stream()
                .map(v -> modelMapper.map(v, VaccineResponseDTO.class))
                .toList();
    }
}