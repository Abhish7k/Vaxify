package com.vaxify.app.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vaxify.app.dtos.SlotRequestDTO;
import com.vaxify.app.dtos.SlotResponseDTO;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.Slot;
import com.vaxify.app.repository.HospitalRepository;
import com.vaxify.app.repository.SlotRepository;
import com.vaxify.app.service.SlotService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final HospitalRepository hospitalRepository;
    private final ModelMapper modelMapper;

    // ---------------- CREATE SLOT ----------------
    @Override
    @Transactional
    public SlotResponseDTO createSlot(SlotRequestDTO dto) {

        Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        Slot slot = new Slot();
        modelMapper.map(dto, slot);   // maps ONLY matching fields
        slot.setCenter(hospital);
        slot.setBookedCount(0);       // default
        // slot.setStatus(dto.getStatus()); // already mapped if names match

        return mapToResponseDTO(slotRepository.save(slot));
    }

    // ---------------- UPDATE SLOT ----------------
    @Override
    @Transactional
    public SlotResponseDTO updateSlot(Long slotId, SlotRequestDTO dto) {

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        // STRICT + skipNullEnabled = true → safe partial update
        modelMapper.map(dto, slot);

        // Hospital change (only if hospitalId provided)
        if (dto.getHospitalId() != null) {
            Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                    .orElseThrow(() -> new RuntimeException("Hospital not found"));
            slot.setCenter(hospital);
        }

        return mapToResponseDTO(slotRepository.save(slot));
    }

    // ---------------- GET SLOT BY ID ----------------
    @Override
    @Transactional(readOnly = true)
    public SlotResponseDTO getSlotById(Long slotId) {

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        return mapToResponseDTO(slot);
    }

    // ---------------- GET ALL SLOTS ----------------
    @Override
    @Transactional(readOnly = true)
    public List<SlotResponseDTO> getAllSlots() {

        return slotRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    // ---------------- GET SLOTS BY HOSPITAL ----------------
    @Override
    @Transactional(readOnly = true)
    public List<SlotResponseDTO> getSlotsByHospital(Long hospitalId) {

        return slotRepository.findByCenterId(hospitalId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    // ---------------- GET SLOTS BY HOSPITAL & DATE ----------------
    @Override
    @Transactional(readOnly = true)
    public List<SlotResponseDTO> getSlotsByHospitalAndDate(
            Long hospitalId, LocalDate date) {

        return slotRepository.findByCenterIdAndDate(hospitalId, date)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    // ---------------- DELETE SLOT ----------------
    @Override
    @Transactional
    public void deleteSlot(Long slotId) {

        if (!slotRepository.existsById(slotId)) {
            throw new RuntimeException("Slot not found");
        }
        slotRepository.deleteById(slotId);
    }

    // ---------------- ENTITY → DTO ----------------
    private SlotResponseDTO mapToResponseDTO(Slot slot) {

        SlotResponseDTO dto = modelMapper.map(slot, SlotResponseDTO.class);

        // Manual mapping for relationship fields
        dto.setHospitalId(slot.getCenter().getId());
        dto.setHospitalName(slot.getCenter().getName());

        return dto;
    }
}
