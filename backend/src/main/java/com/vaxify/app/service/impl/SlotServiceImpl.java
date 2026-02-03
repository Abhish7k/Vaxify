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

    // create slot
    @Override
    @Transactional
    public SlotResponseDTO createSlot(SlotRequestDTO dto) {

        if (dto.getDate().getDayOfWeek() == java.time.DayOfWeek.SUNDAY) {
            throw new RuntimeException("Cannot create slots on Sunday");
        }

        Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        // check for duplicate slot
        // fetch all slots for the day and check time
        List<Slot> daySlots = slotRepository.findByCenterIdAndDate(dto.getHospitalId(), dto.getDate());
        boolean exists = daySlots.stream()
                .anyMatch(s -> s.getStartTime().equals(dto.getStartTime()));

        if (exists) {
            throw new RuntimeException("Slot already exists for this time on the selected date.");
        }

        Slot slot = new Slot();

        modelMapper.map(dto, slot); // maps only matching fields

        slot.setCenter(hospital);

        slot.setBookedCount(0); // default
        // slot.setStatus(dto.getStatus()); // already mapped if names match

        return mapToResponseDTO(slotRepository.save(slot));
    }

    // update slot
    @Override
    @Transactional
    public SlotResponseDTO updateSlot(Long slotId, SlotRequestDTO dto) {

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        // strict + skipNullEnabled = true → safe partial update
        modelMapper.map(dto, slot);

        // validation: capacity cannot be less than current bookings
        if (slot.getCapacity() < slot.getBookedCount()) {
            throw new RuntimeException("New capacity cannot be less than value of confirmed bookings ("
                    + slot.getBookedCount() + ")");
        }

        // hospital change (only if hospitalId provided)
        if (dto.getHospitalId() != null) {
            Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                    .orElseThrow(() -> new RuntimeException("Hospital not found"));
            slot.setCenter(hospital);
        }

        return mapToResponseDTO(slotRepository.save(slot));
    }

    // get slot by id
    @Override
    @Transactional(readOnly = true)
    public SlotResponseDTO getSlotById(Long slotId) {

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        return mapToResponseDTO(slot);
    }

    // get all slots
    @Override
    @Transactional(readOnly = true)
    public List<SlotResponseDTO> getAllSlots() {

        return slotRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    // get slots by hospital
    @Override
    @Transactional(readOnly = true)
    public List<SlotResponseDTO> getSlotsByHospital(Long hospitalId) {

        return slotRepository.findByCenterId(hospitalId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    // get slots by hospital and date
    @Override
    @Transactional(readOnly = true)
    public List<SlotResponseDTO> getSlotsByHospitalAndDate(
            Long hospitalId, LocalDate date) {

        return slotRepository.findByCenterIdAndDate(hospitalId, date)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    // delete slot
    @Override
    @Transactional
    public void deleteSlot(Long slotId) {

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getBookedCount() > 0) {
            throw new RuntimeException("Cannot delete a slot with active bookings.");
        }

        slotRepository.deleteById(slotId);
    }

    // entity → dto
    private SlotResponseDTO mapToResponseDTO(Slot slot) {

        SlotResponseDTO dto = modelMapper.map(slot, SlotResponseDTO.class);

        // manual mapping for relationship fields
        dto.setHospitalId(slot.getCenter().getId());
        dto.setHospitalName(slot.getCenter().getName());

        return dto;
    }
}
