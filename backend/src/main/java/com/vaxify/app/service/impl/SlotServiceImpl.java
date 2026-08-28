package com.vaxify.app.service.impl;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vaxify.app.dtos.slot.BulkSlotRequest;
import com.vaxify.app.dtos.slot.BulkSlotResponse;
import com.vaxify.app.dtos.slot.SlotRequest;
import com.vaxify.app.dtos.slot.SlotResponse;
import com.vaxify.app.entities.Hospital;
import com.vaxify.app.entities.Slot;
import com.vaxify.app.entities.enums.SlotStatus;
import com.vaxify.app.exception.ConflictException;
import com.vaxify.app.exception.ForbiddenException;
import com.vaxify.app.exception.ResourceNotFoundException;
import com.vaxify.app.exception.VaxifyException;
import com.vaxify.app.mapper.SlotMapper;
import com.vaxify.app.repository.AppointmentRepository;
import com.vaxify.app.repository.SlotRepository;
import com.vaxify.app.service.HospitalService;
import com.vaxify.app.service.SlotService;
import com.vaxify.app.time.BusinessClock;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final AppointmentRepository appointmentRepository;
    private final HospitalService hospitalService;
    private final SlotMapper slotMapper;
    private final BusinessClock businessClock;

    @Override
    @Transactional
    public SlotResponse createSlot(SlotRequest dto, String staffEmail) {
        Hospital hospital = hospitalService.requireApprovedStaffHospital(staffEmail);

        validateNewSlotSchedule(dto);

        boolean exists = slotRepository.existsByCenterIdAndDateAndStartTime(hospital.getId(), dto.getDate(),
                dto.getStartTime());

        if (exists) {
            throw new ConflictException("Slot already exists for this time on selected date");
        }

        Slot saved = persistNewSlot(dto, hospital);

        log.info("Slot created: ID={} (Hospital: {} on {} at {})",
                saved.getId(), hospital.getName(), saved.getDate(), saved.getStartTime());

        return slotMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BulkSlotResponse createSlotsBulk(BulkSlotRequest request, String staffEmail) {
        Hospital hospital = hospitalService.requireApprovedStaffHospital(staffEmail);

        List<SlotRequest> slots = request.getSlots();
        Set<String> seen = new HashSet<>();

        for (SlotRequest dto : slots) {
            String key = dto.getDate() + "|" + dto.getStartTime();
            if (!seen.add(key)) {
                throw new VaxifyException("Duplicate slots in the same request");
            }
            validateNewSlotSchedule(dto);
        }

        List<SlotResponse> created = new ArrayList<>();
        int skipped = 0;

        for (SlotRequest dto : slots) {
            boolean exists = slotRepository.existsByCenterIdAndDateAndStartTime(
                    hospital.getId(), dto.getDate(), dto.getStartTime());
            if (exists) {
                skipped++;
                continue;
            }

            Slot saved = persistNewSlot(dto, hospital);
            created.add(slotMapper.toResponse(saved));
        }

        log.info("Bulk slots created: hospital={}, created={}, skipped={}",
                hospital.getName(), created.size(), skipped);

        return BulkSlotResponse.builder()
                .created(created.size())
                .skipped(skipped)
                .createdSlots(created)
                .build();
    }

    @Override
    @Transactional
    public SlotResponse updateSlot(Long slotId, SlotRequest dto, String staffEmail) {
        Slot slot = requireOwnedSlot(slotId, staffEmail);

        boolean dateTimeChanged = (dto.getDate() != null && !dto.getDate().equals(slot.getDate()))
                || (dto.getStartTime() != null && !dto.getStartTime().equals(slot.getStartTime()))
                || (dto.getEndTime() != null && !dto.getEndTime().equals(slot.getEndTime()));

        if (dateTimeChanged && appointmentRepository.existsBySlot(slot)) {
            throw new ConflictException("Cannot change date or time of a slot that has appointments");
        }

        slotMapper.updateEntity(slot, dto);
        slotMapper.applyDerivedStatus(slot);

        LocalDate today = businessClock.today();
        LocalTime now = businessClock.nowTime();

        if (slot.getDate().isBefore(today)) {
            throw new VaxifyException("Cannot move or keep slot in past date");
        }

        if (slot.getDate().isEqual(today) && slot.getStartTime().isBefore(now)) {
            throw new VaxifyException("Cannot move or keep slot in past time today");
        }

        if (slot.getCapacity() < slot.getBookedCount()) {
            throw new VaxifyException("Capacity cannot be less than confirmed bookings ("
                    + slot.getBookedCount() + ")");
        }

        if (slot.getStartTime() != null && slot.getEndTime() != null
                && !slot.getStartTime().isBefore(slot.getEndTime())) {
            throw new VaxifyException("Start time must be before end time.");
        }

        Slot saved = slotRepository.save(slot);

        log.info("Slot updated: ID={} (Hospital: {})", saved.getId(), saved.getCenter().getName());

        return slotMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SlotResponse getSlotById(Long slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        return slotMapper.toResponse(slot);
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
    public void deleteSlot(Long slotId, String staffEmail) {
        Slot slot = requireOwnedSlot(slotId, staffEmail);

        boolean hasHistory = appointmentRepository.existsBySlot(slot);

        if (hasHistory) {
            throw new ConflictException("Cannot delete slot with existing appointment history");
        }

        slotRepository.deleteById(slotId);

        log.info("Slot deleted: ID={} (Hospital: {})", slotId, slot.getCenter().getName());
    }

    @Override
    @Transactional
    public Slot findEntityByDetails(Long centerId, LocalDate date, LocalTime time) {
        return slotRepository.findByCenterIdAndDateAndStartTimeForUpdate(centerId, date, time)
                .orElseThrow(() -> new ResourceNotFoundException("No available slot found for the selected time"));
    }

    @Override
    @Transactional
    public void reserveSlot(Slot slot) {
        Slot locked = slotRepository.findByIdForUpdate(slot.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (locked.getBookedCount() >= locked.getCapacity()) {
            throw new ConflictException("Selected slot is already full");
        }

        locked.setBookedCount(locked.getBookedCount() + 1);

        if (locked.getBookedCount() >= locked.getCapacity()) {
            locked.setStatus(SlotStatus.FULL);
        }

        slotRepository.save(locked);

        log.info("Slot reserved: ID={}, New BookedCount={} (Hospital: {})",
                locked.getId(), locked.getBookedCount(), locked.getCenter().getName());
    }

    @Override
    @Transactional
    public void releaseSlot(Slot slot) {
        Slot locked = slotRepository.findByIdForUpdate(slot.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (locked.getBookedCount() > 0) {
            locked.setBookedCount(locked.getBookedCount() - 1);
        }

        if (locked.getStatus() == SlotStatus.FULL && locked.getBookedCount() < locked.getCapacity()) {
            locked.setStatus(SlotStatus.AVAILABLE);
        }

        slotRepository.save(locked);

        log.info("Slot released: ID={}, New BookedCount={} (Hospital: {})",
                locked.getId(), locked.getBookedCount(), locked.getCenter().getName());
    }

    @Override
    public void validateAvailable(Slot slot, LocalDate date, LocalTime time) {
        if (LocalDateTime.of(date, time).isBefore(businessClock.now())) {
            throw new VaxifyException("Cannot book a slot for a time that has already passed");
        }

        if (slot.getStatus() == SlotStatus.FULL || slot.getBookedCount() >= slot.getCapacity()) {
            throw new ConflictException("Selected slot is already full");
        }
    }

    private void validateNewSlotSchedule(SlotRequest dto) {
        LocalDate today = businessClock.today();
        LocalTime now = businessClock.nowTime();

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
    }

    private Slot persistNewSlot(SlotRequest dto, Hospital hospital) {
        Slot slot = slotMapper.toEntity(dto);
        slot.setCenter(hospital);
        slot.setBookedCount(0);
        slotMapper.applyDerivedStatus(slot);
        return slotRepository.save(slot);
    }

    private Slot requireOwnedSlot(Long slotId, String staffEmail) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        Hospital staffHospital = hospitalService.requireApprovedStaffHospital(staffEmail);

        if (slot.getCenter() == null || !slot.getCenter().getId().equals(staffHospital.getId())) {
            throw new ForbiddenException("You are not authorized to manage this slot");
        }

        return slot;
    }
}
