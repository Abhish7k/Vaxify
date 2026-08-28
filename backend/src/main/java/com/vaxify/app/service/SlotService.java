package com.vaxify.app.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.vaxify.app.entities.Slot;

import com.vaxify.app.dtos.slot.BulkSlotRequest;
import com.vaxify.app.dtos.slot.BulkSlotResponse;
import com.vaxify.app.dtos.slot.SlotRequest;
import com.vaxify.app.dtos.slot.SlotResponse;

public interface SlotService {
    SlotResponse createSlot(SlotRequest dto, String staffEmail);

    BulkSlotResponse createSlotsBulk(BulkSlotRequest request, String staffEmail);

    SlotResponse updateSlot(Long slotId, SlotRequest dto, String staffEmail);

    SlotResponse getSlotById(Long slotId);

    List<SlotResponse> getSlotsByHospital(Long hospitalId);

    List<SlotResponse> getSlotsByHospitalAndDate(Long hospitalId, LocalDate date);

    void deleteSlot(Long slotId, String staffEmail);

    Slot findEntityByDetails(Long centerId, LocalDate date, LocalTime time);

    void reserveSlot(Slot slot);

    void releaseSlot(Slot slot);

    void validateAvailable(Slot slot, LocalDate date, LocalTime time);
}
