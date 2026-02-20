package com.vaxify.app.controller;

import com.vaxify.app.dtos.appointment.AppointmentResponse;
import com.vaxify.app.dtos.appointment.BookAppointmentRequest;
import com.vaxify.app.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import com.vaxify.app.util.SecurityUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<AppointmentResponse> bookAppointment(@RequestBody BookAppointmentRequest request) {
        String email = securityUtils.getCurrentUserEmail();

        return ResponseEntity.ok(appointmentService.bookAppointment(request, email));
    }

    @GetMapping("/my")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments() {
        String email = securityUtils.getCurrentUserEmail();

        return ResponseEntity.ok(appointmentService.getMyAppointments(email));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        String email = securityUtils.getCurrentUserEmail();

        appointmentService.cancelAppointment(id, email);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByHospital(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByHospital(hospitalId));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Void> completeAppointment(@PathVariable Long id) {
        appointmentService.completeAppointment(id);

        return ResponseEntity.ok().build();
    }
}
