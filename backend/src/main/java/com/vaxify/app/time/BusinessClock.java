package com.vaxify.app.time;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class BusinessClock {

    private final ZoneId zone;

    public BusinessClock(@Value("${app.timezone:Asia/Kolkata}") String timezone) {
        this.zone = ZoneId.of(timezone);
    }

    public ZoneId zone() {
        return zone;
    }

    public LocalDate today() {
        return LocalDate.now(zone);
    }

    public LocalTime nowTime() {
        return LocalTime.now(zone);
    }

    public LocalDateTime now() {
        return LocalDateTime.now(zone);
    }
}
