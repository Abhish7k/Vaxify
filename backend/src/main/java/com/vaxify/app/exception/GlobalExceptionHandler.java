package com.vaxify.app.exception;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException ex) {
        return error(HttpStatus.UNAUTHORIZED, ex.getMessage(), "unauthorized");
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(ForbiddenException ex) {
        return error(HttpStatus.FORBIDDEN, ex.getMessage(), "forbidden");
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage(), "not_found");
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(ConflictException ex) {
        return error(HttpStatus.CONFLICT, ex.getMessage(), "conflict");
    }

    @ExceptionHandler(AiUpstreamException.class)
    public ResponseEntity<Map<String, Object>> handleAiUpstream(AiUpstreamException ex) {
        log.warn(
                "AI upstream mapped requestId={} code={} httpStatus={} retryAfterSeconds={} message={}",
                ex.getRequestId(),
                ex.getCode(),
                ex.getHttpStatus().value(),
                ex.getRetryAfterSeconds(),
                ex.getMessage()
        );

        Map<String, Object> body = baseError(ex.getMessage(), ex.getCode());
        if (ex.getRequestId() != null && !ex.getRequestId().isBlank()) {
            body.put("requestId", ex.getRequestId());
        }
        if (ex.getRetryAfterSeconds() != null && ex.getRetryAfterSeconds() > 0) {
            body.put("retryAfterSeconds", ex.getRetryAfterSeconds());
        }

        HttpHeaders headers = new HttpHeaders();
        if (ex.getRequestId() != null && !ex.getRequestId().isBlank()) {
            headers.add("X-Request-Id", ex.getRequestId());
        }
        if (ex.getRetryAfterSeconds() != null && ex.getRetryAfterSeconds() > 0) {
            headers.add(HttpHeaders.RETRY_AFTER, String.valueOf(ex.getRetryAfterSeconds()));
        }

        return new ResponseEntity<>(body, headers, ex.getHttpStatus());
    }

    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<Map<String, Object>> handleServiceUnavailable(ServiceUnavailableException ex) {
        log.warn("Upstream service unavailable: {}", ex.getMessage());
        return error(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), "service_unavailable");
    }

    @ExceptionHandler(VaxifyException.class)
    public ResponseEntity<Map<String, Object>> handleVaxifyException(VaxifyException ex) {
        log.warn("Client error: {}", ex.getMessage());
        return error(HttpStatus.BAD_REQUEST, ex.getMessage(), "validation_error");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "error");
        body.put("code", "validation_error");

        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = error instanceof FieldError fieldError ? fieldError.getField() : error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            body.put(fieldName, errorMessage);
            body.putIfAbsent("message", errorMessage);
        });

        if (!body.containsKey("message")) {
            body.put("message", "Validation failed");
        }

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .findFirst()
                .map(v -> v.getMessage())
                .orElse("Validation failed");
        return error(HttpStatus.BAD_REQUEST, message, "validation_error");
    }

    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            DateTimeParseException.class,
            IllegalArgumentException.class
    })
    public ResponseEntity<Map<String, Object>> handleBadRequest(Exception ex) {
        log.warn("Malformed request: {}", ex.getClass().getSimpleName());
        return error(HttpStatus.BAD_REQUEST, "Invalid request", "validation_error");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getClass().getSimpleName());
        return error(HttpStatus.CONFLICT, uniquenessMessage(ex), "conflict");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return error(HttpStatus.FORBIDDEN, "Access denied", "forbidden");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
        return error(HttpStatus.UNAUTHORIZED, "Authentication required", "unauthorized");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        log.error("Unexpected error", ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", "unknown");
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message, String code) {
        return new ResponseEntity<>(baseError(message, code), status);
    }

    private Map<String, Object> baseError(String message, String code) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", message);
        body.put("status", "error");
        if (code != null && !code.isBlank()) {
            body.put("code", code);
        }
        return body;
    }

    private String uniquenessMessage(DataIntegrityViolationException ex) {
        Throwable cause = ex.getMostSpecificCause();
        String detail = (cause != null ? cause.getMessage() : ex.getMessage());
        String text = detail == null ? "" : detail.toLowerCase();

        if (text.contains("uk_appointments_active_user_slot") || text.contains("booked_slot_key")) {
            return "You already have a booking for this slot";
        }
        if (text.contains("uk_slots_hospital_date_start")) {
            return "Slot already exists for this time on selected date";
        }
        if (text.contains("uk_users_email")) {
            return "Email is already registered";
        }
        if (text.contains("uk_hospitals_staff_user")) {
            return "Hospital already registered for this staff";
        }

        return "A conflicting record already exists";
    }
}
