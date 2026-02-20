package com.vaxify.app.mapper;

import com.vaxify.app.dtos.slot.SlotResponse;
import com.vaxify.app.entities.Slot;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SlotMapper {

    public SlotResponse toResponse(Slot slot) {
        if (slot == null) {
            return null;
        }

        SlotResponse dto = new SlotResponse();
        dto.setId(slot.getId());
        dto.setDate(slot.getDate());
        dto.setStartTime(slot.getStartTime());
        dto.setEndTime(slot.getEndTime());
        dto.setCapacity(slot.getCapacity());
        dto.setBookedCount(slot.getBookedCount());
        dto.setStatus(slot.getStatus());

        if (slot.getCenter() != null) {
            dto.setHospitalId(slot.getCenter().getId());
            dto.setHospitalName(slot.getCenter().getName());
        }

        return dto;
    }

    public List<SlotResponse> toResponses(List<Slot> slots) {
        return slots.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
