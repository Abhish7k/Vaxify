package com.vaxify.app.service;

import java.util.List;
import com.vaxify.app.dtos.*;

public interface VaccineService {

    VaccineResponseDTO createVaccine(VaccineRequestDTO dto, String staffEmail);

    VaccineResponseDTO updateVaccine(Long id, VaccineRequestDTO dto, String staffEmail);

    void deleteVaccine(Long id, String staffEmail);

    VaccineResponseDTO getVaccineById(Long id);

    // for admin or general listing
    List<VaccineResponseDTO> getAllVaccines();

    // for staff dashboard
    List<VaccineResponseDTO> getVaccinesByStaff(String staffEmail);

    // for public booking page
    List<VaccineResponseDTO> getVaccinesByHospitalId(Long hospitalId);
}