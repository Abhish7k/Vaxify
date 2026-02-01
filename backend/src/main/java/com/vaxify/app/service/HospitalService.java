package com.vaxify.app.service;

import com.vaxify.app.dtos.StaffHospitalRegistrationDTO;
import com.vaxify.app.dtos.hospital.HospitalResponse;
import com.vaxify.app.dtos.hospital.StaffHospitalRegisterRequest;
import com.vaxify.app.dtos.hospital.UpdateHospitalRequest;

import java.util.List;

public interface HospitalService {

    // staff
    HospitalResponse registerHospital(
            StaffHospitalRegisterRequest request,
            String staffEmail);

    HospitalResponse getMyHospital(String staffEmail);

    HospitalResponse updateHospital(UpdateHospitalRequest request, String staffEmail);

    // admin
    List<HospitalResponse> getAllHospitals();

    List<HospitalResponse> getApprovedHospitals();

    HospitalResponse getHospitalById(Long id);

    List<HospitalResponse> getPendingHospitals();

    HospitalResponse approveHospital(Long hospitalId);

    HospitalResponse rejectHospital(Long hospitalId);

    // register hospital and staff
    public void registerHospitalStaff(StaffHospitalRegistrationDTO dto);

    void deleteHospital(Long id);

}
