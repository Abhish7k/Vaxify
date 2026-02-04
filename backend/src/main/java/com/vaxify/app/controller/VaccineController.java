package com.vaxify.app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vaxify.app.dtos.VaccineRequestDTO;
import com.vaxify.app.dtos.VaccineResponseDTO;
import com.vaxify.app.service.VaccineService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vaccines")
@RequiredArgsConstructor
public class VaccineController {

    private final VaccineService vaccineService;

    // staff: create vaccine for their hospital
    @PostMapping("/staff")
    public ResponseEntity<VaccineResponseDTO> create(@RequestBody VaccineRequestDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vaccineService.createVaccine(dto, email));
    }

    // staff: update their vaccine
    @PutMapping("/staff/{id}")
    public ResponseEntity<VaccineResponseDTO> update(@PathVariable Long id, @RequestBody VaccineRequestDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return ResponseEntity.ok(vaccineService.updateVaccine(id, dto, email));
    }

    // staff: delete their vaccine
    @DeleteMapping("/staff/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        vaccineService.deleteVaccine(id, email);

        return ResponseEntity.ok("Vaccine deleted");
    }

    // staff: get their hospital's vaccines
    @GetMapping("/staff")
    public ResponseEntity<List<VaccineResponseDTO>> getMyVaccines() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return ResponseEntity.ok(vaccineService.getVaccinesByStaff(email));
    }

    // public: Get all vaccines for displaying
    @GetMapping
    public ResponseEntity<List<VaccineResponseDTO>> getAll() {
        return ResponseEntity.ok(vaccineService.getAllVaccines());
    }

    // public: Get vaccines by hospital id
    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<VaccineResponseDTO>> getByHospital(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(vaccineService.getVaccinesByHospitalId(hospitalId));
    }
}
