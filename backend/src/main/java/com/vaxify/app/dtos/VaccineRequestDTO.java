package com.vaxify.app.dtos;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccineRequestDTO {

    private String name;
    private String type;
    private String manufacturer;
}