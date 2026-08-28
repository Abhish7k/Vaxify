package com.vaxify.app.util;

import java.time.LocalDateTime;

import com.vaxify.app.entities.Slot;

public final class SlotTimes {

    private SlotTimes() {
    }

    public static LocalDateTime startAt(Slot slot) {
        return LocalDateTime.of(slot.getDate(), slot.getStartTime());
    }

    public static LocalDateTime endAt(Slot slot) {
        return LocalDateTime.of(slot.getDate(), slot.getEndTime());
    }

    public static boolean hasStarted(Slot slot, LocalDateTime now) {
        return !startAt(slot).isAfter(now);
    }

    public static boolean hasEnded(Slot slot, LocalDateTime now) {
        return endAt(slot).isBefore(now);
    }
}
