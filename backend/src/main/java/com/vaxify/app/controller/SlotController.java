package com.vaxify.app.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vaxify.app.dtos.slot.BulkSlotRequest;
import com.vaxify.app.dtos.slot.BulkSlotResponse;
import com.vaxify.app.dtos.slot.SlotRequest;
import com.vaxify.app.dtos.slot.SlotResponse;
import com.vaxify.app.service.SlotService;
import com.vaxify.app.util.SecurityUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;
    private final SecurityUtils securityUtils;

    @PostMapping("/staff")
    public ResponseEntity<SlotResponse> createSlot(@Valid @RequestBody SlotRequest dto) {
        String email = securityUtils.getCurrentUserEmail();

        SlotResponse response = slotService.createSlot(dto, email);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/staff/bulk")
    public ResponseEntity<BulkSlotResponse> createSlotsBulk(@Valid @RequestBody BulkSlotRequest request) {
        String email = securityUtils.getCurrentUserEmail();

        BulkSlotResponse response = slotService.createSlotsBulk(request, email);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/staff/{slotId}")
    public ResponseEntity<SlotResponse> updateSlot(@PathVariable Long slotId,
            @Valid @RequestBody SlotRequest dto) {
        String email = securityUtils.getCurrentUserEmail();

        SlotResponse response = slotService.updateSlot(slotId, dto, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{slotId}")
    public ResponseEntity<SlotResponse> getSlotById(@PathVariable Long slotId) {

        return ResponseEntity.ok(slotService.getSlotById(slotId));
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<SlotResponse>> getSlotsByHospital(@PathVariable Long hospitalId) {

        return ResponseEntity.ok(
                slotService.getSlotsByHospital(hospitalId));
    }

    @GetMapping("/hospital/{hospitalId}/date")
    public ResponseEntity<List<SlotResponse>> getSlotsByHospitalAndDate(
            @PathVariable Long hospitalId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(
                slotService.getSlotsByHospitalAndDate(hospitalId, date));
    }

    @DeleteMapping("/staff/{slotId}")
    public ResponseEntity<String> deleteSlot(@PathVariable Long slotId) {
        String email = securityUtils.getCurrentUserEmail();

        slotService.deleteSlot(slotId, email);

        return ResponseEntity.ok("Slot deleted successfully");
    }
}
