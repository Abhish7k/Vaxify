package com.vaxify.app.service.impl;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.modelmapper.ModelMapper;
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

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final HospitalRepository hospitalRepository;
    private final AppointmentRepository appointmentRepository;
    private final ModelMapper modelMapper;
    private final SlotMapper slotMapper;

    // create slot
    @Override
    @Transactional
    public SlotResponse createSlot(SlotRequest dto) {

        // check for past date/time
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (dto.getDate().isBefore(today)) {
            throw new VaxifyException("Cannot create slots for a past date.");
        }

        if (dto.getDate().isEqual(today) && dto.getStartTime().isBefore(now)) {
            throw new VaxifyException("Cannot create slots for a past time today.");
        }

        if (dto.getDate().getDayOfWeek() == java.time.DayOfWeek.SUNDAY) {
            throw new VaxifyException("Cannot create slots on Sunday");
        }

        if (dto.getStartTime() != null && dto.getEndTime() != null && !dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new VaxifyException("Start time must be before end time.");
        }

        Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> new VaxifyException("Hospital not found"));

        // check for duplicate slot
        // fetch all slots for the day and check time
        List<Slot> daySlots = slotRepository.findByCenterIdAndDate(dto.getHospitalId(), dto.getDate());
        boolean exists = daySlots.stream()
                .anyMatch(s -> s.getStartTime().equals(dto.getStartTime()));

        if (exists) {
            throw new VaxifyException("Slot already exists for this time on the selected date.");
        }

        Slot slot = new Slot();

        modelMapper.map(dto, slot); // maps only matching fields

        slot.setCenter(hospital);

        slot.setBookedCount(0); // default

        return slotMapper.toResponse(slotRepository.save(slot));
    }

    // update slot
    @Override
    @Transactional
    public SlotResponse updateSlot(Long slotId, SlotRequest dto) {

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new VaxifyException("Slot not found"));

        // strict + skipNullEnabled = true → safe partial update
        modelMapper.map(dto, slot);

        // validation: past date/time check
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (slot.getDate().isBefore(today)) {
            throw new VaxifyException("Cannot move or keep a slot in a past date.");
        }

        if (slot.getDate().isEqual(today) && slot.getStartTime().isBefore(now)) {
            throw new VaxifyException("Cannot move or keep a slot in a past time today.");
        }

        // validation: capacity cannot be less than current bookings
        if (slot.getCapacity() < slot.getBookedCount()) {
            throw new VaxifyException("New capacity cannot be less than value of confirmed bookings ("
                    + slot.getBookedCount() + ")");
        }

        if (slot.getStartTime() != null && slot.getEndTime() != null
                && !slot.getStartTime().isBefore(slot.getEndTime())) {
            throw new VaxifyException("Start time must be before end time.");
        }

        // hospital change (only if hospitalId provided)
        if (dto.getHospitalId() != null) {
            Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                    .orElseThrow(() -> new VaxifyException("Hospital not found"));
            slot.setCenter(hospital);
        }

        return slotMapper.toResponse(slotRepository.save(slot));
    }

    // get slot by id
    @Override
    @Transactional(readOnly = true)
    public SlotResponse getSlotById(Long slotId) {

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new VaxifyException("Slot not found"));

        return slotMapper.toResponse(slot);
    }

    // get all slots
    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getAllSlots() {

        return slotRepository.findAll()
                .stream()
                .map(slotMapper::toResponse)
                .toList();
    }

    // get slots by hospital
    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getSlotsByHospital(Long hospitalId) {

        return slotRepository.findByCenterId(hospitalId)
                .stream()
                .map(slotMapper::toResponse)
                .toList();
    }

    // get slots by hospital and date
    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getSlotsByHospitalAndDate(
            Long hospitalId, LocalDate date) {

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

        // check if there are any ACTIVE (BOOKED) appointments
        List<Appointment> appointments = appointmentRepository.findBySlot(slot);

        boolean hasActiveBookings = appointments.stream()
                .anyMatch(a -> a.getStatus() == AppointmentStatus.BOOKED);

        if (hasActiveBookings) {
            throw new VaxifyException(
                    "Cannot delete a slot with active PENDING/BOOKED appointments. Please cancel them first.");
        }

        // if appointments are completed or cancelled, we must still delete them to
        // remove the db constraint
        // before we can delete the slot.
        if (!appointments.isEmpty()) {
            appointmentRepository.deleteAll(appointments);
        }

        slotRepository.deleteById(slotId);
    }
}
