package com.vaxify.app.dtos.slot;

import java.time.LocalDate;
import java.time.LocalTime;

import com.vaxify.app.entities.enums.SlotStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import com.vaxify.app.validation.ValidationPatterns;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotRequest {

    private Long hospitalId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = ValidationPatterns.SLOT_CAPACITY_MAX, message = ValidationPatterns.SLOT_CAPACITY_MAX_MESSAGE)
    private Integer capacity;

    private SlotStatus status;

}
