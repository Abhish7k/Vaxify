package com.vaxify.app.mapper;

import com.vaxify.app.dtos.vaccine.VaccineResponse;
import com.vaxify.app.dtos.hospital.HospitalResponse;
import com.vaxify.app.dtos.hospital.HospitalSummaryResponse;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.Vaccine;
import com.vaxify.app.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class HospitalMapper {

        private final S3Service s3Service;

        public HospitalResponse toResponse(Hospital hospital, List<Vaccine> vaccines, boolean includeLowStock,
                        boolean isPrivileged) {
                List<VaccineResponse> vaccineResponses = vaccines == null ? List.of()
                                : vaccines.stream()
                                                .filter(v -> {
                                                        if (includeLowStock)
                                                                return true;
                                                        if (v.getCapacity() != null && v.getCapacity() > 0) {
                                                                return v.getStock() >= (v.getCapacity() * 0.2);
                                                        }
                                                        return true;
                                                })
                                                .map(this::toVaccineResponse)
                                                .collect(Collectors.toList());

                return HospitalResponse.builder()
                                .id(hospital.getId())
                                .name(hospital.getName())
                                .address(hospital.getAddress())
                                .licenseNumber(isPrivileged ? hospital.getLicenseNumber() : null)
                                .documentUrl(isPrivileged ? s3Service.resolveUrl(hospital.getDocumentUrl()) : null)
                                .city(hospital.getCity())
                                .state(hospital.getState())
                                .pincode(hospital.getPincode())
                                .status(hospital.getStatus())
                                .staffName(hospital.getStaffUser() != null ? hospital.getStaffUser().getName() : null)
                                .staffEmail(hospital.getStaffUser() != null ? hospital.getStaffUser().getEmail() : null)
                                .staffPhone(hospital.getStaffUser() != null ? hospital.getStaffUser().getPhone() : null)
                                .staffCreatedAt(hospital.getStaffUser() != null ? hospital.getStaffUser().getCreatedAt()
                                                : null)
                                .availableVaccines(vaccineResponses)
                                .build();
        }

        public HospitalSummaryResponse toSummaryResponse(Hospital hospital, List<String> vaccineNames) {
                return HospitalSummaryResponse.builder()
                                .id(hospital.getId())
                                .name(hospital.getName())
                                .address(hospital.getAddress())
                                .city(hospital.getCity())
                                .state(hospital.getState())
                                .pincode(hospital.getPincode())
                                .availableVaccineNames(vaccineNames)
                                .build();
        }

        private VaccineResponse toVaccineResponse(Vaccine v) {
                return VaccineResponse.builder()
                                .id(v.getId())
                                .name(v.getName())
                                .type(v.getType())
                                .manufacturer(v.getManufacturer())
                                .stock(v.getStock())
                                .capacity(v.getCapacity())
                                .lastUpdated(v.getCreatedAt() != null ? v.getCreatedAt().toString() : null)
                                .build();
        }

        public List<HospitalResponse> toResponses(List<Hospital> hospitals, List<Vaccine> allVaccines,
                        boolean includeLowStock, boolean isPrivileged) {
                if (hospitals == null || hospitals.isEmpty()) {
                        return List.of();
                }

                Map<Long, List<Vaccine>> vaccinesByHospital = allVaccines == null ? Map.of()
                                : allVaccines.stream()
                                                .collect(Collectors.groupingBy(v -> v.getHospital().getId()));

                return hospitals.stream()
                                .map(hospital -> toResponse(
                                                hospital,
                                                vaccinesByHospital.getOrDefault(hospital.getId(), List.of()),
                                                includeLowStock,
                                                isPrivileged))
                                .collect(Collectors.toList());
        }

        public List<HospitalSummaryResponse> toSummaryResponses(List<Hospital> hospitals, List<Vaccine> allVaccines) {
                if (hospitals == null || hospitals.isEmpty()) {
                        return List.of();
                }

                Map<Long, List<String>> vaccineNamesByHospital = allVaccines == null ? Map.of()
                                : allVaccines.stream()
                                                .collect(Collectors.groupingBy(
                                                                v -> v.getHospital().getId(),
                                                                Collectors.mapping(Vaccine::getName,
                                                                                Collectors.toList())));

                return hospitals.stream()
                                .map(hospital -> toSummaryResponse(
                                                hospital,
                                                vaccineNamesByHospital.getOrDefault(hospital.getId(), List.of())))
                                .collect(Collectors.toList());
        }

}
