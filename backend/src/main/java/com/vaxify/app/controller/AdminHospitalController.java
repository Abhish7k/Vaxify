package com.vaxify.app.controller;

import com.vaxify.app.dtos.hospital.HospitalResponse;
import com.vaxify.app.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/hospitals")
@RequiredArgsConstructor
public class AdminHospitalController {

    private final HospitalService hospitalService;

    @GetMapping
    public List<HospitalResponse> getAllHospitals() {
        return hospitalService.getAllHospitals();
    }

    @GetMapping("/pending")
    public List<HospitalResponse> getPendingHospitals() {
        return hospitalService.getPendingHospitals();
    }

    @PutMapping("/approve/{id}")
    public HospitalResponse approveHospital(@PathVariable Long id) {
        return hospitalService.approveHospital(id);
    }

    @PutMapping("/reject/{id}")
    public HospitalResponse rejectHospital(@PathVariable Long id) {
        return hospitalService.rejectHospital(id);
    }


}
