package com.example.backend.controller;

import com.example.backend.dto.request.ChangePasswordRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.response.AdminMeResponse;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.exception.BusinessException;
import com.example.backend.exception.GlobalExceptionHandler;
import com.example.backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("AuthController")
class AuthControllerTest {

    private static final UUID ADMIN_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final String ADMIN_EMAIL = "admin@test.local";
    private static final String PASSWORD = "Admin12345";
    private static final String ACCESS_TOKEN = "access-token";
    private static final String REFRESH_COOKIE_NAME = "le_tacos_refresh";
    private static final String REFRESH_TOKEN = "refresh-token";
    private static final Instant EXPIRES_AT = Instant.parse("2030-01-01T00:00:00Z");

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    AuthControllerTest(MockMvc mockMvc, ObjectMapper objectMapper) {
        this.mockMvc = mockMvc;
        this.objectMapper = objectMapper;
    }

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("should return 200 and auth response when login succeeds")
        void shouldReturn200AndAuthResponseWhenLoginSucceeds() throws Exception {
            when(authService.login(any(LoginRequest.class), any(HttpServletRequest.class), any(HttpServletResponse.class)))
                    .thenReturn(authResponse());

            mockMvc.perform(post("/api/auth/login")
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LoginRequest(ADMIN_EMAIL, PASSWORD))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.status").value(200))
                    .andExpect(jsonPath("$.message").value("Login successful"))
                    .andExpect(jsonPath("$.data.accessToken").value(ACCESS_TOKEN))
                    .andExpect(jsonPath("$.data.expiresInSeconds").value(1200))
                    .andExpect(jsonPath("$.data.mustChangePassword").value(false));
        }

        @Test
        @DisplayName("should return 401 when credentials are invalid")
        void shouldReturn401WhenCredentialsAreInvalid() throws Exception {
            when(authService.login(any(LoginRequest.class), any(HttpServletRequest.class), any(HttpServletResponse.class)))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            mockMvc.perform(post("/api/auth/login")
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LoginRequest(ADMIN_EMAIL, PASSWORD))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.status").value(401))
                    .andExpect(jsonPath("$.message").value("Invalid credentials."));
        }

        @Test
        @DisplayName("should return 400 when login request is invalid")
        void shouldReturn400WhenLoginRequestIsInvalid() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LoginRequest("invalid", "short"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.errors.email").exists())
                    .andExpect(jsonPath("$.errors.password").exists());
        }
    }

    @Nested
    @DisplayName("refresh")
    class Refresh {

        @Test
        @DisplayName("should return 200 and new auth response when refresh succeeds")
        void shouldReturn200AndNewAuthResponseWhenRefreshSucceeds() throws Exception {
            when(authService.refresh(eq(REFRESH_TOKEN), any(HttpServletRequest.class), any(HttpServletResponse.class)))
                    .thenReturn(authResponse());

            mockMvc.perform(post("/api/auth/refresh")
                            .cookie(new jakarta.servlet.http.Cookie(REFRESH_COOKIE_NAME, REFRESH_TOKEN)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Token refreshed successfully"))
                    .andExpect(jsonPath("$.data.accessToken").value(ACCESS_TOKEN));
        }

        @Test
        @DisplayName("should return 400 when refresh cookie is missing")
        void shouldReturn400WhenRefreshCookieIsMissing() throws Exception {
            when(authService.refresh(isNull(), any(HttpServletRequest.class), any(HttpServletResponse.class)))
                    .thenThrow(new BusinessException("Refresh token is missing."));

            mockMvc.perform(post("/api/auth/refresh"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("Refresh token is missing."));
        }
    }

    @Nested
    @DisplayName("logout")
    class Logout {

        @Test
        @DisplayName("should return 204 when logout succeeds")
        void shouldReturn204WhenLogoutSucceeds() throws Exception {
            mockMvc.perform(post("/api/auth/logout")
                            .cookie(new jakarta.servlet.http.Cookie(REFRESH_COOKIE_NAME, REFRESH_TOKEN)))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            verify(authService).logout(eq(REFRESH_TOKEN), any(HttpServletResponse.class));
        }
    }

    @Nested
    @DisplayName("me")
    class Me {

        @Test
        @DisplayName("should return 200 and current admin profile")
        void shouldReturn200AndCurrentAdminProfile() throws Exception {
            when(authService.me()).thenReturn(adminMeResponse());

            mockMvc.perform(get("/api/auth/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("User profile retrieved successfully"))
                    .andExpect(jsonPath("$.data.id").value(ADMIN_ID.toString()))
                    .andExpect(jsonPath("$.data.email").value(ADMIN_EMAIL));
        }
    }

    @Nested
    @DisplayName("change password")
    class ChangePassword {

        @Test
        @DisplayName("should return 204 when password is changed")
        void shouldReturn204WhenPasswordIsChanged() throws Exception {
            mockMvc.perform(post("/api/auth/change-password")
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new ChangePasswordRequest(PASSWORD, "NewAdmin12345")
                            )))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));
        }

        @Test
        @DisplayName("should return 400 when current password is wrong")
        void shouldReturn400WhenCurrentPasswordIsWrong() throws Exception {
            doThrow(new BusinessException("Current password is incorrect."))
                    .when(authService)
                    .changePassword(any(ChangePasswordRequest.class), any(HttpServletResponse.class));

            mockMvc.perform(post("/api/auth/change-password")
                            .contentType(APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new ChangePasswordRequest(PASSWORD, "NewAdmin12345")
                            )))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("Current password is incorrect."));
        }
    }

    private AuthResponse authResponse() {
        return AuthResponse.builder()
                .accessToken(ACCESS_TOKEN)
                .expiresInSeconds(1200L)
                .expiresAt(EXPIRES_AT)
                .mustChangePassword(false)
                .build();
    }

    private AdminMeResponse adminMeResponse() {
        return AdminMeResponse.builder()
                .id(ADMIN_ID)
                .email(ADMIN_EMAIL)
                .role("ROLE_ADMIN")
                .mustChangePassword(false)
                .build();
    }
}