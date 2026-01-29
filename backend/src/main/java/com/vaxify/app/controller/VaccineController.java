package com.vaxify.app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    // STAFF only
    @PostMapping("/staff")
    public ResponseEntity<VaccineResponseDTO> create(@RequestBody VaccineRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vaccineService.createVaccine(dto));
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<VaccineResponseDTO> update(
            @PathVariable Long id,
            @RequestBody VaccineRequestDTO dto) {
        return ResponseEntity.ok(vaccineService.updateVaccine(id, dto));
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        vaccineService.deleteVaccine(id);
        return ResponseEntity.ok("Vaccine deleted");
    }

    // USER / STAFF / ADMIN
    @GetMapping
    public ResponseEntity<List<VaccineResponseDTO>> getAll() {
        return ResponseEntity.ok(vaccineService.getAllVaccines());
    }
}
