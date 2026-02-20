package com.vaxify.app.service;

import java.time.LocalDate;
import java.util.List;

import com.vaxify.app.dtos.slot.SlotRequest;
import com.vaxify.app.dtos.slot.SlotResponse;

public interface SlotService {
    SlotResponse createSlot(SlotRequest dto);

    SlotResponse updateSlot(Long slotId, SlotRequest dto);

    SlotResponse getSlotById(Long slotId);

    List<SlotResponse> getAllSlots();

    List<SlotResponse> getSlotsByHospital(Long hospitalId);

    List<SlotResponse> getSlotsByHospitalAndDate(Long hospitalId, LocalDate date);

    void deleteSlot(Long slotId);
}