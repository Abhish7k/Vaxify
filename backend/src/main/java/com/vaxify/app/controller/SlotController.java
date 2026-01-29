package com.vaxify.app.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vaxify.app.dtos.SlotRequestDTO;
import com.vaxify.app.dtos.SlotResponseDTO;
import com.vaxify.app.service.SlotService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    //create slot
    @PostMapping("/staff")
    public ResponseEntity<SlotResponseDTO> createSlot(
            @RequestBody SlotRequestDTO dto) {

        SlotResponseDTO response = slotService.createSlot(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //update slot
    @PutMapping("/staff/{slotId}")
    public ResponseEntity<SlotResponseDTO> updateSlot(
            @PathVariable Long slotId,
            @RequestBody SlotRequestDTO dto) {

        SlotResponseDTO response = slotService.updateSlot(slotId, dto);
        return ResponseEntity.ok(response);
    }

    //get slot by id
    @GetMapping("/{slotId}")
    public ResponseEntity<SlotResponseDTO> getSlotById(
            @PathVariable Long slotId) {

        return ResponseEntity.ok(slotService.getSlotById(slotId));
    }

    //get all slots
    @GetMapping
    public ResponseEntity<List<SlotResponseDTO>> getAllSlots() {

        return ResponseEntity.ok(slotService.getAllSlots());
    }

    //get slot by hospital
    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<SlotResponseDTO>> getSlotsByHospital(
            @PathVariable Long hospitalId) {

        return ResponseEntity.ok(
                slotService.getSlotsByHospital(hospitalId));
    }

    //get slot by hospital and date
    @GetMapping("/hospital/{hospitalId}/date")
    public ResponseEntity<List<SlotResponseDTO>> getSlotsByHospitalAndDate(
            @PathVariable Long hospitalId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ResponseEntity.ok(
                slotService.getSlotsByHospitalAndDate(hospitalId, date));
    }

    //detele slot
    @DeleteMapping("/staff/{slotId}")
    public ResponseEntity<String> deleteSlot(
            @PathVariable Long slotId) {

        slotService.deleteSlot(slotId);
        return ResponseEntity.ok("Slot deleted successfully");
    }
}
