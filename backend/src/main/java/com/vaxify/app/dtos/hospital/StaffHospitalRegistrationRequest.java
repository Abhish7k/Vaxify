package com.vaxify.app.dtos.hospital;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffHospitalRegistrationRequest {

    private String staffName;

    private String email;

    private String password;

    private String phone;

    private String hospitalName;

    private String hospitalAddress;

    private String licenseNumber;

    private String document;

    private String city;

    private String state;

    private String pincode;

}
