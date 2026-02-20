package com.vaxify.app.dtos.vaccine;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccineRequest {

    private String name;

    private String type;

    private String manufacturer;

    private Integer stock;

    private Integer capacity;

}
