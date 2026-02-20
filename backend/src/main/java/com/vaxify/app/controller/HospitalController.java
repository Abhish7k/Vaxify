package com.vaxify.app.controller;

import com.vaxify.app.dtos.hospital.HospitalResponse;
import com.vaxify.app.dtos.hospital.HospitalSummaryResponse;
import com.vaxify.app.dtos.hospital.UpdateHospitalRequest;
import com.vaxify.app.dtos.hospital.StaffHospitalRegistrationRequest;
import com.vaxify.app.service.HospitalService;
import com.vaxify.app.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
@CrossOrigin("*")
public class HospitalController {

    private final HospitalService hospitalService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<HospitalSummaryResponse>> getAllApprovedHospitals() {
        return ResponseEntity.ok(hospitalService.getApprovedHospitals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalResponse> getHospitalById(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalService.getHospitalById(id));
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerHospitalStaff(@RequestBody StaffHospitalRegistrationRequest dto) {
        hospitalService.registerHospitalStaff(dto);

        return ResponseEntity.ok("Hospital registration submitted for approval");
    }

    @GetMapping("/my")
    public HospitalResponse getMyHospital() {

        String email = securityUtils.getCurrentUserEmail();

        return hospitalService.getMyHospital(email);
    }

    @PutMapping("/my")
    public HospitalResponse updateHospital(@RequestBody UpdateHospitalRequest request) {

        String email = securityUtils.getCurrentUserEmail();

        return hospitalService.updateHospital(request, email);
    }

}
