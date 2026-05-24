package com.example.backend.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import java.util.Set;

import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = GlobalExceptionHandlerTest.ExceptionStubController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("GlobalExceptionHandler")
class GlobalExceptionHandlerTest {

    private static final String VALIDATION_FAILED = "Validation failed.";
    private static final String BUSINESS_ERROR = "Business rule failed.";
    private static final String NOT_FOUND_ERROR = "Resource not found.";
    private static final String TOKEN_EXPIRED = "Access token has expired";
    private static final String TOKEN_INVALID = "Access token is invalid or tampered";

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;

    GlobalExceptionHandlerTest(MockMvc mockMvc, ObjectMapper objectMapper) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
    }

    @Nested
    @DisplayName("validation exceptions")
    class ValidationExceptions {

        @Test
        @DisplayName("should return 400 and errors map when request body validation fails")
        void shouldReturn400AndErrorsMapWhenRequestBodyValidationFails() throws Exception {
            mockMvc.perform(post("/stub/body-validation")
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new BodyValidationRequest(""))))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.message").value(VALIDATION_FAILED))
                    .andExpect(jsonPath("$.data").doesNotExist())
                    .andExpect(jsonPath("$.errors.name").value("Name is required."))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("should return 400 and errors map when method validation fails")
        void shouldReturn400AndErrorsMapWhenMethodValidationFails() throws Exception {
            mockMvc.perform(get("/stub/method-validation").param("count", "1"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.message").value(VALIDATION_FAILED))
                    .andExpect(jsonPath("$.data").doesNotExist())
                    .andExpect(jsonPath("$.errors.count").exists())
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("should return 400 when constraint violation exception is thrown")
        void shouldReturn400WhenConstraintViolationExceptionIsThrown() throws Exception {
            mockMvc.perform(get("/stub/constraint-violation"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.message").value(VALIDATION_FAILED))
                    .andExpect(jsonPath("$.data").doesNotExist())
                    .andExpect(jsonPath("$.errors.field").value("must not be blank"))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }
    }

    @Nested
    @DisplayName("domain exceptions")
    class DomainExceptions {

        @Test
        @DisplayName("should return 400 when BusinessException is thrown")
        void shouldReturn400WhenBusinessExceptionIsThrown() throws Exception {
            mockMvc.perform(get("/stub/business"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.message").value(BUSINESS_ERROR))
                    .andExpect(jsonPath("$.data").doesNotExist())
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("should return 404 when ResourceNotFoundException is thrown")
        void shouldReturn404WhenResourceNotFoundExceptionIsThrown() throws Exception {
            mockMvc.perform(get("/stub/not-found"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.message").value(NOT_FOUND_ERROR))
                    .andExpect(jsonPath("$.data").doesNotExist())
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }
    }

    @Nested
    @DisplayName("auth exceptions")
    class AuthExceptions {

        @Test
        @DisplayName("should return 401 when TokenExpiredException is thrown")
        void shouldReturn401WhenTokenExpiredExceptionIsThrown() throws Exception {
            mockMvc.perform(get("/stub/token-expired"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(401))
                    .andExpect(jsonPath("$.message").value(TOKEN_EXPIRED))
                    .andExpect(jsonPath("$.data").doesNotExist());
        }

        @Test
        @DisplayName("should return 401 when InvalidTokenException is thrown")
        void shouldReturn401WhenInvalidTokenExceptionIsThrown() throws Exception {
            mockMvc.perform(get("/stub/invalid-token"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(401))
                    .andExpect(jsonPath("$.message").value(TOKEN_INVALID))
                    .andExpect(jsonPath("$.data").doesNotExist());
        }

        @Test
        @DisplayName("should return 401 when AuthenticationException is thrown")
        void shouldReturn401WhenAuthenticationExceptionIsThrown() throws Exception {
            mockMvc.perform(get("/stub/authentication"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(401))
                    .andExpect(jsonPath("$.message").value("Invalid credentials."))
                    .andExpect(jsonPath("$.data").doesNotExist());
        }

        @Test
        @DisplayName("should return 403 when AccessDeniedException is thrown")
        void shouldReturn403WhenAccessDeniedExceptionIsThrown() throws Exception {
            mockMvc.perform(get("/stub/access-denied"))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(403))
                    .andExpect(jsonPath("$.message").value("Access denied."))
                    .andExpect(jsonPath("$.data").doesNotExist());
        }
    }

    @Nested
    @DisplayName("fallback")
    class Fallback {

        @Test
        @DisplayName("should return 500 when unexpected exception is thrown")
        void shouldReturn500WhenUnexpectedExceptionIsThrown() throws Exception {
            mockMvc.perform(get("/stub/unexpected"))
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(500))
                    .andExpect(jsonPath("$.message").value("An unexpected error occurred."))
                    .andExpect(jsonPath("$.data").doesNotExist());
        }
    }

    @Validated
    @RestController
    @RequestMapping("/stub")
    static class ExceptionStubController {

        @PostMapping("/body-validation")
        void bodyValidation(@Valid @RequestBody BodyValidationRequest request) {
        }

        @GetMapping("/method-validation")
        void methodValidation(@RequestParam @Min(value = 5, message = "Count must be at least 5.") int count) {
        }

        @GetMapping("/constraint-violation")
        void constraintViolation() {
            ConstraintViolation<?> violation = Mockito.mock(ConstraintViolation.class);
            Path path = Mockito.mock(Path.class);

            when(path.toString()).thenReturn("field");
            when(violation.getPropertyPath()).thenReturn(path);
            when(violation.getMessage()).thenReturn("must not be blank");

            throw new ConstraintViolationException(Set.of(violation));
        }

        @GetMapping("/business")
        void business() {
            throw new BusinessException(BUSINESS_ERROR);
        }

        @GetMapping("/not-found")
        void notFound() {
            throw new ResourceNotFoundException(NOT_FOUND_ERROR);
        }

        @GetMapping("/token-expired")
        void tokenExpired() {
            throw new TokenExpiredException(TOKEN_EXPIRED);
        }

        @GetMapping("/invalid-token")
        void invalidToken() {
            throw new InvalidTokenException(TOKEN_INVALID);
        }

        @GetMapping("/authentication")
        void authentication() {
            throw new BadCredentialsException("Bad credentials");
        }

        @GetMapping("/access-denied")
        void accessDenied() {
            throw new AccessDeniedException("Forbidden");
        }

        @GetMapping("/unexpected")
        void unexpected() {
            throw new RuntimeException("Boom");
        }
    }

    record BodyValidationRequest(
            @NotBlank(message = "Name is required.")
            String name
    ) {
    }
}