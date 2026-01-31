package com.vaxify.app.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

import com.vaxify.app.entities.enums.SlotStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotRequestDTO {

    private Long hospitalId;
    private LocalDate date;
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;
    private Integer capacity;
    private SlotStatus status;

}
