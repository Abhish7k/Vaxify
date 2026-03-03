package com.vaxify.app.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.vaxify.app.entities.Slot;

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

    Slot findEntityByDetails(Long centerId, LocalDate date, LocalTime time);

    void reserveSlot(Slot slot);

    void releaseSlot(Slot slot);

    void validateAvailable(Slot slot, LocalDate date, LocalTime time);
}