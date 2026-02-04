package com.vaxify.app.service;

import java.time.LocalDate;
import java.util.List;

import com.vaxify.app.dtos.SlotRequestDTO;
import com.vaxify.app.dtos.SlotResponseDTO;

public interface SlotService {
    SlotResponseDTO createSlot(SlotRequestDTO dto);

    SlotResponseDTO updateSlot(Long slotId, SlotRequestDTO dto);

    SlotResponseDTO getSlotById(Long slotId);

    List<SlotResponseDTO> getAllSlots();

    List<SlotResponseDTO> getSlotsByHospital(Long hospitalId);

    List<SlotResponseDTO> getSlotsByHospitalAndDate(Long hospitalId, LocalDate date);

    void deleteSlot(Long slotId);
}