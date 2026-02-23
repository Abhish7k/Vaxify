package com.vaxify.app.mapper;

import com.vaxify.app.dtos.slot.SlotRequest;
import com.vaxify.app.dtos.slot.SlotResponse;
import com.vaxify.app.entities.Slot;
import org.springframework.stereotype.Component;

@Component
public class SlotMapper {

    public SlotResponse toResponse(Slot slot) {
        if (slot == null) {
            return null;
        }

        return SlotResponse.builder()
                .id(slot.getId())
                .date(slot.getDate())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .capacity(slot.getCapacity())
                .bookedCount(slot.getBookedCount())
                .status(slot.getStatus())
                .hospitalId(slot.getCenter().getId())
                .hospitalName(slot.getCenter().getName())
                .build();
    }

    public Slot toEntity(SlotRequest dto) {
        if (dto == null) {
            return null;
        }

        Slot slot = new Slot();

        slot.setDate(dto.getDate());
        slot.setStartTime(dto.getStartTime());
        slot.setEndTime(dto.getEndTime());
        slot.setCapacity(dto.getCapacity());

        return slot;
    }

    public void updateEntity(Slot slot, SlotRequest dto) {
        if (dto == null) {
            return;
        }

        if (dto.getDate() != null) {
            slot.setDate(dto.getDate());
        }

        if (dto.getStartTime() != null) {
            slot.setStartTime(dto.getStartTime());
        }

        if (dto.getEndTime() != null) {
            slot.setEndTime(dto.getEndTime());
        }

        if (dto.getCapacity() != null) {
            slot.setCapacity(dto.getCapacity());
        }
    }
}
