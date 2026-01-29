package com.vaxify.app.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.vaxify.app.entities.enums.SlotStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor        
@AllArgsConstructor 
public class SlotResponseDTO {

    private Long id;
    private Long hospitalId;
    private String hospitalName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer capacity;
    private Integer bookedCount;
    private SlotStatus status;
    private LocalDateTime createdAt;
}

