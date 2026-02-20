package com.vaxify.app.mapper;

import com.vaxify.app.dtos.vaccine.VaccineResponse;
import com.vaxify.app.entities.Vaccine;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class VaccineMapper {

    public VaccineResponse toResponse(Vaccine vaccine) {
        if (vaccine == null) {
            return null;
        }

        return VaccineResponse.builder()
                .id(vaccine.getId())
                .name(vaccine.getName())
                .type(vaccine.getType())
                .manufacturer(vaccine.getManufacturer())
                .stock(vaccine.getStock())
                .capacity(vaccine.getCapacity())
                .lastUpdated(vaccine.getCreatedAt() != null ? vaccine.getCreatedAt().toString() : null)
                .build();
    }

    public List<VaccineResponse> toResponses(List<Vaccine> vaccines) {
        return vaccines.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
