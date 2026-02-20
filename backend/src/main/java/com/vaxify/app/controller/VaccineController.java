package com.vaxify.app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vaxify.app.dtos.vaccine.VaccineRequest;
import com.vaxify.app.dtos.vaccine.VaccineResponse;
import com.vaxify.app.service.VaccineService;
import com.vaxify.app.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vaccines")
@RequiredArgsConstructor
public class VaccineController {

    private final VaccineService vaccineService;
    private final SecurityUtils securityUtils;

    // staff: create vaccine for their hospital
    @PostMapping("/staff")
    public ResponseEntity<VaccineResponse> create(@RequestBody VaccineRequest dto) {
        String email = securityUtils.getCurrentUserEmail();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vaccineService.createVaccine(dto, email));
    }

    // staff: update their vaccine
    @PutMapping("/staff/{id}")
    public ResponseEntity<VaccineResponse> update(@PathVariable Long id, @RequestBody VaccineRequest dto) {
        String email = securityUtils.getCurrentUserEmail();

        return ResponseEntity.ok(vaccineService.updateVaccine(id, dto, email));
    }

    // staff: delete their vaccine
    @DeleteMapping("/staff/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        String email = securityUtils.getCurrentUserEmail();

        vaccineService.deleteVaccine(id, email);

        return ResponseEntity.ok("Vaccine deleted");
    }

    // staff: get their hospital's vaccines
    @GetMapping("/staff")
    public ResponseEntity<List<VaccineResponse>> getMyVaccines() {
        String email = securityUtils.getCurrentUserEmail();

        return ResponseEntity.ok(vaccineService.getVaccinesByStaff(email));
    }

    // public: Get all vaccines for displaying
    @GetMapping
    public ResponseEntity<List<VaccineResponse>> getAll() {
        List<VaccineResponse> vaccines = vaccineService.getAllVaccines();

        return ResponseEntity.ok(vaccines);
    }

    // public: Get vaccines by hospital id
    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<VaccineResponse>> getByHospital(@PathVariable Long hospitalId) {
        List<VaccineResponse> vaccines = vaccineService.getVaccinesByHospitalId(hospitalId);

        return ResponseEntity.ok(vaccines);
    }
}
