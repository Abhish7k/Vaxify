package com.vaxify.app.controller;

import com.vaxify.app.dtos.hospital.HospitalResponse;
import com.vaxify.app.dtos.hospital.StaffHospitalRegisterRequest;
import com.vaxify.app.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.vaxify.app.dtos.StaffHospitalRegistrationDTO;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    // @PostMapping("/register")
    // public HospitalResponse registerHospital(
    //         @Valid @RequestBody StaffHospitalRegisterRequest request,
    //         @AuthenticationPrincipal UserDetails principal
    // ) {
    //     return hospitalService.registerHospital(
    //             request,
    //             principal.getUsername() // email
    //     );
    // }

    @PostMapping("/register")
    public ResponseEntity<String> registerHospitalStaff(@Valid @RequestBody StaffHospitalRegistrationDTO dto)
    {
        hospitalService.registerHospitalStaff(dto);
        return ResponseEntity.ok("Hospital registration submitted for approval");
    }


    @GetMapping("/my")
    public HospitalResponse getMyHospital() {

        String email =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        return hospitalService.getMyHospital(email);
    }

}
