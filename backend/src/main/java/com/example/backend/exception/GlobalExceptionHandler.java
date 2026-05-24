package com.example.backend.exception;

import com.example.backend.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return respond(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // ------------------------------------------------------------------ //
    //  Validation
    // ------------------------------------------------------------------ //

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return respond(HttpStatus.BAD_REQUEST, "Validation failed.", errors);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    ResponseEntity<ApiResponse<Void>> handleHandlerMethodValidation(
            HandlerMethodValidationException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getParameterValidationResults().forEach(result ->
                result.getResolvableErrors().forEach(error ->
                        errors.put(
                                result.getMethodParameter().getParameterName(),
                                error.getDefaultMessage()
                        )
                )
        );
        return respond(HttpStatus.BAD_REQUEST, "Validation failed.", errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiResponse<Void>> handleConstraintViolation(
            ConstraintViolationException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getConstraintViolations()
                .forEach(v -> errors.put(v.getPropertyPath().toString(), v.getMessage()));
        return respond(HttpStatus.BAD_REQUEST, "Validation failed.", errors);
    }

    // ------------------------------------------------------------------ //
    //  Business & Domain
    // ------------------------------------------------------------------ //

    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        return respond(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // ------------------------------------------------------------------ //
    //  Auth
    // ------------------------------------------------------------------ //

    @ExceptionHandler({TokenExpiredException.class, InvalidTokenException.class})
    ResponseEntity<ApiResponse<Void>> handleTokenExceptions(RuntimeException ex) {
        return respond(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        return respond(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        return respond(HttpStatus.FORBIDDEN, "Access denied.");
    }

    // ------------------------------------------------------------------ //
    //  Fallback
    // ------------------------------------------------------------------ //

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex) {
        log.error("Unexpected API error", ex);
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.");
    }

    // ------------------------------------------------------------------ //
    //  Helpers
    // ------------------------------------------------------------------ //

    private ResponseEntity<ApiResponse<Void>> respond(HttpStatus status, String message) {
        return ResponseEntity.status(status)
                .body(ApiResponse.error(status.value(), message));
    }

    private ResponseEntity<ApiResponse<Void>> respond(
            HttpStatus status,
            String message,
            Map<String, String> errors) {
        return ResponseEntity.status(status)
                .body(ApiResponse.error(status.value(), message, errors));
    }
}