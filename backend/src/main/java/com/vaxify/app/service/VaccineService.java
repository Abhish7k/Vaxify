package com.vaxify.app.service;

import java.util.List;
import com.vaxify.app.dtos.vaccine.VaccineRequest;
import com.vaxify.app.dtos.vaccine.VaccineResponse;
import com.vaxify.app.entities.Vaccine;

public interface VaccineService {

    VaccineResponse createVaccine(VaccineRequest dto, String staffEmail);

    VaccineResponse updateVaccine(Long id, VaccineRequest dto, String staffEmail);

    void deleteVaccine(Long id, String staffEmail);

    VaccineResponse getVaccineById(Long id);

    // for admin or general listing
    List<VaccineResponse> getAllVaccines();

    // for staff dashboard
    List<VaccineResponse> getVaccinesByStaff(String staffEmail);

    // for public booking page
    List<VaccineResponse> getVaccinesByHospitalId(Long hospitalId);

    void checkStockAlerts(Vaccine vaccine);
}