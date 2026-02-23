package com.vaxify.app.mapper;

import com.vaxify.app.dtos.vaccine.VaccineRequest;
import com.vaxify.app.dtos.vaccine.VaccineResponse;
import com.vaxify.app.entities.Vaccine;
import org.springframework.stereotype.Component;

@Component
public class VaccineMapper {

    public VaccineResponse toResponse(Vaccine vaccine) {
        if (vaccine == null) {
            return null;
        }

        return VaccineResponse.builder()
                .id(vaccine.getId())
                .name(vaccine.getName()) // Keeping name as it's a valid field and no clear instruction to remove it
                .type(vaccine.getType())
                .manufacturer(vaccine.getManufacturer())
                .stock(vaccine.getStock())
                .capacity(vaccine.getCapacity())
                .hospitalId(vaccine.getHospital().getId())
                .hospitalName(vaccine.getHospital().getName())
                .build();
    }

    public Vaccine toEntity(VaccineRequest dto) {
        if (dto == null) {
            return null;
        }

        Vaccine vaccine = new Vaccine();

        vaccine.setName(dto.getName());
        vaccine.setType(dto.getType());
        vaccine.setManufacturer(dto.getManufacturer());
        vaccine.setStock(dto.getStock());
        vaccine.setCapacity(dto.getCapacity());

        return vaccine;
    }

    public void updateEntity(Vaccine vaccine, VaccineRequest dto) {
        if (dto == null) {
            return;
        }

        if (dto.getName() != null) {
            vaccine.setName(dto.getName());
        }

        if (dto.getType() != null) {
            vaccine.setType(dto.getType());
        }

        if (dto.getManufacturer() != null) {
            vaccine.setManufacturer(dto.getManufacturer());
        }

        if (dto.getStock() != null) {
            vaccine.setStock(dto.getStock());
        }

        if (dto.getCapacity() != null) {
            vaccine.setCapacity(dto.getCapacity());
        }
    }
}
