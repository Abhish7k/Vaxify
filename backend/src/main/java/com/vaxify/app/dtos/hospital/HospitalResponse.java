package com.vaxify.app.dtos.hospital;

import com.vaxify.app.entities.enums.HospitalStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HospitalResponse {

    private Long id;
    private String name;
    private String address;
    private HospitalStatus status;
}
