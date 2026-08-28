package com.vaxify.app.dtos.appointment;

import com.vaxify.app.validation.ValidationPatterns;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BookAppointmentRequest {

    @NotNull(message = "Center is required")
    private Long centerId;

    @NotNull(message = "Vaccine is required")
    private Long vaccineId;

    @NotBlank(message = "Date is required")
    @Pattern(regexp = ValidationPatterns.ISO_DATE, message = ValidationPatterns.ISO_DATE_MESSAGE)
    private String date;

    @NotBlank(message = "Slot is required")
    @Pattern(regexp = ValidationPatterns.TIME, message = ValidationPatterns.TIME_MESSAGE)
    private String slot;
}
