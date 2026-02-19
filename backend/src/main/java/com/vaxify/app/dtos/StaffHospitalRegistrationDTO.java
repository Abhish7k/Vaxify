package com.vaxify.app.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffHospitalRegistrationDTO {

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
