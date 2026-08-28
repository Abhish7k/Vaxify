package com.vaxify.app.dtos.vaccine;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccineRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @NotBlank(message = "Type is required")
    @Size(min = 1, max = 100, message = "Type must be between 1 and 100 characters")
    private String type;

    @NotBlank(message = "Manufacturer is required")
    @Size(min = 1, max = 100, message = "Manufacturer must be between 1 and 100 characters")
    private String manufacturer;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be greater than zero")
    private Integer capacity;

}
