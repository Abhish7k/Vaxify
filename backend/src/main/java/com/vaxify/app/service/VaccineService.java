package com.vaxify.app.service;

import java.util.List;
import com.vaxify.app.dtos.*;

public interface VaccineService {

    VaccineResponseDTO createVaccine(VaccineRequestDTO dto);
    VaccineResponseDTO updateVaccine(Long id, VaccineRequestDTO dto);
    void deleteVaccine(Long id);

    VaccineResponseDTO getVaccineById(Long id);
    List<VaccineResponseDTO> getAllVaccines();
}