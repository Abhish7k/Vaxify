package com.vaxify.app.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(VaxifyException.class)
    public ResponseEntity<Map<String, String>> handleVaxifyException(VaxifyException ex) {
        // log a nice, clean message to the console instead of a full stack trace
        log.error(">>> [Vaxify App Error]: {}", ex.getMessage());

        Map<String, String> error = new HashMap<>();

        error.put("message", ex.getMessage());
        error.put("status", "error");

        HttpStatus status = HttpStatus.BAD_REQUEST;

        if ("Invalid credentials".equalsIgnoreCase(ex.getMessage())) {
            status = HttpStatus.UNAUTHORIZED;
        }

        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        log.error(">>> [Runtime Error]: {}", ex.getMessage());

        Map<String, String> error = new HashMap<>();

        error.put("message", ex.getMessage());
        error.put("status", "error");

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        log.error(">>> [Unexpected Error]: {}", ex.getMessage());

        Map<String, String> error = new HashMap<>();

        error.put("message", "An unexpected error occurred");
        error.put("status", "error");

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();

            log.error(">>> [Validation Error]: {} - {}", fieldName, errorMessage);
            errors.put(fieldName, errorMessage);

            // helpful for frontend to show at least one error
            if (!errors.containsKey("message")) {
                errors.put("message", errorMessage);
            }
        });

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}
