package com.vaxify.app.controller;

import com.vaxify.app.dtos.hospital.HospitalResponse;
import com.vaxify.app.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/hospitals")
@RequiredArgsConstructor
public class AdminHospitalController {

    private final HospitalService hospitalService;

    @GetMapping
    public ResponseEntity<List<HospitalResponse>> getAllHospitals() {
        return ResponseEntity.ok(hospitalService.getAllHospitals());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<HospitalResponse>> getPendingHospitals() {
        return ResponseEntity.ok(hospitalService.getPendingHospitals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalResponse> getHospitalById(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalService.getAdminHospitalById(id));
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<HospitalResponse> approveHospital(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalService.approveHospital(id));
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<HospitalResponse> rejectHospital(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalService.rejectHospital(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        return ResponseEntity.ok().build();
    }

}
