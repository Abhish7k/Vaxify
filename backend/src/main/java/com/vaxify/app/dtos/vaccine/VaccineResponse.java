package com.vaxify.app.dtos.vaccine;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccineResponse {

    private Long id;

    private String name;

    private String type;

    private String manufacturer;

    private Integer stock;

    private Integer capacity;

    private Long hospitalId;

    private String hospitalName;

    private String lastUpdated;

}
