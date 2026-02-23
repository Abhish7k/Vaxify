package com.vaxify.app.service.impl;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vaxify.app.dtos.slot.SlotRequest;
import com.vaxify.app.dtos.slot.SlotResponse;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.Slot;
import com.vaxify.app.repository.AppointmentRepository;
import com.vaxify.app.repository.HospitalRepository;
import com.vaxify.app.repository.SlotRepository;
import com.vaxify.app.entities.Appointment;
import com.vaxify.app.entities.enums.AppointmentStatus;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.service.SlotService;
import com.vaxify.app.mapper.SlotMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final HospitalRepository hospitalRepository;
    private final AppointmentRepository appointmentRepository;
    private final SlotMapper slotMapper;

    @Override
    @Transactional
    public SlotResponse createSlot(SlotRequest dto) {
        // check past date/time
        LocalDate today = LocalDate.now();

        LocalTime now = LocalTime.now();

        if (dto.getDate().isBefore(today)) {
            throw new VaxifyException("Cannot create slots for a past date.");
        }

        if (dto.getDate().isEqual(today) && dto.getStartTime().isBefore(now)) {
            throw new VaxifyException("Cannot create slots for a past time today.");
        }

        if (dto.getDate().getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new VaxifyException("Cannot create slots on Sunday");
        }

        if (dto.getStartTime() != null && dto.getEndTime() != null && !dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new VaxifyException("Start time must be before end time.");
        }

        Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> new VaxifyException("Hospital not found"));

        // check duplicate slot
        List<Slot> daySlots = slotRepository.findByCenterIdAndDate(dto.getHospitalId(), dto.getDate());

        boolean exists = daySlots.stream()
                .anyMatch(s -> s.getStartTime().equals(dto.getStartTime()));

        if (exists) {
            throw new VaxifyException("Slot already exists for this time on selected date");
        }

        Slot slot = slotMapper.toEntity(dto);

        slot.setCenter(hospital);
        slot.setBookedCount(0);

        Slot saved = slotRepository.save(slot);

        log.info("Slot created: ID={} (Hospital: {} on {} at {})",
                saved.getId(), hospital.getName(), saved.getDate(), saved.getStartTime());

        return slotMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public SlotResponse updateSlot(Long slotId, SlotRequest dto) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new VaxifyException("Slot not found"));

        slotMapper.updateEntity(slot, dto);

        // validation for past date/time
        LocalDate today = LocalDate.now();

        LocalTime now = LocalTime.now();

        if (slot.getDate().isBefore(today)) {
            throw new VaxifyException("Cannot move or keep slot in past date");
        }

        if (slot.getDate().isEqual(today) && slot.getStartTime().isBefore(now)) {
            throw new VaxifyException("Cannot move or keep slot in past time today");
        }

        // check capacity against confirmed bookings
        if (slot.getCapacity() < slot.getBookedCount()) {
            throw new VaxifyException("Capacity cannot be less than confirmed bookings ("
                    + slot.getBookedCount() + ")");
        }

        if (slot.getStartTime() != null && slot.getEndTime() != null
                && !slot.getStartTime().isBefore(slot.getEndTime())) {
            throw new VaxifyException("Start time must be before end time.");
        }

        // change hospital if id provided
        if (dto.getHospitalId() != null) {
            Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                    .orElseThrow(() -> new VaxifyException("Hospital not found"));

            slot.setCenter(hospital);
        }

        Slot saved = slotRepository.save(slot);

        log.info("Slot updated: ID={} (Hospital: {})", saved.getId(), saved.getCenter().getName());

        return slotMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SlotResponse getSlotById(Long slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new VaxifyException("Slot not found"));

        return slotMapper.toResponse(slot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getAllSlots() {
        return slotRepository.findAll()
                .stream()
                .map(slotMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getSlotsByHospital(Long hospitalId) {
        return slotRepository.findByCenterId(hospitalId)
                .stream()
                .map(slotMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getSlotsByHospitalAndDate(Long hospitalId, LocalDate date) {
        return slotRepository.findByCenterIdAndDate(hospitalId, date)
                .stream()
                .map(slotMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteSlot(Long slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new VaxifyException("Slot not found"));

        // check active bookings
        List<Appointment> appts = appointmentRepository.findBySlot(slot);

        boolean hasActive = appts.stream()
                .anyMatch(a -> a.getStatus() == AppointmentStatus.BOOKED);

        if (hasActive) {
            throw new VaxifyException("Cannot delete slot with active bookings");
        }

        // remove appts to fix fk constraints
        if (!appts.isEmpty()) {
            appointmentRepository.deleteAll(appts);
        }

        slotRepository.deleteById(slotId);

        log.info("Slot deleted: ID={} (Hospital: {})", slotId, slot.getCenter().getName());
    }
}
